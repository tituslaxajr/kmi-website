import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <main className="staff-login"><section><p className="desk-eyebrow">KMI Content Desk</p><h1>Sign in to publish.</h1><p>Enter your approved KMI staff email. Supabase will send a secure sign-in link.</p><LoginForm /><Link href="/">Return to the public website</Link></section></main>;
}
