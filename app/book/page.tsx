import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Book a session" };

export default function BookPage() {
  return <><PageHero eyebrow="Book a meeting" title="Let’s identify your next step." lede="Tell us where your organisation is today and where you need clarity. We’ll use the session to understand your priorities and agree a practical way forward." image="/images/hero/governance.jpg" imagePosition="50% 52%" crumbs={[{ label: "Book a meeting" }]} /><section className="contact-layout inner-contact-layout" data-color-flow="aqua"><div className="shell"><div className="contact-body"><aside className="contact-details"><div><span>What to expect</span><p>60 minutes<br />Video call<br />No preparation needed</p></div><div><span>After you submit</span><p>We&apos;ll review your context and confirm the best available time by email.</p></div></aside><ContactForm booking /></div></div></section></>;
}
