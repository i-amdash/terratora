import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

const statuses = new Set(["pending", "scheduled", "completed", "cancelled"]);

export async function PATCH(request: Request) {
  if (!await requireAdmin("view_bookings")) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const input = await request.json().catch(() => null);
  if (typeof input?.id !== "string" || !statuses.has(input?.status)) return NextResponse.json({ error: "Choose a valid booking status." }, { status: 400 });
  const scheduledAt = typeof input.scheduled_at === "string" && input.scheduled_at ? new Date(input.scheduled_at) : null;
  if ((input.status === "scheduled" || input.status === "completed") && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) return NextResponse.json({ error: "Select the confirmed session date and time." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const scheduledIso = scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt.toISOString() : null;
  const update = { status: input.status, scheduled_at: input.status === "pending" ? null : scheduledIso };
  const { data, error } = await client.from("bookings").update(update).eq("id", input.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
