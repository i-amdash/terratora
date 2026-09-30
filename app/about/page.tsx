import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const { about } = await getSiteContent();
  return <>
    <PageHero eyebrow={about.eyebrow} title={about.title} lede={about.intro} image="/images/hero/sustainable-business.jpg" imagePosition="50% 44%" crumbs={[{ label: "About" }]} />
    <section className="story-section" data-color-flow="aqua"><div className="shell story-grid" data-reveal><h2>We believe clarity is something you make.</h2><div className="story-copy"><p>{about.body}</p><div className="principles">{about.principles.map((item) => <article className="principle" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></div></section>
    <section className="quote-band" data-color-flow="warm"><div className="shell" data-reveal><blockquote>“Not consultants at the edge of the room. <em>Partners in the middle of the work.</em>”</blockquote></div></section>
  </>;
}
