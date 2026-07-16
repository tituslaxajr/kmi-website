import { getSupabaseAdminClient } from "../../lib/supabase/admin";
import type { EngagementKind } from "../../lib/engagement";

const kinds = new Set<EngagementKind>(["contact", "newsletter", "prayer", "giving"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function requestHost(request: Request) {
  return (request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host).split(",")[0].trim().toLowerCase();
}

async function clientHash(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${day}:${forwarded}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return Response.json({ error: "Send this form as JSON." }, { status: 415 });
  }

  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host.toLowerCase() !== requestHost(request)) {
    return Response.json({ error: "This form can only be submitted from the Kapatid Ministry website." }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try { payload = await request.json(); }
  catch { return Response.json({ error: "The form could not be read." }, { status: 400 }); }

  if (text(payload.website, 200)) return Response.json({ ok: true });
  const kind = text(payload.kind, 20) as EngagementKind;
  if (!kinds.has(kind)) return Response.json({ error: "Choose a valid response type." }, { status: 400 });

  const name = text(payload.name, 120);
  const email = text(payload.email, 254).toLowerCase();
  const interest = text(payload.interest, 120);
  const message = text(payload.message, 5000);
  const reference = text(payload.reference, 160);
  const sourcePath = text(payload.sourcePath, 300);

  if (!email || !emailPattern.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (kind === "contact" && (!name || message.length < 10)) return Response.json({ error: "Add your name and a message of at least 10 characters." }, { status: 400 });
  if (kind === "giving" && !interest) return Response.json({ error: "Choose how Kapatid can help with your gift." }, { status: 400 });

  try {
    const database = getSupabaseAdminClient();
    const hash = await clientHash(request);
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count, error: countError } = await database.from("engagement_submissions").select("id", { count: "exact", head: true }).eq("client_hash", hash).gte("created_at", fifteenMinutesAgo);
    if (countError) throw countError;
    if ((count || 0) >= 5) return Response.json({ error: "Too many responses were sent recently. Please wait a few minutes and try again." }, { status: 429 });

    if (kind === "newsletter") {
      const { data: existing, error: lookupError } = await database.from("engagement_submissions").select("id").eq("kind", "newsletter").eq("email", email).neq("status", "resolved").limit(1);
      if (lookupError) throw lookupError;
      if (existing?.length) return Response.json({ ok: true, message: "You are already on the Kapatid prayer-update list." });
    }

    const { error } = await database.from("engagement_submissions").insert({
      kind, name, email, interest, message, reference, source_path: sourcePath,
      client_hash: hash,
      metadata: { updates: Boolean(payload.updates), prayerSlug: text(payload.prayerSlug, 100), needSlug: text(payload.needSlug, 100) },
    });
    if (error) throw error;
    return Response.json({ ok: true, message: kind === "newsletter" ? "You are on the Kapatid prayer-update list." : "Thank you. The Kapatid team has received your response." }, { status: 201 });
  } catch (error) {
    console.error("Engagement submission failed", error);
    return Response.json({ error: "Your response could not be delivered right now. Please email inquiries@kapatidministry.org." }, { status: 503 });
  }
}
