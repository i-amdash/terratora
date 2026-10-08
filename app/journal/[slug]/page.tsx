import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PublicationContent } from "@/components/publication-content";
import { PublicationInteractions } from "@/components/publication-interactions";
import { SharePublication } from "@/components/share-publication";
import { getPost, getPosts } from "@/lib/content";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

type ArticleProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() { return (await getPosts()).map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: ArticleProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Publication not found", robots: { index: false, follow: false } };
  const canonical = `/journal/${post.slug}`;
  const image = post.image_url || "/images/hero/reporting.jpg";
  const author = post.author_name || "Terratora Editorial Team";
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: author }],
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: canonical,
      siteName: "Terratora",
      publishedTime: toIsoDate(post.published_at),
      modifiedTime: toIsoDate(post.updated_at || post.published_at),
      authors: [author],
      section: post.category,
      images: [{ url: image, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: [image] },
    robots: { index: true, follow: true },
  };
}

export default async function ArticlePage({ params }: ArticleProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const published = new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const readingTime = Math.max(1, Math.ceil(post.body.trim().split(/\s+/).length / 220));
  const authorName = post.author_name || "Terratora Editorial Team";
  const articleUrl = absoluteUrl(`/journal/${post.slug}`);
  const imageUrl = absoluteUrl(post.image_url || "/images/hero/reporting.jpg");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        headline: post.title,
        description: post.excerpt,
        image: [imageUrl],
        datePublished: toIsoDate(post.published_at),
        dateModified: toIsoDate(post.updated_at || post.published_at),
        mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
        author: { "@type": authorName.includes("Team") ? "Organization" : "Person", name: authorName },
        publisher: { "@type": "Organization", name: "Terratora", url: siteUrl, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
        articleSection: post.category,
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Publications", item: absoluteUrl("/journal") },
          { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
        ],
      },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><PageHero eyebrow={`${post.category} · ${published}`} title={post.title} lede={post.excerpt} image={post.image_url || "/images/hero/reporting.jpg"} imagePosition="50% 48%" crumbs={[{ label: "Publications", href: "/journal" }, { label: post.title }]} /><article className="article-page" data-color-flow="clear"><div className="shell article-layout"><aside className="article-details"><p className="eyebrow">Reading details</p><div className="article-author">{post.author_avatar_url ? <img src={post.author_avatar_url} alt={`${authorName}, author`} /> : <span aria-hidden="true">{initials(authorName)}</span>}<div><small>Written by</small><strong>{authorName}</strong></div></div><dl><div><dt>Published</dt><dd>{published}</dd></div><div><dt>Category</dt><dd>{post.category}</dd></div><div><dt>Reading time</dt><dd>{readingTime} min read</dd></div></dl><SharePublication slug={post.slug} title={post.title} initialReads={post.read_count} initialShares={post.share_count} /></aside><div className="article-prose"><p className="article-standfirst">{post.excerpt}</p><PublicationContent body={post.body} /><footer className="article-footer"><span>Keep exploring</span><Link href="/journal">More publications <span aria-hidden="true">→</span></Link></footer></div></div><PublicationInteractions slug={post.slug} initialLikes={post.like_count} /></article></>;
}

function toIsoDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
