import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const input = await request.json().catch(() => null);
  const token = typeof input?.token === "string" ? input.token.trim() : "";
  if (!uuidPattern.test(token)) return NextResponse.json({ error: "This unsubscribe link is invalid or has already been used." }, { status: 400 });
  if (input?.consent !== "accepted") return NextResponse.json({ error: "Please confirm that you want us to remove your subscriber data." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Subscriptions are unavailable." }, { status: 503 });
  const { error } = await client.from("subscribers").delete().eq("unsubscribe_token", token);
  if (error) return NextResponse.json({ error: "We could not complete your request. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
