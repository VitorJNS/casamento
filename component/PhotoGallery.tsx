"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Photo = {
  src: string;
  alt: string;
};

type PhotoGalleryProps = {
  photos: Photo[];
};

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<Photo | null>(null);

  // Fecha com ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }

    if (selected) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [selected]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setSelected(photo)}
            className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label={`Abrir foto: ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Modal / Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador de foto"
          onClick={() => setSelected(null)} // clicou fora, fecha
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()} // evita fechar ao clicar na imagem
          >
            {/* Botão fechar */}
            <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-black/80 border border-white/15"
                >
                <span className="text-base leading-none">✕</span>
                Fechar
            </button>


            {/* Área da imagem grande */}
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={selected.src}
                alt={selected.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain"
                priority
              />
            </div>

            {/* Legenda */}
            <div className="bg-black px-4 py-3 text-sm text-white/90">
              {selected.alt}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
