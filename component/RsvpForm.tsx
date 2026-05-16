"use client";

import { useState } from "react";

type AttendanceStatus = "confirmed" | "declined";

type FormState = {
  guestName: string;
  whatsapp: string;
  email: string;
  attendance: AttendanceStatus;
  guestCount: string;
  companionNames: string[];
  note: string;
};

const initialState: FormState = {
  guestName: "",
  whatsapp: "",
  email: "",
  attendance: "confirmed",
  guestCount: "1",
  companionNames: [],
  note: "",
};

export function RsvpForm() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const guestCount = Number(formState.guestCount);
  const companionSlots =
    formState.attendance === "confirmed" ? Math.max(guestCount - 1, 0) : 0;

  function syncCompanionNames(nextCount: number) {
    setFormState((current) => {
      const nextLength =
        current.attendance === "confirmed" ? Math.max(nextCount - 1, 0) : 0;
      const nextNames = current.companionNames.slice(0, nextLength);

      while (nextNames.length < nextLength) {
        nextNames.push("");
      }

      return {
        ...current,
        guestCount: String(nextCount),
        companionNames: nextNames,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: formState.guestName,
          whatsapp: formState.whatsapp,
          email: formState.email || undefined,
          attendance: formState.attendance,
          guestCount: Number(formState.guestCount),
          companionNames:
            formState.attendance === "confirmed"
              ? formState.companionNames
                  .map((name) => name.trim())
                  .filter(Boolean)
              : [],
          note: formState.note || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "Nao foi possivel registrar sua confirmacao.",
        );
      }

      setSuccessMessage(
        formState.attendance === "confirmed"
          ? "Presenca confirmada com sucesso. Vamos ficar muito felizes em celebrar com voce."
          : "Resposta registrada. Obrigado por nos avisar com carinho.",
      );
      setFormState(initialState);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel registrar sua confirmacao.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-zinc-200 bg-white/88 p-5 shadow-sm backdrop-blur sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            Nome completo
          </span>
          <input
            value={formState.guestName}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                guestName: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
            placeholder="Seu nome e sobrenome"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            WhatsApp
          </span>
          <input
            value={formState.whatsapp}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                whatsapp: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
            placeholder="(11) 99999-9999"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            Email
          </span>
          <input
            type="email"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
            placeholder="voce@email.com"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            Resposta
          </span>
          <select
            value={formState.attendance}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                attendance: event.target.value as AttendanceStatus,
                companionNames:
                  event.target.value === "confirmed"
                    ? current.companionNames
                    : [],
              }))
            }
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
          >
            <option value="confirmed">Sim, estarei presente</option>
            <option value="declined">Nao poderei comparecer</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            Total de pessoas
          </span>
          <select
            value={formState.guestCount}
            onChange={(event) => syncCompanionNames(Number(event.target.value))}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <option key={index + 1} value={String(index + 1)}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>

        {companionSlots > 0 ? (
          <div className="sm:col-span-2">
            <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Nomes dos acompanhantes
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Preencha os nomes das outras pessoas que irao com voce.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: companionSlots }, (_, index) => (
                  <label key={index} className="block">
                    <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Acompanhante {index + 1}
                    </span>
                    <input
                      value={formState.companionNames[index] ?? ""}
                      onChange={(event) =>
                        setFormState((current) => {
                          const nextNames = [...current.companionNames];
                          nextNames[index] = event.target.value;
                          return {
                            ...current,
                            companionNames: nextNames,
                          };
                        })
                      }
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                      placeholder={`Nome do acompanhante ${index + 1}`}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            Recado para os noivos
          </span>
          <textarea
            value={formState.note}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                note: event.target.value,
              }))
            }
            rows={4}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
            placeholder="Se quiser, deixe um recado carinhoso para a gente."
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enviando confirmacao..." : "Confirmar presenca"}
        </button>
      </div>
    </form>
  );
}
