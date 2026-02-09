"use client";

import { useState } from "react";

type LocationCardProps = {
  address: string;
  mapsLink: string;
};

export function LocationCard({ address, mapsLink }: LocationCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.log("ERRO COPY ADDRESS ON LOCATION CARD-> ", e);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur p-5 shadow-sm">
      <p className="text-sm text-zinc-600">Endereço:</p>
      <p className="mt-1 break-words font-medium">{address}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyAddress}
          className="rounded-full px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
          style={{ backgroundColor: "rgb(var(--olive))" }}
        >
          {copied ? "Copiado ✅" : "Copiar endereço"}
        </button>

        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-full px-5 py-2 text-sm font-medium border transition hover:bg-white/60"
          style={{
            borderColor: "rgb(var(--lavender) / 0.55)",
            backgroundColor: "rgb(var(--lavender) / 0.18)",
            color: "rgb(var(--olive))",
          }}
        >
          Abrir no Google Maps
        </a>
      </div>
    </div>
  );
}
