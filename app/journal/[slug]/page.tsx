import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";

export async function generateStaticParams() { return (await getPosts()).map((post) => ({ slug: post.slug })); }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <article className="article-page"><div className="shell article-head"><p className="eyebrow">{post.category} · {new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p><h1>{post.title}</h1><p className="article-excerpt">{post.excerpt}</p></div><div className="article-body">{post.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article>;
}
