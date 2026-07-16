import { getSupabaseAdminClient } from "../../lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = { contentDatabase: false, responseInbox: false, givingResponse: false };
  try {
    const database = getSupabaseAdminClient();
    const [content, responses] = await Promise.all([
      database.from("content_documents").select("id", { head: true, count: "exact" }).limit(1),
      database.from("engagement_submissions").select("id", { head: true, count: "exact" }).limit(1),
    ]);
    checks.contentDatabase = !content.error;
    checks.responseInbox = !responses.error;
    checks.givingResponse = checks.responseInbox;
  } catch (error) { console.error("Readiness check failed", error); }
  const ready = Object.values(checks).every(Boolean);
  return Response.json({ status: ready ? "ready" : "not-ready", checks }, { status: ready ? 200 : 503, headers: { "cache-control": "no-store" } });
}
