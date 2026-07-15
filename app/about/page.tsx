import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../components/SiteChrome";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Kapatid Ministry" title="A companion to the local church." intro="Kapatid Ministry is a non-stock, non-profit Christian organization serving marginalized communities in the Philippines in partnership with local churches." />
      <section className="section shell about-intro">
        <div><p className="eyebrow">Why we exist</p><h2>The mission belongs to God. The Great Commission belongs to the church.</h2></div>
        <div><p>Kapatid is a parachurch ministry. We do not seek to become the visible owner of work that belongs to local churches. We walk alongside them—helping understand needs, connect prayer and support, share updates, and care for the practical details around giving.</p><p>Founded in 2003 by Titus and Beth Laxa after returning from Malaysia, Kapatid began by ministering to OFW families and grew into a wider partnership with churches serving children, seniors, students, and marginalized communities.</p></div>
      </section>
      <section className="belief-section"><div className="shell belief-grid"><div><p className="eyebrow light">Our belief</p><h2>Faith in Christ.<br />Faithful in Christ.<br />Fruitful through Christ.</h2></div><div><p>We believe in one God in three persons—the Father, Son, and Holy Spirit—and in Jesus Christ, who died and rose again. We proclaim this Gospel faithfully in word and in lived service to our neighbor.</p><p>We hope to see Filipino families rooted in God, loving one another, and growing in wisdom, skill, generosity, and resilience.</p></div></div></section>
      <section className="commitment-section"><div className="shell"><div className="section-heading split-heading"><div><p className="eyebrow">Our responsibilities</p><h2>Accountable in more than one direction.</h2></div><p>Giving partners may request information about ministry doctrine, practices, and finances. Kapatid publishes annual reporting and operates under spiritual, board, and legal accountability.</p></div><div className="commitment-grid"><article><span>01</span><h3>Financial responsibility</h3><p>Record, allocate, disburse, reconcile, and report support with a visible approval trail.</p></article><article><span>02</span><h3>Spiritual responsibility</h3><p>Serve under the authority and shepherding of local church leaders.</p></article><article><span>03</span><h3>Legal responsibility</h3><p>Operate through a board of trustees and comply with applicable nonprofit requirements.</p></article></div><a className="arrow-link" href="https://2025.kapatidministry.org" target="_blank" rel="noreferrer">Explore the 2024 annual report <span aria-hidden="true">↗</span></a></div></section>
      <section className="section shell"><div className="section-heading center-heading"><p className="eyebrow">KMI team</p><h2>People serving the partnership.</h2><p>The team listed on Kapatid Ministry’s current public website.</p></div><div className="team-grid"><article><strong>Titus Jr Laxa</strong><span>Chief Executive Officer</span></article><article><strong>Elizabeth Laxa</strong><span>General Secretary</span></article><article><strong>Amy Calansanan</strong><span>Partnership Coordinator</span></article><article><strong>Rhodora Añonuevo</strong><span>Communications Officer</span></article><article><strong>Hazel Longos</strong><span>Finance-Admin Officer</span></article></div></section>
      <section className="closing-cta shell"><p className="eyebrow">Walk with us</p><h2>Pray with a church. Follow a need. Give with clarity.</h2><div className="button-row"><Link className="button" href="/active-needs">See active needs</Link><Link className="button button-outline" href="/contact">Start a conversation</Link></div></section>
    </>
  );
}
