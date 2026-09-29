"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { SiteContent } from "@/lib/types";
import { ArrowUpRight } from "./icons";

type Services = SiteContent["services"];

export function HorizontalServices({ services }: { services: Services }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const desktop = window.matchMedia("(min-width: 901px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!desktop.matches || reduced.matches) {
        section.style.removeProperty("height");
        track.style.removeProperty("transform");
        if (progressRef.current) progressRef.current.style.transform = "scaleX(0)";
        return;
      }
      const travel = Math.max(0, track.scrollWidth - window.innerWidth + Math.max(48, window.innerWidth * .05));
      section.style.height = `${travel + window.innerHeight * 1.35}px`;
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      track.style.transform = `translate3d(${-travel * progress}px, 0, 0)`;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    desktop.addEventListener("change", requestUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      desktop.removeEventListener("change", requestUpdate);
    };
  }, []);

  return (
    <section className="horizontal-services" id="capabilities" ref={sectionRef}>
      <div className="horizontal-stage">
        <div className="shell horizontal-heading">
          <div><p className="section-index">02 — Capabilities</p><h2>From intent<br /><em>to impact.</em></h2></div>
          <p>{services.intro}</p>
        </div>
        <div className="horizontal-viewport">
          <div className="horizontal-track" ref={trackRef}>
            <div className="horizontal-spacer" aria-hidden="true" />
            {services.items.map((service, index) => (
              <article className={`horizontal-card horizontal-card-${index + 1}`} key={service.title}>
                <div className="horizontal-card-top"><span>{service.number}</span><span>Terratora / Capability</span></div>
                <div className="horizontal-symbol" aria-hidden="true">{index === 0 ? "◒" : index === 1 ? "✣" : index === 2 ? "⌁" : "◎"}</div>
                <div className="horizontal-card-copy"><h3>{service.title}</h3><p>{service.summary}</p></div>
                <Link href="/services" aria-label={`Explore ${service.title}`}><ArrowUpRight /></Link>
              </article>
            ))}
            <div className="horizontal-end-card">
              <p>Need a different combination?</p><h3>We shape the work around the question.</h3>
              <Link href="/contact">Start a conversation <ArrowUpRight /></Link>
            </div>
            <div className="horizontal-spacer end" aria-hidden="true" />
          </div>
        </div>
        <div className="shell horizontal-progress"><span className="horizontal-instruction">Keep scrolling down <i>↓</i> We&apos;ll move sideways</span><div><span ref={progressRef} /></div><strong>04</strong></div>
      </div>
    </section>
  );
}
