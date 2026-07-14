"use client";

import { useMemo, useState } from "react";

import type { PresenceGuest } from "@/lib/presence-dashboard";

type DraftState = {
  guestName: string;
  whatsapp: string;
  secondaryWhatsapp: string;
  email: string;
  adultNamesText: string;
  childCount: string;
  note: string;
};

const emptyDraft: DraftState = {
  guestName: "",
  whatsapp: "",
  secondaryWhatsapp: "",
  email: "",
  adultNamesText: "",
  childCount: "",
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

function parseLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatLines(names: string[]) {
  return names.join("\n");
}

function getPartySizeLabel(guest: PresenceGuest) {
  if (!guest.guestCount) return "Sem resposta";
  return `${guest.guestCount} ${guest.guestCount === 1 ? "pessoa" : "pessoas"}`;
}

type GuestApiResponse = {
  id: string;
  guestName: string;
  whatsapp: string;
  secondaryWhatsapp: string | null;
  email: string | null;
  adultNames: string[];
  childCount: number;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function mapApiGuestToPresenceGuest(guest: GuestApiResponse): PresenceGuest {
  const adultNames = Array.isArray(guest.adultNames) ? guest.adultNames : [];
  const childCount = guest.childCount ?? 0;

  return {
    id: guest.id,
    guestName: guest.guestName,
    whatsapp: guest.whatsapp,
    secondaryWhatsapp: guest.secondaryWhatsapp ?? null,
    whatsappNormalized: guest.whatsapp.replace(/\D/g, ""),
    note: guest.note ?? null,
    adultNames,
    status: "pending",
    rsvpId: null,
    email: guest.email ?? null,
    guestCount: adultNames.length + childCount,
    childCount,
    countableGuestCount: adultNames.length,
    companionNames: [],
    responseNote: null,
    respondedAt: null,
    sourceKind: "guest-list",
  };
}

export function GuestListManager({
  initialGuests,
}: {
  initialGuests: PresenceGuest[];
}) {
  const [guests, setGuests] = useState(initialGuests);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<DraftState>(emptyDraft);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingCount = useMemo(
    () => guests.filter((guest) => guest.status === "pending").length,
    [guests],
  );

  function openCreateModal() {
    setDraft(emptyDraft);
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function closeCreateModal() {
    setIsModalOpen(false);
    setErrorMessage(null);
  }

  function startEdit(guest: PresenceGuest) {
    setEditingId(guest.id);
    setEditingDraft({
      guestName: guest.guestName,
      whatsapp: guest.whatsapp,
      secondaryWhatsapp: guest.secondaryWhatsapp ?? "",
      email: guest.email ?? "",
      adultNamesText: formatLines(guest.adultNames),
      childCount: String(guest.childCount ?? 0),
      note: guest.note ?? "",
    });
    setErrorMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingDraft(emptyDraft);
  }

  async function reloadGuests() {
    const response = await fetch("/api/admin/guest-list", {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message ?? "Nao foi possivel atualizar a lista.");
    }

    const nextGuests = Array.isArray(data.guests)
      ? data.guests
          .map((guest: GuestApiResponse) => mapApiGuestToPresenceGuest(guest))
          .sort((a: PresenceGuest, b: PresenceGuest) =>
            a.guestName.localeCompare(b.guestName, "pt-BR"),
          )
      : [];

    setGuests(nextGuests);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/guest-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: draft.guestName,
          whatsapp: draft.whatsapp,
          secondaryWhatsapp: draft.secondaryWhatsapp,
          email: draft.email,
          adultNames: parseLines(draft.adultNamesText),
          childCount: Number(draft.childCount || "0"),
          note: draft.note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Nao foi possivel cadastrar o convidado.");
      }

      await reloadGuests();
      closeCreateModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel cadastrar o convidado.",
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
        body: JSON.stringify({
          guestName: editingDraft.guestName,
          whatsapp: editingDraft.whatsapp,
          secondaryWhatsapp: editingDraft.secondaryWhatsapp,
          email: editingDraft.email,
          adultNames: parseLines(editingDraft.adultNamesText),
          childCount: Number(editingDraft.childCount || "0"),
          note: editingDraft.note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Nao foi possivel atualizar o convidado.");
      }

      await reloadGuests();
      cancelEdit();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel atualizar o convidado.",
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
        throw new Error(data?.error?.message ?? "Nao foi possivel desativar o convidado.");
      }

      await reloadGuests();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel desativar o convidado.",
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
            Cadastre aqui cada grupo ou familia com adultos do convite, contatos e criancas previstas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-zinc-200 bg-[rgb(var(--paper))] px-4 py-2 text-sm text-zinc-700">
            {pendingCount} pendentes
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-primary rounded-full px-5 py-3 text-sm font-semibold"
          >
            Adicionar convidado
          </button>
        </div>
      </div>

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
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      value={editingDraft.guestName}
                      onChange={(value) =>
                        setEditingDraft((current) => ({ ...current, guestName: value }))
                      }
                      placeholder="Nome do grupo ou convite"
                    />
                    <Field
                      value={editingDraft.whatsapp}
                      onChange={(value) =>
                        setEditingDraft((current) => ({ ...current, whatsapp: value }))
                      }
                      placeholder="WhatsApp principal"
                    />
                    <Field
                      value={editingDraft.secondaryWhatsapp}
                      onChange={(value) =>
                        setEditingDraft((current) => ({ ...current, secondaryWhatsapp: value }))
                      }
                      placeholder="WhatsApp secundario"
                    />
                    <Field
                      value={editingDraft.email}
                      onChange={(value) =>
                        setEditingDraft((current) => ({ ...current, email: value }))
                      }
                      placeholder="Email"
                      type="email"
                    />
                    <Field
                      label="Criancas"
                      value={editingDraft.childCount}
                      onChange={(value) =>
                        setEditingDraft((current) => ({ ...current, childCount: value }))
                      }
                      placeholder="0"
                      type="number"
                    />
                    <div className="md:col-span-2">
                      <textarea
                        value={editingDraft.adultNamesText}
                        onChange={(event) =>
                          setEditingDraft((current) => ({
                            ...current,
                            adultNamesText: event.target.value,
                          }))
                        }
                        placeholder="Adultos do convite (um por linha ou separados por virgula)"
                        className="min-h-28 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <textarea
                        value={editingDraft.note}
                        onChange={(event) =>
                          setEditingDraft((current) => ({ ...current, note: event.target.value }))
                        }
                        placeholder="Observacao opcional"
                        className="min-h-24 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                      />
                    </div>
                    <div className="flex gap-2 md:col-span-2">
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
                        <h3 className="text-lg font-semibold text-zinc-900">{guest.guestName}</h3>
                        <p className="mt-1 text-sm text-zinc-600">{guest.whatsapp}</p>
                        {guest.secondaryWhatsapp ? (
                          <p className="mt-1 text-sm text-zinc-500">{guest.secondaryWhatsapp}</p>
                        ) : null}
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
                        <span className="font-medium text-zinc-900">Email:</span>{" "}
                        {guest.email || "Nao informado"}
                      </p>
                      <p className="text-sm text-zinc-700">
                        <span className="font-medium text-zinc-900">Adultos do grupo:</span>{" "}
                        {guest.adultNames.length > 0 ? guest.adultNames.length : 1}
                      </p>
                      <p className="text-sm text-zinc-700">
                        <span className="font-medium text-zinc-900">Total previsto:</span>{" "}
                        {getPartySizeLabel(guest)}
                      </p>
                    </div>

                    <p className="mt-3 text-sm text-zinc-700">
                      <span className="font-medium text-zinc-900">Resposta:</span>{" "}
                      {guest.respondedAt
                        ? new Date(guest.respondedAt).toLocaleString("pt-BR")
                        : "Ainda nao respondeu"}
                    </p>

                    {guest.adultNames.length > 0 ? (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {guest.adultNames.map((name) => (
                          <li
                            key={`${guest.id}-${name}`}
                            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-zinc-500">Sem adultos cadastrados.</p>
                    )}

                    <p className="mt-4 text-sm text-zinc-700">
                      <span className="font-medium text-zinc-900">Obs:</span>{" "}
                      {guest.note || "Nenhuma"}
                    </p>
                  </>
                )}
              </article>
            );
          })
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_rgba(24,24,27,0.18)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-zinc-950">
                  Adicionar grupo
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  Cadastre os adultos do convite e ate dois contatos para que qualquer um deles possa responder.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                value={draft.guestName}
                onChange={(value) => setDraft((current) => ({ ...current, guestName: value }))}
                placeholder="Nome do grupo ou convite"
              />
              <Field
                value={draft.whatsapp}
                onChange={(value) => setDraft((current) => ({ ...current, whatsapp: value }))}
                placeholder="WhatsApp principal"
              />
              <Field
                value={draft.secondaryWhatsapp}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, secondaryWhatsapp: value }))
                }
                placeholder="WhatsApp secundario"
              />
              <Field
                value={draft.email}
                onChange={(value) => setDraft((current) => ({ ...current, email: value }))}
                placeholder="Email"
                type="email"
              />
              <Field
                label="Criancas"
                value={draft.childCount}
                onChange={(value) => setDraft((current) => ({ ...current, childCount: value }))}
                placeholder="0"
                type="number"
              />
              <div className="md:col-span-2">
                <textarea
                  value={draft.adultNamesText}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      adultNamesText: event.target.value,
                    }))
                  }
                  placeholder="Adultos do convite (um por linha ou separados por virgula)"
                  className="min-h-28 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                />
              </div>
              <div className="md:col-span-2">
                <textarea
                  value={draft.note}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, note: event.target.value }))
                  }
                  placeholder="Observacao opcional"
                  className="min-h-24 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                />
              </div>

              {errorMessage ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 md:col-span-2">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Salvando..." : "Salvar convidado"}
                </button>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-zinc-700">
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        min={type === "number" ? "0" : undefined}
        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
        placeholder={placeholder}
      />
    </label>
  );
}
