"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownProps = {
  /** Data alvo em formato ISO. Ex: "2027-06-20T00:00:00-03:00" */
  targetISO: string;
  label?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown({ targetISO, label = "Depois de tantos capítulos juntos, chegou o momento do nosso para sempre. Faltam" }: CountdownProps) {
  const targetMs = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  const diff = nowMs === null ? null : Math.max(0, targetMs - nowMs);

  const totalSeconds = diff === null ? null : Math.floor(diff / 1000);
  const days = totalSeconds === null ? "--" : Math.floor(totalSeconds / (60 * 60 * 24));
  const hours =
    totalSeconds === null ? "--" : pad2(Math.floor((totalSeconds / (60 * 60)) % 24));
  const minutes =
    totalSeconds === null ? "--" : pad2(Math.floor((totalSeconds / 60) % 60));
  const seconds = totalSeconds === null ? "--" : pad2(Math.floor(totalSeconds % 60));

  const finished = diff === 0;

  return (
    <div>
        {!finished ? (
        <>
            <p
            className="text-xs tracking-[0.16em] uppercase sm:text-sm sm:tracking-[0.18em]"
            style={{ color: "rgb(var(--olive))" }}
            >
            {label}
            </p>

            <div className="mt-[clamp(0.75rem,1.8svh,1.25rem)] grid grid-cols-4 gap-2">
            <TimeBox value={days} label="Dias" />
            <TimeBox value={hours} label="Horas" />
            <TimeBox value={minutes} label="Min" />
            <TimeBox value={seconds} label="Seg" />
            </div>
        </>
        ) : (
        <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-5 shadow-sm text-center">
            <p
            className="text-sm tracking-[0.22em] uppercase"
            style={{ color: "rgb(var(--olive))" }}
            >
            É hoje!
            </p>

            <div className="display-font mt-2 text-3xl font-semibold">
            Chegou o grande dia 💍
            </div>

            <p className="mt-2 text-zinc-700">
            Obrigado por fazer parte desse momento conosco.
            </p>
        </div>
        )}
    </div>
    );

}

function TimeBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 px-3 py-3 text-center shadow-sm backdrop-blur transition hover:-translate-y-0.5 sm:px-4 sm:py-3.5">
      <div className="display-font text-xl font-semibold leading-none tabular-nums sm:text-2xl">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-zinc-600 sm:mt-2 sm:text-xs">{label}</div>
    </div>
  );
}

