import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { contact } = await getSiteContent();
  return <><PageHero eyebrow={contact.eyebrow} title={contact.title} lede={contact.intro} image="/images/hero/global-markets.jpg" imagePosition="50% 58%" crumbs={[{ label: "Contact us" }]} /><section className="contact-choices" data-color-flow="aqua"><div className="shell"><div className="contact-choice-grid"><Link href="/contact/message" data-reveal><span>Write to us</span><h2>Send us a message</h2><p>Tell us about your organisation, reporting priorities or the challenge you are working through.</p><strong>Open message form <ArrowRight /></strong></Link><Link href="/book" data-reveal><span>Meet with us</span><h2>Book a session</h2><p>Choose a preferred date, time and timezone for an introductory conversation with Terratora.</p><strong>Open booking form <ArrowRight /></strong></Link></div></div></section></>;
}
