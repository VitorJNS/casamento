"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type TimelineImagePreviewProps = {
  src: string;
  alt: string;
};

export function TimelineImagePreview({ src, alt }: TimelineImagePreviewProps) {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative aspect-[16/10] w-full cursor-zoom-in rounded-md bg-[#fffdf3]/55 lg:pointer-events-none lg:cursor-default"
        aria-label="Ampliar nossa historia"
      >
        <Image
          src={src}
          alt={alt}
          fill
          quality={100}
          sizes="(max-width: 640px) 100vw, 1024px"
          className="object-contain p-2 sm:p-3"
        />
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[150] bg-black/80 p-3 backdrop-blur-sm lg:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full border border-white/35 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute inset-0"
                aria-label="Fechar imagem ampliada"
              />

              <div className="relative z-0 flex h-full w-full items-center justify-center overflow-auto">
                <div className="relative aspect-[16/10] w-[min(1400px,180vw)] min-w-[900px]">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    quality={100}
                    sizes="1400px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
