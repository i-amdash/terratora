"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminPermission, AdminRole } from "@/lib/admin-permissions";
import type { AdminBooking, AdminMessage, AdminPublicationComment, AdminUser, Author, Newsletter, Post, SiteAnalyticsSummary, SiteContent, Subscriber } from "@/lib/types";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { AdminContentEditor } from "./admin-content-editor";
import { AdminOverview, type AdminRecord } from "./admin-overview";
import { AdminPublications } from "./admin-publications";
import { AdminUsers } from "./admin-users";
import { AdminNewsletters } from "./admin-newsletters";
import { AdminSubscribers } from "./admin-subscribers";
import { AdminComments } from "./admin-comments";
import { AdminMessages } from "./admin-messages";
import { AdminBookings } from "./admin-bookings";
import { AdminDataTools, exportExcel, isWithinDate } from "./admin-data-tools";
import { AdminConfirmDialog, AdminToast, type AdminConfirmation, type AdminToastTone, type ConfirmAdminAction } from "./admin-feedback";

type Tab = "overview" | "content" | "journal" | "comments" | "subscribers" | "newsletters" | "messages" | "bookings" | "users";
const tabLabels: Record<Tab, string> = { overview: "Dashboard", content: "Website", journal: "Publications", comments: "Comments", subscribers: "Subscribers", newsletters: "Newsletters", messages: "Messages", bookings: "Bookings", users: "Users" };
const tabPermissions: Partial<Record<Tab, AdminPermission>> = { content: "manage_content", journal: "manage_publications", comments: "manage_publications", subscribers: "manage_newsletters", newsletters: "manage_newsletters", messages: "view_messages", bookings: "view_bookings", users: "manage_users" };

export function AdminDashboard({ content, posts, comments, authors, subscribers, subscriberCount, newsletters, messages, bookings, analytics, users, currentUserId, email, role, permissions }: { content: SiteContent; posts: Post[]; comments: AdminPublicationComment[]; authors: Author[]; subscribers: Subscriber[]; subscriberCount: number; newsletters: Newsletter[]; messages: AdminMessage[]; bookings: AdminBooking[]; analytics: SiteAnalyticsSummary; users: AdminUser[]; currentUserId: string; email: string; role: AdminRole; permissions: AdminPermission[] }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState<SiteContent>(content);
  const [toast, setToast] = useState<{ id: number; message: string; tone: AdminToastTone } | null>(null);
  const [confirmation, setConfirmation] = useState<AdminConfirmation | null>(null);
  const confirmationResolver = useRef<((confirmed: boolean) => void) | null>(null);
  const [subscriberTotal, setSubscriberTotal] = useState(subscriberCount);
  const hasPermission = (permission: AdminPermission) => role === "owner" || permissions.includes(permission);
  const visibleTabs = (Object.keys(tabLabels) as Tab[]).filter((item) => !tabPermissions[item] || hasPermission(tabPermissions[item]!));

  const notify = useCallback((message: string, tone?: AdminToastTone) => {
    if (!message) { setToast(null); return; }
    setToast({ id: Date.now(), message, tone: tone || inferToastTone(message) });
  }, []);

  const confirmAction: ConfirmAdminAction = useCallback((nextConfirmation) => new Promise((resolve) => {
    confirmationResolver.current?.(false);
    confirmationResolver.current = resolve;
    setConfirmation(nextConfirmation);
  }), []);

  const resolveConfirmation = useCallback((confirmed: boolean) => {
    confirmationResolver.current?.(confirmed);
    confirmationResolver.current = null;
    setConfirmation(null);
  }, []);

  useEffect(() => {
    if (!toast || toast.message.endsWith("…")) return;
    const timer = window.setTimeout(() => setToast((current) => current?.id === toast.id ? null : current), 4800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function saveContent() {
    notify("Saving…");
    try {
      const response = await fetch("/api/admin/content", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(draft) });
      if (!response.ok) throw new Error((await response.json()).error);
      notify("Published successfully.", "success");
    } catch (e) { notify(e instanceof Error ? e.message : "Could not save.", "error"); }
  }
  async function signOut() { await createBrowserSupabase()?.auth.signOut(); window.location.reload(); }
  function navigate(destination: "journal" | "messages" | "bookings") {
    if (visibleTabs.includes(destination)) setTab(destination);
    else notify("Your role does not include access to that section.", "error");
  }

  return <div className="admin-shell">
    <aside className="admin-sidebar"><div><p className="admin-brand">Terratora<span>CMS</span></p><p className="admin-user">Signed in as<br />{email}<br /><span>{role}</span></p></div><nav>{visibleTabs.map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{tabLabels[item]}</button>)}</nav><div><a href="/" target="_blank">View live site ↗</a><button onClick={signOut}>Sign out</button></div></aside>
    <section className="admin-workspace">
      <header><div><p className="eyebrow">Control room</p><h1>{tabLabels[tab]}</h1></div></header>
      {tab === "overview" && <AdminOverview posts={posts} messages={messages} bookings={bookings} analytics={analytics} onNavigate={navigate} />}
      {tab === "content" && <AdminContentEditor value={draft} onChange={setDraft} onSave={saveContent} />}
      {tab === "journal" && <AdminPublications posts={posts} authors={authors} onNotice={notify} onConfirm={confirmAction} />}
      {tab === "comments" && <AdminComments initialComments={comments} onNotice={notify} onConfirm={confirmAction} />}
      {tab === "subscribers" && <AdminSubscribers initialSubscribers={subscribers} initialTotal={subscriberTotal} onNotice={notify} onConfirm={confirmAction} onTotalChange={setSubscriberTotal} />}
      {tab === "newsletters" && <AdminNewsletters subscriberCount={subscriberTotal} newsletters={newsletters} onNotice={notify} onConfirm={confirmAction} />}
      {tab === "messages" && <AdminMessages initialMessages={messages} onNotice={notify} onConfirm={confirmAction} />}
      {tab === "bookings" && <AdminBookings initialBookings={bookings} onNotice={notify} />}
      {tab === "users" && <AdminUsers initialUsers={users} currentUserId={currentUserId} currentRole={role} onNotice={notify} />}
    </section>
    {toast && <AdminToast key={toast.id} message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    <AdminConfirmDialog confirmation={confirmation} onResolve={resolveConfirmation} />
  </div>;
}

function inferToastTone(message: string): AdminToastTone {
  if (/could not|failed|error|invalid|missing|permission|unavailable|already|enter |choose |do not have|cannot/i.test(message)) return "error";
  if (/saved|published|updated|created|deleted|sent|scheduled|success/i.test(message)) return "success";
  return "info";
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
