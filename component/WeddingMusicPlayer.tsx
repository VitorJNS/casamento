"use client";

import { useEffect, useRef, useState } from "react";

const audioSrc = "/audio/musica-casamento.mp3";

export function WeddingMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControl, setShowControl] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = 0.35;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setShowControl(true);
      } catch {
        setShowControl(true);
      }
    };

    void playAudio();

    const handleFirstInteraction = () => {
      if (audio.paused) {
        void playAudio();
      }
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setShowControl(true);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="auto"
        autoPlay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {showControl ? (
        <button
          type="button"
          onClick={toggleMusic}
          className="music-player-button fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d8ddcf] bg-[#fffdf3]/90 p-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#4f6146] shadow-lg shadow-[#4f6146]/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b19cd9]/55 sm:h-auto sm:min-h-11 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
          aria-label={isPlaying ? "Pausar musica" : "Tocar musica"}
          title="Musica do site"
        >
          <span aria-hidden="true">{isPlaying ? "II" : ">"}</span>
          <span className="hidden sm:inline">{isPlaying ? "Pausar" : "Tocar musica"}</span>
        </button>
      ) : null}
    </>
  );
}
