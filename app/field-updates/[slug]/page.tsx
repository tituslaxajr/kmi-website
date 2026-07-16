import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../components/SiteChrome";
import { formatDate, getChurch, getProgram, updates as seedUpdates } from "../../lib/data";
import { getPublishedUpdates } from "../../lib/content";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return seedUpdates.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const update = (await getPublishedUpdates()).find((item) => item.slug === slug);
  return { title: update?.title || "Field report", description: update?.summary };
}

export default async function UpdateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const update = (await getPublishedUpdates()).find((item) => item.slug === slug);
  if (!update) notFound();
  const church = getChurch(update.churchSlug);
  const program = getProgram(update.programSlug);
  return (
    <>
      <Breadcrumbs items={[{ href: "/field-updates", label: "Field reports" }, { label: update.title }]} />
      <article className="article-layout shell">
        <header className="article-header"><p className="eyebrow">{program?.title} · {formatDate(update.date)}</p><h1>{update.title}</h1><p className="article-deck">{update.summary}</p><p className="church-line large">A field report from <Link href={`/partner-churches/${update.churchSlug}`}>{update.churchName || church?.name || "a KMI partner church"}</Link>.</p></header>
        <figure className="article-image"><Image unoptimized src={update.image} alt={update.alt} width={1024} height={683} sizes="(max-width: 1000px) 100vw, 980px" /><figcaption>The local church remains the visible face of the work.</figcaption></figure>
        <div className="update-sections"><section><span>On the ground</span><h2>What happened</h2><p>{update.happened}</p></section><section><span>How support helped</span><h2>How Kapatid walked alongside</h2><p>{update.stewardship}</p></section><section><span>What remains difficult</span><h2>An honest challenge</h2><p>{update.challenge}</p></section><section className="prayer-section"><span>Pray</span><h2>{update.prayer}</h2></section><section><span>Next step</span><h2>What happens next</h2><p>{update.next}</p></section></div>
      </article>
      <section className="article-cta"><div className="shell narrow"><p className="eyebrow light">Respond to this report</p><h2>Pray first. Then follow the next milestone.</h2><div className="button-row"><Link className="button button-light" href="/active-needs">See related needs</Link><Link className="button button-ghost-light" href="/field-updates">More field reports</Link></div></div></section>
    </>
  );
}
