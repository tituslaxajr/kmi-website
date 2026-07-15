import type { Metadata } from "next";
import Link from "next/link";
import { ProgramCard } from "../components/Cards";
import { PageHero } from "../components/SiteChrome";
import { programs } from "../lib/data";

export const metadata: Metadata = { title: "Our work" };

export default function OurWorkPage() {
  return (
    <>
      <PageHero eyebrow="Our work" title="Different ministries, shaped by the communities churches serve." intro="We walk alongside local churches as they serve children, seniors, students, and families in different seasons of life." />
      <section className="section shell">
        <div className="section-heading compact-heading"><p className="eyebrow">Ministry programs</p><h2>Where churches are serving.</h2></div>
        <div className="program-grid program-grid-full">{programs.map((program) => <ProgramCard key={program.slug} program={program} />)}</div>
      </section>
      <section className="principles-light section">
        <div className="shell">
          <div className="section-heading split-heading"><div><p className="eyebrow">What partnership looks like</p><h2>Churches lead. Partners walk alongside.</h2></div><p>Each ministry takes a different form, but the local church remains close to the people and the story remains open to those who pray and give.</p></div>
          <div className="question-grid">
            <article><span>01</span><h3>Churches lead locally</h3><p>Pastors and volunteers know the families, make ministry decisions, and remain present.</p></article>
            <article><span>02</span><h3>Partners stay connected</h3><p>Prayer, giving, and field updates keep distant partners close to the people they support.</p></article>
            <article><span>03</span><h3>Every season has a next step</h3><p>Updates show what happened, what remains difficult, and where the church is heading next.</p></article>
          </div>
        </div>
      </section>
      <section className="closing-cta shell"><p className="eyebrow">See the work in motion</p><h2>See what churches are working on now.</h2><div className="button-row"><Link className="button" href="/active-needs">Browse active needs</Link><Link className="button button-outline" href="/field-updates">Read updates</Link></div></section>
    </>
  );
}
