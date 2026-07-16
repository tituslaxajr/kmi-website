import { getKMIStaff } from "../../../lib/staff-auth";
import { getSupabaseAdminClient } from "../../../lib/supabase/admin";
import { listDocuments, slugify, type ContentDocument, type ContentKind, type ContentStatus } from "../../../lib/content";

const kinds = new Set<ContentKind>(["field-update", "prayer-request", "story", "partner-church", "active-need"]);
const statuses = new Set<ContentStatus>(["draft", "review", "published"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {} as ContentDocument["metadata"];
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([, item]) => typeof item === "string" || typeof item === "number" || typeof item === "boolean" || (Array.isArray(item) && item.every((entry) => typeof entry === "string")))) as ContentDocument["metadata"];
}

function publishingError(document: { kind: ContentKind; summary: string; body: string; churchSlug: string; programSlug: string; image: string; imageAlt: string; metadata: ContentDocument["metadata"] }) {
  if (!document.summary) return "Add a short summary before publishing.";
  if (document.image && !document.imageAlt) return "Describe the image for people who cannot see it before publishing.";
  if (["story", "field-update", "prayer-request"].includes(document.kind) && !document.body) return "Add the article body before publishing.";
  if (document.kind === "story" && !document.programSlug) return "Choose a ministry program before publishing this story.";
  if (document.kind === "field-update" && (!document.churchSlug || !document.programSlug)) return "Choose the partner church and ministry program before publishing this field report.";
  if (document.kind === "prayer-request" && !String(document.metadata.focus || "").trim()) return "Add a one-line prayer focus before publishing.";
  if (document.kind === "partner-church" && (!String(document.metadata.location || "").trim() || !Array.isArray(document.metadata.programSlugs))) return "Add the church location and at least one ministry program before publishing.";
  if (document.kind === "active-need") {
    if (!document.churchSlug || !document.programSlug) return "Choose the partner church and ministry program before publishing this need.";
    if (Number(document.metadata.target || 0) <= 0 || !String(document.metadata.deadline || "").trim()) return "Add a positive target amount and target date before publishing this need.";
    for (const key of ["designation", "prayer", "nextMilestone", "transitionGoal"]) if (!String(document.metadata[key] || "").trim()) return `Add the ${key} before publishing this need.`;
  }
  return "";
}

export async function GET() {
  const identity = await getKMIStaff();
  if (!identity) return Response.json({ error: "This publishing desk is only available to approved KMI staff." }, { status: 403 });
  try { return Response.json({ documents: await listDocuments(), identity }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Content could not be loaded." }, { status: 500 }); }
}

export async function POST(request: Request) {
  const identity = await getKMIStaff();
  if (!identity) return Response.json({ error: "This publishing desk is only available to approved KMI staff." }, { status: 403 });

  const payload = await request.json().catch(() => null) as (Partial<ContentDocument> & { action?: "save" | "delete" }) | null;
  if (!payload) return Response.json({ error: "The content request could not be read." }, { status: 400 });
  const database = getSupabaseAdminClient();
  if (payload.action === "delete") {
    if (!payload.id) return Response.json({ error: "Document id is required." }, { status: 400 });
    const { error } = await database.from("content_documents").delete().eq("id", payload.id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true });
  }

  if (!payload.title?.trim()) return Response.json({ error: "Add a title before saving." }, { status: 400 });
  if (!payload.kind || !kinds.has(payload.kind)) return Response.json({ error: "Choose a valid content type." }, { status: 400 });

  const status = statuses.has(payload.status as ContentStatus) ? payload.status as ContentStatus : "draft";
  const title = clean(payload.title, 240);
  const subtitle = clean(payload.subtitle, 500);
  const summary = clean(payload.summary, 1000);
  const body = typeof payload.body === "string" ? payload.body.slice(0, 100_000) : "";
  const image = clean(payload.image, 2000);
  const imageAlt = clean(payload.imageAlt, 500);
  const churchSlug = slugify(clean(payload.churchSlug, 100));
  const programSlug = slugify(clean(payload.programSlug, 100));
  const metadata = cleanMetadata(payload.metadata);
  const id = payload.id || crypto.randomUUID();
  const slug = slugify(payload.slug || title);
  if (!slug) return Response.json({ error: "A valid web address could not be created from this title." }, { status: 400 });
  if (status === "published") {
    const error = publishingError({ kind: payload.kind, summary, body, churchSlug, programSlug, image, imageAlt, metadata });
    if (error) return Response.json({ error }, { status: 400 });
  }

  const now = new Date().toISOString();
  let revision = 1;
  let publishedAt: string | null = null;
  if (payload.id) {
    const { data: current } = await database.from("content_documents").select("revision,published_at").eq("id", payload.id).maybeSingle();
    revision = Number(current?.revision || 0) + 1;
    publishedAt = status === "published" ? current?.published_at || now : null;
  } else if (status === "published") publishedAt = now;

  const { error } = await database.from("content_documents").upsert({
    id, kind: payload.kind, slug, title, subtitle,
    summary, body, status,
    image, image_alt: imageAlt,
    church_slug: churchSlug, program_slug: programSlug,
    published_on: /^\d{4}-\d{2}-\d{2}$/.test(payload.publishedOn || "") ? payload.publishedOn : null, metadata, author_email: identity.email,
    updated_at: now, published_at: publishedAt, revision,
  }, { onConflict: "id" });

  if (error) {
    return Response.json({ error: error.code === "23505" ? "That web address is already in use. Change the slug and save again." : error.message }, { status: 400 });
  }
  return Response.json({ ok: true, id, slug, status, updatedAt: now, revision });
}
