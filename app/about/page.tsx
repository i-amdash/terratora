import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const { about } = await getSiteContent();
  return <>
    <section className="page-hero"><div className="shell"><p className="eyebrow">{about.eyebrow}</p><h1>Built for the space<br /><em>between ambition & action.</em></h1><p className="lede">{about.intro}</p></div></section>
    <section className="story-section"><div className="shell story-grid" data-reveal><h2>We believe clarity is something you make.</h2><div className="story-copy"><p>{about.body}</p><div className="principles">{about.principles.map((item) => <article className="principle" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></div></section>
    <section className="quote-band"><div className="shell" data-reveal><blockquote>“Not consultants at the edge of the room. <em>Partners in the middle of the work.</em>”</blockquote></div></section>
  </>;
}
