import { unstable_noStore as noStore } from "next/cache";
import { defaultContent, defaultPosts } from "./default-content";
import { createPublicClient } from "./supabase/server";
import type { Post, SiteContent } from "./types";

export async function getSiteContent(): Promise<SiteContent> {
  noStore();
  const supabase = createPublicClient();
  if (!supabase) return defaultContent;
  const { data } = await supabase.from("site_content").select("content").eq("id", "main").maybeSingle();
  if (!data?.content) return defaultContent;
  const saved = data.content as Partial<SiteContent>;
  return {
    ...defaultContent,
    ...saved,
    global: { ...defaultContent.global, ...saved.global },
    home: { ...defaultContent.home, ...saved.home },
    about: { ...defaultContent.about, ...saved.about },
    services: { ...defaultContent.services, ...saved.services },
    contact: { ...defaultContent.contact, ...saved.contact },
  };
}

export async function getPosts(): Promise<Post[]> {
  noStore();
  const supabase = createPublicClient();
  if (!supabase) return defaultPosts;
  const { data } = await supabase.from("posts").select("*").eq("published", true).order("published_at", { ascending: false });
  return data?.length ? (data as Post[]) : defaultPosts;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}
