import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

const statuses = new Set(["new", "in_progress", "completed"]);

export async function PATCH(request: Request) {
  if (!await requireAdmin("view_messages")) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const input = await request.json().catch(() => null);
  if (typeof input?.id !== "string" || !statuses.has(input?.status)) return NextResponse.json({ error: "Choose a valid message status." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data, error } = await client.from("messages").update({ status: input.status }).eq("id", input.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  if (!await requireAdmin("view_messages")) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing message identifier." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { error } = await client.from("messages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
