import type { Metadata } from "next";
import { ArrowUpRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const { services } = await getSiteContent();
  return <>
    <PageHero eyebrow={services.eyebrow} title={services.title} lede={services.intro} image="/images/hero/operations.jpg" imagePosition="52% 54%" crumbs={[{ label: "Services" }]} />
    <section className="services-page" data-color-flow="grotto"><div className="shell">{services.items.map((service) => <article className="service-row" key={service.number} data-reveal><span>{service.number}</span><h2>{service.title}</h2><div><p>{service.summary}</p><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div><ArrowUpRight /></article>)}</div></section>
  </>;
}
