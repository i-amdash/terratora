"use client";

import { useState } from "react";
import type { AdminPermission, AdminRole } from "@/lib/admin-permissions";
import type { AdminUser, Author, Newsletter, Post, SiteAnalyticsSummary, SiteContent, Subscriber } from "@/lib/types";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { AdminContentEditor } from "./admin-content-editor";
import { AdminOverview, type AdminRecord } from "./admin-overview";
import { AdminPublications } from "./admin-publications";
import { AdminUsers } from "./admin-users";
import { AdminNewsletters } from "./admin-newsletters";
import { AdminSubscribers } from "./admin-subscribers";
import { AdminDataTools, exportExcel, isWithinDate } from "./admin-data-tools";

type Tab = "overview" | "content" | "journal" | "subscribers" | "newsletters" | "messages" | "bookings" | "users";
const tabLabels: Record<Tab, string> = { overview: "Dashboard", content: "Website", journal: "Publications", subscribers: "Subscribers", newsletters: "Newsletters", messages: "Messages", bookings: "Bookings", users: "Users" };
const tabPermissions: Partial<Record<Tab, AdminPermission>> = { content: "manage_content", journal: "manage_publications", subscribers: "manage_newsletters", newsletters: "manage_newsletters", messages: "view_messages", bookings: "view_bookings", users: "manage_users" };

export function AdminDashboard({ content, posts, authors, subscribers, subscriberCount, newsletters, messages, bookings, analytics, users, currentUserId, email, role, permissions }: { content: SiteContent; posts: Post[]; authors: Author[]; subscribers: Subscriber[]; subscriberCount: number; newsletters: Newsletter[]; messages: AdminRecord[]; bookings: AdminRecord[]; analytics: SiteAnalyticsSummary; users: AdminUser[]; currentUserId: string; email: string; role: AdminRole; permissions: AdminPermission[] }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState<SiteContent>(content);
  const [notice, setNotice] = useState("");
  const [subscriberTotal, setSubscriberTotal] = useState(subscriberCount);
  const hasPermission = (permission: AdminPermission) => role === "owner" || permissions.includes(permission);
  const visibleTabs = (Object.keys(tabLabels) as Tab[]).filter((item) => !tabPermissions[item] || hasPermission(tabPermissions[item]!));

  async function saveContent() {
    setNotice("Saving…");
    try {
      const response = await fetch("/api/admin/content", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(draft) });
      if (!response.ok) throw new Error((await response.json()).error);
      setNotice("Published successfully.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not save."); }
  }
  async function signOut() { await createBrowserSupabase()?.auth.signOut(); window.location.reload(); }
  function navigate(destination: "journal" | "messages" | "bookings") {
    if (visibleTabs.includes(destination)) setTab(destination);
    else setNotice("Your role does not include access to that section.");
  }

  return <div className="admin-shell">
    <aside className="admin-sidebar"><div><p className="admin-brand">Terratora<span>CMS</span></p><p className="admin-user">Signed in as<br />{email}<br /><span>{role}</span></p></div><nav>{visibleTabs.map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{tabLabels[item]}</button>)}</nav><div><a href="/" target="_blank">View live site ↗</a><button onClick={signOut}>Sign out</button></div></aside>
    <section className="admin-workspace">
      <header><div><p className="eyebrow">Control room</p><h1>{tabLabels[tab]}</h1></div><p>{notice}</p></header>
      {tab === "overview" && <AdminOverview posts={posts} messages={messages} bookings={bookings} analytics={analytics} onNavigate={navigate} />}
      {tab === "content" && <AdminContentEditor value={draft} onChange={setDraft} onSave={saveContent} />}
      {tab === "journal" && <AdminPublications posts={posts} authors={authors} onNotice={setNotice} />}
      {tab === "subscribers" && <AdminSubscribers initialSubscribers={subscribers} initialTotal={subscriberTotal} onNotice={setNotice} onTotalChange={setSubscriberTotal} />}
      {tab === "newsletters" && <AdminNewsletters subscriberCount={subscriberTotal} newsletters={newsletters} onNotice={setNotice} />}
      {tab === "messages" && <RecordList rows={messages} empty="No messages yet." filename="terratora-messages" fields={["first_name","last_name","email","organisation","interest","message","created_at"]} />}
      {tab === "bookings" && <RecordList rows={bookings} empty="No session requests yet." filename="terratora-bookings" fields={["first_name","last_name","email","organisation","session_type","preferred_date","preferred_time","timezone","message","status"]} />}
      {tab === "users" && <AdminUsers initialUsers={users} currentUserId={currentUserId} currentRole={role} onNotice={setNotice} />}
    </section>
  </div>;
}

function RecordList({ rows, fields, empty, filename }: { rows: AdminRecord[]; fields: string[]; empty: string; filename: string }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const filtered = rows.filter((row) => isWithinDate(row.created_at ?? row.preferred_date, dateFrom, dateTo));
  return <><AdminDataTools from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} onClear={() => { setDateFrom(""); setDateTo(""); }} count={filtered.length} onExport={() => exportExcel(filename, filtered)} />{!filtered.length ? <div className="empty-state">{rows.length ? "No records match this date range." : empty}</div> : <div className="records">{filtered.map((row, index) => <article className="record" key={index}>{fields.map((field) => {
    const fallbackTimezone = field === "timezone" && typeof row.message === "string" ? row.message.match(/^\[Timezone: ([^\]]+)\]/)?.[1] : undefined;
    const fieldValue = row[field] ?? fallbackTimezone;
    return fieldValue != null && <div key={field}><span>{field.replaceAll("_"," ")}</span><p>{String(fieldValue)}</p></div>;
  })}</article>)}</div>}</>;
}
