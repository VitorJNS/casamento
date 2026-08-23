"use client";

import { useEffect, useRef, useState } from "react";

const audioSrc = "/audio/musica-casamento.mp3";
const musicStateStorageKey = "casamento-music-player-state";

type MusicPlayerState = {
  currentTime: number;
  wasPlaying: boolean;
  userPaused: boolean;
};

function readStoredMusicState() {
  try {
    const rawState = window.sessionStorage.getItem(musicStateStorageKey);

    if (!rawState) {
      return null;
    }

    const parsedState = JSON.parse(rawState) as Partial<MusicPlayerState>;

    if (typeof parsedState.currentTime !== "number") {
      return null;
    }

    return {
      currentTime: parsedState.currentTime,
      wasPlaying: parsedState.wasPlaying === true,
      userPaused: parsedState.userPaused === true,
    };
  } catch {
    return null;
  }
}

function storeMusicState(audio: HTMLAudioElement, userPaused: boolean) {
  window.sessionStorage.setItem(
    musicStateStorageKey,
    JSON.stringify({
      currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      wasPlaying: !audio.paused,
      userPaused,
    } satisfies MusicPlayerState),
  );
}

export function WeddingMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const userPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControl, setShowControl] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = 0.35;
    const storedState = readStoredMusicState();
    userPausedRef.current = storedState?.userPaused === true;

    const restoreMusicPosition = () => {
      if (!storedState || storedState.currentTime <= 0) {
        return;
      }

      const duration = Number.isFinite(audio.duration) ? audio.duration : Infinity;
      audio.currentTime = Math.min(storedState.currentTime, Math.max(duration - 1, 0));
    };

    const playAudio = async () => {
      try {
        await audio.play();
        userPausedRef.current = false;
        setIsPlaying(true);
        setShowControl(true);
      } catch {
        return false;
      }

      return true;
    };

    if (audio.readyState >= 1) {
      restoreMusicPosition();
    } else {
      audio.addEventListener("loadedmetadata", restoreMusicPosition, {
        once: true,
      });
    }

    if (!userPausedRef.current) {
      void playAudio();
    } else {
      setShowControl(true);
    }

    const handleFirstInteraction = () => {
      if (audio.paused && !userPausedRef.current) {
        void playAudio();
      }
    };

    const showFallbackControl = () => setShowControl(true);
    const autoplayDelayIds = [450, 1200, 2600].map((delay) =>
      window.setTimeout(() => {
        if (audio.paused && !userPausedRef.current) {
          void playAudio();
        }
      }, delay),
    );
    const fallbackDelayId = window.setTimeout(showFallbackControl, 900);
    const persistMusicState = () => storeMusicState(audio, userPausedRef.current);
    const persistIntervalId = window.setInterval(persistMusicState, 2000);

    audio.addEventListener("canplay", handleFirstInteraction, { once: true });
    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });
    window.addEventListener("wheel", handleFirstInteraction, { once: true, passive: true });
    window.addEventListener("scroll", handleFirstInteraction, { once: true, passive: true });
    window.addEventListener("load", handleFirstInteraction, { once: true });
    window.addEventListener("beforeunload", persistMusicState);

    return () => {
      persistMusicState();
      autoplayDelayIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.clearTimeout(fallbackDelayId);
      window.clearInterval(persistIntervalId);
      audio.removeEventListener("canplay", handleFirstInteraction);
      audio.removeEventListener("loadedmetadata", restoreMusicPosition);
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("wheel", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
      window.removeEventListener("load", handleFirstInteraction);
      window.removeEventListener("beforeunload", persistMusicState);
    };
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        userPausedRef.current = false;
        await audio.play();
        setIsPlaying(true);
      } catch {
        setShowControl(true);
      }
      return;
    }

    userPausedRef.current = true;
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
        onPlay={(event) => {
          setIsPlaying(true);
          storeMusicState(event.currentTarget, userPausedRef.current);
        }}
        onPause={(event) => {
          setIsPlaying(false);
          storeMusicState(event.currentTarget, userPausedRef.current);
        }}
      />
      {showControl ? (
        <button
          type="button"
          onClick={toggleMusic}
          className={`music-player-button fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d8ddcf] bg-[#fffdf3]/90 p-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#4f6146] shadow-lg shadow-[#4f6146]/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b19cd9]/55 sm:h-auto sm:min-h-11 sm:w-auto sm:gap-2 sm:px-4 sm:py-2 ${
            isPlaying ? "" : "music-player-button--attention"
          }`}
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
