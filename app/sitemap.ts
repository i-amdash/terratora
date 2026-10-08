import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

const publicPages = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/journal", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/book", changeFrequency: "yearly", priority: 0.6 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const pages: MetadataRoute.Sitemap = publicPages.map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
  const publications: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/journal/${post.slug}`),
    lastModified: post.updated_at || post.published_at,
    changeFrequency: "monthly",
    priority: 0.8,
    images: post.image_url ? [absoluteUrl(post.image_url)] : undefined,
  }));
  return [...pages, ...publications];
}
