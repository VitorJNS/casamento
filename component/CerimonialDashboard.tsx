"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { CerimonialShell } from "@/component/CerimonialShell";
import type { PresenceGuest, PresenceStatus } from "@/lib/presence-dashboard";

type CerimonialDashboardProps = {
  guests: PresenceGuest[];
  summary: {
    totalGuests: number;
    confirmedGuests: number;
    declinedGuests: number;
    pendingGuests: number;
    confirmedCountableGuests: number;
    confirmedChildren: number;
    declinedCountableGuests: number;
    declinedChildren: number;
  };
};

function formatStatus(status: PresenceStatus) {
  if (status === "confirmed") return "Confirmado";
  if (status === "declined") return "Recusado";
  return "Falta confirmar";
}

function getStatusClasses(status: PresenceStatus) {
  if (status === "confirmed") {
    return "border-emerald-300/70 bg-emerald-50 text-emerald-700";
  }

  if (status === "declined") {
    return "border-rose-300/70 bg-rose-50 text-rose-600";
  }

  return "border-amber-300/70 bg-amber-50 text-amber-700";
}

function formatPeopleLabel(count: number | null, singular: string, plural: string) {
  if (count === null) return "Sem resposta";
  return `${count} ${count === 1 ? singular : plural}`;
}

function matchesSearch(guest: PresenceGuest, term: string) {
  if (!term) return true;

  const haystack = [
    guest.guestName,
    guest.whatsapp,
    guest.email,
    guest.note,
    guest.responseNote,
    ...guest.companionNames,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

function EmptyColumn({ message }: { message: string }) {
  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[28px] border border-dashed border-zinc-300 bg-white/65 px-6 py-10 text-center shadow-[0_20px_60px_rgba(24,24,27,0.05)]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        <CheckCircleIcon className="h-10 w-10" />
      </div>
      <p className="mt-6 max-w-[14rem] text-[1.05rem] italic leading-8 text-zinc-600">
        {message}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper?: string;
}) {
  return (
    <article className="rounded-[28px] border border-zinc-200 bg-white px-6 py-5 shadow-[0_16px_45px_rgba(24,24,27,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-6 text-5xl font-light tracking-[-0.03em] text-zinc-950">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 max-w-[16rem] text-sm leading-6 text-zinc-600">{helper}</p>
      ) : null}
    </article>
  );
}

function GuestCard({ guest }: { guest: PresenceGuest }) {
  return (
    <article className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(24,24,27,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[1.9rem] font-semibold leading-none text-zinc-950">
            {guest.guestName}
          </h3>
          <p className="mt-2 break-all text-lg text-zinc-700">{guest.whatsapp}</p>
        </div>

        <span
          className={`rounded-full border px-4 py-1.5 text-sm font-medium uppercase tracking-[0.08em] ${getStatusClasses(guest.status)}`}
        >
          {formatStatus(guest.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <InfoBox label="Status" value={formatStatus(guest.status)} />
        <InfoBox
          label="Total"
          value={formatPeopleLabel(guest.countableGuestCount, "pessoa", "pessoas")}
        />
      </div>

      <div className="mt-4">
        <InfoBox
          label="Criancas"
          value={guest.guestCount !== null ? String(guest.childCount) : "Sem resposta"}
        />
      </div>

      <div className="mt-6 space-y-5">
        <DetailRow
          label="Resposta"
          value={
            guest.respondedAt
              ? new Date(guest.respondedAt).toLocaleString("pt-BR")
              : "Ainda nao respondeu"
          }
        />
        <DetailRow label="Email" value={guest.email || "Nao informado"} breakAll />

        {guest.companionNames.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Acompanhantes
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {guest.companionNames.map((name) => (
                <span
                  key={`${guest.id}-${name}`}
                  className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {guest.responseNote || guest.note ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Observacao
            </p>
            <p className="mt-2 rounded-[22px] bg-zinc-50 px-4 py-4 text-sm leading-7 text-zinc-700">
              {guest.responseNote || guest.note}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-zinc-100 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-[1.05rem] font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  breakAll = false,
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-2 text-sm leading-7 text-zinc-700 ${breakAll ? "break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ColumnSection({
  title,
  description,
  guests,
  emptyMessage,
}: {
  title: string;
  description: string;
  guests: PresenceGuest[];
  emptyMessage: string;
}) {
  return (
    <section>
      <header>
        <h2 className="text-[2.2rem] font-semibold uppercase leading-none tracking-[-0.03em] text-zinc-950">
          {title}
        </h2>
        <p className="mt-2 text-lg text-zinc-600">{description}</p>
      </header>

      <div className="mt-5 space-y-5">
        {guests.length === 0 ? (
          <EmptyColumn message={emptyMessage} />
        ) : (
          guests.map((guest) => <GuestCard key={guest.id} guest={guest} />)
        )}
      </div>
    </section>
  );
}

export function CerimonialDashboard({ guests, summary }: CerimonialDashboardProps) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const filteredGuests = useMemo(
    () => guests.filter((guest) => matchesSearch(guest, normalizedSearch)),
    [guests, normalizedSearch],
  );

  const pendingGuests = filteredGuests.filter((guest) => guest.status === "pending");
  const confirmedGuests = filteredGuests.filter((guest) => guest.status === "confirmed");
  const declinedGuests = filteredGuests.filter((guest) => guest.status === "declined");

  return (
    <CerimonialShell
      title="Area da Cerimonialista"
      topRight={<DashboardTopBar search={search} setSearch={setSearch} />}
    >
      <div>
        <h1 className="text-[2.8rem] font-semibold tracking-[-0.05em] text-zinc-950">
          Confirmacao de presenca
        </h1>
        <p className="mt-2 max-w-3xl text-xl text-zinc-700">
          Acompanhe quem ja respondeu, quem recusou e quem ainda precisa de contato.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Total de convidados" value={summary.totalGuests} />
        <MetricCard
          label="Ja confirmaram"
          value={summary.confirmedGuests}
          helper={`${summary.confirmedCountableGuests} pessoas contaveis${
            summary.confirmedChildren > 0 ? ` + ${summary.confirmedChildren} criancas` : ""
          }`}
        />
        <MetricCard
          label="Nao comparecem"
          value={summary.declinedGuests}
          helper={`${summary.declinedCountableGuests} pessoas contaveis${
            summary.declinedChildren > 0 ? ` + ${summary.declinedChildren} criancas` : ""
          }`}
        />
        <MetricCard label="Faltam responder" value={summary.pendingGuests} />
      </div>

      {normalizedSearch ? (
        <p className="mt-5 text-sm text-zinc-600">
          Mostrando {filteredGuests.length} resultado{filteredGuests.length === 1 ? "" : "s"} para{" "}
          <span className="font-medium text-zinc-900">"{search}"</span>.
        </p>
      ) : null}

      <div className="mt-8 grid gap-8 2xl:grid-cols-3">
        <ColumnSection
          title="Falta confirmar"
          description="Convidados que ainda precisam de contato."
          guests={pendingGuests}
          emptyMessage="Ninguem pendente no momento."
        />
        <ColumnSection
          title="Ja confirmaram"
          description="Respostas positivas ja registradas."
          guests={confirmedGuests}
          emptyMessage="Nenhuma confirmacao encontrada."
        />
        <ColumnSection
          title="Nao comparecem"
          description="Respostas negativas ja registradas."
          guests={declinedGuests}
          emptyMessage="Nenhuma recusa encontrada."
        />
      </div>
    </CerimonialShell>
  );
}

function DashboardTopBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <>
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 py-3 shadow-sm xl:min-w-[18rem] xl:flex-none xl:px-6">
        <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar convidado..."
          className="w-full bg-transparent text-base text-zinc-800 outline-none placeholder:text-zinc-400"
        />
      </label>

      <TopIconButton ariaLabel="Notificacoes">
        <BellIcon className="h-5 w-5" />
      </TopIconButton>
      <TopIconButton ariaLabel="Configuracoes">
        <GearIcon className="h-5 w-5" />
      </TopIconButton>
    </>
  );
}

function TopIconButton({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-[rgb(var(--lavender))] shadow-sm transition hover:bg-zinc-50"
    >
      {children}
    </button>
  );
}

function SvgIcon({
  className,
  children,
  viewBox = "0 0 24 24",
}: {
  className?: string;
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </SvgIcon>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M15 17H5.5a1.5 1.5 0 0 1-1.2-2.4L6 12.5V9a6 6 0 1 1 12 0v3.5l1.7 2.1a1.5 1.5 0 0 1-1.2 2.4H15" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </SvgIcon>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.6 1.6 0 0 0 15 19.4a1.6 1.6 0 0 0-1 .6 1.6 1.6 0 0 1-2 0 1.6 1.6 0 0 0-1-.6 1.6 1.6 0 0 0-1.76.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-.6-1 1.6 1.6 0 0 1 0-2 1.6 1.6 0 0 0 .6-1 1.6 1.6 0 0 0-.32-1.76l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 1-.6 1.6 1.6 0 0 1 2 0 1.6 1.6 0 0 0 1 .6 1.6 1.6 0 0 0 1.76-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9c0 .38.13.75.37 1.05a1.6 1.6 0 0 1 0 1.9c-.24.3-.37.67-.37 1.05Z" />
    </SvgIcon>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </SvgIcon>
  );
}
