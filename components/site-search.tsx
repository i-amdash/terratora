"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Post, SiteContent } from "@/lib/types";

type SearchEntry = { title: string; description: string; href: string; type: string };

export function SiteSearch({ content, posts }: { content: SiteContent; posts: Post[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo<SearchEntry[]>(() => [
    { title: "Home", description: content.home.intro, href: "/", type: "Page" },
    { title: "About Terratora", description: content.about.intro, href: "/about", type: "Page" },
    { title: "Services", description: content.services.intro, href: "/services", type: "Page" },
    ...content.services.items.map((service) => ({ title: service.title, description: `${service.summary} ${service.body}`, href: `/services#${slugify(service.title)}`, type: "Service" })),
    { title: "Publications", description: "Articles and resources on ESG, reporting, governance and sustainability.", href: "/journal", type: "Page" },
    ...posts.map((post) => ({ title: post.title, description: `${post.excerpt} ${post.body}`, href: `/journal/${post.slug}`, type: "Publication" })),
    { title: "Careers", description: "Join the Terratora team and view current opportunities.", href: "/careers", type: "Page" },
    { title: "Contact us", description: content.contact.intro, href: "/contact", type: "Page" },
    { title: "Send us a message", description: "Contact Terratora about your organisation and advisory needs.", href: "/contact/message", type: "Contact" },
    { title: "Book a session", description: "Request a meeting with the Terratora team.", href: "/book", type: "Contact" },
  ], [content, posts]);

  const results = useMemo(() => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!words.length) return entries.slice(0, 7);
    return entries.filter((entry) => words.every((word) => `${entry.title} ${entry.description} ${entry.type}`.toLowerCase().includes(word))).slice(0, 10);
  }, [entries, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.removeProperty("overflow"); window.removeEventListener("keydown", onKeyDown); };
  }, [open]);

  function close() { setOpen(false); setQuery(""); }

  return <>
    <button className="search-toggle" type="button" onClick={() => setOpen(true)} aria-label="Search this website">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg><span>Search</span>
    </button>
    {open && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search this website">
      <button className="search-backdrop" type="button" onClick={close} aria-label="Close search" />
      <section className="search-panel">
        <header><span>Search this website</span><button type="button" onClick={close} aria-label="Close search">Close</button></header>
        <label className="search-input"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" /></svg><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services, publications and pages" /></label>
        <div className="search-results" aria-live="polite">
          {results.length ? results.map((entry) => <Link href={entry.href} onClick={close} key={`${entry.type}-${entry.href}-${entry.title}`}><span>{entry.type}</span><div><strong>{entry.title}</strong><p>{entry.description}</p></div><i aria-hidden="true">→</i></Link>) : <p className="search-empty">No results found. Try a service name or another keyword.</p>}
        </div>
      </section>
    </div>}
  </>;
}

function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
