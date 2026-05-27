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
      <div className="sticky top-2 z-30 mb-3 hidden lg:block">
        <div className="rounded-full border border-zinc-200 bg-white/85 p-1.5 shadow-sm backdrop-blur">
          <nav className="flex flex-nowrap items-center justify-between gap-1">
            {items.map((item) => {
              const isActive = item.id === activeId;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[9px] font-semibold tracking-[0.08em] uppercase transition lg:px-3 lg:text-[10px] ${
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

            <a
              href="/admin"
              className="whitespace-nowrap rounded-full px-2.5 py-2 text-[9px] font-semibold tracking-[0.08em] uppercase text-[rgb(var(--olive))] transition lg:px-3 lg:text-[10px]"
              style={{
                backgroundColor: "rgb(var(--lavender) / 0.16)",
                border: "1px solid rgb(var(--lavender) / 0.35)",
              }}
            >
              Noivos
            </a>
          </nav>
        </div>
      </div>

      <div className="sticky top-2 z-30 mb-1 flex justify-end sm:mb-3 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center rounded-full border border-zinc-200 bg-white/88 px-5 py-3 text-sm font-medium text-[rgb(var(--olive))] shadow-sm backdrop-blur"
          aria-label="Abrir menu"
        >
          Menu
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-40 sm:hidden">
          <button
            type="button"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            aria-label="Fechar menu"
          />

          <aside className="absolute right-0 top-0 h-full w-[82%] max-w-sm border-l border-zinc-200 bg-[rgb(var(--paper))] p-5 shadow-2xl">
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
              <a
                href="/admin"
                className="rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[rgb(var(--olive))] transition"
                style={{
                  backgroundColor: "rgb(var(--lavender) / 0.14)",
                  border: "1px solid rgb(var(--lavender) / 0.28)",
                }}
              >
                Area dos noivos
              </a>

              {items.map((item) => {
                const isActive = item.id === activeId;

                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={closeMenu}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition ${
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
