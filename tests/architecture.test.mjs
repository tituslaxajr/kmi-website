import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("uses native Next.js scripts for Vercel", async () => {
  const pkg = JSON.parse(await read("../package.json"));
  assert.equal(pkg.scripts.dev, "next dev");
  assert.equal(pkg.scripts.build, "next build");
  assert.ok(pkg.dependencies["@supabase/ssr"]);
  assert.ok(pkg.dependencies["@supabase/supabase-js"]);
  assert.equal(pkg.dependencies.vinext, undefined);
});

test("keeps Supabase service credentials server-only", async () => {
  const env = await read("../.env.example");
  assert.match(env, /^SUPABASE_SERVICE_ROLE_KEY=/m);
  assert.doesNotMatch(env, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
  const browserClient = await read("../app/lib/supabase/browser.ts");
  assert.doesNotMatch(browserClient, /SERVICE_ROLE/);
});

test("database migration exposes only published content", async () => {
  const sql = await read("../supabase/migrations/20260715000100_kmi_content.sql");
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /status = 'published'/i);
  assert.match(sql, /to anon, authenticated/i);
  assert.match(sql, /content-media/);
});

test("admin mutations require an approved Supabase user", async () => {
  const auth = await read("../app/lib/staff-auth.ts");
  const route = await read("../app/api/admin/content/route.ts");
  assert.match(auth, /auth\.getUser\(\)/);
  assert.match(auth, /KMI_STAFF_EMAILS/);
  assert.match(route, /getKMIStaff\(\)/);
});

test("admin keeps editorial content separate from structured ministry records", async () => {
  const desk = await read("../app/admin/AdminDesk.tsx");
  const content = await read("../app/lib/content.ts");
  assert.match(desk, /editorialKinds = new Set<ContentKind>\(\["story", "prayer-request", "field-update"\]\)/);
  assert.match(desk, /Church profile information/);
  assert.match(desk, /Need information/);
  assert.match(desk, /nextMilestone/);
  assert.match(desk, /activeIsEditorial && <SocialAssetKit/);
  assert.match(content, /metadata\.programSlugs/);
  assert.match(content, /churchName:/);
});

test("public response journeys use a private staff inbox", async () => {
  const forms = await read("../app/components/Forms.tsx");
  const publicRoute = await read("../app/api/engagement/route.ts");
  const adminRoute = await read("../app/api/admin/engagement/route.ts");
  const migration = await read("../supabase/migrations/20260716000100_engagement_submissions.sql");
  const givingPage = await read("../app/give/page.tsx");
  assert.match(forms, /\/api\/engagement/);
  assert.match(forms, /PrayerResponseForm/);
  assert.match(forms, /GivingResponseForm/);
  assert.match(forms, /const form = event\.currentTarget/);
  assert.match(publicRoute, /requestHost\(request\)/);
  assert.match(publicRoute, /client_hash/);
  assert.match(publicRoute, /Too many responses/);
  assert.match(publicRoute, /getSupabaseAdminClient/);
  assert.match(adminRoute, /getKMIStaff\(\)/);
  assert.match(migration, /revoke all on public\.engagement_submissions from anon, authenticated/i);
  assert.match(givingPage, /getPublishedNeeds\(\)/);
  assert.doesNotMatch(givingPage, /Sample amounts|Draft designation|Pending verification/);
});

test("staff magic links are issued only through the server allowlist", async () => {
  const login = await read("../app/admin/login/LoginForm.tsx");
  const route = await read("../app/api/auth/magic-link/route.ts");
  assert.match(login, /\/api\/auth\/magic-link/);
  assert.doesNotMatch(login, /signInWithOtp/);
  assert.match(route, /isKMIStaffEmail/);
  assert.match(route, /signInWithOtp/);
});

test("readiness and recovery surfaces cover production dependencies", async () => {
  const health = await read("../app/api/health/route.ts");
  const errorPage = await read("../app/error.tsx");
  const notFound = await read("../app/not-found.tsx");
  const robots = await read("../app/robots.ts");
  assert.match(health, /contentDatabase/);
  assert.match(health, /responseInbox/);
  assert.match(health, /givingMethod/);
  assert.match(errorPage, /Try again/);
  assert.match(notFound, /Page not found/);
  assert.match(robots, /disallow: \["\/admin", "\/api\/"\]/);
});

test("production responses include baseline security headers", async () => {
  const config = await read("../next.config.ts");
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /Referrer-Policy/);
  assert.match(config, /Permissions-Policy/);
  assert.match(config, /X-Frame-Options/);
  assert.match(config, /Strict-Transport-Security/);
});
