import type { Post, SiteContent } from "./types";
import siteContent from "@/content/site-content.json";
import sitePosts from "@/content/posts.json";

export const defaultContent = siteContent as SiteContent;

export const defaultPosts = sitePosts as Post[];
