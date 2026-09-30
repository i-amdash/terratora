import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { contact, global } = await getSiteContent();
  return <><PageHero eyebrow={contact.eyebrow} title={contact.title} lede={contact.intro} image="/images/hero/governance.jpg" imagePosition="50% 52%" crumbs={[{ label: "Contact" }]} /><section className="contact-layout inner-contact-layout" data-color-flow="aqua"><div className="shell"><div className="contact-body"><aside className="contact-details"><div><span>Email us</span><a href={`mailto:${global.email}`}>{global.email}</a></div>{global.phone && <div><span>Call us</span><a href={`tel:${global.phone}`}>{global.phone}</a></div>}<div><span>Where we work</span><p>{global.location}</p></div></aside><ContactForm /></div></div></section></>;
}
