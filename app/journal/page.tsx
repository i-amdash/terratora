import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage() {
  const posts = await getPosts();
  return <section className="journal-page"><div className="shell"><div className="journal-title"><div><p className="eyebrow">Ideas & observations</p><h1>Journal.</h1></div><p>Thinking for leaders and teams shaping what comes next.</p></div><div className="journal-list">{posts.map((post) => <Link className="journal-row" href={`/journal/${post.slug}`} key={post.slug} data-reveal><span>{post.category}<br />{new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span><h2>{post.title}</h2><p>{post.excerpt}</p><ArrowUpRight /></Link>)}</div></div></section>;
}
