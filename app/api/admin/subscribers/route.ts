import { NextResponse } from "next/server";
import { getAdminSession, hasAdminPermission } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { removeResendContact } from "@/lib/resend";

const allowedPageSizes = new Set([10, 25, 50]);

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasAdminPermission(session.profile, "manage_newsletters")) {
    return NextResponse.json({ error: "You do not have permission to view subscribers." }, { status: 403 });
  }

  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const params = new URL(request.url).searchParams;
  const requestedPage = Number.parseInt(params.get("page") ?? "1", 10);
  const requestedPageSize = Number.parseInt(params.get("per_page") ?? "25", 10);
  const exportAll = params.get("export") === "1";
  const fromDate = validDate(params.get("from"));
  const toDate = validDate(params.get("to"));
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const perPage = allowedPageSizes.has(requestedPageSize) ? requestedPageSize : 25;
  const from = (page - 1) * perPage;

  let query = client
    .from("subscribers")
    .select("id,name,email,consent_at,consent_source,subscribed_at,updated_at", { count: "exact" })
    .order("subscribed_at", { ascending: false });
  if (fromDate) query = query.gte("subscribed_at", `${fromDate}T00:00:00.000Z`);
  if (toDate) query = query.lte("subscribed_at", `${toDate}T23:59:59.999Z`);
  const { data, count, error } = exportAll ? await query.limit(10000) : await query.range(from, from + perPage - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? 0;
  return NextResponse.json(
    {
      subscribers: data ?? [],
      total,
      page,
      per_page: perPage,
      page_count: Math.max(1, Math.ceil(total / perPage)),
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasAdminPermission(session.profile, "manage_newsletters")) return NextResponse.json({ error: "You do not have permission to edit subscribers." }, { status: 403 });
  const input = await request.json().catch(() => null);
  const id = clean(input?.id, 80);
  const name = clean(input?.name, 160);
  const email = clean(input?.email, 320).toLowerCase();
  const consentSource = clean(input?.consent_source, 80) || "website";
  if (!id || !name || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid name and email address." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: existing } = await client.from("subscribers").select("email").eq("id", id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });
  try {
    // Removing first prevents an edited address from remaining in the provider audience.
    await removeResendContact(client, existing.email);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The newsletter contact could not be updated." }, { status: 502 });
  }
  const { data, error } = await client.from("subscribers").update({ name, email, consent_source: consentSource, updated_at: new Date().toISOString() }).eq("id", id).select("id,name,email,consent_at,consent_source,subscribed_at,updated_at").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "That email address is already subscribed." : error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasAdminPermission(session.profile, "manage_newsletters")) return NextResponse.json({ error: "You do not have permission to delete subscribers." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing subscriber ID." }, { status: 400 });
  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data } = await client.from("subscribers").select("email").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });
  try {
    await removeResendContact(client, data.email);
    const { error } = await client.from("subscribers").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Subscriber deletion failed." }, { status: 500 });
  }
}

function validDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}
