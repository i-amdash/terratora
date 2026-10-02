import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { SharePublication } from "@/components/share-publication";
import { getPost, getPosts } from "@/lib/content";

export async function generateStaticParams() { return (await getPosts()).map((post) => ({ slug: post.slug })); }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <><PageHero eyebrow={`${post.category} · ${new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`} title={post.title} lede={post.excerpt} image={post.image_url || "/images/hero/reporting.jpg"} imagePosition="50% 48%" crumbs={[{ label: "Publications", href: "/journal" }, { label: post.title }]} /><article className="article-page" data-color-flow="clear"><div className="article-body"><SharePublication title={post.title} />{post.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<SharePublication title={post.title} /></div></article></>;
}
