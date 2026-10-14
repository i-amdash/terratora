"use client";

import { useEffect, useState } from "react";
import { SubscriptionForm } from "./subscription-form";

const seenKey = "terratora-publication-subscription-seen";
const cookiePreferencesKey = "terratora-cookie-preferences";

export function SubscriptionPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (stored(seenKey)) return;
    let timer: number | undefined;
    const reveal = () => {
      if (stored(seenKey)) return;
      timer = window.setTimeout(() => {
        storeSeen();
        setVisible(true);
      }, 1800);
    };
    if (stored(cookiePreferencesKey)) reveal();
    else window.addEventListener("terratora:cookie-preferences-changed", reveal, { once: true });
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("terratora:cookie-preferences-changed", reveal);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setVisible(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [visible]);

  if (!visible) return null;
  return <div className="subscription-popup-layer" role="presentation">
    <button type="button" className="subscription-popup-backdrop" aria-label="Close subscription form" onClick={() => setVisible(false)} />
    <section className="subscription-popup" role="dialog" aria-modal="true" aria-labelledby="subscription-popup-title">
      <button type="button" className="subscription-popup-close" aria-label="Close subscription form" onClick={() => setVisible(false)}>×</button>
      <p className="eyebrow">Terratora publications</p>
      <h2 id="subscription-popup-title">Insight for the decisions ahead.</h2>
      <p>Receive practical ESG, sustainability and reporting perspectives directly in your inbox.</p>
      <SubscriptionForm source="journal-popup" compact onSubscribed={() => window.setTimeout(() => setVisible(false), 1800)} />
    </section>
  </div>;
}

function stored(key: string) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function storeSeen() {
  try { window.localStorage.setItem(seenKey, "shown"); } catch { /* The prompt can still be dismissed for this visit. */ }
}
