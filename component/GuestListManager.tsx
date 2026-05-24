"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { PresenceGuest } from "@/lib/presence-dashboard";

type DraftState = {
  guestName: string;
  whatsapp: string;
  note: string;
};

const emptyDraft: DraftState = {
  guestName: "",
  whatsapp: "",
  note: "",
};

function getStatusLabel(status: PresenceGuest["status"]) {
  if (status === "confirmed") return "Confirmado";
  if (status === "declined") return "Recusado";
  return "Pendente";
}

function getStatusClasses(status: PresenceGuest["status"]) {
  if (status === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "declined") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function GuestListManager({
  initialGuests,
}: {
  initialGuests: PresenceGuest[];
}) {
  const router = useRouter();
  const [guests, setGuests] = useState(initialGuests);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<DraftState>(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingCount = useMemo(
    () => guests.filter((guest) => guest.status === "pending").length,
    [guests],
  );

  useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  function startEdit(guest: PresenceGuest) {
    setEditingId(guest.id);
    setEditingDraft({
      guestName: guest.guestName,
      whatsapp: guest.whatsapp,
      note: guest.note ?? "",
    });
    setErrorMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingDraft(emptyDraft);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/guest-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "Nao foi possivel cadastrar o convidado.",
        );
      }

      setGuests((current) => [
        ...current,
        {
          ...data.guest,
          whatsappNormalized: data.guest.whatsapp.replace(/\D/g, ""),
          status: "pending",
          rsvpId: null,
          email: null,
          guestCount: null,
          companionNames: [],
          responseNote: null,
          respondedAt: null,
          sourceKind: "guest-list",
        },
      ].sort((a, b) => a.guestName.localeCompare(b.guestName, "pt-BR")));
      setDraft(emptyDraft);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel cadastrar o convidado.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/guest-list/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDraft),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "Nao foi possivel atualizar o convidado.",
        );
      }

      setGuests((current) =>
        current
          .map((guest) =>
            guest.id === id
              ? {
                  ...guest,
                  guestName: data.guest.guestName,
                  whatsapp: data.guest.whatsapp,
                  whatsappNormalized: data.guest.whatsapp.replace(/\D/g, ""),
                  note: data.guest.note,
                }
              : guest,
          )
          .sort((a, b) => a.guestName.localeCompare(b.guestName, "pt-BR")),
      );
      cancelEdit();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar o convidado.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/guest-list/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "Nao foi possivel desativar o convidado.",
        );
      }

      setGuests((current) => current.filter((guest) => guest.id !== id));
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel desativar o convidado.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Lista-base de convidados
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Cadastre aqui quem deve responder ao RSVP. A cerimonialista vera quem
            confirmou e quem ainda esta pendente.
          </p>
        </div>

        <div className="rounded-full border border-zinc-200 bg-[rgb(var(--paper))] px-4 py-2 text-sm text-zinc-700">
          {pendingCount} pendentes
        </div>
      </div>

      <form onSubmit={handleCreate} className="mt-5 grid gap-3 lg:grid-cols-[1.1fr_1fr_1.2fr_auto]">
        <input
          value={draft.guestName}
          onChange={(event) =>
            setDraft((current) => ({ ...current, guestName: event.target.value }))
          }
          className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
          placeholder="Nome do convidado"
        />
        <input
          value={draft.whatsapp}
          onChange={(event) =>
            setDraft((current) => ({ ...current, whatsapp: event.target.value }))
          }
          className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
          placeholder="WhatsApp"
        />
        <input
          value={draft.note}
          onChange={(event) =>
            setDraft((current) => ({ ...current, note: event.target.value }))
          }
          className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
          placeholder="Observacao opcional"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-5 max-h-[42rem] space-y-4 overflow-y-auto pr-2">
        {guests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600">
            Nenhum convidado cadastrado ainda.
          </p>
        ) : (
          guests.map((guest) => {
            const isEditing = editingId === guest.id;

            return (
              <article
                key={guest.id}
                className="rounded-[22px] border border-zinc-200 bg-[rgb(var(--paper))] p-4"
              >
                {isEditing ? (
                  <div className="grid gap-3 md:grid-cols-[1.1fr_1fr_1.2fr_auto]">
                    <input
                      value={editingDraft.guestName}
                      onChange={(event) =>
                        setEditingDraft((current) => ({
                          ...current,
                          guestName: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                    />
                    <input
                      value={editingDraft.whatsapp}
                      onChange={(event) =>
                        setEditingDraft((current) => ({
                          ...current,
                          whatsapp: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                    />
                    <input
                      value={editingDraft.note}
                      onChange={(event) =>
                        setEditingDraft((current) => ({
                          ...current,
                          note: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                      placeholder="Observacao opcional"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(guest.id)}
                        disabled={isSaving}
                        className="btn-primary rounded-full px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {guest.guestName}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600">{guest.whatsapp}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClasses(guest.status)}`}
                        >
                          {getStatusLabel(guest.status)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(guest)}
                          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivate(guest.id)}
                          disabled={isSaving}
                          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Desativar
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <p className="text-sm text-zinc-700">
                        <span className="font-medium text-zinc-900">Status:</span>{" "}
                        {getStatusLabel(guest.status)}
                      </p>
                      <p className="text-sm text-zinc-700">
                        <span className="font-medium text-zinc-900">Resposta:</span>{" "}
                        {guest.respondedAt
                          ? new Date(guest.respondedAt).toLocaleString("pt-BR")
                          : "Ainda nao respondeu"}
                      </p>
                      <p className="text-sm text-zinc-700">
                        <span className="font-medium text-zinc-900">Total:</span>{" "}
                        {guest.guestCount
                          ? `${guest.guestCount} ${
                              guest.guestCount === 1 ? "pessoa" : "pessoas"
                            }`
                          : "Sem resposta"}
                      </p>
                      <p className="text-sm text-zinc-700">
                        <span className="font-medium text-zinc-900">Obs:</span>{" "}
                        {guest.note || "Nenhuma"}
                      </p>
                    </div>

                    {guest.companionNames.length > 0 ? (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {guest.companionNames.map((name) => (
                          <li
                            key={`${guest.id}-${name}`}
                            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
