"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );

    const observeItems = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches("[data-reveal]") && !observed.has(root)) {
        observed.add(root);
        observer.observe(root);
      }
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((item) => {
        if (observed.has(item)) return;
        observed.add(item);
        observer.observe(item);
      });
    };

    observeItems(document);
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) observeItems(node);
    })));
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);
  return null;
}
