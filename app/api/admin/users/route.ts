import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { adminRoleDefaults, isAdminRole, normaliseAdminPermissions, type AdminRole } from "@/lib/admin-permissions";
import { getAdminSession, hasAdminPermission } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasAdminPermission(session.profile, "manage_users")) return denied();
  const input = await request.json().catch(() => null);
  const email = clean(input?.email, 320).toLowerCase();
  const fullName = clean(input?.full_name, 160);
  const password = typeof input?.password === "string" ? input.password : "";
  const requestedRole: unknown = input?.role;
  const role: AdminRole = isAdminRole(requestedRole) ? requestedRole : "editor";
  const permissions = normaliseAdminPermissions(input?.permissions ?? adminRoleDefaults[role], role);
  if (!email || !email.includes("@") || !fullName) return NextResponse.json({ error: "Enter the user’s name and a valid email address." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Temporary passwords must contain at least 8 characters." }, { status: 400 });
  if (role === "owner" && session.profile.role !== "owner") return NextResponse.json({ error: "Only an owner can create another owner." }, { status: 403 });

  const client = createAdminClient();
  if (!client) return unavailable();
  const { data: created, error: createError } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createError || !created.user) return NextResponse.json({ error: createError?.message ?? "The user could not be created." }, { status: 400 });

  const profile = { user_id: created.user.id, full_name: fullName, role, permissions, is_active: true, updated_at: new Date().toISOString() };
  const { data, error } = await client.from("admin_users").insert(profile).select("*").single();
  if (error) {
    await client.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(toAdminUser(created.user, data), { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasAdminPermission(session.profile, "manage_users")) return denied();
  const input = await request.json().catch(() => null);
  const id = clean(input?.id, 80);
  const email = clean(input?.email, 320).toLowerCase();
  const fullName = clean(input?.full_name, 160);
  const password = typeof input?.password === "string" ? input.password : "";
  if (!id || !email || !email.includes("@") || !fullName || !isAdminRole(input?.role)) return NextResponse.json({ error: "Complete the user’s name, email and role." }, { status: 400 });
  if (password && password.length < 8) return NextResponse.json({ error: "New passwords must contain at least 8 characters." }, { status: 400 });

  const client = createAdminClient();
  if (!client) return unavailable();
  const { data: current, error: currentError } = await client.from("admin_users").select("*").eq("user_id", id).maybeSingle();
  if (currentError || !current) return NextResponse.json({ error: "This CMS user could not be found." }, { status: 404 });
  if (current.role === "owner" && session.profile.role !== "owner") return NextResponse.json({ error: "Only an owner can edit another owner." }, { status: 403 });

  let role = input.role;
  let permissions = normaliseAdminPermissions(input.permissions, role);
  let isActive = input.is_active !== false;
  if (role === "owner" && session.profile.role !== "owner") return NextResponse.json({ error: "Only an owner can assign the owner role." }, { status: 403 });
  if (id === session.user.id) {
    role = session.profile.role;
    permissions = session.profile.permissions;
    isActive = true;
  }

  if (current.role === "owner" && current.is_active !== false && (role !== "owner" || !isActive)) {
    const { count } = await client.from("admin_users").select("user_id", { count: "exact", head: true }).eq("role", "owner").eq("is_active", true).neq("user_id", id);
    if (!count) return NextResponse.json({ error: "At least one active owner must remain." }, { status: 400 });
  }

  const attributes: { email: string; email_confirm: boolean; password?: string; user_metadata: { full_name: string } } = {
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  };
  if (password) attributes.password = password;
  const { data: updatedAuth, error: authError } = await client.auth.admin.updateUserById(id, attributes);
  if (authError || !updatedAuth.user) return NextResponse.json({ error: authError?.message ?? "The login details could not be updated." }, { status: 400 });

  const profile = { full_name: fullName, role, permissions, is_active: isActive, updated_at: new Date().toISOString() };
  const { data, error } = await client.from("admin_users").update(profile).eq("user_id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toAdminUser(updatedAuth.user, data));
}

function toAdminUser(user: User, profile: Record<string, unknown>) {
  const role = isAdminRole(profile.role) ? profile.role : "editor";
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: typeof profile.full_name === "string" ? profile.full_name : String(user.user_metadata?.full_name ?? ""),
    role,
    permissions: normaliseAdminPermissions(profile.permissions, role),
    is_active: profile.is_active !== false,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
  };
}

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function denied() {
  return NextResponse.json({ error: "You do not have permission to manage CMS users." }, { status: 403 });
}

function unavailable() {
  return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
}
