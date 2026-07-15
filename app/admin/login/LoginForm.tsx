"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("Sending your secure sign-in link…");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin` },
      });
      if (error) throw error;
      setMessage("Check your email and open the KMI sign-in link.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The sign-in link could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return <form className="staff-login-form" onSubmit={submit}>
    <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
    <button className="button" type="submit" disabled={sending}>{sending ? "Sending…" : "Email me a sign-in link"}</button>
    <p role="status">{message}</p>
  </form>;
}
