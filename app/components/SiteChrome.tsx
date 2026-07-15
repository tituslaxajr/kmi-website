import Link from "next/link";
import Image from "next/image";
import { ActiveNavLink } from "./ActiveNavLink";

const primaryNav = [
  { href: "/our-work", label: "Our work" },
  { href: "/partner-churches", label: "Partner churches" },
  { href: "/active-needs", label: "Active needs" },
  { href: "/prayer", label: "Prayer" },
  { href: "/field-updates", label: "Field updates" },
  { href: "/stories", label: "Stories" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Kapatid Ministry home">
          <Image unoptimized src="/brand-mark.png" alt="" width={54} height={54} priority />
          <span>
            <strong>Kapatid Ministry</strong>
            <small>Alongside local churches</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {primaryNav.map((item) => (
            <ActiveNavLink href={item.href} label={item.label} key={item.href} />
          ))}
        </nav>

        <div className="header-actions">
          <ActiveNavLink className="text-link header-contact" href="/contact" label="Contact" />
          <ActiveNavLink className="button button-small" href="/give" label="Give" />
        </div>

        <details className="mobile-menu">
          <summary aria-label="Open navigation"><span /><span /><span /></summary>
          <nav aria-label="Mobile navigation">
            {primaryNav.map((item) => (
              <ActiveNavLink href={item.href} label={item.label} key={item.href} />
            ))}
            <ActiveNavLink href="/contact" label="Contact" />
            <ActiveNavLink className="button" href="/give" label="Give" />
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-lead shell">
        <p className="eyebrow light">Together with local churches</p>
        <h2>Walk alongside the church.</h2>
        <p>Pray with the people doing the work. Give with clarity. Follow the story as it unfolds.</p>
        <div className="button-row">
          <Link className="button button-light" href="/active-needs">See active needs</Link>
          <Link className="button button-ghost-light" href="/field-updates">Read field updates</Link>
        </div>
      </div>
      <div className="footer-main shell">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <Image unoptimized src="/brand-mark.png" alt="" width={62} height={62} />
            <span><strong>Kapatid Ministry</strong><small>Kaakbay ng mga pamilyang tinawag ng Diyos</small></span>
          </Link>
          <p>A non-stock, non-profit Christian organization serving marginalized communities in partnership with local churches.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/our-work">Our work</Link>
          <Link href="/partner-churches">Partner churches</Link>
          <Link href="/active-needs">Active needs</Link>
          <Link href="/prayer">Prayer requests</Link>
          <Link href="/field-updates">Field updates</Link>
          <Link href="/stories">Stories</Link>
          <Link href="/about">About</Link>
          <Link href="/process-of-faithfulness">How we work</Link>
        </div>
        <div>
          <h3>Connect</h3>
          <Link href="/contact">Contact us</Link>
          <a href="mailto:inquiries@kapatidministry.org">inquiries@kapatidministry.org</a>
          <a href="tel:+639995161932">+63 999 516 1932</a>
          <a href="tel:+639094762692">+63 909 476 2692</a>
        </div>
        <div>
          <h3>Visit</h3>
          <p>4 Acacia St., Silanganan Subd., Llano, Caloocan City, Philippines 1422</p>
          <p>Monday–Friday<br />8:00 AM–5:00 PM</p>
        </div>
      </div>
      <div className="footer-bottom shell">
        <span>© {new Date().getFullYear()} Kapatid Ministry, Inc.</span>
        <span>Faith in Christ · Faithful in Christ · Fruitful through Christ</span>
      </div>
    </footer>
  );
}

export function PreviewNotice() {
  return (
    <aside className="preview-notice" aria-label="Local preview notice">
      <span className="status-dot" />
      <strong>Local preview:</strong> sample needs and amounts must be verified before publishing.
    </aside>
  );
}

export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children?: React.ReactNode }) {
  return (
    <section className="page-hero">
      <div className="shell narrow">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-intro">{intro}</p>
        {children}
      </div>
    </section>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="breadcrumbs shell" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          <span aria-hidden="true">/</span>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
