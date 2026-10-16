import { NextResponse } from "next/server";
import { getAdminSession, hasAdminPermission } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { renderBroadcastNewsletterEmail } from "@/lib/newsletters";
import { createResendBroadcast, discardResendBroadcast, prepareNewsletterAudience } from "@/lib/resend";

type NewsletterAction = "draft" | "send" | "schedule";

export async function POST(request: Request) {
  return saveNewsletter(request, false);
}

export async function PUT(request: Request) {
  return saveNewsletter(request, true);
}

export async function DELETE(request: Request) {
  const session = await authorised();
  if (!session) return NextResponse.json({ error: "You do not have permission to delete newsletters." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing newsletter ID." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data } = await client.from("newsletters").select("status,resend_broadcast_id").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Newsletter not found." }, { status: 404 });
  try {
    if (data.resend_broadcast_id && ["draft", "scheduled"].includes(data.status)) await discardResendBroadcast(data.resend_broadcast_id, data.status === "scheduled");
    const { error } = await client.from("newsletters").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: message(error) }, { status: 502 });
  }
}

async function saveNewsletter(request: Request, editing: boolean) {
  const session = await authorised();
  if (!session) return NextResponse.json({ error: "You do not have permission to manage newsletters." }, { status: 403 });
  const input = await request.json().catch(() => null);
  const id = clean(input?.id, 80);
  const subject = clean(input?.subject, 200).replace(/[\r\n]+/g, " ");
  const body = clean(input?.body, 50000);
  const action: NewsletterAction = input?.action === "send" || input?.action === "schedule" ? input.action : "draft";
  const scheduledFor = action === "schedule" ? parseFutureDate(input?.scheduled_for) : null;
  if (!subject || !body) return NextResponse.json({ error: "Enter a subject and newsletter body." }, { status: 400 });
  if (editing && !id) return NextResponse.json({ error: "Missing newsletter ID." }, { status: 400 });
  if (action === "schedule" && !scheduledFor) return NextResponse.json({ error: "Choose a delivery time between two minutes and 30 days from now." }, { status: 400 });

  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const now = new Date().toISOString();
  let newsletterId = id;
  let existing: { status: string; resend_broadcast_id?: string | null } | null = null;
  if (editing) {
    existing = (await client.from("newsletters").select("status,resend_broadcast_id").eq("id", id).maybeSingle()).data;
    if (!existing) return NextResponse.json({ error: "Newsletter not found." }, { status: 404 });
    if (existing.status === "sent" && action !== "draft") return NextResponse.json({ error: "A sent newsletter cannot be sent again. Create a new newsletter instead." }, { status: 400 });
  } else {
    const { data, error } = await client.from("newsletters").insert({ subject, body, status: "draft", recipient_count: 0, created_by: session.user.id }).select("id").single();
    if (error || !data) return NextResponse.json({ error: error?.message ?? "The newsletter could not be created." }, { status: 500 });
    newsletterId = data.id;
  }

  try {
    if (existing?.resend_broadcast_id && ["draft", "scheduled"].includes(existing.status)) await discardResendBroadcast(existing.resend_broadcast_id, existing.status === "scheduled");
    if (action === "draft") {
      const preserveSent = existing?.status === "sent";
      const { data, error } = await client.from("newsletters").update({ subject, body, status: preserveSent ? "sent" : "draft", scheduled_for: preserveSent ? undefined : null, resend_broadcast_id: preserveSent ? existing?.resend_broadcast_id : null, last_error: null, updated_at: now }).eq("id", newsletterId).select("*").single();
      if (error) throw new Error(error.message);
      return NextResponse.json(data);
    }

    await client.from("newsletters").update({ subject, body, status: "sending", scheduled_for: scheduledFor, last_error: null, updated_at: now }).eq("id", newsletterId);
    const audience = await prepareNewsletterAudience(client);
    if (!audience.recipientCount) throw new Error("There are no subscribers to receive this newsletter.");
    const email = renderBroadcastNewsletterEmail({ subject, body });
    const broadcast = await createResendBroadcast({ segmentId: audience.segmentId, subject, html: email.html, text: email.text, scheduledAt: scheduledFor ?? undefined });
    const status = action === "schedule" ? "scheduled" : "sent";
    const { data, error } = await client.from("newsletters").update({ subject, body, status, recipient_count: audience.recipientCount, resend_broadcast_id: broadcast.id, scheduled_for: scheduledFor, sent_at: action === "send" ? now : null, updated_at: now }).eq("id", newsletterId).select("*").single();
    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (error) {
    const detail = message(error);
    await client.from("newsletters").update({ status: "failed", last_error: detail.slice(0, 1000), updated_at: new Date().toISOString() }).eq("id", newsletterId);
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}

async function authorised() {
  const session = await getAdminSession();
  return session && hasAdminPermission(session.profile, "manage_newsletters") ? session : null;
}

function parseFutureDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  const timestamp = date.getTime();
  return Number.isFinite(timestamp) && timestamp > Date.now() + 60_000 && timestamp <= Date.now() + 30 * 24 * 60 * 60 * 1000 ? date.toISOString() : null;
}

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "The newsletter operation failed.";
}
