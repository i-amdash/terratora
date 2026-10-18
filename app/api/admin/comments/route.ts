import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

const statuses = new Set(["pending", "published", "hidden"]);

export async function PATCH(request: Request) {
  if (!await requireAdmin("manage_publications")) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const input = await request.json().catch(() => null);
  const id = clean(input?.id, 80);
  const status = clean(input?.status, 20);
  if (!id || !statuses.has(status)) return NextResponse.json({ error: "Choose a valid comment status." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data, error } = await client.from("publication_comments").update({ status }).eq("id", id).select("id,status").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await requireAdmin("manage_publications");
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const input = await request.json().catch(() => null);
  const parentId = clean(input?.parent_id, 80);
  const body = clean(input?.body, 2000);
  if (!parentId || !body) return NextResponse.json({ error: "Write a reply first." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: parent } = await client.from("publication_comments").select("id,post_id").eq("id", parentId).maybeSingle();
  if (!parent) return NextResponse.json({ error: "The original comment could not be found." }, { status: 404 });
  const { data, error } = await client.from("publication_comments").insert({ post_id: parent.post_id, parent_id: parent.id, author_name: "Terratora Team", author_email: user.email ?? "team@terratoraconsulting.com", body, status: "published", is_team: true }).select("id,post_id,parent_id,author_name,author_email,body,like_count,status,is_team,created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!await requireAdmin("manage_publications")) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing comment identifier." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { error } = await client.from("publication_comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}
