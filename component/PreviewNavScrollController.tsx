"use client";

import { useEffect } from "react";

export function PreviewNavScrollController() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-preview-top-nav]");
    if (!nav) return;

    nav.classList.remove("-translate-y-full");
    nav.classList.add("translate-y-0");
  }, []);

  useEffect(() => {
    const scrollToHomeTop = () => {
      if (window.location.hash !== "#home") {
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    scrollToHomeTop();
    const animationFrameId = window.requestAnimationFrame(scrollToHomeTop);
    const timeoutIds = [80, 250, 600].map((delay) =>
      window.setTimeout(scrollToHomeTop, delay),
    );

    window.addEventListener("hashchange", scrollToHomeTop);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.removeEventListener("hashchange", scrollToHomeTop);
    };
  }, []);

  return null;
}
