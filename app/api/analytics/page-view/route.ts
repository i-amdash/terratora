import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

type PageViewInput = {
  path?: unknown;
  sessionId?: unknown;
  visitorId?: unknown;
};

const identifierPattern = /^[a-zA-Z0-9-]{1,100}$/;

export async function POST(request: Request) {
  const input = await request.json().catch(() => null) as PageViewInput | null;
  const path = typeof input?.path === "string" ? normalisePath(input.path) : "";
  const sessionId = typeof input?.sessionId === "string" ? input.sessionId : "";
  const visitorId = typeof input?.visitorId === "string" ? input.visitorId : "";

  if (!path || path.startsWith("/admin") || path.startsWith("/api") || !identifierPattern.test(sessionId) || !identifierPattern.test(visitorId)) {
    return NextResponse.json({ error: "Invalid page view." }, { status: 400 });
  }

  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Analytics is unavailable." }, { status: 503 });

  const { error } = await client.from("site_page_views").insert({
    path,
    session_id: sessionId,
    visitor_id: visitorId,
    country_code: cleanHeader(request.headers.get("x-vercel-ip-country"), 8),
    region: cleanHeader(request.headers.get("x-vercel-ip-country-region"), 100),
    city: cleanHeader(request.headers.get("x-vercel-ip-city"), 160),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

function cleanHeader(value: string | null, limit: number) {
  if (!value) return null;
  try { return decodeURIComponent(value).trim().slice(0, limit) || null; }
  catch { return value.trim().slice(0, limit) || null; }
}

function normalisePath(value: string) {
  const path = value.split("?")[0].split("#")[0].trim();
  if (!path.startsWith("/") || path.length > 300) return "";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}
