"use client";

import { useEffect, useState } from "react";
import type { PublicationComment } from "@/lib/types";

export function PublicationInteractions({ slug, initialLikes = 0 }: { slug: string; initialLikes?: number }) {
  const [visitorKey, setVisitorKey] = useState("");
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<PublicationComment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const key = getVisitorKey();
    setVisitorKey(key);
    void Promise.all([loadLikes(key), loadComments(key)]).finally(() => setLoading(false));
    // The publication slug remains stable while this component is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadLikes(key: string) {
    try {
      const response = await fetch(`/api/publications/${encodeURIComponent(slug)}/likes?visitor=${encodeURIComponent(key)}`);
      if (!response.ok) return;
      const result = await response.json();
      setLikeCount(result.like_count ?? 0);
      setLiked(Boolean(result.liked));
    } catch { /* Keep the server-rendered count. */ }
  }

  async function loadComments(key = visitorKey) {
    try {
      const response = await fetch(`/api/publications/${encodeURIComponent(slug)}/comments?visitor=${encodeURIComponent(key)}`);
      if (response.ok) setComments(await response.json());
    } catch { /* Comments remain unavailable without disrupting the article. */ }
  }

  async function togglePublicationLike() {
    if (!visitorKey) return;
    const response = await fetch(`/api/publications/${encodeURIComponent(slug)}/likes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitor_key: visitorKey }) });
    if (!response.ok) { setNotice("The like could not be saved. Please try again."); return; }
    const result = await response.json();
    setLikeCount(result.like_count ?? 0);
    setLiked(Boolean(result.liked));
    setNotice("");
  }

  async function submitComment(input: CommentInput) {
    const response = await fetch(`/api/publications/${encodeURIComponent(slug)}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const result = await response.json();
    if (!response.ok) { setNotice(result.error ?? "Your comment could not be posted."); return false; }
    setComments((current) => [...current, result as PublicationComment]);
    setReplyingTo(null);
    setNotice("Your comment has been posted.");
    return true;
  }

  async function toggleCommentLike(commentId: string) {
    if (!visitorKey) return;
    const response = await fetch(`/api/publications/${encodeURIComponent(slug)}/comments/${commentId}/like`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitor_key: visitorKey }) });
    if (!response.ok) { setNotice("The comment like could not be saved."); return; }
    const result = await response.json();
    setComments((current) => current.map((comment) => comment.id === commentId ? { ...comment, like_count: result.like_count ?? 0, liked: Boolean(result.liked) } : comment));
  }

  const roots = comments.filter((comment) => !comment.parent_id || !comments.some((candidate) => candidate.id === comment.parent_id));

  return <section className="publication-community shell"><div className="publication-like-panel"><div><p className="eyebrow">Found this useful?</p><h2>Support this publication.</h2></div><button type="button" className={liked ? "liked" : ""} onClick={togglePublicationLike} aria-pressed={liked}><span aria-hidden="true">♥</span><strong>{liked ? "Liked" : "Like publication"}</strong><small>{likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}</small></button></div><div className="discussion-layout"><div className="discussion-heading"><p className="eyebrow">Discussion</p><h2>Comments & replies</h2><p>Share a perspective, ask a question or continue the conversation.</p></div><div className="discussion-main"><CommentForm onSubmit={submitComment} />{notice && <p className="discussion-notice" role="status">{notice}</p>}<div className="comment-list">{loading ? <p className="comments-empty">Loading comments…</p> : roots.length ? roots.map((comment) => <article className="comment-thread" key={comment.id}><CommentCard comment={comment} onLike={toggleCommentLike} onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} />{comments.filter((reply) => reply.parent_id === comment.id).map((reply) => <div className="comment-reply" key={reply.id}><CommentCard comment={reply} onLike={toggleCommentLike} /></div>)}{replyingTo === comment.id && <div className="reply-form"><p>Reply to {comment.author_name}</p><CommentForm compact parentId={comment.id} onSubmit={submitComment} /></div>}</article>) : <p className="comments-empty">No comments yet. Be the first to join the conversation.</p>}</div></div></div></section>;
}

type CommentInput = { author_name: string; author_email: string; body: string; parent_id?: string; website?: string };

function CommentForm({ onSubmit, parentId, compact = false }: { onSubmit: (input: CommentInput) => Promise<boolean>; parentId?: string; compact?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const posted = await onSubmit({ author_name: name, author_email: email, body, parent_id: parentId, website });
    if (posted) setBody("");
    setSubmitting(false);
  }

  return <form className={`comment-form ${compact ? "compact" : ""}`} onSubmit={submit}><div className="comment-identity"><label><span>Name</span><input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label><label><span>Email</span><input required type="email" maxLength={240} value={email} onChange={(event) => setEmail(event.target.value)} /></label></div><label className="comment-message"><span>{compact ? "Your reply" : "Your comment"}</span><textarea required maxLength={2000} rows={compact ? 3 : 5} value={body} onChange={(event) => setBody(event.target.value)} /></label><label className="comment-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label><footer><small>Your email address is stored privately and is never displayed.</small><button className="button button-dark" disabled={submitting}>{submitting ? "Posting…" : compact ? "Post reply →" : "Post comment →"}</button></footer></form>;
}

function CommentCard({ comment, onLike, onReply }: { comment: PublicationComment; onLike: (id: string) => void; onReply?: () => void }) {
  return <div className="comment-card"><header><span>{initials(comment.author_name)}</span><div><strong>{comment.author_name}</strong><time>{new Date(comment.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</time></div></header><p>{comment.body}</p><footer><button type="button" className={comment.liked ? "liked" : ""} onClick={() => onLike(comment.id)} aria-pressed={comment.liked}><span aria-hidden="true">♥</span> {comment.like_count.toLocaleString()}</button>{onReply && <button type="button" onClick={onReply}>Reply</button>}</footer></div>;
}

function getVisitorKey() {
  const storageKey = "terratora:visitor";
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(storageKey, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
