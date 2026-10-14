"use client";

import { FormEvent, useState } from "react";

export function UnsubscribeForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const consent = new FormData(event.currentTarget).get("consent");
    try {
      const response = await fetch("/api/subscribers/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, consent }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not complete your request.");
      try { window.localStorage.setItem("terratora-publication-subscription-seen", "unsubscribed"); } catch { /* Data removal still succeeded. */ }
      setState("success");
      setMessage("Your subscription has been cancelled and your subscriber record has been removed.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  if (state === "success") return <div className="unsubscribe-success"><span aria-hidden="true">✓</span><p>{message}</p></div>;
  return <form className="unsubscribe-form" onSubmit={submit}>
    <label><input name="consent" type="checkbox" value="accepted" required /><span>I confirm that I want to unsubscribe and consent to Terratora removing my name, email address and subscription record from the website database.</span></label>
    <button className="button button-dark" disabled={state === "sending"}>{state === "sending" ? "Removing your data…" : "Unsubscribe and remove my data →"}</button>
    {message && <p className={`form-status ${state}`} role="alert">{message}</p>}
  </form>;
}
