import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { defaultContent, defaultPosts } from "@/lib/default-content";
import { mergeSiteContent } from "@/lib/content";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient, hasSupabase } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export const metadata: Metadata = { title: "CMS" };

export default async function AdminPage() {
  const user = await requireAdmin();
  if (!user) return <AdminLogin configured={hasSupabase()} supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY} />;
  const client = createAdminClient();
  const [contentResult, postsResult, messagesResult, bookingsResult] = client ? await Promise.all([
    client.from("site_content").select("content").eq("id","main").maybeSingle(),
    client.from("posts").select("*").order("published_at",{ascending:false}),
    client.from("messages").select("*").order("created_at",{ascending:false}),
    client.from("bookings").select("*").order("created_at",{ascending:false}),
  ]) : [{data:null},{data:null},{data:null},{data:null}];
  const saved = (contentResult.data?.content ?? {}) as Partial<typeof defaultContent>;
  const content = mergeSiteContent(saved);
  const posts = ((postsResult.data ?? defaultPosts) as Post[]).map((post) => ({ ...post, image_url: post.image_url || defaultPosts.find((fallback) => fallback.slug === post.slug)?.image_url }));
  return <AdminDashboard email={user.email ?? "Admin"} content={content} posts={posts} messages={(messagesResult.data ?? [])} bookings={(bookingsResult.data ?? [])} />;
}
