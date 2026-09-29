"use client";

import { useState } from "react";
import type { Post, SiteContent } from "@/lib/types";
import { createBrowserSupabase } from "@/lib/supabase/browser";

type RecordItem = Record<string, string | boolean | null>;
type Tab = "content" | "journal" | "messages" | "bookings";

export function AdminDashboard({ content, posts, messages, bookings, email }: { content: SiteContent; posts: Post[]; messages: RecordItem[]; bookings: RecordItem[]; email: string }) {
  const [tab, setTab] = useState<Tab>("content");
  const [draft, setDraft] = useState(JSON.stringify(content, null, 2));
  const [postDraft, setPostDraft] = useState<Partial<Post>>({ title: "", slug: "", excerpt: "", body: "", category: "Perspective", published_at: new Date().toISOString().slice(0,10), featured: false });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function saveContent() {
    setNotice("Saving…");
    try {
      const parsed = JSON.parse(draft);
      const response = await fetch("/api/admin/content", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(parsed) });
      if (!response.ok) throw new Error((await response.json()).error);
      setNotice("Published successfully.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not save."); }
  }
  async function addPost() {
    setNotice("Publishing…");
    const response = await fetch("/api/admin/posts", { method:editingSlug ? "PUT" : "POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...postDraft, original_slug:editingSlug}) });
    if (response.ok) window.location.reload(); else setNotice((await response.json()).error);
  }
  function editPost(post: Post) { setPostDraft(post); setEditingSlug(post.slug); setNotice(`Editing “${post.title}”`); }
  async function deletePost(slug: string) {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    const response = await fetch(`/api/admin/posts?slug=${encodeURIComponent(slug)}`, { method:"DELETE" });
    if (response.ok) window.location.reload(); else setNotice((await response.json()).error);
  }
  async function signOut() { await createBrowserSupabase()?.auth.signOut(); window.location.reload(); }

  return <div className="admin-shell">
    <aside className="admin-sidebar"><div><p className="admin-brand">Terratora<span>CMS</span></p><p className="admin-user">Signed in as<br />{email}</p></div><nav>{(["content","journal","messages","bookings"] as Tab[]).map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}><span>0{["content","journal","messages","bookings"].indexOf(item)+1}</span>{item}</button>)}</nav><div><a href="/" target="_blank">View live site ↗</a><button onClick={signOut}>Sign out</button></div></aside>
    <section className="admin-workspace">
      <header><div><p className="eyebrow">Control room</p><h1>{tab}</h1></div><p>{notice}</p></header>
      {tab === "content" && <div className="editor-panel"><div className="editor-copy"><h2>Site content</h2><p>Every public-facing text value, client, metric, principle, service and contact detail lives here. Keep the JSON structure intact while editing values.</p><button className="button button-dark" onClick={saveContent}>Publish changes →</button></div><textarea className="json-editor" value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} /></div>}
      {tab === "journal" && <div><div className="admin-grid"><div className="admin-card"><h2>{editingSlug ? "Edit article" : "New article"}</h2>{(["title","slug","excerpt","category"] as const).map((key) => <label className="field" key={key}><span>{key}</span><input value={String(postDraft[key] ?? "")} onChange={(e) => setPostDraft({...postDraft,[key]:e.target.value})} /></label>)}<label className="field"><span>Article body</span><textarea rows={9} value={postDraft.body} onChange={(e) => setPostDraft({...postDraft,body:e.target.value})} /></label><div className="admin-actions"><button className="button button-dark" onClick={addPost}>{editingSlug ? "Save changes →" : "Publish article →"}</button>{editingSlug && <button className="text-button" onClick={() => { setEditingSlug(null); setPostDraft({ title:"",slug:"",excerpt:"",body:"",category:"Perspective",published_at:new Date().toISOString().slice(0,10) }); }}>Cancel</button>}</div></div><div className="admin-card"><h2>Published</h2>{posts.map((post) => <div className="admin-list-item" key={post.slug}><div><strong>{post.title}</strong><span>{post.category}</span></div><div className="admin-item-actions"><button onClick={() => editPost(post)}>Edit</button><a href={`/journal/${post.slug}`} target="_blank">View ↗</a><button className="danger" onClick={() => deletePost(post.slug)}>Delete</button></div></div>)}</div></div></div>}
      {tab === "messages" && <RecordList rows={messages} empty="No messages yet." fields={["first_name","last_name","email","organisation","interest","message","created_at"]} />}
      {tab === "bookings" && <RecordList rows={bookings} empty="No session requests yet." fields={["first_name","last_name","email","organisation","session_type","preferred_date","preferred_time","message","status"]} />}
    </section>
  </div>;
}

function RecordList({ rows, fields, empty }: { rows: RecordItem[]; fields: string[]; empty: string }) {
  if (!rows.length) return <div className="empty-state">{empty}</div>;
  return <div className="records">{rows.map((row, index) => <article className="record" key={index}>{fields.map((field) => row[field] != null && <div key={field}><span>{field.replaceAll("_"," ")}</span><p>{String(row[field])}</p></div>)}</article>)}</div>;
}
