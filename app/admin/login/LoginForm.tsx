"use client";

import { FormEvent, useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("Sending your secure sign-in link…");
    try {
      const response = await fetch("/api/auth/magic-link", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The sign-in link could not be sent.");
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The sign-in link could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return <form className="staff-login-form" onSubmit={submit}>
    <label>Email address<input type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
    <button className="button" type="submit" disabled={sending}>{sending ? "Sending…" : "Email me a sign-in link"}</button>
    <p role="status">{message}</p>
  </form>;
}
