import type { Metadata } from "next";
import { ArrowUpRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const { services } = await getSiteContent();
  return <>
    <PageHero eyebrow={services.eyebrow} title={services.title} lede={services.intro} image="/images/hero/operations.jpg" imagePosition="52% 54%" crumbs={[{ label: "Services" }]} />
    <section className="services-page" data-color-flow="grotto"><div className="shell">{services.items.map((service) => <article id={service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")} className="service-row" key={service.number} data-reveal><span>{service.number}</span><h2>{service.title}</h2><div><p className="service-summary">{service.summary}</p><div className="service-body">{service.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><h3>What this can include</h3><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div><ArrowUpRight /></article>)}</div></section>
    <section className="starting-points" data-color-flow="clear"><div className="shell"><div className="starting-heading" data-reveal><p className="section-index">Find your starting point</p><h2>Where should<br /><em>you start?</em></h2></div><div className="starting-list">{services.startingPoints.map((item, index) => <article key={item.situation} data-reveal><span>{String(index + 1).padStart(2, "0")}</span><p>{item.situation}</p><strong>{item.service}</strong></article>)}</div></div></section>
  </>;
}
