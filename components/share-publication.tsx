"use client";

import { useState } from "react";

export function SharePublication({ title }: { title: string }) {
  const [message, setMessage] = useState("");

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
      window.setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setMessage("Copy the page address to share this publication.");
    }
  }

  return <div className="share-publication"><button type="button" onClick={share}>Share publication</button>{message && <span role="status">{message}</span>}</div>;
}
