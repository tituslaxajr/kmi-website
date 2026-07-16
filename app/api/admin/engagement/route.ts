import { getKMIStaff } from "../../../lib/staff-auth";
import { getSupabaseAdminClient } from "../../../lib/supabase/admin";
import { rowToEngagement, type EngagementStatus } from "../../../lib/engagement";

const statuses = new Set<EngagementStatus>(["new", "read", "resolved"]);

export async function GET() {
  const identity = await getKMIStaff();
  if (!identity) return Response.json({ error: "This inbox is only available to approved KMI staff." }, { status: 403 });
  const { data, error } = await getSupabaseAdminClient().from("engagement_submissions").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ submissions: (data || []).map((row) => rowToEngagement(row)) });
}

export async function PATCH(request: Request) {
  const identity = await getKMIStaff();
  if (!identity) return Response.json({ error: "This inbox is only available to approved KMI staff." }, { status: 403 });
  const payload = await request.json() as { id?: string; status?: EngagementStatus };
  if (!payload.id || !payload.status || !statuses.has(payload.status)) return Response.json({ error: "Choose a valid response and status." }, { status: 400 });
  const { error } = await getSupabaseAdminClient().from("engagement_submissions").update({ status: payload.status, updated_at: new Date().toISOString() }).eq("id", payload.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const identity = await getKMIStaff();
  if (!identity) return Response.json({ error: "This inbox is only available to approved KMI staff." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Response id is required." }, { status: 400 });
  const { error } = await getSupabaseAdminClient().from("engagement_submissions").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
