"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type PreviewTopNavItem = {
  href: string;
  label: string;
};

type PreviewTopNavProps = {
  items: PreviewTopNavItem[];
};

export function PreviewTopNav({ items }: PreviewTopNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <nav
      data-preview-top-nav
      className="fixed inset-x-0 top-0 z-40 border-b border-[#d8ddcf]/70 bg-[#fffdf3]/88 backdrop-blur transition-transform duration-300"
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
        <a
          href="#home"
          className="relative h-14 w-14 shrink-0 rounded-full border border-[#d8ddcf] bg-white/65 shadow-sm transition hover:bg-white"
          aria-label="Ir para o inicio"
        >
          <Image
            src="/brand/monograma.png"
            alt=""
            fill
            priority
            sizes="56px"
            className="object-contain p-1.5"
          />
        </a>

        <div className="hidden items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#66745c] xl:flex">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-[#b89543]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-full border border-[#d8ddcf] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4f6146] transition hover:bg-white xl:hidden"
          >
            Menu
          </button>
          <a
            href="/admin"
            className="hidden rounded-full border border-[#d8ddcf] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4f6146] transition hover:bg-white xl:inline-flex"
          >
            Noivos
          </a>
          <a
            href="#rsvp"
            className="shrink-0 rounded-full bg-[#4f6146] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#fffdf3] transition hover:bg-[#b89543] sm:px-5 sm:text-[11px]"
          >
            Confirmar presenca
          </a>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            aria-label="Fechar menu"
          />

          <aside className="absolute right-0 top-0 flex h-dvh w-[88%] max-w-sm flex-col overflow-y-auto border-l border-[#d8ddcf] bg-[#fffdf3] p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b89543]">
                  Menu
                </p>
                <p className="display-font mt-1 text-2xl font-semibold text-[#4f6146]">
                  Yasmim & Vitor
                </p>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                className="rounded-full border border-[#d8ddcf] px-4 py-2 text-sm font-medium text-[#66745c]"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 grid gap-2 pb-8">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-2xl border border-[#d8ddcf] bg-white/70 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#4f6146] transition hover:bg-white"
                >
                  {item.label}
                </a>
              ))}

              <a
                href="#rsvp"
                onClick={closeMenu}
                className="rounded-2xl bg-[#4f6146] px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#fffdf3] transition hover:bg-[#b89543]"
              >
                Confirmar presenca
              </a>
              <a
                href="/admin"
                className="rounded-2xl border border-[#d8ddcf] bg-white/70 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#4f6146] transition hover:bg-white"
              >
                Area dos noivos
              </a>
              <a
                href="/cerimonial"
                className="rounded-2xl border border-[#d8ddcf] bg-white/70 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#4f6146] transition hover:bg-white"
              >
                Cerimonialista
              </a>
            </div>
          </aside>
        </div>
      ) : null}
    </nav>
  );
}
