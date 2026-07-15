import { getKMIStaff } from "../../../lib/staff-auth";
import { getSupabaseAdminClient } from "../../../lib/supabase/admin";
import { listDocuments, slugify, type ContentDocument, type ContentKind, type ContentStatus } from "../../../lib/content";

const kinds = new Set<ContentKind>(["field-update", "prayer-request", "story", "partner-church", "active-need"]);
const statuses = new Set<ContentStatus>(["draft", "review", "published"]);

export async function GET() {
  const identity = await getKMIStaff();
  if (!identity) return Response.json({ error: "This publishing desk is only available to approved KMI staff." }, { status: 403 });
  try { return Response.json({ documents: await listDocuments(), identity }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Content could not be loaded." }, { status: 500 }); }
}

export async function POST(request: Request) {
  const identity = await getKMIStaff();
  if (!identity) return Response.json({ error: "This publishing desk is only available to approved KMI staff." }, { status: 403 });

  const payload = await request.json() as Partial<ContentDocument> & { action?: "save" | "delete" };
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
  const id = payload.id || crypto.randomUUID();
  const slug = slugify(payload.slug || payload.title);
  if (!slug) return Response.json({ error: "A valid web address could not be created from this title." }, { status: 400 });

  const now = new Date().toISOString();
  let revision = 1;
  let publishedAt: string | null = null;
  if (payload.id) {
    const { data: current } = await database.from("content_documents").select("revision,published_at").eq("id", payload.id).maybeSingle();
    revision = Number(current?.revision || 0) + 1;
    publishedAt = status === "published" ? current?.published_at || now : null;
  } else if (status === "published") publishedAt = now;

  const { error } = await database.from("content_documents").upsert({
    id, kind: payload.kind, slug, title: payload.title.trim(), subtitle: payload.subtitle?.trim() || "",
    summary: payload.summary?.trim() || "", body: payload.body || "", status,
    image: payload.image?.trim() || "", image_alt: payload.imageAlt?.trim() || "",
    church_slug: payload.churchSlug || "", program_slug: payload.programSlug || "",
    published_on: payload.publishedOn || null, metadata: payload.metadata || {}, author_email: identity.email,
    updated_at: now, published_at: publishedAt, revision,
  }, { onConflict: "id" });

  if (error) {
    return Response.json({ error: error.code === "23505" ? "That web address is already in use. Change the slug and save again." : error.message }, { status: 400 });
  }
  return Response.json({ ok: true, id, slug, status, updatedAt: now, revision });
}
