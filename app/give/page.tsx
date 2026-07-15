import type { Metadata } from "next";
import Link from "next/link";
import { NeedCard } from "../components/Cards";
import { PageHero } from "../components/SiteChrome";
import { needs, programs } from "../lib/data";

export const metadata: Metadata = { title: "Give" };

const programGivingDescriptions: Record<string, string> = {
  "feeding-program": "Support church-led meals, Gospel gatherings, and ongoing relationships with children and families.",
  "child-sponsorship": "Support education, mentoring, wellbeing, and church relationships for participating children.",
  "bless-a-senior": "Support seasonal care, home visits, practical gifts, and Gospel gatherings for senior citizens.",
  "ofw-families": "Support verified, case-based needs affecting OFW workers and their families.",
};

const programDesignations: Record<string, string> = {
  "feeding-program": "KAPATID FEEDING PROGRAM",
  "child-sponsorship": "KAPATID CHILD SPONSORSHIP",
  "bless-a-senior": "KAPATID BLESS A SENIOR",
  "ofw-families": "KAPATID OFW FAMILIES",
};

export default function GivePage() {
  const openNeeds = needs.filter((need) => need.status === "active" || need.status === "closing");
  return (
    <>
      <PageHero eyebrow="Give" title="Choose the work. Name the designation. Follow the update." intro="Giving is one way to stand with local churches. See the people doing the work, pray with them, and keep following what happens next." />
      <section className="section shell"><div className="section-heading split-heading compact-heading"><div><p className="eyebrow">Church-led needs</p><h2>Start with a current need.</h2></div><p>Sample amounts are shown for local review only. Verified live records will replace them before launch.</p></div><div className="needs-grid">{openNeeds.map((need) => <NeedCard compact need={need} key={need.slug} />)}</div></section>
      <section className="program-funds-section">
        <div className="shell">
          <div className="section-heading split-heading compact-heading"><div><p className="eyebrow">Broader giving</p><h2>Give to a program—or wherever Kapatid needs it most.</h2></div><p>Choose this path when you want to support a whole ministry rather than one current need. Draft designations below must be confirmed before launch.</p></div>
          <div className="program-funds-grid">
            {programs.map((program) => (
              <article className={`program-fund-card accent-${program.accent}`} key={program.slug}>
                <p className="card-kicker">Program giving</p>
                <h3>{program.title}</h3>
                <p>{programGivingDescriptions[program.slug]}</p>
                <div className="fund-designation"><small>Draft designation</small><strong>{programDesignations[program.slug]}</strong></div>
                <Link className="arrow-link" href="/contact#contact-form">Ask about giving to this program <span aria-hidden="true">→</span></Link>
              </article>
            ))}
            <article className="program-fund-card general-fund-card">
              <p className="card-kicker">General giving</p>
              <h3>Kapatid Ministry General Fund</h3>
              <p>Help Kapatid respond where support is most useful, including ministry coordination, field visits, communication, and responsible administration.</p>
              <div className="fund-designation"><small>Draft designation</small><strong>KAPATID GENERAL FUND</strong></div>
              <Link className="arrow-link" href="/contact#contact-form">Ask about general giving <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </div>
      </section>
      <section className="giving-methods-section" id="giving-methods"><div className="shell giving-layout"><div><p className="eyebrow">Ways to give</p><h2>Current giving methods, presented clearly.</h2><p>Account numbers and payment links are intentionally withheld from this local preview until Kapatid staff verifies them. No gift is processed by this website yet.</p></div><div className="method-grid"><article><span>01</span><h3>Card or online payment</h3><p>A verified card-payment link will be added here before launch.</p><strong>Pending verification</strong></article><article><span>02</span><h3>Bank transfer</h3><p>Verified bank account details and receipt instructions will be added here.</p><strong>Pending verification</strong></article><article><span>03</span><h3>GCash</h3><p>Verified GCash details for Philippine giving will be added here.</p><strong>Pending verification</strong></article></div></div></section>
      <section className="section shell give-steps"><div className="section-heading center-heading"><p className="eyebrow">After you choose</p><h2>What happens after you give.</h2></div><ol><li><span>01</span><div><h3>Designate clearly</h3><p>Use the need’s exact designation, or choose a program or the general fund.</p></div></li><li><span>02</span><div><h3>Receive acknowledgment</h3><p>Send the transfer reference when required. Kapatid confirms the gift and receipt process.</p></div></li><li><span>03</span><div><h3>Follow the work</h3><p>Receive updates matched to what you support, including honest challenges and prayer concerns.</p></div></li><li><span>04</span><div><h3>See what follows</h3><p>A final update explains the outcome, the finances, and the church’s next step.</p></div></li></ol></section>
      <section className="program-giving shell"><div><p className="eyebrow">Questions before giving?</p><h2>Talk with the giving-partner coordinator.</h2></div><p>Any future allocation percentage or operating-cost split will be disclosed before a gift is submitted.</p><Link className="arrow-link" href="/contact#contact-form">Ask a giving question <span aria-hidden="true">→</span></Link></section>
    </>
  );
}
