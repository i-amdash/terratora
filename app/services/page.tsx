import type { Metadata } from "next";
import { ArrowUpRight } from "@/components/icons";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const { services } = await getSiteContent();
  return <>
    <section className="page-hero"><div className="shell"><p className="eyebrow">{services.eyebrow}</p><h1>From first question<br /><em>to lasting change.</em></h1><p className="lede">{services.intro}</p></div></section>
    <section className="services-page"><div className="shell">{services.items.map((service) => <article className="service-row" key={service.number} data-reveal><span>{service.number}</span><h2>{service.title}</h2><div><p>{service.summary}</p><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div><ArrowUpRight /></article>)}</div></section>
  </>;
}
