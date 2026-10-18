"use client";

import { useState } from "react";
import type { AdminPublicationComment } from "@/lib/types";
import { AdminDataTools, exportExcel, isWithinDate } from "./admin-data-tools";
import type { ConfirmAdminAction } from "./admin-feedback";

export function AdminComments({ initialComments, onNotice, onConfirm }: { initialComments: AdminPublicationComment[]; onNotice: (message: string) => void; onConfirm: ConfirmAdminAction }) {
  const [comments, setComments] = useState(initialComments);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const filtered = comments.filter((comment) => (statusFilter === "all" || comment.status === statusFilter) && isWithinDate(comment.created_at, dateFrom, dateTo));
  const pending = comments.filter((comment) => comment.status === "pending").length;

  async function updateStatus(comment: AdminPublicationComment, status: "pending" | "published" | "hidden") {
    setBusy(comment.id);
    const response = await fetch("/api/admin/comments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: comment.id, status }) });
    const result = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) { onNotice(result.error || "Comment could not be updated."); return; }
    setComments((current) => current.map((item) => item.id === comment.id ? { ...item, status } : item));
    onNotice(status === "published" ? "Comment approved and published." : status === "hidden" ? "Comment hidden." : "Comment moved to approval queue.");
  }

  async function postTeamReply(comment: AdminPublicationComment) {
    if (!reply.trim()) { onNotice("Write a reply first."); return; }
    setBusy(comment.id);
    const response = await fetch("/api/admin/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parent_id: comment.parent_id || comment.id, body: reply }) });
    const result = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) { onNotice(result.error || "Reply could not be published."); return; }
    setComments((current) => [{ ...result, post_title: comment.post_title, post_slug: comment.post_slug } as AdminPublicationComment, ...current]);
    setReply(""); setReplyingTo(null); onNotice("Terratora Team reply published.");
  }

  async function remove(comment: AdminPublicationComment) {
    if (!await onConfirm({ title: "Delete this comment?", message: "The comment, its replies and likes will be permanently removed.", confirmLabel: "Delete comment", tone: "danger" })) return;
    setBusy(comment.id);
    const response = await fetch(`/api/admin/comments?id=${encodeURIComponent(comment.id)}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) { onNotice(result.error || "Comment could not be deleted."); return; }
    setComments((current) => current.filter((item) => item.id !== comment.id && item.parent_id !== comment.id));
    onNotice("Comment deleted.");
  }

  return <section className="comment-manager">
    <header className="publication-manager-head"><div><p className="eyebrow">Publication discussion</p><h2>Comments</h2><p>Approve reader contributions, hide unsuitable comments and reply as Terratora Team.</p></div><div className="comment-queue-count"><strong>{pending}</strong><span>Awaiting approval</span></div></header>
    <div className="admin-list-filter"><label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All comments</option><option value="pending">Awaiting approval</option><option value="published">Published</option><option value="hidden">Hidden</option></select></label></div>
    <AdminDataTools from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} onClear={() => { setDateFrom(""); setDateTo(""); }} count={filtered.length} onExport={() => exportExcel("terratora-comments", filtered.map(({ liked, ...comment }) => comment))} />
    <div className="moderation-list">{filtered.map((comment) => <article className={`moderation-card${comment.is_team ? " team" : ""}`} key={comment.id}><header><div><span className={`workflow-status ${comment.status}`}>{comment.status === "pending" ? "Awaiting approval" : comment.status}</span><strong>{comment.author_name}{comment.is_team ? " · Terratora" : ""}</strong><small>{comment.author_email || "No email provided"} · {new Date(comment.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</small></div><a href={`/journal/${comment.post_slug}`} target="_blank">{comment.post_title} ↗</a></header><p>{comment.body}</p><footer><div>{comment.status !== "published" && <button type="button" disabled={busy === comment.id} onClick={() => void updateStatus(comment, "published")}>Approve</button>}{comment.status !== "hidden" && <button type="button" disabled={busy === comment.id} onClick={() => void updateStatus(comment, "hidden")}>Hide</button>}{comment.status !== "pending" && !comment.is_team && <button type="button" disabled={busy === comment.id} onClick={() => void updateStatus(comment, "pending")}>Require approval</button>}{!comment.is_team && comment.status === "published" && <button type="button" onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReply(""); }}>Reply as Terratora</button>}</div><button type="button" className="danger" disabled={busy === comment.id} onClick={() => void remove(comment)}>Delete</button></footer>{replyingTo === comment.id && <div className="team-reply-editor"><label><span>Terratora Team reply</span><textarea rows={4} maxLength={2000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder={`Reply to ${comment.author_name}…`} /></label><div><button type="button" onClick={() => setReplyingTo(null)}>Cancel</button><button type="button" className="button button-dark" disabled={busy === comment.id} onClick={() => void postTeamReply(comment)}>Publish reply →</button></div></div>}</article>)}{!filtered.length && <div className="empty-state">No comments match these filters.</div>}</div>
  </section>;
}
