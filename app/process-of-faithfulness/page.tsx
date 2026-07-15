import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "Process of Faithfulness",
  description: "The theological foundation, roles, commitments, and working flow that guide Kapatid Ministry.",
};

const principles = [
  { number: "01", title: "Task", verb: "Do it", text: "Name the work, the responsible church, and Kapatid’s stewardship role." },
  { number: "02", title: "Transparency", verb: "Show it", text: "Share verified progress, records, funding status, and what happens next." },
  { number: "03", title: "Truthful", verb: "Tell it", text: "Credit God’s provision and the church’s work, including honest challenges." },
  { number: "04", title: "Time Bound", verb: "Set it", text: "Give each need a deadline, update cadence, and respectful close or transition." },
];

const stages = [
  { number: "01", title: "Church update", text: "The partner church reports the task, people served, progress, records, and prayer concerns." },
  { number: "02", title: "Kapatid review", text: "Kapatid checks the information, coordinates communication, and administers designated support." },
  { number: "03", title: "Partner response", text: "Giving partners pray, give, and continue following the work of the church." },
  { number: "04", title: "Progress and closure", text: "The church and Kapatid report what happened, reconcile support, and identify the next step." },
];

export default function ProcessOfFaithfulnessPage() {
  return (
    <>
      <PageHero
        eyebrow="Process of Faithfulness"
        title="Why we work this way—and how the parts hold together."
        intro="This page gathers the theological assumptions, roles, commitments, and internal flow that guide Kapatid Ministry."
      />

      <section className="section shell">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Our starting point</p><h2>The mission is God’s. The church is called to carry it.</h2></div>
          <p>Kapatid is a parachurch ministry. We exist to serve the church’s calling, not to replace it or become the visible owner of ministry in a community.</p>
        </div>
        <div className="commitment-grid process-role-grid">
          <article><span>01</span><h3>God’s mission</h3><p>God is reconciling people to Himself through Jesus Christ. The Gospel is the center and source of every work.</p></article>
          <article><span>02</span><h3>The church’s calling</h3><p>Local churches proclaim Christ, disciple people, serve their neighbours, and remain present in the community.</p></article>
          <article><span>03</span><h3>Kapatid’s place</h3><p>Kapatid walks alongside the church by connecting prayer, support, communication, and practical coordination.</p></article>
        </div>
      </section>

      <section className="process-principles-section">
        <div className="shell">
          <div className="section-heading split-heading">
            <div><p className="eyebrow light">Four commitments</p><h2>The Process of Faithfulness.</h2></div>
            <p>These commitments shape how ministry work is named, communicated, supported, and brought to an appropriate end or transition.</p>
          </div>
          <div className="process-principles-grid">
            {principles.map((principle) => (
              <article key={principle.title}><span>{principle.number}</span><h3>{principle.title}</h3><strong>{principle.verb}</strong><p>{principle.text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading center-heading"><p className="eyebrow">The stewardship loop</p><h2>Church work, shared news, prayer, and support remain connected.</h2></div>
        <ol className="process-stage-grid">
          {stages.map((stage) => <li key={stage.title}><span>{stage.number}</span><h3>{stage.title}</h3><p>{stage.text}</p></li>)}
        </ol>
      </section>

      <section className="commitment-section">
        <div className="shell">
          <div className="section-heading split-heading"><div><p className="eyebrow">Clarity of roles</p><h2>Each participant carries a distinct responsibility.</h2></div><p>Good partnership keeps the church visible, giving partners informed, and Kapatid accountable for what passes through its hands.</p></div>
          <div className="commitment-grid process-role-grid"><article><span>Church</span><h3>Lead the ministry</h3><p>Know the people, make local decisions, carry out the work, and share honest progress and prayer concerns.</p></article><article><span>Kapatid</span><h3>Steward the connection</h3><p>Assess and verify information, coordinate communication, administer designated support, and help prepare reports.</p></article><article><span>Giving partner</span><h3>Pray and support</h3><p>Respond to a clear need, use the stated designation, pray for the church, and continue following the work.</p></article></div>
        </div>
      </section>

      <section className="closing-cta shell"><p className="eyebrow">Return to the ministry</p><h2>Meet the churches and follow the work.</h2><div className="button-row"><Link className="button" href="/partner-churches">Partner churches</Link><Link className="button button-outline" href="/active-needs">Active needs</Link></div></section>
    </>
  );
}
