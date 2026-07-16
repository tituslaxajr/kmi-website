import type { Metadata } from "next";
import Link from "next/link";
import { NeedCard } from "../components/Cards";
import { GivingResponseForm } from "../components/Forms";
import { PageHero } from "../components/SiteChrome";
import { getPublishedNeeds } from "../lib/content";
import { programs } from "../lib/data";

export const metadata: Metadata = { title: "Give" };
export const dynamic = "force-dynamic";

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

export default async function GivePage({ searchParams }: { searchParams: Promise<{ need?: string }> }) {
  const { need: selectedNeed = "" } = await searchParams;
  const needs = await getPublishedNeeds();
  const openNeeds = needs.filter((need) => need.status === "active" || need.status === "closing");
  const givingMethods = [
    process.env.KMI_CARD_GIVING_URL ? { title: "Card or online payment", detail: "Open Kapatid’s verified secure payment page.", href: process.env.KMI_CARD_GIVING_URL, action: "Open secure giving page" } : null,
    process.env.KMI_BANK_GIVING_DETAILS ? { title: "Bank transfer", detail: process.env.KMI_BANK_GIVING_DETAILS, href: "#giving-response", action: "Send a transfer reference" } : null,
    process.env.KMI_GCASH_GIVING_DETAILS ? { title: "GCash", detail: process.env.KMI_GCASH_GIVING_DETAILS, href: "#giving-response", action: "Send a payment reference" } : null,
  ].filter((method): method is NonNullable<typeof method> => Boolean(method));

  return (
    <>
      <PageHero eyebrow="Give" title="Choose the work. Name the designation. Follow the update." intro="Giving is one way to stand with local churches. See the people doing the work, pray with them, and keep following what happens next." />

      <section className="section shell">
        <div className="section-heading split-heading compact-heading"><div><p className="eyebrow">Church-led needs</p><h2>Start with a current need.</h2></div><p>Every need shown here is a verified record published by the KMI team.</p></div>
        {openNeeds.length ? <div className="needs-grid">{openNeeds.map((need) => <NeedCard compact need={need} key={need.slug} />)}</div> : <div className="public-empty"><h3>No verified active needs are posted right now.</h3><p>You can still ask about program or general giving below.</p></div>}
      </section>

      <section className="program-funds-section">
        <div className="shell">
          <div className="section-heading split-heading compact-heading"><div><p className="eyebrow">Broader giving</p><h2>Give to a program—or wherever Kapatid needs it most.</h2></div><p>Choose this path when you want to support a whole ministry rather than one current need. The KMI team will confirm the correct designation before a transfer.</p></div>
          <div className="program-funds-grid">
            {programs.map((program) => (
              <article className={`program-fund-card accent-${program.accent}`} key={program.slug}>
                <p className="card-kicker">Program giving</p><h3>{program.title}</h3><p>{programGivingDescriptions[program.slug]}</p>
                <div className="fund-designation"><small>Giving designation</small><strong>{programDesignations[program.slug]}</strong></div>
                <Link className="arrow-link" href="#giving-response">Ask about giving to this program <span aria-hidden="true">→</span></Link>
              </article>
            ))}
            <article className="program-fund-card general-fund-card">
              <p className="card-kicker">General giving</p><h3>Kapatid Ministry General Fund</h3><p>Help Kapatid respond where support is most useful, including ministry coordination, field visits, communication, and responsible administration.</p>
              <div className="fund-designation"><small>Giving designation</small><strong>KAPATID GENERAL FUND</strong></div>
              <Link className="arrow-link" href="#giving-response">Ask about general giving <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </div>
      </section>

      <section className="giving-methods-section" id="giving-methods">
        <div className="shell giving-layout">
          <div><p className="eyebrow">Ways to give</p><h2>Current giving methods, presented clearly.</h2><p>Only methods verified and configured by Kapatid staff appear here. Never send funds to account details received from an unverified source.</p></div>
          {givingMethods.length ? <div className="method-grid">{givingMethods.map((method, index) => <article key={method.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{method.title}</h3><p>{method.detail}</p><a className="arrow-link" href={method.href} target={method.href.startsWith("http") ? "_blank" : undefined} rel={method.href.startsWith("http") ? "noreferrer" : undefined}>{method.action} <span aria-hidden="true">→</span></a></article>)}</div> : <div className="public-empty"><h3>Request verified giving instructions.</h3><p>Submit the giving response below. Kapatid staff will confirm the current method and designation directly with you.</p></div>}
        </div>
      </section>

      <section className="section shell contact-layout" id="giving-response">
        <div className="contact-details"><p className="eyebrow">Giving response</p><h2>Ask, confirm, or request a receipt.</h2><p>Use this secure form to request verified instructions, share a transfer reference, or ask about supporting a ministry program. The response is visible only to approved KMI staff.</p></div>
        <div className="form-panel"><GivingResponseForm needs={openNeeds.map(({ slug, title, designation }) => ({ slug, title, designation }))} selectedNeed={openNeeds.some((need) => need.slug === selectedNeed) ? selectedNeed : ""} /></div>
      </section>

      <section className="section shell give-steps"><div className="section-heading center-heading"><p className="eyebrow">After you choose</p><h2>What happens after you give.</h2></div><ol><li><span>01</span><div><h3>Designate clearly</h3><p>Use the need’s exact designation, or choose a program or the general fund.</p></div></li><li><span>02</span><div><h3>Receive acknowledgment</h3><p>Send the transfer reference when required. Kapatid confirms the gift and receipt process.</p></div></li><li><span>03</span><div><h3>Follow the work</h3><p>Receive updates matched to what you support, including honest challenges and prayer concerns.</p></div></li><li><span>04</span><div><h3>See what follows</h3><p>A final update explains the outcome, the finances, and the church’s next step.</p></div></li></ol></section>
      <section className="program-giving shell"><div><p className="eyebrow">Questions before giving?</p><h2>Talk with the giving-partner coordinator.</h2></div><p>Any allocation percentage or operating-cost split will be disclosed before a gift is submitted.</p><Link className="arrow-link" href="#giving-response">Ask a giving question <span aria-hidden="true">→</span></Link></section>
    </>
  );
}
