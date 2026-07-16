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

  const bytes = new Uint8Array(await file.arrayBuffer());
  const matches = file.type === "image/jpeg"
    ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : file.type === "image/png"
      ? bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])
      : bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!matches) return Response.json({ error: "The selected file does not match its image type." }, { status: 400 });

  const now = new Date();
  const key = `content/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;
  const storage = getSupabaseAdminClient().storage.from("content-media");
  const { error } = await storage.upload(key, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return Response.json({ error: error.message }, { status: 400 });

  const { data } = storage.getPublicUrl(key);
  return Response.json({ ok: true, url: data.publicUrl });
}
