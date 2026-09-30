import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Cookie policy" };

export default async function CookiesPage() {
  const { global } = await getSiteContent();
  return <><PageHero eyebrow="Browser preferences" title="Cookie policy" lede="A clear explanation of the browser storage used on this website." image="/images/hero/sustainable-business.jpg" imagePosition="50% 46%" crumbs={[{ label: "Cookie policy" }]} /><section className="policy-page" data-color-flow="aqua"><div className="shell policy-grid"><aside><p>Your controls</p><strong>Accept or reject optional cookies from the banner.</strong></aside><div className="policy-copy"><Policy title="What cookies are">Cookies and similar browser storage are small pieces of information that websites use to remember preferences or understand how a service is used.</Policy><Policy title="Essential storage">Terratora uses essential storage to remember your cookie choice and to support secure website functions. These functions cannot operate reliably without it.</Policy><Policy title="Optional analytics">If analytics are introduced, they will be treated as optional and will only be enabled after you accept optional cookies. Rejecting them will not prevent you from using the website.</Policy><Policy title="Managing your choice">You can clear this website’s stored data in your browser to reset your selection. Your browser settings can also block or remove cookies.</Policy><Policy title="Questions">For questions about this policy, email <a href={`mailto:${global.email}`}>{global.email}</a>.</Policy></div></div></section></>;
}

function Policy({ title, children }: { title: string; children: ReactNode }) {
  return <article data-reveal><h2>{title}</h2><p>{children}</p></article>;
}
