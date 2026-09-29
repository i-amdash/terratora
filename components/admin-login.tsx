"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function AdminLogin({ configured, supabaseUrl, anonKey }: { configured: boolean; supabaseUrl?: string; anonKey?: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const client = createBrowserSupabase({ url: supabaseUrl, key: anonKey });
    if (!client) { setError("Supabase is not configured yet."); setLoading(false); return; }
    const { error: authError } = await client.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (authError) { setError(authError.message); setLoading(false); return; }
    window.location.reload();
  }
  return <div className="admin-login"><div><p className="eyebrow">Terratora CMS</p><h1>Welcome<br /><em>back.</em></h1><p>Manage the entire public experience, journal, messages, and sessions from one place.</p></div><form onSubmit={login}><h2>Sign in</h2>{!configured && <p className="setup-note">Connect Supabase using <code>.env.local</code> before signing in.</p>}<label className="field"><span>Email</span><input type="email" name="email" required /></label><label className="field"><span>Password</span><input type="password" name="password" required /></label><button className="button button-dark" disabled={loading}>{loading ? "Signing in…" : "Enter CMS →"}</button>{error && <p className="form-status error">{error}</p>}</form></div>;
}
