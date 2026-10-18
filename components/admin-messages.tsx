"use client";

import { useState } from "react";
import type { AdminMessage } from "@/lib/types";
import { AdminDataTools, exportExcel, isWithinDate } from "./admin-data-tools";
import type { ConfirmAdminAction } from "./admin-feedback";

export function AdminMessages({ initialMessages, onNotice, onConfirm }: { initialMessages: AdminMessage[]; onNotice: (message: string) => void; onConfirm: ConfirmAdminAction }) {
  const [messages, setMessages] = useState(initialMessages);
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState(""); const [busy, setBusy] = useState<string | null>(null);
  const filtered = messages.filter((message) => isWithinDate(message.created_at, dateFrom, dateTo));

  async function updateStatus(message: AdminMessage, status: AdminMessage["status"]) {
    setBusy(message.id); const response = await fetch("/api/admin/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: message.id, status }) }); const result = await response.json().catch(() => ({})); setBusy(null);
    if (!response.ok) { onNotice(result.error || "Message could not be updated."); return; }
    setMessages((current) => current.map((item) => item.id === message.id ? result : item)); onNotice(status === "completed" ? "Message marked as completed." : "Message status updated.");
  }

  async function remove(message: AdminMessage) {
    if (!await onConfirm({ title: "Delete this message?", message: `The enquiry from ${message.first_name} ${message.last_name} will be permanently removed.`, confirmLabel: "Delete message", tone: "danger" })) return;
    setBusy(message.id); const response = await fetch(`/api/admin/messages?id=${encodeURIComponent(message.id)}`, { method: "DELETE" }); const result = await response.json().catch(() => ({})); setBusy(null);
    if (!response.ok) { onNotice(result.error || "Message could not be deleted."); return; }
    setMessages((current) => current.filter((item) => item.id !== message.id)); onNotice("Message deleted.");
  }

  return <section><header className="publication-manager-head"><div><p className="eyebrow">Contact inbox</p><h2>Messages</h2><p>Track enquiries through review and completion.</p></div></header><AdminDataTools from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} onClear={() => { setDateFrom(""); setDateTo(""); }} count={filtered.length} onExport={() => exportExcel("terratora-messages", filtered)} /><div className="workflow-list">{filtered.map((message) => <article className="workflow-card" key={message.id}><header><div><strong>{message.first_name} {message.last_name}</strong><small>{message.email}{message.organisation ? ` · ${message.organisation}` : ""}</small></div><select aria-label={`Status for ${message.first_name} ${message.last_name}`} value={message.status} disabled={busy === message.id} onChange={(event) => void updateStatus(message, event.target.value as AdminMessage["status"])}><option value="new">New</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></header><div className="workflow-meta"><span>{message.interest || "General enquiry"}</span><time>{new Date(message.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</time></div><p>{message.message}</p><footer><a href={`mailto:${message.email}`}>Reply by email ↗</a><button type="button" className="danger" disabled={busy === message.id} onClick={() => void remove(message)}>Delete message</button></footer></article>)}{!filtered.length && <div className="empty-state">No messages match this date range.</div>}</div></section>;
}
