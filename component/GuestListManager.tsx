"use client";

import { GuestDetailsDialog } from "@/component/GuestDetailsDialog";
import { GuestSummaryCard } from "@/component/GuestSummaryCard";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ListPagination } from "@/component/ListPagination";
import type { PresenceGuest } from "@/lib/presence-dashboard";

type DraftState = {
  guestName: string;
  whatsapp: string;
  familyLabel: string;
  note: string;
  isChild: boolean;
};

type GuestApiEntry = {
  id: string;
  guestName: string;
  whatsapp: string;
  secondaryWhatsapp: string | null;
  email: string | null;
  familyLabel: string | null;
  isChild: boolean;
  note: string | null;
};

const emptyDraft: DraftState = {
  guestName: "",
  whatsapp: "",
  familyLabel: "",
  note: "",
  isChild: false,
};

const GUESTS_PER_PAGE = 10;

function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "");
}

function mapGuestApiEntryToPresenceGuest(guest: GuestApiEntry): PresenceGuest {
  return {
    id: guest.id,
    guestName: guest.guestName,
    whatsapp: guest.whatsapp,
    secondaryWhatsapp: guest.secondaryWhatsapp,
    whatsappNormalized: normalizeWhatsapp(guest.whatsapp),
    note: guest.note,
    familyLabel: guest.familyLabel,
    isChild: guest.isChild,
    householdMembers: [guest.guestName],
    status: "pending",
    rsvpId: null,
    email: guest.email,
    guestCount: null,
    childCount: 0,
    countableGuestCount: null,
    companionNames: [],
    adultNames: [],
    responseNote: null,
    respondedAt: null,
    sourceKind: "guest-list",
  };
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [details, setDetails] = useState<{ guest: PresenceGuest; mode: "message" | "group" } | null>(null);

  const pendingCount = useMemo(
    () => guests.filter((guest) => guest.status === "pending").length,
    [guests],
  );
  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const isSearchActive = normalizedSearchTerm.length >= 3;
  const filteredGuests = useMemo(() => {
    if (!isSearchActive) {
      return guests;
    }

    return guests.filter((guest) => {
      const searchableText = normalizeSearchText(
        [
          guest.guestName,
          guest.familyLabel ?? "",
          guest.whatsapp,
          guest.householdMembers.join(" "),
        ].join(" "),
      );

      return searchableText.includes(normalizedSearchTerm);
    });
  }, [guests, isSearchActive, normalizedSearchTerm]);
  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / GUESTS_PER_PAGE));
  const visibleGuests = useMemo(() => {
    const start = (page - 1) * GUESTS_PER_PAGE;
    return filteredGuests.slice(start, start + GUESTS_PER_PAGE);
  }, [filteredGuests, page]);
  const startItem = filteredGuests.length === 0 ? 0 : (page - 1) * GUESTS_PER_PAGE + 1;
  const endItem = Math.min(page * GUESTS_PER_PAGE, filteredGuests.length);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [normalizedSearchTerm]);

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

      if (data?.guest) {
        setGuests((current) =>
          [...current, mapGuestApiEntryToPresenceGuest(data.guest)].sort((a, b) =>
            a.guestName.localeCompare(b.guestName, "pt-BR"),
          ),
        );
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

  return (
    <section className="@container/guests rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
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

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-[rgb(var(--paper))] p-4">
        <label
          htmlFor="guest-search"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
        >
          Pesquisar convidado
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="guest-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Digite pelo menos 3 letras do nome"
              className="h-12 w-full rounded-full border border-zinc-300 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
            />
          </div>
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Limpar
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          {isSearchActive
            ? `${filteredGuests.length} resultado${filteredGuests.length === 1 ? "" : "s"} encontrado${filteredGuests.length === 1 ? "" : "s"}.`
            : "A busca começa a filtrar automaticamente a partir de 3 letras."}
        </p>
      </div>

      <div className="mt-5 grid items-start gap-3 @min-[640px]/guests:grid-cols-2">
        {guests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600 col-span-full">
            Nenhum convidado cadastrado ainda.
          </p>
        ) : filteredGuests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600 col-span-full">
            Nenhum convidado encontrado para essa busca.
          </p>
        ) : (
          visibleGuests.map((guest) => {
            const isEditing = editingId === guest.id;

            return (
              <article
                key={guest.id}
                className="@container/card flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-zinc-200 bg-[rgb(var(--paper))] shadow-[0_14px_40px_rgba(24,24,27,0.04)]"
              >
                {isEditing ? (
                  <div className="grid gap-3 p-4 md:grid-cols-2">
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
                  <GuestSummaryCard guest={guest} onEdit={() => startEdit(guest)} onRemove={() => handleDeactivate(guest.id)} onDetails={(mode) => setDetails({ guest, mode })} removing={removingId === guest.id} disableRemove={isSaving || removingId !== null} />
                )}
              </article>
            );
          })
        )}
      </div>

      <ListPagination
        page={page}
        totalPages={totalPages}
        totalItems={filteredGuests.length}
        startItem={startItem}
        endItem={endItem}
        itemLabel="convidados"
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      />

      {details ? <GuestDetailsDialog guest={details.guest} mode={details.mode} onClose={() => setDetails(null)} /> : null}

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

function SvgIcon({
  className,
  viewBox = "0 0 24 24",
  children,
}: {
  className?: string;
  viewBox?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="m21 21-4.34-4.34" />
      <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
    </SvgIcon>
  );
}
