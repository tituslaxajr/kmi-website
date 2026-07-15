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
