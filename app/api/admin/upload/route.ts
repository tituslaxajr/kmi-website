import { getKMIStaff } from "../../../lib/staff-auth";
import { getSupabaseAdminClient } from "../../../lib/supabase/admin";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  const identity = await getKMIStaff();
  if (!identity) return Response.json({ error: "This publishing desk is only available to approved KMI staff." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  const extension = allowedTypes.get(file.type);
  if (!extension) return Response.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return Response.json({ error: "Images must be smaller than 12 MB." }, { status: 400 });

  const now = new Date();
  const key = `content/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;
  const storage = getSupabaseAdminClient().storage.from("content-media");
  const { error } = await storage.upload(key, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return Response.json({ error: error.message }, { status: 400 });

  const { data } = storage.getPublicUrl(key);
  return Response.json({ ok: true, url: data.publicUrl });
}
