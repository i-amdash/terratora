"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "./icons";
import type { SiteContent } from "@/lib/types";

const AUTOPLAY_MS = 7000;

type HeroContent = SiteContent["home"];

export function HeroCarousel({ home }: { home: HeroContent }) {
  const slides = home.heroSlides.length ? home.heroSlides : [{
    image: "/images/hero/global-markets.jpg",
    position: "38% 64%",
    label: "Nigeria · Africa · Global markets",
    caption: "Navigate ESG change with a clearer view of what comes next.",
  }];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);

  const showSlide = useCallback((index: number) => {
    setActive((index + slides.length) % slides.length);
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setActive((current) => (current + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(nextSlide, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [nextSlide, paused, reducedMotion, slides.length]);

  const current = slides[active];
  const isStopped = paused || reducedMotion;

  return (
    <section
      className="home-hero hero-carousel"
      data-color-flow="deep"
      role="region"
      aria-roledescription="carousel"
      aria-label="Terratora capabilities"
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
        if (Math.abs(distance) > 48) showSlide(active + (distance < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="hero-slides" aria-hidden="true">
        {slides.map((slide, index) => (
          <div className={`hero-slide ${index === active ? "is-active" : ""}`} key={slide.image}>
            <Image
              src={slide.image}
              alt=""
              fill
              sizes="100vw"
              preload={index === 0}
              quality={75}
              style={{ objectFit: "cover", objectPosition: slide.position }}
            />
          </div>
        ))}
      </div>
      <div className="hero-shade" aria-hidden="true" />

      <div className="shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span />{home.eyebrow}</p>
          <h1><span>{home.title}</span><em>{home.titleAccent}</em></h1>
        </div>

        <div className="hero-aside">
          <p>{home.intro}</p>
          <Link href="/services" className="text-link">Explore our services <ArrowRight /></Link>
        </div>

        <div className="hero-slide-meta" aria-live="polite" aria-atomic="true">
          <p><span>{String(active + 1).padStart(2, "0")}</span>{current.label}</p>
          <strong>{current.caption}</strong>
        </div>

        <div className="hero-carousel-controls">
          <div className="hero-pagination" aria-label="Choose a carousel slide">
            {slides.map((slide, index) => (
              <button
                className={index === active ? "is-active" : ""}
                key={slide.image}
                type="button"
                onClick={() => showSlide(index)}
                aria-label={`Show slide ${index + 1}: ${slide.label}`}
                aria-current={index === active ? "true" : undefined}
              >
                <span
                  key={`${active}-${isStopped}`}
                  className={index === active && !isStopped ? "is-running" : ""}
                  style={{ "--hero-duration": `${AUTOPLAY_MS}ms` } as CSSProperties}
                />
              </button>
            ))}
          </div>
          <button
            className="hero-pause"
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Play carousel" : "Pause carousel"}
          >
            {paused ? <span className="play-icon">▶</span> : <span className="pause-icon">Ⅱ</span>}
          </button>
        </div>

        <div className="scroll-cue"><span>Scroll to explore</span><i /></div>
      </div>
    </section>
  );
}
