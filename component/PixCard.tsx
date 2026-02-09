"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type PixCardProps = {
  title: string;
  description?: string;
  pixKey: string;
  pixCopiaECola?: string;
};

export function PixCard({
  title,
  description,
  pixKey,
  pixCopiaECola,
}: PixCardProps) {
  const [copied, setCopied] = useState<"code" | "key" | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Se tiver "copia e cola", ele vira o payload principal (QR + copiar)
  const payload = useMemo(() => {
    const v = pixCopiaECola?.trim();
    return v ? v : pixKey;
  }, [pixCopiaECola, pixKey]);

  async function copy(text: string, kind: "code" | "key") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      // se bloquear, não é crítico
    }
  }

  const hasCopiaECola = Boolean(pixCopiaECola?.trim());

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-zinc-700 mt-2">{description}</p>}

      <div className="mt-4 flex flex-col sm:flex-row gap-6 sm:items-center">
        <div className="w-fit rounded-xl border border-zinc-200 bg-white p-3">
          <QRCodeSVG value={payload} size={180} />
        </div>

        <div className="flex-1">
          <div className="mt-1 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => copy(payload, "code")}
              className="rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              {copied === "code"
                ? "Código copiado ✅"
                : hasCopiaECola
                ? "Copiar código Pix"
                : "Copiar chave"}
            </button>

            <button
              type="button"
              onClick={() => copy(pixKey, "key")}
              className="rounded-full px-4 py-2 text-sm font-medium border hover:bg-white/60"
              style={{
                borderColor: "rgb(var(--lavender) / 0.55)",
                backgroundColor: "rgb(var(--lavender) / 0.18)",
                color: "rgb(var(--olive))",
              }}
            >
              {copied === "key" ? "Chave copiada ✅" : "Copiar chave"}
            </button>

            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="rounded-full px-4 py-2 text-sm font-medium border transition hover:bg-white/60"
              style={{
                borderColor: "rgb(var(--lavender) / 0.35)",
                backgroundColor: "rgb(var(--lavender) / 0.10)",
                color: "rgb(var(--olive))",
              }}
            >
              {showDetails ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
          </div>

          <p className="text-xs text-zinc-500 mt-3">
            Dica: se o QR não abrir automaticamente no seu banco, copie o código Pix e cole no app do banco.
          </p>

          {showDetails && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white/60 p-4">
              <p className="text-xs text-zinc-600">Chave Pix</p>
              <p className="break-all font-medium">{pixKey}</p>

              {hasCopiaECola && (
                <>
                  <p className="mt-3 text-xs text-zinc-600">Pix Copia e Cola</p>
                  <p className="break-all text-sm">{pixCopiaECola}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
