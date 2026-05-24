"use client";

import { useEffect, useState } from "react";

type NavItem = {
  id: string;
  label: string;
  mobileLabel?: string;
};

type TopSectionNavProps = {
  items: NavItem[];
};

export function TopSectionNav({ items }: TopSectionNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    const syncToHash = () => {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    };

    requestAnimationFrame(syncToHash);
    const timeoutId = window.setTimeout(syncToHash, 250);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -45% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <>
      <div className="sticky top-4 z-30 mb-6 hidden sm:block">
        <div className="rounded-full border border-zinc-200 bg-white/85 p-2 shadow-sm backdrop-blur">
          <nav className="flex flex-wrap justify-center gap-2">
            {items.map((item) => {
              const isActive = item.id === activeId;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "text-white" : "text-[rgb(var(--olive))]"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: "rgb(var(--olive))" }
                      : {
                          backgroundColor: "rgb(var(--lavender) / 0.16)",
                          border: "1px solid rgb(var(--lavender) / 0.35)",
                        }
                  }
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="sticky top-4 z-30 mb-6 sm:hidden">
        <div className="flex items-center justify-between rounded-full border border-zinc-200 bg-white/88 px-4 py-3 shadow-sm backdrop-blur">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Navegacao
            </p>
            <p className="text-sm font-medium text-zinc-900">
              {items.find((item) => item.id === activeId)?.label ?? "Inicio"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-[rgb(var(--olive))]"
            aria-label="Abrir menu"
          >
            Menu
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-40 sm:hidden">
          <button
            type="button"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            aria-label="Fechar menu"
          />

          <aside className="absolute right-0 top-0 h-full w-[82%] max-w-xs border-l border-zinc-200 bg-[rgb(var(--paper))] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Menu
                </p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                  Yasmim & Vitor
                </h2>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                className="rounded-full border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700"
              >
                Fechar
              </button>
            </div>

            <nav className="mt-6 grid gap-2">
              {items.map((item) => {
                const isActive = item.id === activeId;

                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={closeMenu}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "text-white" : "text-[rgb(var(--olive))]"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: "rgb(var(--olive))" }
                        : {
                            backgroundColor: "rgb(var(--lavender) / 0.14)",
                            border: "1px solid rgb(var(--lavender) / 0.28)",
                          }
                    }
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
