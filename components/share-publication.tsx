"use client";

import { useEffect, useState } from "react";

type Engagement = { read_count: number; share_count: number };

export function SharePublication({ slug, title, initialReads = 0, initialShares = 0 }: { slug: string; title: string; initialReads?: number; initialShares?: number }) {
  const [message, setMessage] = useState("");
  const [engagement, setEngagement] = useState<Engagement>({ read_count: initialReads, share_count: initialShares });

  async function record(type: "read" | "share") {
    try {
      const response = await fetch(`/api/publications/${encodeURIComponent(slug)}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (response.ok) setEngagement(await response.json() as Engagement);
    } catch {
      // Engagement tracking must never interrupt reading or sharing.
    }
  }

  useEffect(() => {
    const key = `terratora:read:${slug}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Count the visit when storage is unavailable.
    }
    void record("read");
    // A slug identifies one publication for the lifetime of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        void record("share");
        return;
      }
      await navigator.clipboard.writeText(url);
      void record("share");
      setMessage("Link copied");
      window.setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setMessage("Copy the page address to share this publication.");
    }
  }

  return <div className="share-publication"><p><strong>{engagement.read_count.toLocaleString()}</strong> reads <span aria-hidden="true">·</span> <strong>{engagement.share_count.toLocaleString()}</strong> shares</p><button type="button" onClick={share}>Share publication <span aria-hidden="true">↗</span></button>{message && <span className="share-status" role="status">{message}</span>}</div>;
}
