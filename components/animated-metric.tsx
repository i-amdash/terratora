"use client";

import { useEffect, useRef } from "react";

const NUMBER_PATTERN = /\d+(?:[.,]\d+)?/g;

export function AnimatedMetric({ value, label }: { value: string; label: string }) {
  const valueRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = valueRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let animationFrame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const startedAt = performance.now();
        const duration = 1650;
        const draw = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 4);
          element.textContent = interpolateMetric(value, eased);
          if (progress < 1) animationFrame = requestAnimationFrame(draw);
        };

        element.textContent = interpolateMetric(value, 0);
        animationFrame = requestAnimationFrame(draw);
      },
      { threshold: 0.45 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return (
    <div className="metric" data-reveal>
      <strong ref={valueRef} aria-label={value}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function interpolateMetric(value: string, progress: number) {
  return value.replace(NUMBER_PATTERN, (token) => {
    const normalised = Number(token.replace(",", "."));
    if (!Number.isFinite(normalised)) return token;

    const decimals = token.includes(".") || token.includes(",")
      ? token.split(/[.,]/)[1]?.length ?? 0
      : 0;
    const target = normalised * progress;
    let result = decimals ? target.toFixed(decimals) : String(Math.round(target));
    if (token.includes(",")) result = result.replace(".", ",");

    const integerWidth = token.split(/[.,]/)[0]?.length ?? 1;
    const [integer, decimal] = result.split(/[.,]/);
    const padded = integer.padStart(integerWidth, "0");
    if (decimal === undefined) return padded;
    return `${padded}${token.includes(",") ? "," : "."}${decimal}`;
  });
}
