import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const input = await request.json().catch(() => null);
  const name = clean(input?.name, 120);
  if (!name) return NextResponse.json({ error: "Enter the author’s name." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data, error } = await client.from("authors").insert({ name, role: clean(input?.role, 120) || null, bio: clean(input?.bio, 1200) || null, avatar_url: clean(input?.avatar_url, 1000) || null }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const input = await request.json().catch(() => null);
  const id = clean(input?.id, 80);
  const name = clean(input?.name, 120);
  if (!id || !name) return NextResponse.json({ error: "Choose an author and enter their name." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const author = { name, role: clean(input?.role, 120) || null, bio: clean(input?.bio, 1200) || null, avatar_url: clean(input?.avatar_url, 1000) || null, updated_at: new Date().toISOString() };
  const { data, error } = await client.from("authors").update(author).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { error: syncError } = await client.from("posts").update({ author_name: name, author_avatar_url: author.avatar_url, updated_at: new Date().toISOString() }).eq("author_id", id);
  if (syncError) return NextResponse.json({ error: syncError.message }, { status: 500 });
  return NextResponse.json(data);
}

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}
