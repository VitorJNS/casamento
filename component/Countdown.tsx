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

export function Countdown({ targetISO, label = "Faltam" }: CountdownProps) {
  const targetMs = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, targetMs - nowMs);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const seconds = Math.floor(totalSeconds % 60);

  const finished = diff === 0;

  return (
    <div className="mt-6">
        {!finished ? (
        <>
            <p
            className="text-sm tracking-[0.18em] uppercase"
            style={{ color: "rgb(var(--olive))" }}
            >
            {label}
            </p>

            <div className="mt-3 grid grid-cols-4 gap-2">
            <TimeBox value={days} label="Dias" />
            <TimeBox value={pad2(hours)} label="Horas" />
            <TimeBox value={pad2(minutes)} label="Min" />
            <TimeBox value={pad2(seconds)} label="Seg" />
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
            Obrigado por fazer parte desse momento com a gente.
            </p>
        </div>
        )}
    </div>
    );

}

function TimeBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur px-3 py-3 text-center shadow-sm">
      <div className="display-font text-2xl font-semibold leading-none">
        {value}
      </div>
      <div className="mt-1 text-xs text-zinc-600">{label}</div>
    </div>
  );
}
