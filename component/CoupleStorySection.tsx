"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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
  carouselPhotos: StoryPhoto[];
};

export function CoupleStorySection({
  id,
  title,
  text,
  leftPortrait,
  rightPortrait,
  carouselPhotos,
}: CoupleStorySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  const safePhotos = carouselPhotos.length > 0 ? carouselPhotos : [leftPortrait, rightPortrait];
  const activePhoto = safePhotos[activeIndex] ?? safePhotos[0];

  const scheduleIndexChange = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeIndex || isTransitioning) {
        return;
      }

      setIsTransitioning(true);

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setActiveIndex(nextIndex);
        setIsTransitioning(false);
        transitionTimeoutRef.current = null;
      }, 240);
    },
    [activeIndex, isTransitioning],
  );

  useEffect(() => {
    if (safePhotos.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const nextIndex = activeIndex === safePhotos.length - 1 ? 0 : activeIndex + 1;
      scheduleIndexChange(nextIndex);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [activeIndex, isTransitioning, safePhotos.length, scheduleIndexChange]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const goToPrevious = () => {
    scheduleIndexChange(activeIndex === 0 ? safePhotos.length - 1 : activeIndex - 1);
  };

  const goToNext = () => {
    scheduleIndexChange(activeIndex === safePhotos.length - 1 ? 0 : activeIndex + 1);
  };

  return (
    <section
      id={id}
      className="section-shell mb-10 min-h-[calc(100vh-7.5rem)] rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm backdrop-blur sm:min-h-0 sm:p-8"
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

        <p className="mx-auto mt-8 max-w-3xl text-sm leading-7 text-zinc-600 sm:text-base">
          {text}
        </p>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
          <div className="relative aspect-[16/10] w-full bg-zinc-100">
            <Image
              key={activePhoto.src}
              src={activePhoto.src}
              alt={activePhoto.alt}
              fill
              sizes="(max-width: 768px) 100vw, 960px"
              className={`object-cover transition-all duration-500 ease-out ${
                isTransitioning ? "scale-[1.03] opacity-0" : "scale-100 opacity-100"
              }`}
              priority
            />

            {safePhotos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/15 text-3xl text-white shadow-lg backdrop-blur transition hover:bg-white/25 sm:left-4"
                  aria-label="Foto anterior"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={goToNext}
                  className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/15 text-3xl text-white shadow-lg backdrop-blur transition hover:bg-white/25 sm:right-4"
                  aria-label="Proxima foto"
                >
                  ›
                </button>
              </>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent px-4 pb-4 pt-14">
              <div className="mx-auto flex max-w-xl items-center justify-center gap-2 overflow-x-auto pb-1">
                {safePhotos.map((photo, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={`${photo.src}-${index}`}
                      type="button"
                      onClick={() => scheduleIndexChange(index)}
                      className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-md border transition sm:h-14 sm:w-14 ${
                        isActive
                          ? "border-white shadow-lg"
                          : "border-white/50 opacity-80 hover:opacity-100"
                      }`}
                      aria-label={`Abrir foto ${index + 1}`}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
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
