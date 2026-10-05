import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string; commentId: string }> }) {
  const { slug, commentId } = await params;
  const input = await request.json().catch(() => null);
  const visitorKey = typeof input?.visitor_key === "string" ? input.visitor_key : "";
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(visitorKey)) return NextResponse.json({ error: "Invalid visitor identifier." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Comment likes are unavailable." }, { status: 503 });
  const { data: post } = await client.from("posts").select("id").eq("slug", slug).eq("published", true).maybeSingle();
  if (!post) return NextResponse.json({ error: "Publication not found." }, { status: 404 });
  const { data: comment } = await client.from("publication_comments").select("id").eq("id", commentId).eq("post_id", post.id).eq("status", "published").maybeSingle();
  if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  const { data, error } = await client.rpc("toggle_comment_like", { target_comment_id: commentId, visitor_token: visitorKey }).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
