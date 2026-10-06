"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "./icons";

type Organisation = SiteContent["home"]["organisations"][number];

export function OrganisationCarousel({ organisations }: { organisations: Organisation[] }) {
  const visibleOrganisations = organisations.filter((organisation) => organisation.image?.trim());
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(visibleOrganisations.length > 1);

  const updatePosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    setCanGoBack(viewport.scrollLeft > 4);
    setCanGoForward(viewport.scrollLeft < maximum - 4);
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
    viewport.scrollBy({ left: viewport.clientWidth * 0.75 * direction, behavior: "smooth" });
  };

  if (!visibleOrganisations.length) return null;

  return (
    <section className="organisation-section" data-color-flow="clear">
      <div className="shell organisation-heading">
        <div><p className="section-index">Experience</p><h2 className="section-display-title">Organisations we<br /><em>have supported.</em></h2></div>
        <div className="organisation-controls">
          <button type="button" onClick={() => move(-1)} disabled={!canGoBack} aria-label="Previous organisations"><ArrowLeft /></button>
          <button type="button" onClick={() => move(1)} disabled={!canGoForward} aria-label="Next organisations"><ArrowRight /></button>
        </div>
      </div>
      <div className="organisation-viewport" ref={viewportRef} tabIndex={0} aria-label="Organisations Terratora has supported">
        <div className="organisation-track">
          {visibleOrganisations.map((organisation) => (
            <article className="organisation-logo" key={`${organisation.name}-${organisation.image}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={organisation.image.trim()} alt={`${organisation.name} logo`} />
              <p>{organisation.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
