"use client";

import { useEffect } from "react";

export type AdminToastTone = "info" | "success" | "error";
export type AdminConfirmation = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};
export type ConfirmAdminAction = (confirmation: AdminConfirmation) => Promise<boolean>;

export function AdminToast({ message, tone, onClose }: { message: string; tone: AdminToastTone; onClose: () => void }) {
  return <aside className={`admin-toast ${tone}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"}>
    <span className="admin-toast-mark" aria-hidden="true">{tone === "error" ? "!" : tone === "success" ? "✓" : "i"}</span>
    <div><strong>{tone === "error" ? "Action needed" : tone === "success" ? "Done" : "In progress"}</strong><p>{message}</p></div>
    <button type="button" onClick={onClose} aria-label="Dismiss notification">×</button>
  </aside>;
}

export function AdminConfirmDialog({ confirmation, onResolve }: { confirmation: AdminConfirmation | null; onResolve: (confirmed: boolean) => void }) {
  useEffect(() => {
    if (!confirmation) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onResolve(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [confirmation, onResolve]);

  if (!confirmation) return null;
  const danger = confirmation.tone === "danger";
  return <div className="admin-confirm-layer">
    <button className="admin-confirm-backdrop" type="button" aria-label="Cancel action" onClick={() => onResolve(false)} />
    <section className={`admin-confirm-card${danger ? " danger" : ""}`} role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-message">
      <span className="admin-confirm-mark" aria-hidden="true">{danger ? "!" : "→"}</span>
      <p className="eyebrow">Please confirm</p>
      <h2 id="admin-confirm-title">{confirmation.title}</h2>
      <p id="admin-confirm-message">{confirmation.message}</p>
      <footer><button type="button" onClick={() => onResolve(false)}>{confirmation.cancelLabel || "Keep it"}</button><button type="button" className={danger ? "danger" : "confirm"} autoFocus onClick={() => onResolve(true)}>{confirmation.confirmLabel}</button></footer>
    </section>
  </div>;
}
