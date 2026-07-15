import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { NeedCard, UpdateCard } from "../../components/Cards";
import { Breadcrumbs } from "../../components/SiteChrome";
import { churches as seedChurches, getProgram } from "../../lib/data";
import { getPublishedChurches, getPublishedNeeds, getPublishedUpdates } from "../../lib/content";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return seedChurches.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const church = (await getPublishedChurches()).find((item) => item.slug === slug);
  return { title: church?.name || "Partner church", description: church?.summary };
}

export default async function ChurchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const church = (await getPublishedChurches()).find((item) => item.slug === slug);
  if (!church) notFound();
  const needs = await getPublishedNeeds();
  const updates = await getPublishedUpdates();
  const churchNeeds = needs.filter((item) => item.churchSlug === church.slug);
  const churchUpdates = updates.filter((item) => item.churchSlug === church.slug);

  return (
    <>
      <Breadcrumbs items={[{ href: "/partner-churches", label: "Partner churches" }, { label: church.name }]} />
      <section className="detail-hero shell">
        <div className="detail-hero-copy"><p className="eyebrow">Partner church · {church.location}</p><h1>{church.name}</h1><p>{church.summary}</p><div className="tag-row">{church.programs.map((slug) => <span className="tag" key={slug}>{getProgram(slug)?.title}</span>)}</div></div>
        <Image unoptimized src={church.image} alt={church.alt} width={1024} height={683} sizes="(max-width: 820px) 100vw, 48vw" />
      </section>
      <section className="detail-facts"><div className="shell detail-facts-grid"><div><small>Church’s role</small><strong>Lead the work in the community</strong></div><div><small>Kapatid’s role</small><strong>Connect prayer, giving, and updates</strong></div><div><small>Profile status</small><strong>{church.verified}</strong></div></div></section>
      <section className="section shell two-column-story"><div><p className="eyebrow">Pray with this church</p><h2>{church.prayer}</h2></div><div><h3>How partnership works</h3><p>The church owns the relationships and ministry decisions in its community. Kapatid helps others understand the need, follow updates, and direct support clearly.</p><Link className="arrow-link" href="/partner-churches">Meet more partner churches <span aria-hidden="true">→</span></Link></div></section>
      {churchNeeds.length > 0 && <section className="archive-section"><div className="shell"><div className="section-heading split-heading compact-heading"><div><p className="eyebrow">Current and past needs</p><h2>Work you can follow</h2></div><p>Open, closing, and completed needs remain visible for accountability.</p></div><div className="needs-grid">{churchNeeds.map((need) => <NeedCard need={need} key={need.slug} />)}</div></div></section>}
      {churchUpdates.length > 0 && <section className="section shell"><div className="section-heading split-heading compact-heading"><div><p className="eyebrow">Recent field updates</p><h2>From the church</h2></div></div><div className="updates-grid">{churchUpdates.map((update) => <UpdateCard update={update} key={update.slug} />)}</div></section>}
    </>
  );
}
