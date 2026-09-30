"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const storageKey = "terratora-cookie-consent";

export function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(!window.localStorage.getItem(storageKey)), []);

  if (!visible || pathname.startsWith("/admin")) return null;

  function choose(value: "accepted" | "rejected") {
    window.localStorage.setItem(storageKey, value);
    setVisible(false);
  }

  return <aside className="cookie-banner" aria-label="Cookie preferences">
    <div><strong>Your privacy, your choice.</strong><p>We use essential browser storage to remember your preferences. Optional analytics will only be enabled if you accept.</p><span>Read our <Link href="/cookies">cookie policy</Link> and <Link href="/privacy">privacy policy</Link>.</span></div>
    <div className="cookie-actions"><button type="button" onClick={() => choose("rejected")}>Reject optional</button><button className="button button-dark" type="button" onClick={() => choose("accepted")}>Accept</button></div>
  </aside>;
}
