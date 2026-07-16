import type { Metadata } from "next";
import { requireKMIStaffPage } from "../../lib/staff-auth";
import ResponsesInbox from "./ResponsesInbox";

export const metadata: Metadata = { title: "Supporter responses", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ResponsesPage() {
  const access = await requireKMIStaffPage("/admin/responses");
  if (!access.authorized) return <main className="staff-denied"><div><h1>Staff access only</h1><p>This inbox is available only to approved KMI staff.</p><a className="button" href="/admin">Return to the Content Desk</a></div></main>;
  return <ResponsesInbox />;
}
