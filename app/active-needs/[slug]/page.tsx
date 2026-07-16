import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "../../components/Cards";
import { Breadcrumbs } from "../../components/SiteChrome";
import { formatDate, formatPeso, getChurch, getProgram, needs as seedNeeds } from "../../lib/data";
import { getPublishedNeeds } from "../../lib/content";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return seedNeeds.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const need = (await getPublishedNeeds()).find((item) => item.slug === slug);
  return { title: need?.title || "Need details", description: need?.summary };
}

export default async function NeedDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const need = (await getPublishedNeeds()).find((item) => item.slug === slug);
  if (!need) notFound();
  const church = getChurch(need.churchSlug);
  const program = getProgram(need.programSlug);
  const percentage = need.target > 0 ? Math.min(100, Math.round((need.received / need.target) * 100)) : 0;
  const canGive = need.status === "active" || need.status === "closing";

  return (
    <>
      <Breadcrumbs items={[{ href: "/active-needs", label: "Active needs" }, { label: need.title }]} />
      <section className="record-hero shell">
        <div><div className="record-labels"><StatusBadge status={need.status} /><span>{program?.title}</span></div><h1>{need.title}</h1><p>{need.summary}</p><p className="church-line large">Led on the ground by <Link href={`/partner-churches/${need.churchSlug}`}>{need.churchName || church?.name || "a KMI partner church"}</Link>{(need.churchLocation || church?.location) ? ` in ${need.churchLocation || church?.location}` : ""}.</p></div>
        <aside className="funding-panel"><p className="card-kicker">Verified funding progress</p><div className="funding-large"><strong>{formatPeso(need.received)}</strong><span>received of {formatPeso(need.target)}</span></div><div className="progress-track large" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><span style={{ width: `${percentage}%` }} /></div><div className="funding-percent">{percentage}% funded</div>{canGive ? <Link className="button full-button" href={`/give?need=${need.slug}`}>Support this need</Link> : <p className="closed-message">This need is closed and cannot receive new designations.</p>}</aside>
      </section>
      <section className="record-meta"><div className="shell record-meta-grid"><div><small>Current phase</small><strong>{need.phase}</strong></div><div><small>{need.status === "completed" ? "Closed" : "Target date"}</small><strong>{formatDate(need.deadline)}</strong></div><div><small>Update cadence</small><strong>{need.cadence}</strong></div><div><small>Last verified</small><strong>{formatDate(need.verifiedAt)}</strong></div></div></section>
      <section className="section shell record-content"><article><span>01</span><p className="eyebrow">Pray</p><h2>{need.prayer}</h2></article><article><span>02</span><p className="eyebrow">Next milestone</p><h2>{need.nextMilestone}</h2></article><article><span>03</span><p className="eyebrow">Long-term hope</p><h2>{need.transitionGoal}</h2></article></section>
      <section className="designation-section"><div className="shell designation-layout"><div><p className="eyebrow light">Giving designation</p><h2>{need.designation}</h2><p>Use this exact wording with a giving method verified by Kapatid staff.</p></div><div><h3>What you should receive</h3><ul className="check-list"><li>Acknowledgment and receipt guidance</li><li>Updates at the stated cadence</li><li>Honest challenges and prayer concerns</li><li>A final update or next-step summary</li></ul>{canGive && <Link className="button button-light" href={`/give?need=${need.slug}#giving-response`}>Request instructions or confirm a gift</Link>}</div></div></section>
    </>
  );
}
