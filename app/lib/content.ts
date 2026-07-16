import { getSupabaseAdminClient } from "./supabase/admin";

export type ContentKind = "field-update" | "prayer-request" | "story" | "partner-church" | "active-need";
export type ContentStatus = "draft" | "review" | "published";

export type ContentDocument = {
  id: string;
  kind: ContentKind;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  body: string;
  status: ContentStatus;
  image: string;
  imageAlt: string;
  churchSlug: string;
  programSlug: string;
  publishedOn: string;
  metadata: Record<string, string | number | boolean | string[]>;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  revision: number;
};

type SupabaseContentRow = Record<string, unknown>;

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function rowToDocument(row: SupabaseContentRow): ContentDocument {
  const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
    ? row.metadata as ContentDocument["metadata"]
    : {};
  return {
    id: String(row.id), kind: String(row.kind) as ContentKind, slug: String(row.slug), title: String(row.title),
    subtitle: String(row.subtitle || ""), summary: String(row.summary || ""), body: String(row.body || ""),
    status: String(row.status) as ContentStatus, image: String(row.image || ""), imageAlt: String(row.image_alt || ""),
    churchSlug: String(row.church_slug || ""), programSlug: String(row.program_slug || ""), publishedOn: row.published_on ? String(row.published_on) : "",
    metadata, authorEmail: String(row.author_email || ""), createdAt: String(row.created_at || ""), updatedAt: String(row.updated_at || ""),
    publishedAt: row.published_at ? String(row.published_at) : null, revision: Number(row.revision || 1),
  };
}

export async function listDocuments(options: { kind?: ContentKind; publishedOnly?: boolean } = {}) {
  let query = getSupabaseAdminClient().from("content_documents").select("*").order("updated_at", { ascending: false });
  if (options.kind) query = query.eq("kind", options.kind);
  if (options.publishedOnly) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row) => rowToDocument(row));
}

export async function getPublishedDocument(kind: ContentKind, slug: string) {
  const { data, error } = await getSupabaseAdminClient().from("content_documents").select("*")
    .eq("kind", kind).eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw error;
  return data ? rowToDocument(data) : null;
}

export async function getPublishedStories() {
  const { stories } = await import("./data");
  try {
    const documents = await listDocuments({ kind: "story", publishedOnly: true });
    const managed = documents.map((document) => ({
      slug: document.slug, title: document.title, subtitle: document.subtitle, programSlug: document.programSlug || "feeding-program",
      date: document.publishedOn || document.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      excerpt: document.summary, body: document.body.split(/\n\s*\n/).filter(Boolean), image: document.image || "/church-partners.jpg",
      alt: document.imageAlt || "Kapatid Ministry field story",
    }));
    return [...managed, ...stories.filter((seed) => !managed.some((item) => item.slug === seed.slug))];
  } catch { return stories; }
}

export async function getPublishedUpdates() {
  try {
    const [documents, churches] = await Promise.all([
      listDocuments({ kind: "field-update", publishedOnly: true }),
      getPublishedChurches(),
    ]);
    return documents.map((document) => ({
      slug: document.slug, title: document.title, churchSlug: document.churchSlug || "christ-in-you-forever",
      programSlug: document.programSlug || "feeding-program", date: document.publishedOn || document.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      summary: document.summary, happened: document.body, stewardship: String(document.metadata.stewardship || "Kapatid received and reviewed this update with the partner church."),
      challenge: String(document.metadata.challenge || "The church continues to listen carefully and respond as circumstances change."),
      prayer: String(document.metadata.prayer || "Pray for the church, its volunteers, and the families they continue to serve."),
      next: String(document.metadata.next || "The next field update will share what follows."), image: document.image || "/church-partners.jpg",
      alt: document.imageAlt || "A Kapatid Ministry partner church field update",
      churchName: churches.find((church) => church.slug === document.churchSlug)?.name,
    }));
  } catch { return []; }
}

export async function getPublishedPrayerRequests() {
  const { prayerRequests } = await import("./data");
  try {
    const documents = await listDocuments({ kind: "prayer-request", publishedOnly: true });
    const managed = documents.map((document) => ({
      slug: document.slug, title: document.title,
      date: document.publishedOn || document.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      summary: document.summary, body: document.body.split(/\n\s*\n/).filter(Boolean),
      focus: String(document.metadata.focus || document.subtitle || document.summary), image: document.image || "/hero-community.jpg",
      alt: document.imageAlt || "Kapatid Ministry prayer focus",
    }));
    return [...managed, ...prayerRequests.filter((seed) => !managed.some((item) => item.slug === seed.slug))];
  } catch { return prayerRequests; }
}

export async function getPublishedChurches() {
  const { churches } = await import("./data");
  try {
    const documents = await listDocuments({ kind: "partner-church", publishedOnly: true });
    const managed = documents.map((document) => ({
      slug: document.slug, name: document.title, location: String(document.metadata.location || "Philippines"),
      summary: document.summary || document.body,
      programs: Array.isArray(document.metadata.programSlugs)
        ? document.metadata.programSlugs.map(String)
        : document.programSlug ? [document.programSlug] : [],
      prayer: String(document.metadata.prayer || "Pray for this church and the community it serves."),
      verified: String(document.metadata.profileStatus || "Profile maintained by the KMI team"), image: document.image || "/church-partners.jpg",
      alt: document.imageAlt || `${document.title} partner church`,
    }));
    return [...managed, ...churches.filter((seed) => !managed.some((item) => item.slug === seed.slug))];
  } catch { return churches; }
}

export async function getPublishedNeeds() {
  try {
    const [documents, churches] = await Promise.all([
      listDocuments({ kind: "active-need", publishedOnly: true }),
      getPublishedChurches(),
    ]);
    return documents.map((document) => ({
      slug: document.slug, title: document.title, churchSlug: document.churchSlug || "christ-in-you-forever",
      programSlug: document.programSlug || "feeding-program", status: String(document.metadata.needStatus || "active") as "active" | "closing" | "completed" | "fully-funded",
      phase: String(document.metadata.phase || "Active"), target: Number(document.metadata.target || 0), received: Number(document.metadata.received || 0),
      deadline: String(document.metadata.deadline || document.publishedOn || new Date().toISOString().slice(0, 10)), cadence: String(document.metadata.cadence || "Update after the next milestone"),
      designation: String(document.metadata.designation || document.title.toUpperCase()), verifiedAt: document.updatedAt.slice(0, 10), summary: document.summary,
      prayer: String(document.metadata.prayer || "Pray for the church and the people connected to this need."),
      nextMilestone: String(document.metadata.nextMilestone || "The church will confirm the next milestone in its field update."),
      transitionGoal: String(document.metadata.transitionGoal || "Complete the work and share what follows."),
      churchName: churches.find((church) => church.slug === document.churchSlug)?.name,
      churchLocation: churches.find((church) => church.slug === document.churchSlug)?.location,
      sample: false,
    }));
  } catch { return []; }
}
