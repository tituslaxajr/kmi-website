"use client";

import { FormEvent, useState } from "react";
import type { EngagementKind } from "../lib/engagement";

type SubmitState = "idle" | "sending" | "success" | "error";

async function sendForm(form: HTMLFormElement, kind: EngagementKind, extra: Record<string, unknown> = {}) {
  const values = Object.fromEntries(new FormData(form).entries());
  const response = await fetch("/api/engagement", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...values, ...extra, kind, sourcePath: window.location.pathname }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Your response could not be delivered.");
  return result.message as string;
}

function Honeypot() {
  return <label className="form-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>;
}

export function NewsletterForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    try {
      setMessage(await sendForm(form, "newsletter"));
      form.reset();
      setState("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your email could not be saved.");
      setState("error");
    }
  }

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <label htmlFor="newsletter-email">Email address</label>
      <Honeypot />
      <div>
        <input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        <button className="button button-light" type="submit" disabled={state === "sending"}>{state === "sending" ? "Joining…" : "Pray with us"}</button>
      </div>
      <p className={`form-note form-${state}`} aria-live="polite">{message || "Monthly field updates and prayer concerns. Unsubscribe anytime."}</p>
    </form>
  );
}

export function ContactForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    try {
      setMessage(await sendForm(form, "contact"));
      form.reset();
      setState("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your message could not be delivered.");
      setState("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <Honeypot />
      <div className="field-grid">
        <label>Full name<input name="name" autoComplete="name" maxLength={120} required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      </div>
      <label>How would you like to connect?
        <select name="interest" defaultValue="" required>
          <option value="" disabled>Select one</option>
          <option>Giving partnership</option>
          <option>Prayer partnership</option>
          <option>Partner church inquiry</option>
          <option>Program or story question</option>
          <option>Other</option>
        </select>
      </label>
      <label>Message<textarea name="message" rows={7} minLength={10} maxLength={5000} required /></label>
      <label className="checkbox-label"><input type="checkbox" name="updates" value="yes" /> <span>You may send me occasional ministry updates.</span></label>
      <button className="button" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
      <p className={`form-status form-${state}`} role="status" aria-live="polite">{message}</p>
    </form>
  );
}

export function PrayerResponseForm({ prayerSlug, prayerTitle }: { prayerSlug: string; prayerTitle: string }) {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    try {
      setMessage(await sendForm(form, "prayer", { prayerSlug, interest: prayerTitle }));
      form.reset();
      setState("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your prayer response could not be delivered.");
      setState("error");
    }
  }

  return (
    <form className="response-form" onSubmit={submit}>
      <Honeypot />
      <div><p className="eyebrow">Pray alongside Kapatid</p><h2>Let the team know you prayed.</h2><p>Your note encourages the partner churches and helps KMI know which prayer updates are reaching people.</p></div>
      <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label>Name <span>(optional)</span><input name="name" autoComplete="name" maxLength={120} /></label>
      <label>Prayer note <span>(optional)</span><textarea name="message" rows={3} maxLength={1000} /></label>
      <button className="button" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "I prayed for this"}</button>
      <p className={`form-status form-${state}`} role="status" aria-live="polite">{message}</p>
    </form>
  );
}

export function GivingResponseForm({ needs, selectedNeed = "" }: { needs: Array<{ slug: string; title: string; designation: string }>; selectedNeed?: string }) {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const needSlug = String(new FormData(form).get("needSlug") || "");
    try {
      setMessage(await sendForm(form, "giving", { needSlug }));
      form.reset();
      setState("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your giving response could not be delivered.");
      setState("error");
    }
  }

  return (
    <form className="contact-form giving-response-form" onSubmit={submit}>
      <Honeypot />
      <div className="field-grid">
        <label>Full name<input name="name" autoComplete="name" maxLength={120} /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      </div>
      <label>How can Kapatid help?
        <select name="interest" defaultValue="Giving instructions" required>
          <option>Giving instructions</option>
          <option>Confirm a transfer or reference</option>
          <option>Request a receipt</option>
          <option>Discuss a church or program partnership</option>
        </select>
      </label>
      <label>Choose a current need <span>(optional)</span>
        <select name="needSlug" defaultValue={selectedNeed}>
          <option value="">Program or general giving</option>
          {needs.map((need) => <option value={need.slug} key={need.slug}>{need.title} — {need.designation}</option>)}
        </select>
      </label>
      <label>Transfer or payment reference <span>(optional)</span><input name="reference" maxLength={160} /></label>
      <label>Message <span>(optional)</span><textarea name="message" rows={4} maxLength={3000} /></label>
      <button className="button" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send giving response"}</button>
      <p className={`form-status form-${state}`} role="status" aria-live="polite">{message}</p>
    </form>
  );
}
