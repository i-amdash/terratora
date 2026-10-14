"use client";

import { useCallback, useEffect, useState } from "react";
import type { Subscriber } from "@/lib/types";

type SubscriberPage = {
  subscribers: Subscriber[];
  total: number;
  page: number;
  per_page: number;
  page_count: number;
};

export function AdminSubscribers({ initialSubscribers, initialTotal, onNotice, onTotalChange }: { initialSubscribers: Subscriber[]; initialTotal: number; onNotice: (message: string) => void; onTotalChange?: (total: number) => void }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const pageCount = Math.max(1, Math.ceil(total / perPage));

  const loadPage = useCallback(async (nextPage: number, nextPerPage = perPage) => {
    setLoading(true);
    onNotice("");
    try {
      const response = await fetch(`/api/admin/subscribers?page=${nextPage}&per_page=${nextPerPage}`, { cache: "no-store" });
      const result = await response.json().catch(() => null) as SubscriberPage | { error?: string } | null;
      if (!response.ok || !result || !("subscribers" in result)) throw new Error(result && "error" in result ? result.error : "Subscribers could not be loaded.");
      setSubscribers(result.subscribers);
      setTotal(result.total);
      onTotalChange?.(result.total);
      setPage(result.page);
      setPerPage(result.per_page);
    } catch (error) {
      onNotice(error instanceof Error ? error.message : "Subscribers could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [onNotice, onTotalChange, perPage]);

  useEffect(() => {
    void loadPage(1, 25);
    // Fetch fresh data when this tab is opened; the server-rendered snapshot may be older.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changePageSize(value: number) {
    void loadPage(1, value);
  }

  return <section className="subscriber-manager">
    <header className="publication-manager-head">
      <div><p className="eyebrow">Newsletter audience</p><h2>Subscribers</h2><p>Everyone who has consented to receive newsletters from Terratora.</p></div>
      <button className="button button-dark" type="button" disabled={loading} onClick={() => void loadPage(page)}>{loading ? "Refreshing…" : "Refresh list ↻"}</button>
    </header>

    <div className="subscriber-list-summary">
      <div><strong>{total.toLocaleString()}</strong><span>Total subscribers</span></div>
      <label><span>Rows per page</span><select value={perPage} disabled={loading} onChange={(event) => changePageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label>
    </div>

    <div className={`publication-table-wrap subscriber-table-wrap${loading ? " is-loading" : ""}`} aria-busy={loading}>
      <table className="publication-table subscriber-table">
        <thead><tr><th>Name</th><th>Email</th><th>Subscribed</th><th>Consent recorded</th><th>Source</th><th>Last updated</th></tr></thead>
        <tbody>{subscribers.map((subscriber) => <tr key={subscriber.id}><td><strong>{subscriber.name}</strong></td><td><a href={`mailto:${subscriber.email}`}>{subscriber.email}</a></td><td><time dateTime={subscriber.subscribed_at}>{formatDate(subscriber.subscribed_at)}</time></td><td><time dateTime={subscriber.consent_at}>{formatDate(subscriber.consent_at)}</time></td><td><span className="subscriber-source">{subscriber.consent_source.replaceAll("-", " ")}</span></td><td><time dateTime={subscriber.updated_at}>{formatDate(subscriber.updated_at)}</time></td></tr>)}</tbody>
      </table>
      {!subscribers.length && !loading && <div className="empty-state">No subscribers yet.</div>}
      {loading && <div className="subscriber-loading" role="status">Loading subscribers…</div>}
    </div>

    <footer className="subscriber-pagination">
      <p>Showing {total ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, total)} of {total.toLocaleString()}</p>
      <div><button type="button" disabled={loading || page <= 1} onClick={() => void loadPage(page - 1)}>← Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={loading || page >= pageCount} onClick={() => void loadPage(page + 1)}>Next →</button></div>
    </footer>
  </section>;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
