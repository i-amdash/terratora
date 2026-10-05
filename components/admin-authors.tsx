"use client";

import { useState } from "react";
import type { Author } from "@/lib/types";
import { MediaUploader } from "./media-uploader";

export function AdminAuthors({ authors, onChange, onClose, onNotice }: { authors: Author[]; onChange: (authors: Author[]) => void; onClose: () => void; onNotice: (message: string) => void }) {
  const empty = (): Partial<Author> => ({ name: "", role: "", bio: "", avatar_url: "" });
  const [draft, setDraft] = useState<Partial<Author>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  function edit(author: Author) {
    setEditingId(author.id);
    setDraft(author);
  }

  function reset() {
    setEditingId(null);
    setDraft(empty());
  }

  async function save() {
    onNotice(editingId ? "Saving author…" : "Adding author…");
    const response = await fetch("/api/admin/authors", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, id: editingId }) });
    const result = await response.json();
    if (!response.ok) { onNotice(result.error ?? "Could not save the author."); return; }
    const author = result as Author;
    onChange(editingId ? authors.map((item) => item.id === editingId ? author : item) : [...authors, author].sort((a, b) => a.name.localeCompare(b.name)));
    onNotice(editingId ? "Author updated." : "Author added.");
    reset();
  }

  return <div className="publication-drawer-layer"><button className="publication-drawer-backdrop" type="button" aria-label="Close author manager" onClick={onClose} /><aside className="publication-drawer author-drawer" role="dialog" aria-modal="true" aria-labelledby="author-manager-title"><header><div><p className="eyebrow">Publication team</p><h2 id="author-manager-title">Manage authors</h2></div><button type="button" onClick={onClose} aria-label="Close author manager">×</button></header><div className="publication-drawer-body"><section className="author-editor"><h3>{editingId ? "Edit author" : "Add a new author"}</h3><label className="field"><span>Name</span><input value={draft.name ?? ""} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label className="field"><span>Role or title</span><input value={draft.role ?? ""} onChange={(event) => setDraft({ ...draft, role: event.target.value })} /></label><label className="field"><span>Short biography</span><textarea rows={4} value={draft.bio ?? ""} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></label><MediaUploader label="Author avatar" avatar value={draft.avatar_url} onChange={(avatar_url) => setDraft({ ...draft, avatar_url })} /><div className="admin-actions"><button type="button" className="button button-dark" onClick={save}>{editingId ? "Save author →" : "Add author →"}</button>{editingId && <button type="button" className="text-button" onClick={reset}>Cancel edit</button>}</div></section><section className="author-library"><p className="eyebrow">Saved authors</p>{authors.length ? authors.map((author) => <button type="button" key={author.id} onClick={() => edit(author)}><span className="author-library-avatar">{author.avatar_url ? <img src={author.avatar_url} alt="" /> : initials(author.name)}</span><span><strong>{author.name}</strong><small>{author.role || "Author"}</small></span><b>Edit</b></button>) : <p className="overview-empty">No authors have been saved yet.</p>}</section></div></aside></div>;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
