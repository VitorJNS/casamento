"use client";

import { useEffect } from "react";

export function PreviewNavScrollController() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-preview-top-nav]");
    if (!nav) return;

    nav.classList.remove("-translate-y-full");
    nav.classList.add("translate-y-0");
  }, []);

  return null;
}
