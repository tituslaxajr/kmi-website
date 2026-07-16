import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../components/SiteChrome";
import { PrayerResponseForm } from "../../components/Forms";
import { prayerRequests as seedPrayers, formatDate } from "../../lib/data";
import { getPublishedPrayerRequests } from "../../lib/content";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return seedPrayers.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const prayer = (await getPublishedPrayerRequests()).find((item) => item.slug === slug);
  return { title: prayer?.title || "Prayer request", description: prayer?.summary };
}

export default async function PrayerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prayer = (await getPublishedPrayerRequests()).find((item) => item.slug === slug);
  if (!prayer) notFound();
  return (
    <>
      <Breadcrumbs items={[{ href: "/prayer", label: "Prayer requests" }, { label: prayer.title }]} />
      <article className="article-layout shell prayer-article">
        <header className="article-header"><p className="eyebrow">Prayer focus · {formatDate(prayer.date)}</p><h1>{prayer.title}</h1><p className="article-deck">{prayer.summary}</p></header>
        <figure className="article-image"><Image unoptimized src={prayer.image} alt={prayer.alt} width={1024} height={683} sizes="(max-width: 1000px) 100vw, 980px" /></figure>
        <aside className="prayer-callout"><p className="eyebrow">Pray for</p><h2>{prayer.focus}</h2></aside>
        <div className="article-body">{prayer.body.map((paragraph, index) => paragraph.startsWith("- ") ? <ul key={index}>{paragraph.split("\n").map((line) => <li key={line}>{line.replace(/^- /, "")}</li>)}</ul> : <p key={index}>{paragraph}</p>)}</div>
        <PrayerResponseForm prayerSlug={prayer.slug} prayerTitle={prayer.title} />
      </article>
      <section className="article-cta"><div className="shell narrow"><p className="eyebrow light">Keep praying</p><h2>Receive the next focus and field update.</h2><div className="button-row"><Link className="button button-light" href="/prayer">More prayer requests</Link><Link className="button button-ghost-light" href="/field-updates">Field updates</Link></div></div></section>
    </>
  );
}
