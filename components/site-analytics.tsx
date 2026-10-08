"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const preferencesKey = "terratora-cookie-preferences";
const visitorKey = "terratora-analytics-visitor";
const sessionKey = "terratora-analytics-session";
const preferencesEvent = "terratora:cookie-preferences-changed";

type AnalyticsPreferences = { analytics?: boolean };

export function SiteAnalytics() {
  const pathname = usePathname();
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const track = (preferences?: AnalyticsPreferences) => {
      const analyticsAllowed = preferences?.analytics ?? readAnalyticsPreference();
      if (!analyticsAllowed) {
        window.localStorage.removeItem(visitorKey);
        window.sessionStorage.removeItem(sessionKey);
        trackedPath.current = null;
        return;
      }
      if (trackedPath.current === pathname) return;

      const visitorId = getOrCreateIdentifier(window.localStorage, visitorKey);
      const sessionId = getOrCreateIdentifier(window.sessionStorage, sessionKey);
      trackedPath.current = pathname;
      void fetch("/api/analytics/page-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, sessionId, visitorId }),
        keepalive: true,
      }).catch(() => undefined);
    };

    const handlePreferences = (event: Event) => {
      track((event as CustomEvent<AnalyticsPreferences>).detail);
    };

    track();
    window.addEventListener(preferencesEvent, handlePreferences);
    return () => window.removeEventListener(preferencesEvent, handlePreferences);
  }, [pathname]);

  return null;
}

function readAnalyticsPreference() {
  try {
    const saved = window.localStorage.getItem(preferencesKey);
    return saved ? Boolean((JSON.parse(saved) as AnalyticsPreferences).analytics) : false;
  } catch {
    return false;
  }
}

function getOrCreateIdentifier(storage: Storage, key: string) {
  const saved = storage.getItem(key);
  if (saved) return saved;
  const value = crypto.randomUUID();
  storage.setItem(key, value);
  return value;
}
