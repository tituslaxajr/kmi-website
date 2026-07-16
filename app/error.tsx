"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("KMI page error", error); }, [error]);
  return <section className="section shell"><div className="public-empty"><h1>Something did not load.</h1><p>The Kapatid team has been notified through the application logs. You can try again or return to the homepage.</p><div className="button-row"><button className="button" onClick={reset}>Try again</button><Link className="button button-outline" href="/">Return home</Link></div></div></section>;
}
