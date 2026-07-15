"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [message, setMessage] = useState("");
  const endpoint = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;

  function submit(event: FormEvent<HTMLFormElement>) {
    if (!endpoint) {
      event.preventDefault();
      setMessage("Local preview only — connect the newsletter endpoint before launch.");
    }
  }

  return (
    <form className="newsletter-form" action={endpoint} method="post" onSubmit={submit}>
      <label htmlFor="newsletter-email">Email address</label>
      <div>
        <input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        <button className="button button-light" type="submit">Pray with us</button>
      </div>
      <p className="form-note" aria-live="polite">{message || "Monthly field updates and prayer concerns. Unsubscribe anytime."}</p>
    </form>
  );
}

export function ContactForm() {
  const [message, setMessage] = useState("");
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

  function submit(event: FormEvent<HTMLFormElement>) {
    if (!endpoint) {
      event.preventDefault();
      setMessage("Your form is valid. Delivery is disabled in this local preview until the contact endpoint is connected.");
    }
  }

  return (
    <form className="contact-form" action={endpoint} method="post" onSubmit={submit}>
      <div className="field-grid">
        <label>Full name<input name="name" autoComplete="name" required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
      </div>
      <label>How would you like to connect?
        <select name="interest" defaultValue="">
          <option value="" disabled>Select one</option>
          <option>Giving partnership</option>
          <option>Prayer partnership</option>
          <option>Partner church inquiry</option>
          <option>Program or story question</option>
          <option>Other</option>
        </select>
      </label>
      <label>Message<textarea name="message" rows={7} minLength={10} required /></label>
      <label className="checkbox-label"><input type="checkbox" name="updates" /> <span>You may send me occasional ministry updates.</span></label>
      <button className="button" type="submit">Send message</button>
      <p className="form-status" aria-live="polite">{message}</p>
    </form>
  );
}
