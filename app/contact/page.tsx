import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { contact, global } = await getSiteContent();
  return <section className="contact-layout"><div className="shell"><div className="contact-top"><div><p className="eyebrow">{contact.eyebrow}</p><h1>{contact.title}</h1></div><p className="contact-intro">{contact.intro}</p></div><div className="contact-body"><aside className="contact-details"><div><span>Email us</span><a href={`mailto:${global.email}`}>{global.email}</a></div><div><span>Call us</span><a href={`tel:${global.phone}`}>{global.phone}</a></div><div><span>Where we work</span><p>{global.location}</p></div></aside><ContactForm /></div></div></section>;
}
