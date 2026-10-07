import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { hasAdminPermission, getAdminSession } from "@/lib/supabase/auth";
import { isAdminRole, normaliseAdminPermissions } from "@/lib/admin-permissions";
import { defaultContent, defaultPosts } from "@/lib/default-content";
import { mergeSiteContent } from "@/lib/content";
import { createAdminClient, hasSupabase } from "@/lib/supabase/server";
import type { AdminUser, Author, Post } from "@/lib/types";

export const metadata: Metadata = { title: "CMS" };

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) return <AdminLogin configured={hasSupabase()} supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY} />;
  const { user, profile } = session;
  const client = createAdminClient();
  const canPublish = hasAdminPermission(profile, "manage_publications");
  const canViewMessages = hasAdminPermission(profile, "view_messages");
  const canViewBookings = hasAdminPermission(profile, "view_bookings");
  const canManageUsers = hasAdminPermission(profile, "manage_users");
  const empty = Promise.resolve({ data: [] as Record<string, unknown>[] });
  const [contentResult, postsResult, messagesResult, bookingsResult, authorsResult, profilesResult, authUsersResult] = client ? await Promise.all([
    client.from("site_content").select("content").eq("id","main").maybeSingle(),
    canPublish ? client.from("posts").select("*").order("published_at",{ascending:false}) : empty,
    canViewMessages ? client.from("messages").select("*").order("created_at",{ascending:false}) : empty,
    canViewBookings ? client.from("bookings").select("*").order("created_at",{ascending:false}) : empty,
    canPublish ? client.from("authors").select("*").order("name",{ascending:true}) : empty,
    canManageUsers ? client.from("admin_users").select("*").order("created_at",{ascending:true}) : empty,
    canManageUsers ? client.auth.admin.listUsers({ page: 1, perPage: 1000 }) : Promise.resolve({ data: { users: [] }, error: null }),
  ]) : [{data:null},{data:[]},{data:[]},{data:[]},{data:[]},{data:[]},{data:{users:[]}}];
  const saved = (contentResult.data?.content ?? {}) as Partial<typeof defaultContent>;
  const content = mergeSiteContent(saved);
  const posts = ((postsResult.data ?? defaultPosts) as Post[]).map((post) => ({ ...post, image_url: post.image_url || defaultPosts.find((fallback) => fallback.slug === post.slug)?.image_url }));
  const authUsers = new Map((authUsersResult.data?.users ?? []).map((item) => [item.id, item]));
  const adminUsers = (profilesResult.data ?? []).map((item) => {
    const authUser = authUsers.get(String(item.user_id));
    const role = isAdminRole(item.role) ? item.role : "editor";
    return {
      id: String(item.user_id),
      email: authUser?.email ?? "",
      full_name: typeof item.full_name === "string" ? item.full_name : String(authUser?.user_metadata?.full_name ?? ""),
      role,
      permissions: normaliseAdminPermissions(item.permissions, role),
      is_active: item.is_active !== false,
      created_at: authUser?.created_at ?? String(item.created_at ?? ""),
      last_sign_in_at: authUser?.last_sign_in_at,
    } satisfies AdminUser;
  });
  if (canManageUsers && !adminUsers.some((item) => item.id === user.id)) {
    adminUsers.unshift({ id: user.id, email: user.email ?? "", full_name: profile.full_name, role: profile.role, permissions: profile.permissions, is_active: true, created_at: user.created_at, last_sign_in_at: user.last_sign_in_at });
  }
  return <AdminDashboard currentUserId={user.id} email={user.email ?? "Admin"} role={profile.role} permissions={profile.permissions} users={adminUsers} content={content} posts={posts} authors={(authorsResult.data ?? []) as Author[]} messages={(messagesResult.data ?? [])} bookings={(bookingsResult.data ?? [])} />;
}
