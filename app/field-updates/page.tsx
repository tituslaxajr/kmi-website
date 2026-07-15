import type { Metadata } from "next";
import { UpdateCard } from "../components/Cards";
import { PageHero } from "../components/SiteChrome";
import { getPublishedUpdates } from "../lib/content";

export const metadata: Metadata = { title: "Field updates" };

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const updates = await getPublishedUpdates();
  return (
    <>
      <PageHero eyebrow="Field updates" title="Progress, prayer, and the honest next step." intro="These updates are shared by local churches for people who pray and give alongside them. They show what happened, how Kapatid responded, what remains difficult, and what comes next." />
      <section className="section shell"><div className="section-heading compact-heading"><p className="eyebrow">Latest updates</p><h2>From the field.</h2></div>{updates.length ? <div className="updates-grid updates-grid-page">{updates.map((update) => <UpdateCard update={update} key={update.slug} />)}</div> : <div className="public-empty"><h3>The next verified field report is being prepared.</h3><p>Visit the prayer page for the latest published prayer focuses, or check back after the KMI team posts the next report.</p></div>}</section>
    </>
  );
}
