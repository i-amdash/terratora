"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Newsletter } from "@/lib/types";
import { AdminDataTools, exportExcel, isWithinDate } from "./admin-data-tools";
import { MediaUploader } from "./media-uploader";
import { PublicationContent } from "./publication-content";
import type { ConfirmAdminAction } from "./admin-feedback";

type EditorView = "write" | "preview";
type Action = "draft" | "send" | "schedule";

export function AdminNewsletters({ subscriberCount, newsletters: initialNewsletters, onNotice, onConfirm }: { subscriberCount: number; newsletters: Newsletter[]; onNotice: (message: string) => void; onConfirm: ConfirmAdminAction }) {
  const [newsletters, setNewsletters] = useState(initialNewsletters);
  const [editing, setEditing] = useState<Newsletter | null>(null);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [view, setView] = useState<EditorView>("write");
  const [inlineImage, setInlineImage] = useState("");
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const filtered = useMemo(() => newsletters.filter((item) => isWithinDate(item.created_at, dateFrom, dateTo)), [newsletters, dateFrom, dateTo]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape" && !saving) setOpen(false); };
    window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close);
  }, [open, saving]);

  function compose(newsletter?: Newsletter) {
    setEditing(newsletter ?? null); setSubject(newsletter?.subject ?? ""); setBody(newsletter?.body ?? "");
    setScheduledFor(newsletter?.scheduled_for ? toLocalInput(newsletter.scheduled_for) : ""); setView("write"); setInlineImage(""); setOpen(true); onNotice("");
  }

  function insertMarkdown(before: string, after = "", fallback = "Text") {
    const textarea = bodyRef.current; const start = textarea?.selectionStart ?? body.length; const end = textarea?.selectionEnd ?? body.length;
    const selected = body.slice(start, end) || fallback; setBody(`${body.slice(0, start)}${before}${selected}${after}${body.slice(end)}`);
    window.requestAnimationFrame(() => { textarea?.focus(); const cursor = start + before.length + selected.length + after.length; textarea?.setSelectionRange(cursor, cursor); });
  }

  async function save(action: Action) {
    if (!subject.trim() || !body.trim()) { onNotice("Enter a subject and newsletter body."); return; }
    if (action === "schedule" && !scheduledFor) { onNotice("Choose a date and time first."); return; }
    if (action === "send" && !await onConfirm({ title: "Send this newsletter now?", message: `It will be sent to ${subscriberCount.toLocaleString()} active subscribers. Delivered emails cannot be recalled.`, confirmLabel: "Send newsletter" })) return;
    if (action === "schedule" && !await onConfirm({ title: "Schedule this newsletter?", message: `Resend will deliver it on ${formatDate(scheduledFor)}. You can edit or cancel it before delivery.`, confirmLabel: "Schedule delivery" })) return;
    setSaving(true); onNotice(action === "draft" ? "Saving draft…" : action === "schedule" ? "Scheduling newsletter…" : "Sending newsletter…");
    try {
      const response = await fetch("/api/admin/newsletters", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing?.id, subject, body, action, scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null }) });
      const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result.error || "The newsletter could not be saved.");
      setNewsletters((current) => editing ? current.map((item) => item.id === result.id ? result : item) : [result, ...current]);
      setOpen(false); onNotice(action === "draft" ? "Newsletter draft saved." : action === "schedule" ? "Newsletter scheduled." : "Newsletter sent.");
    } catch (error) { onNotice(error instanceof Error ? error.message : "The newsletter operation failed."); }
    finally { setSaving(false); }
  }

  async function remove(newsletter: Newsletter) {
    const sent = newsletter.status === "sent";
    const confirmed = await onConfirm({ title: sent ? "Delete this newsletter record?" : newsletter.status === "scheduled" ? "Cancel and delete this newsletter?" : "Delete this newsletter?", message: sent ? "This removes it from your admin history only. Emails already delivered to subscribers cannot be recalled." : newsletter.status === "scheduled" ? "The scheduled delivery will be cancelled before the newsletter is deleted." : "This draft will be permanently removed.", confirmLabel: sent ? "Delete history" : "Delete newsletter", tone: "danger" });
    if (!confirmed) return;
    const response = await fetch(`/api/admin/newsletters?id=${encodeURIComponent(newsletter.id)}`, { method: "DELETE" }); const result = await response.json().catch(() => ({}));
    if (!response.ok) { onNotice(result.error || "Newsletter could not be deleted."); return; }
    setNewsletters((current) => current.filter((item) => item.id !== newsletter.id)); onNotice("Newsletter deleted.");
  }

  return <section className="newsletter-manager">
    <header className="publication-manager-head"><div><p className="eyebrow">Subscriber communications</p><h2>Newsletters</h2><p>Save drafts, schedule delivery, edit campaigns and manage newsletter history.</p></div><button className="button button-dark" type="button" onClick={() => compose()}>New newsletter <span aria-hidden="true">＋</span></button></header>
    <div className="newsletter-summary"><article><strong>{subscriberCount.toLocaleString()}</strong><span>Active subscribers</span></article><article><strong>{newsletters.filter((item) => item.status === "sent").length.toLocaleString()}</strong><span>Newsletters sent</span></article><article><strong>{newsletters.filter((item) => item.status === "draft").length.toLocaleString()}</strong><span>Drafts</span></article></div>
    <AdminDataTools from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} onClear={() => { setDateFrom(""); setDateTo(""); }} count={filtered.length} onExport={() => exportExcel("terratora-newsletters", filtered.map(({ body: newsletterBody, resend_broadcast_id, ...item }) => ({ ...item, body: newsletterBody, provider_reference: resend_broadcast_id })))} />
    <section className="newsletter-history-panel"><div className="newsletter-section-heading"><div><p className="eyebrow">Campaign library</p><h3>Drafts and delivery history</h3></div><span>{filtered.length} shown</span></div><div className="newsletter-history">{filtered.map((newsletter) => <article key={newsletter.id}><div><strong>{newsletter.subject}</strong><small>{newsletter.status === "scheduled" ? `Scheduled ${formatDate(newsletter.scheduled_for)}` : `${formatDate(newsletter.sent_at || newsletter.created_at)} · ${newsletter.recipient_count.toLocaleString()} recipients`}</small>{newsletter.last_error && <small className="newsletter-error">{newsletter.last_error}</small>}</div><div className="newsletter-history-actions"><span className={`newsletter-status ${newsletter.status}`}>{newsletter.status}</span><button type="button" onClick={() => compose(newsletter)}>Edit</button><button type="button" className="danger" onClick={() => void remove(newsletter)}>Delete</button></div></article>)}{!filtered.length && <div className="empty-state">No newsletters match this date range.</div>}</div></section>
    {open && <div className="publication-drawer-layer"><button className="publication-drawer-backdrop" type="button" aria-label="Close newsletter editor" onClick={() => !saving && setOpen(false)} /><aside className="publication-drawer newsletter-drawer" role="dialog" aria-modal="true" aria-labelledby="newsletter-editor-title"><header><div><p className="eyebrow">{editing ? "Edit newsletter" : "New newsletter"}</p><h2 id="newsletter-editor-title">{editing?.status === "sent" ? "Edit sent record" : `Compose for ${subscriberCount.toLocaleString()} subscribers`}</h2></div><button type="button" disabled={saving} onClick={() => setOpen(false)}>×</button></header><div className="publication-drawer-body">
      <label className="field"><span>Email subject</span><input value={subject} maxLength={200} onChange={(event) => setSubject(event.target.value)} placeholder="A clear reason to open this email" /></label>
      <section className="markdown-editor"><div className="markdown-editor-heading"><div><h3>Newsletter body</h3><p>Write in Markdown and preview the final structure.</p></div><div className="editor-view-switch"><button type="button" className={view === "write" ? "active" : ""} onClick={() => setView("write")}>Write</button><button type="button" className={view === "preview" ? "active" : ""} onClick={() => setView("preview")}>Preview</button></div></div>
      {view === "write" ? <><div className="markdown-toolbar"><button type="button" onClick={() => insertMarkdown("**", "**", "Bold text")}><b>B</b><span>Bold</span></button><button type="button" onClick={() => insertMarkdown("*", "*", "Italic text")}><b>I</b><span>Italic</span></button><button type="button" onClick={() => insertMarkdown("\n\n## ", "\n\n", "Heading")}><b>H2</b><span>Heading</span></button><button type="button" onClick={() => insertMarkdown("[", "](https://example.com)", "Link text")}><b>↗</b><span>Link</span></button></div><textarea ref={bodyRef} className="markdown-textarea" rows={18} value={body} onChange={(event) => setBody(event.target.value)} /><div className="inline-image-inserter"><MediaUploader label="Upload an image for the newsletter" value={inlineImage} onChange={setInlineImage} />{inlineImage && <button type="button" className="button button-dark" onClick={() => { insertMarkdown("\n\n![", `](${inlineImage})\n\n`, "Describe this image"); setInlineImage(""); }}>Insert image at cursor →</button>}</div></> : <PublicationContent body={body} className="markdown-preview" />}</section>
      {editing?.status !== "sent" && <label className="field newsletter-schedule-field"><span>Schedule delivery (optional)</span><input type="datetime-local" min={toLocalInput(new Date(Date.now() + 120000).toISOString())} max={toLocalInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())} value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} /><small className="field-help">Schedule up to 30 days ahead. Resend Broadcasts handles delivery independently of your Vercel plan.</small></label>}
    </div><footer><p>{editing?.status === "sent" ? "Editing changes the CMS record only; already delivered emails cannot change." : "Drafts remain private until you send or schedule them."}</p><div><button type="button" className="text-button" disabled={saving} onClick={() => setOpen(false)}>Cancel</button><button type="button" className="text-button" disabled={saving} onClick={() => void save("draft")}>{saving ? "Saving…" : editing?.status === "sent" ? "Save record" : "Save draft"}</button>{editing?.status !== "sent" && <><button type="button" className="text-button" disabled={saving || !scheduledFor || !subscriberCount} onClick={() => void save("schedule")}>Schedule →</button><button type="button" className="button button-dark" disabled={saving || !subscriberCount} onClick={() => void save("send")}>Send now →</button></>}</div></footer></aside></div>}
  </section>;
}

function formatDate(value?: string | null) { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
function toLocalInput(value: string) { const date = new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16); }
