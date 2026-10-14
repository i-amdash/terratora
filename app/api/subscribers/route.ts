import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const input = await request.json().catch(() => null);
  const name = clean(input?.name, 160);
  const email = clean(input?.email, 320).toLowerCase();
  const consent = input?.consent === "accepted";
  const source = input?.source === "journal-popup" ? "journal-popup" : "footer";
  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!consent) return NextResponse.json({ error: "Please agree to the Privacy Policy before subscribing." }, { status: 400 });

  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Subscriptions are not configured yet." }, { status: 503 });
  const now = new Date().toISOString();
  const payload = { name, email, consent_at: now, consent_source: source, subscribed_at: now, updated_at: now, unsubscribe_token: crypto.randomUUID() };
  const { data: subscriber, error } = await client
    .from("subscribers")
    .upsert(payload, { onConflict: "email" })
    .select("id")
    .single();

  if (error || !subscriber) {
    console.error("Subscriber upsert failed", { code: error?.code, message: error?.message });
    return NextResponse.json({ error: "We could not save your subscription. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}
