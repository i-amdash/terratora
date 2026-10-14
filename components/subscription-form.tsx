"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight } from "./icons";

type SubscriptionFormProps = {
  source: "footer" | "journal-popup";
  compact?: boolean;
  onSubscribed?: () => void;
};

export function SubscriptionForm({ source, compact = false, onSubscribed }: SubscriptionFormProps) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const form = event.currentTarget;
    const payload = { ...Object.fromEntries(new FormData(form).entries()), source };
    try {
      const response = await fetch("/api/subscribers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not save your subscription.");
      try { window.localStorage.setItem("terratora-publication-subscription-seen", "subscribed"); } catch { /* Subscription still succeeded. */ }
      setState("success");
      setMessage("You’re subscribed. Look out for Terratora’s next publication.");
      form.reset();
      onSubscribed?.();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return <form className={`subscription-form${compact ? " compact" : ""}`} onSubmit={submit}>
    <div className="subscription-fields">
      <label><span>Name</span><input name="name" type="text" autoComplete="name" required placeholder="Your name" /></label>
      <label><span>Email</span><input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
      <button className="button subscription-submit" disabled={state === "sending"}>{state === "sending" ? "Subscribing…" : "Subscribe"}<ArrowRight /></button>
    </div>
    <label className="subscription-consent"><input name="consent" type="checkbox" value="accepted" required /><span>I agree to receive Terratora publications and updates and consent to the processing of my name and email as explained in the <Link href="/privacy" target="_blank">Privacy Policy<span className="sr-only"> (opens in a new window)</span></Link>. I can unsubscribe and request deletion at any time.</span></label>
    {message && <p className={`subscription-status ${state}`} role={state === "error" ? "alert" : "status"}>{message}</p>}
  </form>;
}
