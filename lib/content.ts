import { unstable_noStore as noStore } from "next/cache";
import { defaultContent, defaultPosts } from "./default-content";
import { createPublicClient } from "./supabase/server";
import type { Post, SiteContent } from "./types";

export function mergeSiteContent(saved: Partial<SiteContent> = {}): SiteContent {
  const savedServices = saved.services;
  const savedHome = saved.home;
  const serviceItems = savedServices?.items?.map((item, index) => {
    const fallback = defaultContent.services.items.find((entry) => entry.number === item.number) ?? defaultContent.services.items[index];
    return {
      ...(fallback ?? { number: String(index + 1).padStart(2, "0"), title: "Service", summary: "", body: "", deliverables: [] }),
      ...item,
      body: item.body || fallback?.body || item.summary,
      deliverables: item.deliverables ?? fallback?.deliverables ?? [],
    };
  }) ?? defaultContent.services.items;
  const heroSlides = (savedHome?.heroSlides ?? defaultContent.home.heroSlides).slice(0, 3).map((slide, index) => {
    const fallback = defaultContent.home.heroSlides[index] ?? defaultContent.home.heroSlides[0];
    const legacyHeadline = index === 0 ? savedHome : undefined;
    return {
      ...fallback,
      ...slide,
      eyebrow: slide.eyebrow || legacyHeadline?.eyebrow || fallback.eyebrow,
      title: slide.title || legacyHeadline?.title || fallback.title,
      titleAccent: slide.titleAccent || legacyHeadline?.titleAccent || fallback.titleAccent,
    };
  });

  return {
    ...defaultContent,
    ...saved,
    global: { ...defaultContent.global, ...saved.global },
    home: {
      ...defaultContent.home,
      ...savedHome,
      organisations: savedHome?.organisations ?? defaultContent.home.organisations,
      heroSlides,
    },
    about: { ...defaultContent.about, ...saved.about },
    services: {
      ...defaultContent.services,
      ...savedServices,
      items: serviceItems,
      startingPoints: savedServices?.startingPoints ?? defaultContent.services.startingPoints,
    },
    contact: { ...defaultContent.contact, ...saved.contact },
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  noStore();
  const supabase = createPublicClient();
  if (!supabase) return defaultContent;
  const { data } = await supabase.from("site_content").select("content").eq("id", "main").maybeSingle();
  if (!data?.content) return defaultContent;
  return mergeSiteContent(data.content as Partial<SiteContent>);
}

export async function getPosts(): Promise<Post[]> {
  noStore();
  const supabase = createPublicClient();
  if (!supabase) return defaultPosts;
  const { data } = await supabase.from("posts").select("*").eq("published", true).order("published_at", { ascending: false });
  return data?.length ? (data as Post[]).map((post) => ({
    ...post,
    image_url: post.image_url || defaultPosts.find((fallback) => fallback.slug === post.slug)?.image_url,
  })) : defaultPosts;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}
