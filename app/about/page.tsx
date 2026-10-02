import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const { about } = await getSiteContent();
  return <>
    <PageHero eyebrow={about.eyebrow} title={about.title} lede={about.intro} image="/images/hero/sustainable-business.jpg" imagePosition="50% 44%" crumbs={[{ label: "About" }]} />
    <section className="story-section" data-color-flow="aqua"><div className="shell story-grid" data-reveal><h2>Turning sustainability requirements into practical business action.</h2><div className="story-copy"><div className="story-paragraphs">{about.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="principles">{about.principles.map((item) => <article className="principle" key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></div></section>
    <section className="vision-section" data-color-flow="clear"><div className="shell vision-grid"><article data-reveal><span>Our vision</span><p>{about.vision}</p></article><article data-reveal><span>Our mission</span><p>{about.mission}</p></article></div></section>
    <section className="quote-band" data-color-flow="deep"><div className="shell" data-reveal><blockquote>“Credible reporting begins with <em>clear ownership, reliable data and strong governance.</em>”</blockquote></div></section>
  </>;
}
