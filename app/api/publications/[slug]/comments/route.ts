import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const visitorKey = new URL(request.url).searchParams.get("visitor") ?? "";
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Comments are unavailable." }, { status: 503 });
  const { data: post } = await client.from("posts").select("id").eq("slug", slug).eq("published", true).maybeSingle();
  if (!post) return NextResponse.json({ error: "Publication not found." }, { status: 404 });
  const { data, error } = await client.from("publication_comments").select("id,parent_id,author_name,body,like_count,created_at").eq("post_id", post.id).eq("status", "published").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const comments = data ?? [];
  let likedIds = new Set<string>();
  if (validVisitorKey(visitorKey) && comments.length) {
    const { data: likes } = await client.from("publication_comment_likes").select("comment_id").eq("visitor_key", visitorKey).in("comment_id", comments.map((comment) => comment.id));
    likedIds = new Set((likes ?? []).map((like) => String(like.comment_id)));
  }
  return NextResponse.json(comments.map((comment) => ({ ...comment, liked: likedIds.has(comment.id) })), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const input = await request.json().catch(() => null);
  if (typeof input?.website === "string" && input.website) return NextResponse.json({ ok: true });
  const authorName = clean(input?.author_name, 100);
  const authorEmail = clean(input?.author_email, 240).toLowerCase();
  const body = clean(input?.body, 2000);
  const parentId = clean(input?.parent_id, 80) || null;
  if (!authorName || !body || !/^\S+@\S+\.\S+$/.test(authorEmail)) return NextResponse.json({ error: "Enter your name, a valid email address and your comment." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Comments are unavailable." }, { status: 503 });
  const { data: post } = await client.from("posts").select("id").eq("slug", slug).eq("published", true).maybeSingle();
  if (!post) return NextResponse.json({ error: "Publication not found." }, { status: 404 });
  if (parentId) {
    const { data: parent } = await client.from("publication_comments").select("id").eq("id", parentId).eq("post_id", post.id).eq("status", "published").maybeSingle();
    if (!parent) return NextResponse.json({ error: "The comment you are replying to is unavailable." }, { status: 400 });
  }
  const { data, error } = await client.from("publication_comments").insert({ post_id: post.id, parent_id: parentId, author_name: authorName, author_email: authorEmail, body, status: "published" }).select("id,parent_id,author_name,body,like_count,created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, liked: false }, { status: 201 });
}

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function validVisitorKey(value: string) {
  return /^[a-zA-Z0-9_-]{16,80}$/.test(value);
}
