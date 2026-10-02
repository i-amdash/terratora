import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Send us a message" };

export default async function MessagePage() {
  const { global } = await getSiteContent();
  return <><PageHero eyebrow="Contact Terratora" title="Send us a message" lede="Tell us about your organisation and the ESG, reporting or sustainability question you are working through." image="/images/hero/reporting.jpg" imagePosition="50% 48%" crumbs={[{ label: "Contact us", href: "/contact" }, { label: "Send us a message" }]} /><section className="contact-layout inner-contact-layout" data-color-flow="aqua"><div className="shell"><div className="contact-body"><aside className="contact-details"><div><span>Email us</span><a href={`mailto:${global.email}`}>{global.email}</a></div><div><span>Where we work</span><p>{global.location}</p></div></aside><ContactForm /></div></div></section></>;
}
