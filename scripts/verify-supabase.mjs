import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const options = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};

const publicClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options,
);
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  options,
);

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const managedSlug = `verification-${suffix}`;
const deniedSlug = `anonymous-write-${suffix}`;
const engagementEmail = `verification-${suffix}@example.com`;

async function removeVerificationRows() {
  await adminClient.from("content_documents").delete().in("slug", [managedSlug, deniedSlug]);
  await adminClient.from("engagement_submissions").delete().eq("email", engagementEmail);
}

try {
  const { data: bucket, error: bucketError } = await adminClient.storage.getBucket("content-media");
  if (bucketError) throw bucketError;
  if (!bucket?.public) throw new Error("content-media bucket is not public");
  if (Number(bucket.file_size_limit) !== 12_582_912) {
    throw new Error("content-media bucket does not have the expected 12 MB limit");
  }
  const expectedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!expectedMimeTypes.every((type) => bucket.allowed_mime_types?.includes(type))) {
    throw new Error("content-media bucket is missing an expected image MIME type");
  }

  const { error: deniedWriteError } = await publicClient.from("content_documents").insert({
    kind: "field-update",
    slug: deniedSlug,
    title: "Anonymous write verification",
  });
  if (!deniedWriteError) throw new Error("anonymous insert unexpectedly succeeded");

  const { error: draftInsertError } = await adminClient.from("content_documents").insert({
    kind: "field-update",
    slug: managedSlug,
    title: "KMI verification document",
    summary: "Temporary row created by the deployment verifier.",
    status: "draft",
    author_email: "deployment-verifier@kapatidministry.org",
  });
  if (draftInsertError) throw draftInsertError;

  const { data: hiddenDraft, error: hiddenDraftError } = await publicClient
    .from("content_documents")
    .select("id")
    .eq("slug", managedSlug);
  if (hiddenDraftError) throw hiddenDraftError;
  if (hiddenDraft.length !== 0) throw new Error("draft content is visible to anonymous readers");

  const { error: publishError } = await adminClient
    .from("content_documents")
    .update({
      status: "published",
      published_on: new Date().toISOString().slice(0, 10),
      published_at: new Date().toISOString(),
    })
    .eq("slug", managedSlug);
  if (publishError) throw publishError;

  const { data: publishedDocument, error: publishedError } = await publicClient
    .from("content_documents")
    .select("slug,status")
    .eq("slug", managedSlug);
  if (publishedError) throw publishedError;
  if (publishedDocument.length !== 1 || publishedDocument[0].status !== "published") {
    throw new Error("published content is not visible to anonymous readers");
  }

  const { error: engagementInsertError } = await adminClient.from("engagement_submissions").insert({
    kind: "contact", email: engagementEmail, name: "Deployment verifier", message: "Temporary private inbox verification.",
  });
  if (engagementInsertError) throw engagementInsertError;
  const { error: privateInboxError } = await publicClient.from("engagement_submissions").select("id").eq("email", engagementEmail);
  if (!privateInboxError) throw new Error("private engagement inbox is queryable with the public key");

  console.log("Supabase verification passed:");
  console.log("- content-media bucket is public with the expected size and MIME limits");
  console.log("- anonymous writes are denied");
  console.log("- draft documents are private");
  console.log("- trusted server writes succeed");
  console.log("- published documents are publicly readable");
  console.log("- supporter responses are private to the trusted server role");
} finally {
  await removeVerificationRows();
}
