import { createClient } from "@supabase/supabase-js";
import { isKMIStaffEmail } from "../../../lib/staff-auth";
import { getSupabasePublicConfig } from "../../../lib/supabase/config";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host).split(",")[0].trim().toLowerCase();
  if (origin) {
    try {
      if (new URL(origin).host.toLowerCase() !== host) return Response.json({ error: "This sign-in request is not allowed." }, { status: 403 });
    } catch { return Response.json({ error: "This sign-in request is not allowed." }, { status: 403 }); }
  }

  const payload = await request.json().catch(() => ({})) as { email?: unknown };
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";
  const generic = { ok: true, message: "If this email is approved for KMI staff, a secure sign-in link is on its way." };
  if (!emailPattern.test(email) || !isKMIStaffEmail(email)) return Response.json(generic);

  try {
    const { url: supabaseUrl, publishableKey } = getSupabasePublicConfig();
    const supabase = createClient(supabaseUrl, publishableKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const protocol = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "") || "https";
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${protocol}://${host}/auth/callback?next=/admin` } });
    if (error) throw error;
    return Response.json(generic);
  } catch (error) {
    console.error("Staff magic-link request failed", error);
    return Response.json({ error: "A secure sign-in link could not be sent right now. Please try again later." }, { status: 503 });
  }
}
