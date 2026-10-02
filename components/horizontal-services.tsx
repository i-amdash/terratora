"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "./icons";

type Services = SiteContent["services"];

export function HorizontalServices({ services }: { services: Services }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);

  const updatePosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const progress = maximum ? viewport.scrollLeft / maximum : 1;
    setCanGoBack(viewport.scrollLeft > 4);
    setCanGoForward(viewport.scrollLeft < maximum - 4);
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    updatePosition();
    viewport.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      viewport.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({ left: viewport.clientWidth * 0.78 * direction, behavior: "smooth" });
  };

  return (
    <section className="horizontal-services" id="capabilities" data-color-flow="aqua">
      <div className="shell horizontal-heading">
        <div><p className="section-index">Capabilities</p><h2>From intent<br /><em>to impact.</em></h2></div>
        <p>{services.intro}</p>
      </div>
      <div className="horizontal-viewport" ref={viewportRef} tabIndex={0} aria-label="Terratora services. Scroll horizontally to explore.">
        <div className="horizontal-track">
          {services.items.map((service, index) => (
            <Link className={`horizontal-card horizontal-card-${index + 1}`} href="/services" key={service.title}>
              <div className="horizontal-card-top"><span>Terratora</span><span>Capability</span></div>
              <div className="horizontal-card-copy"><h3>{service.title}</h3><p>{service.summary}</p></div>
              <span className="horizontal-card-action">View service <ArrowRight /></span>
            </Link>
          ))}
          <article className="horizontal-end-card">
            <p>Need a different combination?</p><h3>We shape the work around the question.</h3>
            <Link href="/contact">Start a conversation <ArrowRight /></Link>
          </article>
        </div>
      </div>
      <div className="shell horizontal-progress">
        <span className="horizontal-instruction">Scroll across to explore</span>
        <div><span ref={progressRef} /></div>
        <div className="horizontal-controls">
          <button type="button" onClick={() => move(-1)} disabled={!canGoBack} aria-label="Previous services"><ArrowLeft /></button>
          <button type="button" onClick={() => move(1)} disabled={!canGoForward} aria-label="Next services"><ArrowRight /></button>
        </div>
      </div>
    </section>
  );
}
