import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { getPost, getPosts } from "@/lib/content";

export async function generateStaticParams() { return (await getPosts()).map((post) => ({ slug: post.slug })); }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <><PageHero eyebrow={`${post.category} · ${new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`} title={post.title} lede={post.excerpt} image="/images/hero/reporting.jpg" imagePosition="50% 48%" crumbs={[{ label: "Insights", href: "/journal" }, { label: post.title }]} /><article className="article-page"><div className="article-body">{post.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article></>;
}
