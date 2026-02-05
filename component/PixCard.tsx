"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type PixCardProps = {
  title: string;
  description?: string;
  pixKey: string;
};

export function PixCard({ title, description, pixKey }: PixCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // se bloquear, não é crítico
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-zinc-700 mt-2">{description}</p>}

      <div className="mt-4 flex flex-col sm:flex-row gap-6 sm:items-center">
        <div className="w-fit rounded-xl border border-zinc-200 bg-white p-3">
          {/* QR simples: nem todo banco abre Pix direto com isso,
             mas serve como atalho/identificação. */}
          <QRCodeSVG value={pixKey} size={180} />
        </div>

        <div className="flex-1">
          <p className="text-sm text-zinc-600">Chave Pix:</p>
          <p className="break-all font-medium">{pixKey}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyKey}
              className="rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              {copied ? "Copiado ✅" : "Copiar chave"}
            </button>

            <p className="text-xs text-zinc-500 mt-2">
              Dica: o botão “Copiar chave” é o método mais garantido. Se o QR não
              abrir Pix direto no seu banco, use a chave copiada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
