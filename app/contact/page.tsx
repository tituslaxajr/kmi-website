import type { Metadata } from "next";
import { ContactForm } from "../components/Forms";
import { PageHero } from "../components/SiteChrome";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Begin with a conversation." intro="Ask about a current need, prayer partnership, church partnership, giving designation, annual report, or ministry visit." />
      <section className="section shell contact-layout" id="contact-form"><div className="contact-details"><p className="eyebrow">Reach Kapatid Ministry</p><h2>We would be glad to hear from you.</h2><dl><div><dt>Email</dt><dd><a href="mailto:inquiries@kapatidministry.org">inquiries@kapatidministry.org</a><br /><a href="mailto:kapatidministry@gmail.com">kapatidministry@gmail.com</a></dd></div><div><dt>Phone</dt><dd><a href="tel:+639995161932">+63 999 516 1932</a><br /><a href="tel:+639094762692">+63 909 476 2692</a></dd></div><div><dt>Address</dt><dd>4 Acacia St., Silanganan Subd., Llano, Caloocan City, Philippines 1422</dd></div><div><dt>Office hours</dt><dd>Monday–Friday, 8:00 AM–5:00 PM</dd></div></dl></div><div className="form-panel"><ContactForm /></div></section>
    </>
  );
}
