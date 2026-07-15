import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { NeedCard, PrayerCard, ProgramCard, UpdateCard } from "./components/Cards";
import { programs, stats } from "./lib/data";
import { getPublishedNeeds, getPublishedPrayerRequests, getPublishedUpdates } from "./lib/content";

export const metadata: Metadata = {
  title: "Alongside local churches in the Philippines",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const [needs, updates, prayers] = await Promise.all([getPublishedNeeds(), getPublishedUpdates(), getPublishedPrayerRequests()]);
  const currentNeeds = needs.filter((need) => need.status !== "completed").slice(0, 3);

  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Alongside local churches since 2003</p>
          <h1>God’s mission.<br /><em>The church at work.</em><br />Your partnership.</h1>
          <p className="hero-intro">
            Local churches know their communities and serve there. Kapatid helps partners pray, give, and stay connected to the work.
          </p>
          <div className="button-row">
            <Link className="button" href="/active-needs">See where support is needed</Link>
            <Link className="button button-outline" href="/field-updates">Follow the work</Link>
          </div>
          <div className="hero-trust">
            <span>Verified needs</span><span>Named local churches</span><span>Updates along the way</span>
          </div>
        </div>
        <div className="hero-visual">
          <Image unoptimized src="/hero-community.jpg" alt="A local church worker listening to women during a community home visit" width={1024} height={683} sizes="(max-width: 820px) 100vw, 45vw" priority />
          <div className="image-caption">
            <span className="caption-rule" />
            <p><strong>The church stays visible.</strong><br />Kapatid walks alongside.</p>
          </div>
          <div className="hero-stamp" aria-hidden="true"><span>Walking</span><strong>↻</strong><span>together</span></div>
        </div>
      </section>

      <section className="mission-section" aria-labelledby="mission-title">
        <div className="shell">
          <div className="mission-heading-row">
            <div><span>01</span><h2 id="mission-title">Our mission</h2></div>
            <p>About Kapatid Ministry</p>
          </div>
          <div className="mission-layout">
            <div className="mission-work">
              <p className="mission-intro">We partner with Christian churches, organizations, and individuals to encourage, equip, and strengthen communities through ministry among:</p>
              <ol className="mission-list">
                <li><span>01</span><strong>OFW workers and their families</strong></li>
                <li><span>02</span><strong>Children and students</strong></li>
                <li><span>03</span><strong>Senior citizens</strong></li>
                <li><span>04</span><strong>Families facing calamity and hardship</strong></li>
              </ol>
            </div>
            <aside className="mission-belief">
              <blockquote>Faith in Christ. Faithful in Christ. Fruitful through Christ.</blockquote>
              <p className="eyebrow">What we believe, in nine words</p>
              <p>Through our initiatives, we aim to bring the love of Christ into action—serving communities through local churches and opening opportunities for growth.</p>
              <Link className="arrow-link" href="/about">Our belief and our hope <span aria-hidden="true">→</span></Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="home-stats-section" aria-labelledby="home-stats-title">
        <div className="shell">
          <div className="home-stats-kicker"><span aria-hidden="true" /><p className="eyebrow light" id="home-stats-title">The year 2024, counted</p></div>
          <div className="home-stats-grid">
            {stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
          </div>
          <p className="home-stats-note">Each number represents people served through local churches. <a href="/annual-report-2024.pdf" target="_blank" rel="noreferrer">Read the 2024 annual report <span aria-hidden="true">↗</span></a></p>
        </div>
      </section>

      <section className="section shell" aria-labelledby="needs-title">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Current opportunities</p><h2 id="needs-title">Current needs from<br />partner churches.</h2></div>
          <div><p>See who is doing the work, what stage it is in, what has been received, and when the next update is due.</p><Link className="arrow-link" href="/active-needs">View all current needs <span aria-hidden="true">→</span></Link></div>
        </div>
        {currentNeeds.length ? <div className="needs-grid">{currentNeeds.map((need) => <NeedCard need={need} key={need.slug} />)}</div> : <div className="public-empty"><h3>No verified active needs are posted right now.</h3><p>The KMI team can publish the next need as soon as its details are ready.</p></div>}
      </section>

      <section className="home-giving-section">
        <div className="shell home-giving-layout">
          <div><p className="eyebrow light">Ways to give</p><h2>Support a current need or a ministry as a whole.</h2></div>
          <div className="home-giving-options">
            <article><span>01</span><h3>Current church needs</h3><p>Choose a specific need with a named church, target, prayer concern, and latest update.</p><Link className="arrow-link" href="/active-needs">Browse current needs <span aria-hidden="true">→</span></Link></article>
            <article><span>02</span><h3>Program or general giving</h3><p>Give to Feeding, Child Sponsorship, Bless a Senior Citizen, OFW Families, or Kapatid’s general fund.</p><Link className="arrow-link" href="/give">See all giving options <span aria-hidden="true">→</span></Link></article>
          </div>
        </div>
      </section>

      <section className="section programs-section shell" aria-labelledby="programs-title">
        <div className="section-heading center-heading">
          <p className="eyebrow">Our programs</p>
          <h2 id="programs-title">Serving children, seniors, students, and families.</h2>
          <p>Explore Kapatid’s four areas of ministry with partner churches across the Philippines.</p>
        </div>
        <div className="program-grid">
          {programs.map((program) => <ProgramCard program={program} key={program.slug} />)}
        </div>
        <div className="center-action"><Link className="button button-outline" href="/our-work">Explore all ministry work</Link></div>
      </section>

      <section className="field-section">
        <div className="shell">
          <div className="section-heading split-heading">
            <div><p className="eyebrow">From the field</p><h2>News from the communities our partners serve.</h2></div>
            <div><p>Churches share progress, prayer concerns, difficult moments, and what they are working toward next.</p><Link className="arrow-link" href="/field-updates">Read all field updates <span aria-hidden="true">→</span></Link></div>
          </div>
          {updates.length ? <div className="updates-grid">{updates.slice(0, 3).map((update) => <UpdateCard update={update} key={update.slug} />)}</div> : <div className="public-empty public-empty-dark"><h3>The next field update is being prepared.</h3><p>In the meantime, pray with the latest published prayer focuses.</p></div>}
        </div>
      </section>

      <section className="section shell" aria-labelledby="prayer-home-title">
        <div className="section-heading split-heading"><div><p className="eyebrow">Pray with Kapatid</p><h2 id="prayer-home-title">Current prayer focuses.</h2></div><div><p>Thank God for His provision and carry local churches, ministry teams, and families in prayer.</p><Link className="arrow-link" href="/prayer">View all prayer requests <span aria-hidden="true">→</span></Link></div></div>
        <div className="prayer-grid">{prayers.slice(0, 3).map((prayer) => <PrayerCard prayer={prayer} key={prayer.slug} />)}</div>
      </section>

      <section className="newsletter-section">
        <div className="shell newsletter-layout">
          <div><p className="eyebrow light">Pray before the next update</p><h2>Carry the field in prayer.</h2><p>Read current prayer concerns, honest progress, and stories from partner churches.</p></div>
          <div className="button-row"><Link className="button button-light" href="/prayer">See prayer requests</Link><Link className="button button-ghost-light" href="/contact">Stay connected</Link></div>
        </div>
      </section>
    </>
  );
}
