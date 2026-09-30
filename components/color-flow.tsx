"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const palettes: Record<string, string> = {
  deep: "radial-gradient(circle at 14% 20%, rgba(24,154,180,.42), transparent 38%), radial-gradient(circle at 86% 74%, rgba(212,241,244,.26), transparent 42%)",
  aqua: "radial-gradient(circle at 82% 18%, rgba(24,154,180,.34), transparent 38%), radial-gradient(circle at 18% 78%, rgba(212,241,244,.5), transparent 46%)",
  grotto: "radial-gradient(circle at 22% 28%, rgba(212,241,244,.42), transparent 40%), radial-gradient(circle at 78% 72%, rgba(24,154,180,.46), transparent 43%)",
  warm: "radial-gradient(circle at 80% 24%, rgba(233,196,106,.32), transparent 40%), radial-gradient(circle at 18% 78%, rgba(212,241,244,.42), transparent 45%)",
  clear: "radial-gradient(circle at 75% 18%, rgba(212,241,244,.3), transparent 42%), radial-gradient(circle at 15% 80%, rgba(24,154,180,.18), transparent 46%)",
};

export function ColorFlow() {
  const pathname = usePathname();
  const firstLayerRef = useRef<HTMLSpanElement>(null);
  const secondLayerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-color-flow]"));
    if (!sections.length) return;

    let currentPalette = "deep";
    let activeLayer = 0;
    let frame = 0;

    const firstLayer = firstLayerRef.current;
    const secondLayer = secondLayerRef.current;
    if (!firstLayer || !secondLayer) return;
    firstLayer.style.background = palettes.deep;
    firstLayer.style.opacity = "1";
    secondLayer.style.opacity = "0";

    const showPalette = (name: string) => {
      if (name === currentPalette) return;
      const nextLayer = activeLayer === 0 ? secondLayer : firstLayer;
      const previousLayer = activeLayer === 0 ? firstLayer : secondLayer;
      nextLayer.style.background = palettes[name] ?? palettes.clear;
      nextLayer.style.opacity = "1";
      previousLayer.style.opacity = "0";
      activeLayer = activeLayer === 0 ? 1 : 0;
      currentPalette = name;
    };

    const update = () => {
      frame = 0;
      const focusLine = window.innerHeight * 0.52;
      let closest = sections[0];
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = rect.top <= focusLine && rect.bottom >= focusLine
          ? 0
          : Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
        if (distance < closestDistance) {
          closest = section;
          closestDistance = distance;
        }
      });

      showPalette(closest.dataset.colorFlow ?? "clear");
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;
  return <div className="site-color-flow" aria-hidden="true"><span ref={firstLayerRef} style={{ background: palettes.deep, opacity: 1 }} /><span ref={secondLayerRef} /></div>;
}
