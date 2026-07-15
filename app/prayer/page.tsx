import type { Metadata } from "next";
import { PrayerCard } from "../components/Cards";
import { PageHero } from "../components/SiteChrome";
import { getPublishedPrayerRequests } from "../lib/content";

export const metadata: Metadata = { title: "Prayer requests", description: "Current prayer requests and thanksgiving from Kapatid Ministry and its partner churches." };
export const dynamic = "force-dynamic";

export default async function PrayerPage() {
  const prayers = await getPublishedPrayerRequests();
  return (
    <>
      <PageHero eyebrow="Pray with us" title="Carry the work in prayer." intro="Pray for local churches, families, ministry teams, current needs, and answered prayer. Each focus is written so individuals, families, and churches can pray along." />
      <section className="section shell">
        <div className="section-heading split-heading compact-heading"><div><p className="eyebrow">Current prayer focuses</p><h2>Thanksgiving and requests.</h2></div><p>These are the latest prayer articles from Kapatid Ministry, alongside new requests published by the KMI team.</p></div>
        <div className="prayer-grid">{prayers.map((prayer) => <PrayerCard prayer={prayer} key={prayer.slug} />)}</div>
      </section>
    </>
  );
}
