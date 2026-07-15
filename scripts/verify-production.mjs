import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const baseUrl = (process.env.KMI_PRODUCTION_URL || "https://kmi-website-nine.vercel.app").replace(/\/$/, "");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serverSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
const staffEmail = (process.env.KMI_STAFF_EMAILS || "").split(/[\s,;]+/).find(Boolean);

if (!supabaseUrl || !publishableKey || !serverSecret || !staffEmail) {
  throw new Error("Production verification requires Supabase URL/keys and at least one KMI staff email.");
}

const authOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};
const adminClient = createClient(supabaseUrl, serverSecret, authOptions);
const publicClient = createClient(supabaseUrl, publishableKey, authOptions);
const cookieJar = new Map();
const cookieClient = createServerClient(supabaseUrl, publishableKey, {
  cookies: {
    getAll() {
      return Array.from(cookieJar, ([name, value]) => ({ name, value }));
    },
    setAll(cookies) {
      for (const { name, value } of cookies) {
        if (value) cookieJar.set(name, value);
        else cookieJar.delete(name);
      }
    },
  },
});

function cookieHeader() {
  return Array.from(cookieJar, ([name, value]) => `${name}=${value}`).join("; ");
}

async function expectJson(response, label) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${label} failed with HTTP ${response.status}: ${body.error || "unknown error"}`);
  return body;
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const title = `Production publishing verification ${suffix}`;
let createdId = "";

try {
  const { data: link, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: staffEmail,
    options: { redirectTo: `${baseUrl}/auth/callback?next=/admin` },
  });
  if (linkError) throw linkError;
  if (!link.properties?.hashed_token) throw new Error("Supabase did not return a magic-link token hash.");

  const { data: verified, error: verificationError } = await publicClient.auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: "email",
  });
  if (verificationError) throw verificationError;
  if (!verified.session) throw new Error("Supabase magic-link verification did not create a session.");

  const { error: sessionError } = await cookieClient.auth.setSession({
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
  });
  if (sessionError) throw sessionError;

  const headers = { cookie: cookieHeader() };
  const deskResponse = await fetch(`${baseUrl}/admin`, { headers, redirect: "manual" });
  if (deskResponse.status !== 200) {
    throw new Error(`Authenticated staff desk returned HTTP ${deskResponse.status}.`);
  }

  const library = await expectJson(
    await fetch(`${baseUrl}/api/admin/content`, { headers, cache: "no-store" }),
    "Authenticated content-library request",
  );
  if (library.identity?.email?.toLowerCase() !== staffEmail.toLowerCase()) {
    throw new Error("The deployed admin API did not recognize the approved KMI staff identity.");
  }

  const created = await expectJson(
    await fetch(`${baseUrl}/api/admin/content`, {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({
        kind: "field-update",
        title,
        summary: "Temporary production row created by the deployment verifier.",
        body: "This temporary update verifies the complete KMI publishing workflow.",
        status: "published",
        publishedOn: new Date().toISOString().slice(0, 10),
      }),
    }),
    "Authenticated publish request",
  );
  createdId = created.id;
  if (!created.slug || created.status !== "published") {
    throw new Error("The deployed admin API did not publish the verification document.");
  }

  const publicDocument = await fetch(`${baseUrl}/field-updates/${created.slug}`, { cache: "no-store" });
  const publicHtml = await publicDocument.text();
  if (publicDocument.status !== 200 || !publicHtml.includes(title)) {
    throw new Error("The published verification document was not rendered on its public URL.");
  }

  console.log("Production verification passed:");
  console.log("- Supabase magic-link authentication creates a valid staff session");
  console.log("- the deployed staff desk accepts the approved KMI identity");
  console.log("- authenticated content publishing succeeds through the production API");
  console.log("- the published field update renders on its public URL");
} finally {
  if (createdId) {
    await expectJson(
      await fetch(`${baseUrl}/api/admin/content`, {
        method: "POST",
        headers: { cookie: cookieHeader(), "content-type": "application/json" },
        body: JSON.stringify({ action: "delete", id: createdId }),
      }),
      "Production verification cleanup",
    );
  }
}
