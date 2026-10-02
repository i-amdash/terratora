import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json().catch(() => null) as { type?: unknown } | null;
  if (body?.type !== "read" && body?.type !== "share") {
    return NextResponse.json({ error: "Invalid engagement type." }, { status: 400 });
  }

  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Engagement tracking is unavailable." }, { status: 503 });

  const functionName = body.type === "read" ? "increment_post_read" : "increment_post_share";
  const { data, error } = await client.rpc(functionName, { post_slug: slug }).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Publication not found." }, { status: 404 });

  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
