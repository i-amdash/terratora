"use client";

import { useState } from "react";
import type { Post, SiteContent } from "@/lib/types";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { AdminContentEditor } from "./admin-content-editor";
import { AdminOverview, type AdminRecord } from "./admin-overview";
import { AdminPublications } from "./admin-publications";

type Tab = "overview" | "content" | "journal" | "messages" | "bookings";
const tabLabels: Record<Tab, string> = { overview: "Dashboard", content: "Website", journal: "Publications", messages: "Messages", bookings: "Bookings" };

export function AdminDashboard({ content, posts, messages, bookings, email }: { content: SiteContent; posts: Post[]; messages: AdminRecord[]; bookings: AdminRecord[]; email: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState<SiteContent>(content);
  const [notice, setNotice] = useState("");

  async function saveContent() {
    setNotice("Saving…");
    try {
      const response = await fetch("/api/admin/content", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(draft) });
      if (!response.ok) throw new Error((await response.json()).error);
      setNotice("Published successfully.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not save."); }
  }
  async function signOut() { await createBrowserSupabase()?.auth.signOut(); window.location.reload(); }

  return <div className="admin-shell">
    <aside className="admin-sidebar"><div><p className="admin-brand">Terratora<span>CMS</span></p><p className="admin-user">Signed in as<br />{email}</p></div><nav>{(["overview","content","journal","messages","bookings"] as Tab[]).map((item, index) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}><span>{String(index + 1).padStart(2, "0")}</span>{tabLabels[item]}</button>)}</nav><div><a href="/" target="_blank">View live site ↗</a><button onClick={signOut}>Sign out</button></div></aside>
    <section className="admin-workspace">
      <header><div><p className="eyebrow">Control room</p><h1>{tabLabels[tab]}</h1></div><p>{notice}</p></header>
      {tab === "overview" && <AdminOverview posts={posts} messages={messages} bookings={bookings} onNavigate={setTab} />}
      {tab === "content" && <AdminContentEditor value={draft} onChange={setDraft} onSave={saveContent} />}
      {tab === "journal" && <AdminPublications posts={posts} onNotice={setNotice} />}
      {tab === "messages" && <RecordList rows={messages} empty="No messages yet." fields={["first_name","last_name","email","organisation","interest","message","created_at"]} />}
      {tab === "bookings" && <RecordList rows={bookings} empty="No session requests yet." fields={["first_name","last_name","email","organisation","session_type","preferred_date","preferred_time","timezone","message","status"]} />}
    </section>
  </div>;
}

function RecordList({ rows, fields, empty }: { rows: AdminRecord[]; fields: string[]; empty: string }) {
  if (!rows.length) return <div className="empty-state">{empty}</div>;
  return <div className="records">{rows.map((row, index) => <article className="record" key={index}>{fields.map((field) => {
    const fallbackTimezone = field === "timezone" && typeof row.message === "string" ? row.message.match(/^\[Timezone: ([^\]]+)\]/)?.[1] : undefined;
    const fieldValue = row[field] ?? fallbackTimezone;
    return fieldValue != null && <div key={field}><span>{field.replaceAll("_"," ")}</span><p>{String(fieldValue)}</p></div>;
  })}</article>)}</div>;
}
