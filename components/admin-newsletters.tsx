"use client";

import { useEffect, useRef, useState } from "react";
import type { Newsletter } from "@/lib/types";
import { MediaUploader } from "./media-uploader";
import { PublicationContent } from "./publication-content";

type EditorView = "write" | "preview";

export function AdminNewsletters({ subscriberCount, newsletters, onNotice }: { subscriberCount: number; newsletters: Newsletter[]; onNotice: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [view, setView] = useState<EditorView>("write");
  const [inlineImage, setInlineImage] = useState("");
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape" && !sending) setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, sending]);

  function compose() {
    setSubject("");
    setBody("");
    setView("write");
    setInlineImage("");
    setOpen(true);
    onNotice("");
  }

  function insertInlineImage() {
    if (!inlineImage) return;
    insertMarkdown("\n\n![", `](${inlineImage})\n\n`, "Describe this image");
    setInlineImage("");
  }

  function insertMarkdown(before: string, after = "", fallback = "Text") {
    const textarea = bodyRef.current;
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const selected = body.slice(start, end) || fallback;
    const next = `${body.slice(0, start)}${before}${selected}${after}${body.slice(end)}`;
    setBody(next);
    window.requestAnimationFrame(() => {
      textarea?.focus();
      const cursor = start + before.length + selected.length + after.length;
      textarea?.setSelectionRange(cursor, cursor);
    });
  }

  async function sendNewsletter() {
    if (!subject.trim() || !body.trim()) { onNotice("Enter a subject and newsletter body."); return; }
    if (!window.confirm(`Send this newsletter to ${subscriberCount.toLocaleString()} subscriber${subscriberCount === 1 ? "" : "s"}?`)) return;
    setSending(true);
    onNotice("Sending newsletter…");
    try {
      const response = await fetch("/api/admin/newsletters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, body }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The newsletter could not be sent.");
      onNotice(`Newsletter sent to ${Number(result.recipient_count).toLocaleString()} subscribers.`);
      window.location.reload();
    } catch (error) {
      onNotice(error instanceof Error ? error.message : "The newsletter could not be sent.");
      setSending(false);
    }
  }

  return <section className="newsletter-manager">
    <header className="publication-manager-head"><div><p className="eyebrow">Subscriber communications</p><h2>Newsletters</h2><p>Compose updates and manage the people who have consented to receive them.</p></div><button className="button button-dark" type="button" onClick={compose}>New newsletter <span aria-hidden="true">＋</span></button></header>
    <div className="newsletter-summary"><article><strong>{subscriberCount.toLocaleString()}</strong><span>Active subscribers</span></article><article><strong>{newsletters.filter((item) => item.status === "sent").length.toLocaleString()}</strong><span>Newsletters sent</span></article></div>
    <section className="newsletter-history-panel"><div className="newsletter-section-heading"><div><p className="eyebrow">Delivery history</p><h3>Sent newsletters</h3></div></div><div className="newsletter-history">{newsletters.map((newsletter) => <article key={newsletter.id}><div><strong>{newsletter.subject}</strong><small>{formatDate(newsletter.sent_at || newsletter.created_at)} · {newsletter.recipient_count.toLocaleString()} recipients</small>{newsletter.last_error && <small className="newsletter-error">{newsletter.last_error}</small>}</div><span className={`newsletter-status ${newsletter.status}`}>{newsletter.status}</span></article>)}{!newsletters.length && <div className="empty-state">No newsletters have been sent.</div>}</div></section>

    {open && <div className="publication-drawer-layer"><button className="publication-drawer-backdrop" type="button" aria-label="Close newsletter editor" onClick={() => !sending && setOpen(false)} /><aside className="publication-drawer newsletter-drawer" role="dialog" aria-modal="true" aria-labelledby="newsletter-editor-title"><header><div><p className="eyebrow">New newsletter</p><h2 id="newsletter-editor-title">Compose for {subscriberCount.toLocaleString()} subscribers</h2></div><button type="button" disabled={sending} onClick={() => setOpen(false)} aria-label="Close newsletter editor">×</button></header><div className="publication-drawer-body">
      <label className="field"><span>Email subject</span><input value={subject} maxLength={200} onChange={(event) => setSubject(event.target.value)} placeholder="A clear reason to open this email" /></label>
      <section className="markdown-editor"><div className="markdown-editor-heading"><div><h3>Newsletter body</h3><p>Use the same Markdown formatting available in the publication editor.</p></div><div className="editor-view-switch"><button type="button" className={view === "write" ? "active" : ""} onClick={() => setView("write")}>Write</button><button type="button" className={view === "preview" ? "active" : ""} onClick={() => setView("preview")}>Preview</button></div></div>
        {view === "write" ? <><div className="markdown-toolbar" aria-label="Text formatting"><button type="button" onClick={() => insertMarkdown("**", "**", "Bold text")}><b>B</b><span>Bold</span></button><button type="button" onClick={() => insertMarkdown("*", "*", "Italic text")}><b>I</b><span>Italic</span></button><button type="button" onClick={() => insertMarkdown("\n\n## ", "\n\n", "Heading")}><b>H2</b><span>Heading</span></button><button type="button" onClick={() => insertMarkdown("\n\n> ", "\n\n", "Quote")}><b>❞</b><span>Quote</span></button><button type="button" onClick={() => insertMarkdown("\n\n- ", "\n\n", "List item")}><b>•</b><span>List</span></button><button type="button" onClick={() => insertMarkdown("[", "](https://example.com)", "Link text")}><b>↗</b><span>Link</span></button><button type="button" onClick={() => insertMarkdown("\n\n![", "](https://image-url)\n\n", "Image description")}><b>▧</b><span>Image URL</span></button></div><textarea ref={bodyRef} className="markdown-textarea" rows={18} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write your newsletter here…" /><div className="inline-image-inserter"><MediaUploader label="Upload an image for the newsletter" value={inlineImage} onChange={setInlineImage} />{inlineImage && <button type="button" className="button button-dark" onClick={insertInlineImage}>Insert image at cursor →</button>}</div></> : <PublicationContent body={body} className="markdown-preview" />}
      </section>
    </div><footer><p>Every recipient receives a private unsubscribe and data-removal link.</p><div><button type="button" className="text-button" disabled={sending} onClick={() => setOpen(false)}>Cancel</button><button type="button" className="button button-dark" disabled={sending || !subscriberCount} onClick={sendNewsletter}>{sending ? "Sending…" : `Send to ${subscriberCount.toLocaleString()} →`}</button></div></footer></aside></div>}
  </section>;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
