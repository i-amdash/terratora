import { NextResponse } from "next/server";
import { getAdminSession, hasAdminPermission } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

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
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const perPage = allowedPageSizes.has(requestedPageSize) ? requestedPageSize : 25;
  const from = (page - 1) * perPage;

  const { data, count, error } = await client
    .from("subscribers")
    .select("id,name,email,consent_at,consent_source,subscribed_at,updated_at", { count: "exact" })
    .order("subscribed_at", { ascending: false })
    .range(from, from + perPage - 1);

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
