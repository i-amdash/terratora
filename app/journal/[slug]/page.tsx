import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PublicationContent } from "@/components/publication-content";
import { PublicationInteractions } from "@/components/publication-interactions";
import { SharePublication } from "@/components/share-publication";
import { getPost, getPosts } from "@/lib/content";

export async function generateStaticParams() { return (await getPosts()).map((post) => ({ slug: post.slug })); }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const published = new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const readingTime = Math.max(1, Math.ceil(post.body.trim().split(/\s+/).length / 220));
  const authorName = post.author_name || "Terratora Editorial Team";

  return <><PageHero eyebrow={`${post.category} · ${published}`} title={post.title} lede={post.excerpt} image={post.image_url || "/images/hero/reporting.jpg"} imagePosition="50% 48%" crumbs={[{ label: "Publications", href: "/journal" }, { label: post.title }]} /><article className="article-page" data-color-flow="clear"><div className="shell article-layout"><aside className="article-details"><p className="eyebrow">Reading details</p><div className="article-author">{post.author_avatar_url ? <img src={post.author_avatar_url} alt={`${authorName}, author`} /> : <span aria-hidden="true">{initials(authorName)}</span>}<div><small>Written by</small><strong>{authorName}</strong></div></div><dl><div><dt>Published</dt><dd>{published}</dd></div><div><dt>Category</dt><dd>{post.category}</dd></div><div><dt>Reading time</dt><dd>{readingTime} min read</dd></div></dl><SharePublication slug={post.slug} title={post.title} initialReads={post.read_count} initialShares={post.share_count} /></aside><div className="article-prose"><p className="article-standfirst">{post.excerpt}</p><PublicationContent body={post.body} /><footer className="article-footer"><span>Keep exploring</span><Link href="/journal">More publications <span aria-hidden="true">→</span></Link></footer></div></div><PublicationInteractions slug={post.slug} initialLikes={post.like_count} /></article></>;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
