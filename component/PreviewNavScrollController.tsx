"use client";

import { useEffect, useRef } from "react";

export function PreviewNavScrollController() {
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-preview-top-nav]");
    if (!nav) return;

    lastScrollY.current = window.scrollY;

    function updateVisibility() {
      if (!nav) return;

      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY.current;
      const nearTop = currentScrollY < 48;

      nav.classList.toggle("-translate-y-full", !nearTop && !scrollingUp);
      nav.classList.toggle("translate-y-0", nearTop || scrollingUp);

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    }

    function handleScroll() {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(updateVisibility);
    }

    nav.classList.add("translate-y-0");
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
