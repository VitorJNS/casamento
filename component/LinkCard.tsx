"use client";

import { useState } from "react";

type LinkCardProps = {
  title: string;
  description?: string;
  href: string;
  buttonText?: string;
};

export function LinkCard({
  title,
  description,
  href,
  buttonText = "Abrir pasta",
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // se bloquear, só não copia (não é crítico)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-zinc-700 mt-2">{description}</p>}

      {/* <div className="mt-4 break-all rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-black" >
        {href}
      </div> */}

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          {buttonText}
        </a>

        <button
          type="button"
          onClick={copyLink}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          {copied ? "Copiado ✅" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}
