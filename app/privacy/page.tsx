import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy policy" };

export default async function PrivacyPage() {
  const { global } = await getSiteContent();
  return <><PageHero eyebrow="Your information" title="Privacy policy" lede="How Terratora handles the personal information you share through this website." image="/images/hero/reporting.jpg" imagePosition="50% 48%" crumbs={[{ label: "Privacy policy" }]} /><section className="policy-page" data-color-flow="clear"><div className="shell policy-grid"><aside><p>Last reviewed</p><strong>30 September 2026</strong></aside><div className="policy-copy"><Policy title="Information we collect">When you contact us or request a session, we collect the information you enter, such as your name, work email, organisation, service interest, message, requested date and time, and timezone.</Policy><Policy title="How we use it">We use this information to respond to your enquiry, arrange a requested session, understand your organisation’s needs, maintain appropriate business records and protect the security of our services.</Policy><Policy title="How information is handled">Information may be processed by service providers that support our website, database and email delivery. We limit access to people and providers who need it for these purposes and retain information only for as long as reasonably necessary.</Policy><Policy title="Your choices">You may ask to access, correct or delete personal information you have submitted, subject to any legal or record-keeping obligations that apply.</Policy><Policy title="Contact us">For privacy questions or requests, email <a href={`mailto:${global.email}`}>{global.email}</a>.</Policy></div></div></section></>;
}

function Policy({ title, children }: { title: string; children: ReactNode }) {
  return <article data-reveal><h2>{title}</h2><p>{children}</p></article>;
}
