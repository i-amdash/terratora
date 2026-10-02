"use client";

import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/types";
import { MediaUploader } from "./media-uploader";
import { PublicationContent } from "./publication-content";

type EditorView = "write" | "preview";

export function AdminPublications({ posts, onNotice }: { posts: Post[]; onNotice: (message: string) => void }) {
  const emptyPost = (): Partial<Post> => ({ title: "", slug: "", excerpt: "", body: "", category: "Perspective", image_url: "", author_name: "", author_avatar_url: "", published_at: new Date().toISOString().slice(0, 10), featured: false });
  const [draft, setDraft] = useState<Partial<Post>>(emptyPost);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<EditorView>("write");
  const [inlineImage, setInlineImage] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") closeEditor(); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function newPublication() {
    setDraft(emptyPost());
    setEditingSlug(null);
    setInlineImage("");
    setView("write");
    setOpen(true);
    onNotice("");
  }

  function editPublication(post: Post) {
    setDraft(post);
    setEditingSlug(post.slug);
    setInlineImage("");
    setView("write");
    setOpen(true);
    onNotice(`Editing “${post.title}”`);
  }

  function closeEditor() {
    setOpen(false);
    setInlineImage("");
  }

  function updateTitle(title: string) {
    const slug = editingSlug ? draft.slug : title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setDraft({ ...draft, title, slug });
  }

  async function savePublication() {
    onNotice("Publishing…");
    const response = await fetch("/api/admin/posts", { method: editingSlug ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, original_slug: editingSlug }) });
    if (response.ok) window.location.reload();
    else onNotice((await response.json()).error);
  }

  async function deletePublication(slug: string) {
    if (!window.confirm("Delete this publication? This cannot be undone.")) return;
    const response = await fetch(`/api/admin/posts?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    if (response.ok) window.location.reload();
    else onNotice((await response.json()).error);
  }

  function insertMarkdown(before: string, after = "", fallback = "Text") {
    const textarea = bodyRef.current;
    const body = String(draft.body ?? "");
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const selected = body.slice(start, end) || fallback;
    const nextBody = `${body.slice(0, start)}${before}${selected}${after}${body.slice(end)}`;
    setDraft({ ...draft, body: nextBody });
    window.requestAnimationFrame(() => {
      textarea?.focus();
      const cursor = start + before.length + selected.length + after.length;
      textarea?.setSelectionRange(cursor, cursor);
    });
  }

  function setHeading(level: "##" | "###" | "normal") {
    const textarea = bodyRef.current;
    const body = String(draft.body ?? "");
    const cursor = textarea?.selectionStart ?? body.length;
    const lineStart = body.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
    const lineEndIndex = body.indexOf("\n", cursor);
    const lineEnd = lineEndIndex === -1 ? body.length : lineEndIndex;
    const current = body.slice(lineStart, lineEnd).replace(/^#{2,3}\s+/, "");
    const prefix = level === "normal" ? "" : `${level} `;
    setDraft({ ...draft, body: `${body.slice(0, lineStart)}${prefix}${current}${body.slice(lineEnd)}` });
    window.requestAnimationFrame(() => textarea?.focus());
  }

  function insertInlineImage() {
    if (!inlineImage) return;
    insertMarkdown("\n\n![", `](${inlineImage})\n\n`, "Describe this image");
    setInlineImage("");
  }

  return <section className="publication-manager">
    <header className="publication-manager-head"><div><p className="eyebrow">Content library</p><h2>Published articles</h2><p>Create, edit and review the performance of Terratora publications.</p></div><button type="button" className="button button-dark" onClick={newPublication}>New Publication <span aria-hidden="true">＋</span></button></header>
    <div className="publication-table-wrap"><table className="publication-table"><thead><tr><th>Publication</th><th>Author</th><th>Published</th><th>Engagement</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{posts.map((post) => <tr key={post.slug}><td><strong>{post.title}</strong><small>{post.category}</small></td><td><div className="publication-author-cell">{post.author_avatar_url ? <img src={post.author_avatar_url} alt="" /> : <span>{initials(post.author_name)}</span>}<small>{post.author_name || "Terratora Editorial Team"}</small></div></td><td><time>{new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</time></td><td><small>{(post.read_count ?? 0).toLocaleString()} reads<br />{(post.share_count ?? 0).toLocaleString()} shares</small></td><td><div className="admin-item-actions"><button type="button" onClick={() => editPublication(post)}>Edit</button><a href={`/journal/${post.slug}`} target="_blank">View ↗</a><button type="button" className="danger" onClick={() => deletePublication(post.slug)}>Delete</button></div></td></tr>)}</tbody></table>{!posts.length && <div className="empty-state">No publications yet.</div>}</div>

    {open && <div className="publication-drawer-layer"><button className="publication-drawer-backdrop" type="button" aria-label="Close publication editor" onClick={closeEditor} /><aside className="publication-drawer" role="dialog" aria-modal="true" aria-labelledby="publication-editor-title"><header><div><p className="eyebrow">{editingSlug ? "Edit publication" : "New publication"}</p><h2 id="publication-editor-title">{editingSlug ? draft.title : "Create a publication"}</h2></div><button type="button" onClick={closeEditor} aria-label="Close publication editor">×</button></header><div className="publication-drawer-body">
      <div className="drawer-field-grid"><label className="field"><span>Article title</span><input value={String(draft.title ?? "")} onChange={(event) => updateTitle(event.target.value)} /></label><label className="field"><span>Web address</span><input value={String(draft.slug ?? "")} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /><small className="field-help">Created automatically from the title.</small></label></div>
      <label className="field"><span>Short summary</span><textarea rows={3} value={String(draft.excerpt ?? "")} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} /></label>
      <div className="drawer-field-grid"><label className="field"><span>Category</span><input value={String(draft.category ?? "")} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></label><label className="field"><span>Publication date</span><input type="date" value={String(draft.published_at ?? "").slice(0, 10)} onChange={(event) => setDraft({ ...draft, published_at: event.target.value })} /></label></div>
      <MediaUploader label="Publication cover image" publication value={draft.image_url} onChange={(image_url) => setDraft({ ...draft, image_url })} />
      <section className="publication-author-fields"><h3>Author</h3><p>The name and portrait shown with this publication.</p><label className="field"><span>Author name</span><input value={String(draft.author_name ?? "")} onChange={(event) => setDraft({ ...draft, author_name: event.target.value })} /></label><MediaUploader label="Author avatar" avatar value={draft.author_avatar_url} onChange={(author_avatar_url) => setDraft({ ...draft, author_avatar_url })} /></section>
      <section className="markdown-editor"><div className="markdown-editor-heading"><div><h3>Article body</h3><p>Use the toolbar or Markdown syntax to format the publication.</p></div><div className="editor-view-switch"><button type="button" className={view === "write" ? "active" : ""} onClick={() => setView("write")}>Write</button><button type="button" className={view === "preview" ? "active" : ""} onClick={() => setView("preview")}>Preview</button></div></div>
        {view === "write" ? <><div className="markdown-toolbar" aria-label="Text formatting"><button type="button" onClick={() => insertMarkdown("**", "**", "Bold text")}><b>B</b><span>Bold</span></button><button type="button" onClick={() => setHeading("##")}><b>H2</b><span>Larger heading</span></button><button type="button" onClick={() => setHeading("###")}><b>H3</b><span>Smaller heading</span></button><button type="button" onClick={() => setHeading("normal")}><b>¶</b><span>Normal text</span></button><button type="button" onClick={() => insertMarkdown("\n\n![", "](https://image-url)\n\n", "Image description")}><b>▧</b><span>Image URL</span></button></div><textarea ref={bodyRef} className="markdown-textarea" rows={18} value={String(draft.body ?? "")} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="Write your article here…" /><div className="inline-image-inserter"><MediaUploader label="Upload an image for the article body" value={inlineImage} onChange={setInlineImage} />{inlineImage && <button type="button" className="button button-dark" onClick={insertInlineImage}>Insert image at cursor →</button>}</div></> : <PublicationContent body={String(draft.body ?? "")} className="markdown-preview" />}
      </section>
    </div><footer><p>Publishing makes this article visible on the website.</p><div><button type="button" className="text-button" onClick={closeEditor}>Cancel</button><button type="button" className="button button-dark" onClick={savePublication}>{editingSlug ? "Save changes →" : "Publish article →"}</button></div></footer></aside></div>}
  </section>;
}

function initials(name?: string) {
  return (name || "Terratora Editorial Team").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
