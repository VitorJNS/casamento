"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type TimelineImagePreviewProps = {
  src: string;
  mobileSrc?: string;
  alt: string;
};

export function TimelineImagePreview({
  src,
  mobileSrc = src,
  alt,
}: TimelineImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedMobileSrc, setResolvedMobileSrc] = useState(mobileSrc);

  useEffect(() => {
    setResolvedMobileSrc(mobileSrc);
  }, [mobileSrc]);

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

  function openPreview() {
    setIsOpen(true);
  }

  function closePreview() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="relative aspect-[9/16] w-full cursor-zoom-in rounded-md bg-[#fffdf3]/55 sm:aspect-[16/10] lg:pointer-events-none lg:cursor-default"
        aria-label="Ampliar nossa historia"
      >
        <Image
          src={src}
          alt={alt}
          fill
          quality={100}
          sizes="(max-width: 640px) 100vw, 1024px"
          className="hidden object-contain p-2 sm:block sm:p-3"
        />
        <Image
          src={resolvedMobileSrc}
          alt={alt}
          fill
          quality={100}
          sizes="100vw"
          className="object-contain p-2 sm:hidden"
          onError={() => setResolvedMobileSrc(src)}
        />
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-sm lg:hidden"
              onClick={closePreview}
            >
              <button
                type="button"
                onClick={closePreview}
                className="absolute right-4 top-4 z-30 rounded-full border border-white/35 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur"
              >
                Fechar
              </button>

              <div
                className="h-full w-full overflow-auto overscroll-contain p-4 pt-20"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex min-h-full items-center justify-center">
                  <div className="relative aspect-[9/16] w-full shrink-0 transition-[width]">
                    <Image
                      src={resolvedMobileSrc}
                      alt={alt}
                      fill
                      quality={100}
                      sizes="(max-width: 1024px) 100vw, 430px"
                      className="object-contain"
                      onError={() => setResolvedMobileSrc(src)}
                    />
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
