import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const { services } = await getSiteContent();
  return <>
    <PageHero eyebrow={services.eyebrow} title={services.title} lede={services.intro} image="/images/hero/supply-chain.jpg" imagePosition="48% 48%" crumbs={[{ label: "Services" }]} />
    <section className="services-page" data-color-flow="grotto"><div className="shell">{services.items.map((service) => <article id={service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")} className="service-row" key={service.number} data-reveal><h2>{service.title}</h2><div><p className="service-summary">{service.summary}</p><div className="service-body">{service.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div></article>)}</div></section>
  </>;
}
