import type { Metadata } from "next";
import { ChurchCard } from "../components/Cards";
import { PageHero } from "../components/SiteChrome";
import { getPublishedChurches } from "../lib/content";

export const metadata: Metadata = { title: "Partner churches" };

export const dynamic = "force-dynamic";
export default async function ChurchesPage() {
  const churches = await getPublishedChurches();
  return (
    <>
      <PageHero eyebrow="Partner churches" title="Let their names and their prayers be heard." intro="Local churches carry the relationships and ministry on the ground. Kapatid helps giving partners see and support that work clearly." />
      <section className="section shell">
        <div className="section-heading compact-heading"><p className="eyebrow">Church partners</p><h2>Churches we walk alongside.</h2></div>
        <div className="church-grid">{churches.map((church) => <ChurchCard church={church} key={church.slug} />)}</div>
      </section>
      <section className="quote-band"><div className="shell narrow"><p>“Ministry grows through people who know their neighbours, remain present, and bear witness to Christ together.”</p><span>Why local churches remain at the center</span></div></section>
    </>
  );
}
