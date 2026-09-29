"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "./icons";

export function ParallaxManifesto({ manifesto }: { manifesto: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      section.style.setProperty("--parallax-slow", `${(progress - .5) * -110}px`);
      section.style.setProperty("--parallax-fast", `${(progress - .5) * 210}px`);
      section.style.setProperty("--parallax-copy", `${(progress - .5) * -45}px`);
      section.style.setProperty("--wash", String(progress));
      section.style.setProperty("--manifesto-bg", mixColor([212, 241, 244], [24, 154, 180], progress * .9));
      section.style.setProperty("--manifesto-ink", mixColor([5, 68, 94], [255, 255, 255], Math.max(0, (progress - .38) / .62)));
      section.style.setProperty("--manifesto-accent", mixColor([24, 154, 180], [212, 241, 244], progress));
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", requestUpdate); window.removeEventListener("resize", requestUpdate); };
  }, []);

  return (
    <section className="manifesto-section parallax-manifesto" ref={sectionRef}>
      <div className="parallax-word" aria-hidden="true">TERRATORA</div>
      <div className="orb orb-one" /><div className="orb orb-two" />
      <div className="shell manifesto-grid" data-reveal>
        <p className="section-index">01 — Our point of view</p>
        <h2>{manifesto.split(" ").map((word, index) => <span key={index}>{word} </span>)}</h2>
        <Link href="/about" className="circle-link" aria-label="About our approach"><ArrowUpRight /></Link>
      </div>
      <div className="parallax-note"><span>Scroll</span><i /></div>
    </section>
  );
}

function mixColor(from: number[], to: number[], amount: number) {
  const value = from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount));
  return `rgb(${value.join(",")})`;
}
