import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "./supabase/server";

export type KMIStaffIdentity = {
  email: string;
  displayName: string;
  fullName: string | null;
  local: boolean;
};

function staffEmails() {
  const configured = process.env.KMI_STAFF_EMAILS || "";
  return new Set(configured.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean));
}

function localEditor() {
  return process.env.NODE_ENV !== "production" && process.env.KMI_LOCAL_EDITOR === "true";
}

function localIdentity(): KMIStaffIdentity {
  return { email: "local-editor@kapatid.test", displayName: "Local editor", fullName: null, local: true };
}

function identityFromUser(user: { email?: string; user_metadata?: Record<string, unknown> }): KMIStaffIdentity | null {
  if (!user.email) return null;
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  return { email: user.email, displayName: fullName || user.email, fullName, local: false };
}

export function isKMIStaffEmail(email: string) {
  return staffEmails().has(email.toLowerCase());
}

export async function getKMIStaff() {
  if (localEditor()) return localIdentity();
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const identity = identityFromUser(user);
  return identity && isKMIStaffEmail(identity.email) ? identity : null;
}

export async function requireKMIStaffPage(returnTo = "/admin") {
  if (localEditor()) return { user: localIdentity(), authorized: true, configured: staffEmails().size > 0 };

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(returnTo)}`);

  const identity = identityFromUser(user);
  return {
    user: identity || { email: "unknown", displayName: "Unknown user", fullName: null, local: false },
    authorized: Boolean(identity && isKMIStaffEmail(identity.email)),
    configured: staffEmails().size > 0,
  };
}
