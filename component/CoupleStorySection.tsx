"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type StoryPhoto = {
  src: string;
  alt: string;
};

type CoupleStorySectionProps = {
  id: string;
  title: string;
  text: string;
  leftPortrait: StoryPhoto;
  rightPortrait: StoryPhoto;
  timelineImage: StoryPhoto;
};

export function CoupleStorySection({
  id,
  title,
  text,
  leftPortrait,
  rightPortrait,
  timelineImage,
}: CoupleStorySectionProps) {
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  useEffect(() => {
    if (!mobilePreviewOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobilePreviewOpen]);

  const storyParagraphs = text
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section
      id={id}
      className="section-shell mb-10 rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm backdrop-blur sm:min-h-0 sm:p-8"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h2
          className="display-font text-3xl font-semibold tracking-[0.08em] sm:text-5xl"
          style={{ color: "rgb(var(--olive))" }}
        >
          {title}
        </h2>

        <div className="mx-auto mt-8 grid max-w-[19rem] grid-cols-2 justify-center gap-3 sm:mt-10 sm:max-w-[28rem] sm:gap-5">
          <PortraitCircle photo={leftPortrait} />
          <PortraitCircle photo={rightPortrait} />
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-4 text-sm leading-7 text-zinc-600 sm:text-base">
          {storyParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={() => setMobilePreviewOpen(true)}
            className="relative aspect-[4/3] w-full cursor-zoom-in sm:pointer-events-none sm:cursor-default"
            aria-label="Ampliar linha do tempo"
          >
            <Image
              src={timelineImage.src}
              alt={timelineImage.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-contain"
            />
          </button>
        </div>
      </div>

      {typeof document !== "undefined" && mobilePreviewOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 sm:hidden"
              onClick={() => setMobilePreviewOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                className="absolute right-4 top-4 rounded-full border border-white/35 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur"
              >
                Fechar
              </button>

              <div
                className="relative aspect-[4/3] w-full max-w-md"
                onClick={(event) => event.stopPropagation()}
              >
                <Image
                  src={timelineImage.src}
                  alt={timelineImage.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}

function PortraitCircle({ photo }: { photo: StoryPhoto }) {
  return (
    <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 shadow-sm sm:h-56 sm:w-56">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 640px) 160px, 224px"
        className="object-cover"
      />
    </div>
  );
}
