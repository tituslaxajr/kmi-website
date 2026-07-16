import Link from "next/link";

export default function NotFoundPage() {
  return <section className="section shell"><div className="public-empty"><p className="eyebrow">Page not found</p><h1>This page may have moved.</h1><p>Return to the ministry homepage, browse current needs, or contact the Kapatid team for help.</p><div className="button-row"><Link className="button" href="/">Return home</Link><Link className="button button-outline" href="/contact">Contact Kapatid</Link></div></div></section>;
}
