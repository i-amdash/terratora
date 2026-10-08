"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoadingScreen } from "./loading-screen";

const navigationStartEvent = "terratora:navigation-start";
const minimumVisibleTime = 380;
const fadeDuration = 220;

type ActiveNavigation = {
  origin: string;
  startedAt: number;
  leaving: boolean;
};

export function NavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const routeKey = `${pathname}${query ? `?${query}` : ""}`;
  const routeKeyRef = useRef(routeKey);
  const [navigation, setNavigation] = useState<ActiveNavigation | null>(null);

  useEffect(() => {
    routeKeyRef.current = routeKey;
  }, [routeKey]);

  useEffect(() => {
    const handleStart = (event: Event) => {
      const destination = routeKeyFromUrl((event as CustomEvent<{ url?: string }>).detail?.url);
      if (!destination || destination === routeKeyRef.current) return;
      setNavigation({ origin: routeKeyRef.current, startedAt: performance.now(), leaving: false });
    };
    window.addEventListener(navigationStartEvent, handleStart);
    return () => window.removeEventListener(navigationStartEvent, handleStart);
  }, []);

  useEffect(() => {
    if (!navigation || navigation.leaving || routeKey === navigation.origin) return;
    let firstFrame = 0;
    let secondFrame = 0;
    let timeout = 0;

    const finishWhenPageIsReady = () => {
      if (document.querySelector("main .app-loading")) {
        firstFrame = window.requestAnimationFrame(finishWhenPageIsReady);
        return;
      }

      resetScrollPosition();
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          resetScrollPosition();
          const remaining = Math.max(0, minimumVisibleTime - (performance.now() - navigation.startedAt));
          timeout = window.setTimeout(() => setNavigation((current) => current ? { ...current, leaving: true } : null), remaining);
        });
      });
    };

    finishWhenPageIsReady();
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(timeout);
    };
  }, [navigation, routeKey]);

  useEffect(() => {
    if (!navigation) return;
    if (navigation.leaving) {
      const timeout = window.setTimeout(() => setNavigation(null), fadeDuration);
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(() => {
      resetScrollPosition();
      setNavigation((current) => current ? { ...current, leaving: true } : null);
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [navigation]);

  return navigation ? <LoadingScreen leaving={navigation.leaving} /> : null;
}

function routeKeyFromUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value, window.location.href);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function resetScrollPosition() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
