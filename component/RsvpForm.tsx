"use client";

import { useMemo, useState } from "react";

type AttendanceStatus = "confirmed" | "declined";

type InviteGuest = {
  id: string;
  guestName: string;
  familyLabel: string | null;
  isChild: boolean;
  latestAttendance?: AttendanceStatus | null;
};

type GuestMatch = {
  id: string;
  guestName: string;
  familyLabel: string | null;
  isChild: boolean;
};

type GuestSelection = {
  guestId: string;
  guestName: string;
  status: AttendanceStatus;
};

type LookupState = {
  lookupGuestId: string;
  familyLabel: string | null;
  guests: InviteGuest[];
};

const initialContactState = {
  guestName: "",
  email: "",
  note: "",
};

export function RsvpForm({
  giftListHref = "#lista-de-presentes",
}: {
  giftListHref?: string;
}) {
  const [contactState, setContactState] = useState(initialContactState);
  const [lookupState, setLookupState] = useState<LookupState | null>(null);
  const [guestMatches, setGuestMatches] = useState<GuestMatch[]>([]);
  const [guestSelections, setGuestSelections] = useState<GuestSelection[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const answeredCount = useMemo(
    () => guestSelections.length,
    [guestSelections],
  );

  function applyLookupData(data: {
    lookupGuestId?: string;
    familyLabel?: string | null;
    guests?: InviteGuest[];
    latestResponses?: Record<string, AttendanceStatus>;
  }) {
    const latestResponses =
      data.latestResponses && typeof data.latestResponses === "object"
        ? data.latestResponses
        : {};
    const guests = Array.isArray(data.guests)
      ? data.guests.map((guest) => ({
          ...guest,
          latestAttendance: latestResponses[guest.id] ?? null,
        }))
      : [];

    setLookupState({
      lookupGuestId: data.lookupGuestId ?? guests[0]?.id ?? "",
      familyLabel: data.familyLabel ?? null,
      guests,
    });

    const lookupGuest = guests.find((guest) => guest.id === data.lookupGuestId);
    if (lookupGuest) {
      setContactState((current) => ({
        ...current,
        guestName: lookupGuest.guestName,
      }));
    }

    setGuestSelections(
      guests.map((guest) => ({
        guestId: guest.id,
        guestName: guest.guestName,
        status: guest.latestAttendance === "declined" ? "declined" : "confirmed",
      })),
    );
  }

  async function handleLookup() {
    setIsLookingUp(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setLookupState(null);
    setGuestMatches([]);
    setGuestSelections([]);

    try {
      const response = await fetch(
        `/api/rsvp?name=${encodeURIComponent(contactState.guestName)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "Nao foi possivel localizar convidados com esse nome.",
        );
      }

      if (Array.isArray(data.matches)) {
        setLookupState(null);
        setGuestSelections([]);
        setGuestMatches(data.matches as GuestMatch[]);
        return;
      }

      applyLookupData(data);
    } catch (error) {
      setLookupState(null);
      setGuestMatches([]);
      setGuestSelections([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel localizar convidados com esse nome.",
      );
    } finally {
      setIsLookingUp(false);
    }
  }

  async function handleSelectMatch(guestId: string) {
    setIsLookingUp(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/rsvp?guestId=${encodeURIComponent(guestId)}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Nao foi possivel carregar esse convite.");
      }

      setGuestMatches([]);
      applyLookupData(data);
    } catch (error) {
      setLookupState(null);
      setGuestSelections([]);
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel carregar esse convite.",
      );
    } finally {
      setIsLookingUp(false);
    }
  }

  function updateSelection(guestId: string, status: AttendanceStatus) {
    setGuestSelections((current) =>
      current.map((guest) => (guest.guestId === guestId ? { ...guest, status } : guest)),
    );
  }

  function applyStatusToAll(status: AttendanceStatus) {
    setGuestSelections((current) =>
      current.map((guest) => {
        const inviteGuest = lookupState?.guests.find((item) => item.id === guest.guestId);
        if (inviteGuest?.latestAttendance) {
          return guest;
        }

        return { ...guest, status };
      }),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const answeredGuests = guestSelections
        .filter((guest) => {
          const inviteGuest = lookupState?.guests.find((item) => item.id === guest.guestId);
          return !inviteGuest?.latestAttendance;
        })
        .map((guest) => ({
          guestId: guest.guestId,
          attendance: guest.status,
        }));

      if (answeredGuests.length === 0) {
        throw new Error("Todos os nomes deste convite ja possuem resposta registrada.");
      }

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lookupGuestId: lookupState?.lookupGuestId,
          guestName: contactState.guestName,
          email: contactState.email,
          note: contactState.note || undefined,
          guests: answeredGuests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "Nao foi possivel registrar sua confirmacao.",
        );
      }

      setSuccessMessage("Resposta registrada com sucesso. Obrigado por confirmar sua presença.");
      setContactState(initialContactState);
      setLookupState(null);
      setGuestMatches([]);
      setGuestSelections([]);
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
      className="rounded-[2rem] border border-[#c9a65a]/35 bg-[#fffdf3]/86 p-5 shadow-[0_24px_80px_rgba(79,97,70,0.10)] backdrop-blur sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-[#7b6234]">
            Seu nome
          </span>
          <input
            value={contactState.guestName}
            onChange={(event) => {
              setContactState((current) => ({
                ...current,
                guestName: event.target.value,
              }));
              setLookupState(null);
              setGuestMatches([]);
              setGuestSelections([]);
            }}
            className="w-full rounded-lg border border-[#d9c6a4] bg-white/88 px-4 py-3 text-sm text-[#2f302d] outline-none transition placeholder:text-[#9b8f75] focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
            placeholder="Digite pelo menos 3 letras do seu nome"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-[#7b6234]">
            Email para receber a confirmação
          </span>
          <input
            type="email"
            required
            value={contactState.email}
            onChange={(event) =>
              setContactState((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-[#d9c6a4] bg-white/88 px-4 py-3 text-sm text-[#2f302d] outline-none transition placeholder:text-[#9b8f75] focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
            placeholder="Digite o email para receber o comprovante"
          />
        </label>

        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={handleLookup}
            disabled={isLookingUp || contactState.guestName.trim().length < 3}
            className="rounded-lg border border-[#c9a65a] bg-[#fffaf1] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#4f6146] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLookingUp ? "Buscando convidados..." : "Buscar meus nomes"}
          </button>
        </div>

        {guestMatches.length > 0 ? (
          <div className="sm:col-span-2">
            <div className="rounded-[1.5rem] border border-[#d9c6a4] bg-[#fffaf1] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6234]">
                Escolha seu nome
              </p>
              <p className="mt-1 text-sm leading-6 text-[#5f6b55]">
                Encontramos mais de um convidado com esse nome. Selecione a opcao correta
                para abrir o grupo do convite.
              </p>

              <div className="mt-4 grid gap-3">
                {guestMatches.map((guest) => (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => handleSelectMatch(guest.id)}
                    disabled={isLookingUp}
                    className="rounded-2xl border border-[#d9c6a4] bg-white/86 px-4 py-3 text-left transition hover:border-[rgb(var(--olive))] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="block text-base font-semibold text-zinc-900">
                      {guest.guestName}
                    </span>
                    <span className="mt-1 block text-sm text-zinc-500">
                      {guest.familyLabel
                        ? guest.familyLabel
                        : guest.isChild
                          ? "Crianca"
                          : "Convidado individual"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {lookupState ? (
          <div className="sm:col-span-2">
            <div className="rounded-[1.5rem] border border-[#d9c6a4] bg-[#fffaf1] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6234]">
                    Confirmacao por grupo
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#5f6b55]">
                    {lookupState.familyLabel
                      ? `${lookupState.familyLabel}: escolha quem vai comparecer ou quem nao podera ir neste grupo.`
                      : "Escolha abaixo quem você deseja confirmar ou recusar neste convite."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyStatusToAll("confirmed")}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700"
                  >
                    Todos irao
                  </button>
                  <button
                    type="button"
                    onClick={() => applyStatusToAll("declined")}
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700"
                  >
                    Ninguem ira
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {lookupState.guests.map((guest) => {
                  const selection =
                    guestSelections.find((item) => item.guestId === guest.id)?.status ??
                    "confirmed";
                  const isLocked = Boolean(guest.latestAttendance);

                  return (
                    <div
                      key={guest.id}
                      className="rounded-2xl border border-[#d9c6a4] bg-white/86 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-zinc-900">
                            {guest.guestName}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {guest.isChild ? "Crianca" : "Adulto"}
                          </p>
                          {guest.latestAttendance ? (
                            <p className="mt-1 text-sm text-amber-700">
                              Ja respondeu: {guest.latestAttendance === "confirmed" ? "Irei" : "Nao irei"}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => updateSelection(guest.id, "confirmed")}
                            disabled={isLocked}
                            className={`rounded-full px-4 py-2 text-sm font-medium ${
                              selection === "confirmed"
                                ? "bg-emerald-600 text-white"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            Irei
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSelection(guest.id, "declined")}
                            disabled={isLocked}
                            className={`rounded-full px-4 py-2 text-sm font-medium ${
                              selection === "declined"
                                ? "bg-rose-600 text-white"
                                : "border border-rose-200 bg-rose-50 text-rose-700"
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            Nao irei
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-sm text-zinc-600">
                {answeredCount} nome{answeredCount === 1 ? "" : "s"} pronto
                {answeredCount === 1 ? "" : "s"} para confirmar.
              </p>
              {lookupState.guests.some((guest) => guest.latestAttendance) ? (
                <p className="mt-2 text-sm text-amber-700">
                  Nomes com resposta anterior ficam bloqueados para evitar confirmacao duplicada.
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !lookupState}
                  className="btn-primary rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Enviando confirmacao..." : "Salvar resposta"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-[#7b6234]">
            Recado para os noivos
          </span>
          <textarea
            value={contactState.note}
            onChange={(event) =>
              setContactState((current) => ({
                ...current,
                note: event.target.value,
              }))
            }
            rows={4}
            className="w-full rounded-lg border border-[#d9c6a4] bg-white/88 px-4 py-3 text-sm text-[#2f302d] outline-none transition placeholder:text-[#9b8f75] focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
            placeholder="Se quiser, deixe um recado carinhoso para nós."
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <div className="mt-4 space-y-3">
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>

          <div className="rounded-2xl border border-[rgb(var(--lavender))/0.4] bg-white/90 px-4 py-4 text-sm text-zinc-700">
            <p className="font-semibold text-zinc-900">
              Se quiser, aproveite para visitar nossa lista de presentes.
            </p>
            <p className="mt-1 leading-6">
              Ela foi preparada com muito carinho para quem desejar participar da
              construção do nosso novo lar.
            </p>

            <div className="mt-3">
              <a
                href={giftListHref}
                className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold"
              >
                Ver lista de presentes
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
