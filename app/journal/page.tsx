import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = { title: "Publications" };

export default async function JournalPage() {
  const posts = await getPosts();
  return <><PageHero eyebrow="Articles & resources" title="Publications" lede="Practical insight for organisations navigating ESG, sustainability reporting and long-term value." image="/images/hero/reporting.jpg" imagePosition="50% 48%" crumbs={[{ label: "Publications" }]} /><section className="journal-page" data-color-flow="clear"><div className="shell"><div className="journal-list">{posts.map((post) => <Link className="journal-row" href={`/journal/${post.slug}`} key={post.slug} data-reveal><span>{post.category}<br />{new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span><h2>{post.title}</h2><p>{post.excerpt}</p><ArrowUpRight /></Link>)}</div></div></section></>;
}
