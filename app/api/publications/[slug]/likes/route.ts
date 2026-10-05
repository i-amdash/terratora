import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const visitorKey = new URL(request.url).searchParams.get("visitor") ?? "";
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Likes are unavailable." }, { status: 503 });
  const { data: post } = await client.from("posts").select("id,like_count").eq("slug", slug).eq("published", true).maybeSingle();
  if (!post) return NextResponse.json({ error: "Publication not found." }, { status: 404 });
  let liked = false;
  if (validVisitorKey(visitorKey)) {
    const { data } = await client.from("publication_likes").select("post_id").eq("post_id", post.id).eq("visitor_key", visitorKey).maybeSingle();
    liked = Boolean(data);
  }
  return NextResponse.json({ like_count: post.like_count ?? 0, liked }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const input = await request.json().catch(() => null);
  const visitorKey = typeof input?.visitor_key === "string" ? input.visitor_key : "";
  if (!validVisitorKey(visitorKey)) return NextResponse.json({ error: "Invalid visitor identifier." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Likes are unavailable." }, { status: 503 });
  const { data, error } = await client.rpc("toggle_post_like", { post_slug: slug, visitor_token: visitorKey }).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Publication not found." }, { status: 404 });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

function validVisitorKey(value: string) {
  return /^[a-zA-Z0-9_-]{16,80}$/.test(value);
}
