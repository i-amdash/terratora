"use client";

import { createBrowserClient } from "@supabase/ssr";

export type PublicSupabaseConfig = { url?: string; key?: string };

export function createBrowserSupabase(config?: PublicSupabaseConfig) {
  const url = config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = config?.key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
