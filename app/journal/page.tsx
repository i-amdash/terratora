import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPosts } from "@/lib/content";

const postsPerPage = 8;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const requestedPage = Number.parseInt((await searchParams).page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 1 ? requestedPage : 1;
  const title = page > 1 ? `Publications — Page ${page}` : "Publications";
  const description = "Practical ESG, sustainability reporting and long-term value insight for organisations in Nigeria, Africa and global markets.";
  const canonical = page > 1 ? `/journal?page=${page}` : "/journal";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", title, description, url: canonical, images: ["/images/hero/reporting.jpg"] },
    twitter: { card: "summary_large_image", title, description, images: ["/images/hero/reporting.jpg"] },
  };
}

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const posts = await getPosts();
  const requestedPage = Number.parseInt((await searchParams).page ?? "1", 10);
  const pageCount = Math.max(1, Math.ceil(posts.length / postsPerPage));
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visiblePosts = posts.slice((page - 1) * postsPerPage, page * postsPerPage);
  return <><PageHero eyebrow="Articles & resources" title="Publications" lede="Practical insight for organisations navigating ESG, sustainability reporting and long-term value." image="/images/hero/reporting.jpg" imagePosition="50% 48%" crumbs={[{ label: "Publications" }]} /><section className="journal-page" data-color-flow="clear"><div className="shell"><div className="publication-grid">{visiblePosts.map((post) => <Link className="publication-card" href={`/journal/${post.slug}`} key={post.slug} data-reveal><div className="publication-image">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={post.image_url || "/images/hero/reporting.jpg"} alt="" /></div><div className="publication-copy"><span>{post.category} · {new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span><h2>{post.title}</h2><p>{post.excerpt}</p><small className="publication-byline">By {post.author_name || "Terratora Editorial Team"}</small><div className="publication-card-footer"><strong>Read publication <ArrowRight /></strong><small>{(post.read_count ?? 0).toLocaleString()} reads · {(post.like_count ?? 0).toLocaleString()} likes</small></div></div></Link>)}</div>{pageCount > 1 && <nav className="publication-pagination" aria-label="Publication pages"><Link className={page <= 1 ? "disabled" : ""} aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} href={page > 1 ? `/journal?page=${page - 1}` : "/journal"}>Previous</Link><span>Page {page} of {pageCount}</span><Link className={page >= pageCount ? "disabled" : ""} aria-disabled={page >= pageCount} tabIndex={page >= pageCount ? -1 : undefined} href={page < pageCount ? `/journal?page=${page + 1}` : `/journal?page=${pageCount}`}>Next</Link></nav>}</div></section></>;
}
