"use client";

import { useCallback, useEffect, useState } from "react";
import type { Subscriber } from "@/lib/types";
import { AdminDataTools, exportExcel } from "./admin-data-tools";

type SubscriberPage = { subscribers: Subscriber[]; total: number; page: number; per_page: number; page_count: number };

export function AdminSubscribers({ initialSubscribers, initialTotal, onNotice, onTotalChange }: { initialSubscribers: Subscriber[]; initialTotal: number; onNotice: (message: string) => void; onTotalChange?: (total: number) => void }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Subscriber | null>(null);
  const pageCount = Math.max(1, Math.ceil(total / perPage));

  const loadPage = useCallback(async (nextPage = 1, nextPerPage = perPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage), per_page: String(nextPerPage) });
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const response = await fetch(`/api/admin/subscribers?${params}`, { cache: "no-store" });
      const result = await response.json().catch(() => null) as SubscriberPage | { error?: string } | null;
      if (!response.ok || !result || !("subscribers" in result)) throw new Error(result && "error" in result ? result.error : "Subscribers could not be loaded.");
      setSubscribers(result.subscribers); setTotal(result.total); if (!dateFrom && !dateTo) onTotalChange?.(result.total); setPage(result.page); setPerPage(result.per_page);
    } catch (error) { onNotice(error instanceof Error ? error.message : "Subscribers could not be loaded."); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo, onNotice, onTotalChange, perPage]);

  useEffect(() => { void loadPage(1); }, [dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveSubscriber() {
    if (!editing) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/subscribers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Subscriber could not be updated.");
      setEditing(null); onNotice("Subscriber updated."); await loadPage(page);
    } catch (error) { onNotice(error instanceof Error ? error.message : "Subscriber could not be updated."); setLoading(false); }
  }

  async function deleteSubscriber(subscriber: Subscriber) {
    if (!window.confirm(`Permanently delete ${subscriber.name} and remove their email from the newsletter audience?`)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/subscribers?id=${encodeURIComponent(subscriber.id)}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Subscriber could not be deleted.");
      onNotice("Subscriber deleted."); await loadPage(Math.min(page, Math.max(1, Math.ceil((total - 1) / perPage))));
    } catch (error) { onNotice(error instanceof Error ? error.message : "Subscriber could not be deleted."); setLoading(false); }
  }

  async function exportSubscribers() {
    const params = new URLSearchParams({ export: "1" });
    if (dateFrom) params.set("from", dateFrom); if (dateTo) params.set("to", dateTo);
    const response = await fetch(`/api/admin/subscribers?${params}`, { cache: "no-store" });
    const result = await response.json().catch(() => null) as SubscriberPage | { error?: string } | null;
    if (!response.ok || !result || !("subscribers" in result)) { onNotice(result && "error" in result ? result.error || "Export failed." : "Export failed."); return; }
    exportExcel("terratora-subscribers", result.subscribers.map(({ id, ...subscriber }) => subscriber));
  }

  return <section className="subscriber-manager">
    <header className="publication-manager-head"><div><p className="eyebrow">Newsletter audience</p><h2>Subscribers</h2><p>Edit consented contacts, export filtered records or remove subscriber data.</p></div><button className="button button-dark" type="button" disabled={loading} onClick={() => void loadPage(page)}>{loading ? "Refreshing…" : "Refresh list ↻"}</button></header>
    <AdminDataTools from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} onClear={() => { setDateFrom(""); setDateTo(""); }} onExport={() => void exportSubscribers()} count={total} />
    <div className="subscriber-list-summary"><div><strong>{total.toLocaleString()}</strong><span>Filtered subscribers</span></div><label><span>Rows per page</span><select value={perPage} disabled={loading} onChange={(event) => void loadPage(1, Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label></div>
    <div className={`publication-table-wrap subscriber-table-wrap${loading ? " is-loading" : ""}`} aria-busy={loading}><table className="publication-table subscriber-table"><thead><tr><th>Name</th><th>Email</th><th>Subscribed</th><th>Consent recorded</th><th>Source</th><th>Updated</th><th /></tr></thead><tbody>{subscribers.map((subscriber) => <tr key={subscriber.id}><td><strong>{subscriber.name}</strong></td><td><a href={`mailto:${subscriber.email}`}>{subscriber.email}</a></td><td><time>{formatDate(subscriber.subscribed_at)}</time></td><td><time>{formatDate(subscriber.consent_at)}</time></td><td><span className="subscriber-source">{subscriber.consent_source.replaceAll("-", " ")}</span></td><td><time>{formatDate(subscriber.updated_at)}</time></td><td><div className="admin-item-actions"><button type="button" onClick={() => setEditing({ ...subscriber })}>Edit</button><button type="button" className="danger" onClick={() => void deleteSubscriber(subscriber)}>Delete</button></div></td></tr>)}</tbody></table>{!subscribers.length && !loading && <div className="empty-state">No subscribers match this date range.</div>}{loading && <div className="subscriber-loading" role="status">Loading subscribers…</div>}</div>
    <footer className="subscriber-pagination"><p>Showing {total ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, total)} of {total.toLocaleString()}</p><div><button type="button" disabled={loading || page <= 1} onClick={() => void loadPage(page - 1)}>← Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={loading || page >= pageCount} onClick={() => void loadPage(page + 1)}>Next →</button></div></footer>
    {editing && <div className="publication-drawer-layer"><button className="publication-drawer-backdrop" type="button" aria-label="Close subscriber editor" onClick={() => setEditing(null)} /><aside className="publication-drawer subscriber-drawer" role="dialog" aria-modal="true" aria-labelledby="subscriber-editor-title"><header><div><p className="eyebrow">Subscriber record</p><h2 id="subscriber-editor-title">Edit subscriber</h2></div><button type="button" onClick={() => setEditing(null)}>×</button></header><div className="publication-drawer-body"><label className="field"><span>Name</span><input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label><label className="field"><span>Email</span><input type="email" value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} /></label><label className="field"><span>Consent source</span><input value={editing.consent_source} onChange={(event) => setEditing({ ...editing, consent_source: event.target.value })} /></label><p className="drawer-note">Consent recorded {formatDate(editing.consent_at)}. Changing the email will update the audience during the next newsletter send.</p></div><footer><p>Subscriber changes are recorded immediately.</p><div><button className="text-button" type="button" onClick={() => setEditing(null)}>Cancel</button><button className="button button-dark" type="button" disabled={loading} onClick={() => void saveSubscriber()}>{loading ? "Saving…" : "Save subscriber →"}</button></div></footer></aside></div>}
  </section>;
}

function formatDate(value?: string | null) {
  if (!value) return "—"; const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
