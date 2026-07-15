import type { Metadata } from "next";
import { NeedCard } from "../components/Cards";
import { PageHero } from "../components/SiteChrome";
import { getPublishedNeeds } from "../lib/content";

export const metadata: Metadata = { title: "Active needs" };

export const dynamic = "force-dynamic";
export default async function ActiveNeedsPage() {
  const needs = await getPublishedNeeds();
  const open = needs.filter((need) => need.status !== "completed");
  const closed = needs.filter((need) => need.status === "completed");
  return (
    <>
      <PageHero eyebrow="Active needs" title="Give to work you can follow." intro="Each need names the church doing the work, the current phase, verified funding progress, prayer concerns, and what the church is working toward next." />
      <section className="section shell">
        <div className="section-heading split-heading compact-heading"><div><p className="eyebrow">Open and in progress</p><h2>Current needs</h2></div><p>Every published need is reviewed by the KMI team and names its funding progress, prayer focus, and next milestone.</p></div>
        {open.length ? <div className="needs-grid">{open.map((need) => <NeedCard need={need} key={need.slug} />)}</div> : <div className="public-empty"><h3>No verified active needs are posted right now.</h3><p>Please check back soon or contact KMI to ask where prayer and support are currently needed.</p></div>}
      </section>
      {closed.length > 0 && <section className="archive-section"><div className="shell"><div className="section-heading split-heading compact-heading"><div><p className="eyebrow">Completed work</p><h2>Past needs remain visible.</h2></div><p>Completed work remains available so partners can see what happened and what followed. Past needs cannot receive new designations.</p></div><div className="needs-grid needs-grid-archive">{closed.map((need) => <NeedCard need={need} key={need.slug} />)}</div></div></section>}
    </>
  );
}
