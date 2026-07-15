import type { Metadata } from "next";
import Link from "next/link";
import AdminDesk from "./AdminDesk";
import { requireKMIStaffPage } from "../lib/staff-auth";

export const metadata: Metadata = { title: "KMI Content Desk", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const access = await requireKMIStaffPage("/admin");
  if (!access.authorized) return <main className="staff-denied"><div><p className="desk-eyebrow">KMI Content Desk</p><h1>Staff access only</h1><p>{access.configured ? `${access.user.email} is signed in but is not on the KMI staff list.` : "The KMI staff list has not been configured for this site yet."}</p><form action="/auth/signout" method="post"><button className="button" type="submit">Sign out</button></form><Link className="button button-outline" href="/">Return to the public website</Link></div></main>;
  return <AdminDesk />;
}
