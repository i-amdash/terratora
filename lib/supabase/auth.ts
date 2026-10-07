import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { adminPermissions, normaliseAdminPermissions, type AdminPermission, type AdminRole } from "@/lib/admin-permissions";

export type AdminProfile = {
  user_id: string;
  full_name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  is_active: boolean;
};

export type AdminSession = { user: User; profile: AdminProfile };

export async function createAuthClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items: { name: string; value: string; options: CookieOptions }[]) => {
        try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Server component */ }
      },
    },
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const client = await createAuthClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data, error } = await client.from("admin_users").select("user_id,full_name,role,permissions,is_active").eq("user_id", user.id).maybeSingle();
  if (!error && data) {
    const role = isRole(data.role) ? data.role : "editor";
    if (data.is_active === false) return null;
    return {
      user,
      profile: {
        user_id: data.user_id,
        full_name: typeof data.full_name === "string" ? data.full_name : "",
        role,
        permissions: normaliseAdminPermissions(data.permissions, role),
        is_active: true,
      },
    };
  }

  const missingRoleColumns = error?.code === "42703" || error?.code === "PGRST204";
  if (!missingRoleColumns) return null;

  // Compatibility only until the roles migration has been applied.
  const { data: legacy } = await client.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return legacy ? {
    user,
    profile: { user_id: user.id, full_name: "", role: "owner", permissions: [...adminPermissions], is_active: true },
  } : null;
}

export function hasAdminPermission(profile: AdminProfile, permission: AdminPermission) {
  return profile.role === "owner" || profile.permissions.includes(permission);
}

export async function requireAdmin(permission?: AdminPermission) {
  const session = await getAdminSession();
  if (!session || (permission && !hasAdminPermission(session.profile, permission))) return null;
  return session.user;
}

export async function requireAnyAdminPermission(permissions: AdminPermission[]) {
  const session = await getAdminSession();
  if (!session || !permissions.some((permission) => hasAdminPermission(session.profile, permission))) return null;
  return session.user;
}

function isRole(value: unknown): value is AdminRole {
  return value === "owner" || value === "admin" || value === "editor" || value === "viewer";
}
