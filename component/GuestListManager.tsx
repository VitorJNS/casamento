"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ListPagination } from "@/component/ListPagination";
import { formatDisplayDateTime } from "@/lib/display-date";
import type { PresenceGuest } from "@/lib/presence-dashboard";

type DraftState = {
  guestName: string;
  whatsapp: string;
  familyLabel: string;
  note: string;
  isChild: boolean;
};

const emptyDraft: DraftState = {
  guestName: "",
  whatsapp: "",
  familyLabel: "",
  note: "",
  isChild: false,
};

const GUESTS_PER_PAGE = 10;

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

function getFamilyLabel(guest: PresenceGuest) {
  if (guest.familyLabel) return guest.familyLabel;
  if (guest.householdMembers.length <= 1) return "Sem grupo vinculado";
  return `${guest.householdMembers.length} pessoas no mesmo grupo`;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const pendingCount = useMemo(
    () => guests.filter((guest) => guest.status === "pending").length,
    [guests],
  );
  const totalPages = Math.max(1, Math.ceil(guests.length / GUESTS_PER_PAGE));
  const visibleGuests = useMemo(() => {
    const start = (page - 1) * GUESTS_PER_PAGE;
    return guests.slice(start, start + GUESTS_PER_PAGE);
  }, [guests, page]);
  const startItem = guests.length === 0 ? 0 : (page - 1) * GUESTS_PER_PAGE + 1;
  const endItem = Math.min(page * GUESTS_PER_PAGE, guests.length);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

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
      familyLabel: guest.familyLabel ?? "",
      note: guest.note ?? "",
      isChild: guest.isChild,
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
        throw new Error(data?.error?.message ?? "Nao foi possivel cadastrar o convidado.");
      }

      closeCreateModal();
      router.refresh();
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
        body: JSON.stringify(editingDraft),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Nao foi possivel atualizar o convidado.");
      }

      setGuests((current) =>
        current.map((guest) =>
          guest.id === id
            ? {
                ...guest,
                guestName: editingDraft.guestName,
                whatsapp: editingDraft.whatsapp,
                familyLabel: editingDraft.familyLabel || null,
                note: editingDraft.note || null,
                isChild: editingDraft.isChild,
              }
            : guest,
        ),
      );
      cancelEdit();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel atualizar o convidado.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    setRemovingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/guest-list/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Nao foi possivel remover o convidado.");
      }

      setGuests((current) => current.filter((guest) => guest.id !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel remover o convidado.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  async function handleResetGuests() {
    const confirmed = window.confirm(
      "Tem certeza que deseja remover todos os convidados e todas as confirmacoes de presenca? Essa acao nao pode ser desfeita.",
    );

    if (!confirmed) {
      return;
    }

    setIsResetting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/guest-list/reset", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Nao foi possivel limpar a lista.");
      }

      setGuests([]);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel limpar a lista.",
      );
    } finally {
      setIsResetting(false);
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
            Cadastre cada convidado individualmente. Use o mesmo nome de familia ou grupo
            para quem deve aparecer junto na confirmacao publica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-zinc-200 bg-[rgb(var(--paper))] px-4 py-2 text-sm text-zinc-700">
            {pendingCount} pendentes
          </div>
          {guests.length > 0 ? (
            <button
              type="button"
              onClick={handleResetGuests}
              disabled={isSaving || removingId !== null || isResetting}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResetting ? "Limpando..." : "Limpar lista"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={openCreateModal}
            disabled={isResetting}
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

      <div className="mt-5 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {guests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600 lg:col-span-2 2xl:col-span-3">
            Nenhum convidado cadastrado ainda.
          </p>
        ) : (
          visibleGuests.map((guest) => {
            const isEditing = editingId === guest.id;

            return (
              <article
                key={guest.id}
                className="flex min-h-[14.5rem] flex-col rounded-[18px] border border-zinc-200 bg-[rgb(var(--paper))] p-3"
              >
                {isEditing ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      label="Nome"
                      value={editingDraft.guestName}
                      onChange={(value) =>
                        setEditingDraft((current) => ({ ...current, guestName: value }))
                      }
                      placeholder="Nome do convidado"
                    />
                    <Field
                      label="WhatsApp"
                      value={editingDraft.whatsapp}
                      onChange={(value) =>
                        setEditingDraft((current) => ({ ...current, whatsapp: value }))
                      }
                      placeholder="WhatsApp individual do convidado"
                    />
                    <Field
                      label="Familia ou grupo"
                      value={editingDraft.familyLabel}
                      onChange={(value) =>
                        setEditingDraft((current) => ({ ...current, familyLabel: value }))
                      }
                      placeholder="Ex.: Familia Silva"
                    />
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
                    <label className="flex items-center gap-3 text-sm text-zinc-700 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={editingDraft.isChild}
                        onChange={(event) =>
                          setEditingDraft((current) => ({
                            ...current,
                            isChild: event.target.checked,
                          }))
                        }
                      />
                      Marcar como crianca
                    </label>
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
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-zinc-900">{guest.guestName}</h3>
                        <p className="mt-0.5 text-xs text-zinc-600">{guest.whatsapp}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{getFamilyLabel(guest)}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(guest.status)}`}
                        >
                          {getStatusLabel(guest.status)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(guest)}
                          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivate(guest.id)}
                          disabled={isSaving || removingId !== null}
                          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {removingId === guest.id ? "Removendo..." : "Remover"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-1.5 text-xs text-zinc-700 sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-zinc-900">Status:</span>{" "}
                        {getStatusLabel(guest.status)}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">Tipo:</span>{" "}
                        {guest.isChild ? "Crianca" : "Adulto"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">Resposta:</span>{" "}
                        {guest.respondedAt
                          ? formatDisplayDateTime(guest.respondedAt)
                          : "Ainda nao respondeu"}
                      </p>
                    </div>

                    <div className="mt-3 min-h-[3.75rem]">
                      <p className="text-xs font-medium text-zinc-900">Mesmo grupo:</p>
                      {guest.householdMembers.length > 1 ? (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {guest.householdMembers.map((name) => (
                            <li
                              key={`${guest.id}-${name}`}
                              className={`rounded-full border px-2.5 py-1 text-xs ${
                                name === guest.guestName
                                  ? "border-[rgb(var(--olive))] bg-white text-zinc-900"
                                  : "border-zinc-200 bg-white text-zinc-700"
                              }`}
                            >
                              {name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-zinc-500">Sem grupo vinculado</p>
                      )}
                    </div>

                    <p className="mt-auto pt-3 line-clamp-2 text-xs text-zinc-700">
                      <span className="font-medium text-zinc-900">Obs:</span>{" "}
                      {guest.responseNote || guest.note || "Nenhuma"}
                    </p>
                  </>
                )}
              </article>
            );
          })
        )}
      </div>

      <ListPagination
        page={page}
        totalPages={totalPages}
        totalItems={guests.length}
        startItem={startItem}
        endItem={endItem}
        itemLabel="convidados"
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      />

      {isModalOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_rgba(24,24,27,0.18)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-zinc-950">
                  Adicionar convidado
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  Cadastre uma pessoa por vez e repita o mesmo nome de familia ou grupo
                  para quem deve aparecer junto no RSVP.
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
                label="Nome"
                value={draft.guestName}
                onChange={(value) => setDraft((current) => ({ ...current, guestName: value }))}
                placeholder="Nome do convidado"
              />
              <Field
                label="WhatsApp"
                value={draft.whatsapp}
                onChange={(value) => setDraft((current) => ({ ...current, whatsapp: value }))}
                placeholder="WhatsApp individual do convidado"
              />
              <Field
                label="Familia ou grupo"
                value={draft.familyLabel}
                onChange={(value) => setDraft((current) => ({ ...current, familyLabel: value }))}
                placeholder="Ex.: Familia Silva"
              />
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
              <label className="flex items-center gap-3 text-sm text-zinc-700 md:col-span-2">
                <input
                  type="checkbox"
                  checked={draft.isChild}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      isChild: event.target.checked,
                    }))
                  }
                />
                Marcar como crianca
              </label>

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
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-zinc-700">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
        placeholder={placeholder}
      />
    </label>
  );
}
