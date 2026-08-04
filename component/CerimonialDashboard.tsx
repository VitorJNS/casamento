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
  };
};

function formatStatus(status: PresenceStatus) {
  if (status === "confirmed") return "Confirmado";
  if (status === "declined") return "Recusado";
  return "Pendente";
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

type RsvpFilter = "all" | "pending" | "confirmed" | "declined" | "children" | "notes";

function matchesSearch(guest: PresenceGuest, term: string) {
  if (!term) return true;

  const haystack = [
    guest.guestName,
    guest.whatsapp,
    guest.secondaryWhatsapp,
    guest.email,
    guest.note,
    guest.responseNote,
    ...guest.adultNames,
    ...guest.companionNames,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "confirmed" | "declined" | "pending" | "notes";
}) {
  const toneClasses = {
    neutral: "bg-zinc-100 text-[rgb(var(--olive))]",
    confirmed: "bg-emerald-50 text-emerald-700",
    declined: "bg-rose-50 text-rose-600",
    pending: "bg-amber-50 text-amber-700",
    notes: "bg-[rgb(var(--lavender))/0.16] text-[rgb(var(--lavender))]",
  };

  return (
    <article className="flex items-center gap-4 rounded-[22px] border border-zinc-200 bg-white px-5 py-4 shadow-[0_14px_35px_rgba(24,24,27,0.04)]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${toneClasses[tone]}`}>
        {tone === "confirmed" ? (
          <CheckCircleIcon className="h-6 w-6" />
        ) : tone === "declined" ? (
          <XCircleIcon className="h-6 w-6" />
        ) : tone === "pending" ? (
          <ClockIcon className="h-6 w-6" />
        ) : tone === "notes" ? (
          <MessageIcon className="h-6 w-6" />
        ) : (
          <UsersIcon className="h-6 w-6" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-600">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-zinc-950">{value}</p>
      </div>
    </article>
  );
}

function getFamilyLabel(guest: PresenceGuest) {
  if (guest.familyLabel) return guest.familyLabel;
  if (guest.householdMembers.length <= 1) return "Sem grupo vinculado";
  return `${guest.householdMembers.length} pessoas no grupo`;
}

function getFilterLabel(filter: RsvpFilter) {
  if (filter === "pending") return "Pendentes";
  if (filter === "confirmed") return "Confirmados";
  if (filter === "declined") return "Recusados";
  if (filter === "children") return "Criancas";
  if (filter === "notes") return "Com observacao";
  return "Todos";
}

function matchesFilter(guest: PresenceGuest, filter: RsvpFilter) {
  if (filter === "pending") return guest.status === "pending";
  if (filter === "confirmed") return guest.status === "confirmed";
  if (filter === "declined") return guest.status === "declined";
  if (filter === "children") return guest.isChild;
  if (filter === "notes") return Boolean(guest.responseNote || guest.note);
  return true;
}

function getFilterCount(guests: PresenceGuest[], filter: RsvpFilter) {
  return guests.filter((guest) => matchesFilter(guest, filter)).length;
}

function GuestRow({ guest }: { guest: PresenceGuest }) {
  const whatsappMessage =
    "Ola, tudo bem? Meu nome e Karine, eu sou a Cerimonialista responsavel pelo casamento dos noivos Yasmim e Vitor. Estou entrando em contato para saber se ja confirmaram presenca no evento.";
  const whatsappHref = `https://wa.me/${guest.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <tr className="border-t border-zinc-200 align-middle text-sm text-zinc-700">
      <td className="min-w-[13rem] px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--lavender))/0.14] font-semibold text-[rgb(var(--lavender))]">
            {guest.guestName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-zinc-950">{guest.guestName}</p>
            <p className="mt-0.5 truncate text-xs text-zinc-500">{guest.isChild ? "Crianca" : "Adulto"}</p>
          </div>
        </div>
      </td>
      <td className="min-w-[11rem] px-4 py-4">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-medium text-[rgb(var(--olive))] transition hover:text-[#b89543]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          <span>{guest.whatsapp}</span>
        </a>
      </td>
      <td className="min-w-[12rem] px-4 py-4">
        <p className="max-w-[14rem] truncate">{getFamilyLabel(guest)}</p>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
          {guest.isChild ? "Crianca" : "Adulto"}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(guest.status)}`}>
          {formatStatus(guest.status)}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--olive))/0.5] bg-white px-4 py-2 text-sm font-semibold text-[rgb(var(--olive))] transition hover:bg-[rgb(var(--olive))/0.08]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Chamar no WhatsApp
        </a>
      </td>
    </tr>
  );
}

function FilterButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
        isActive
          ? "border-[rgb(var(--olive))] bg-[rgb(var(--olive))] text-[#fffdf3]"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-[rgb(var(--olive))/0.45] hover:text-[rgb(var(--olive))]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          isActive ? "bg-white/18 text-white" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ProgressPanel({
  respondedCount,
  totalCount,
}: {
  respondedCount: number;
  totalCount: number;
}) {
  const percent = totalCount > 0 ? Math.round((respondedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-[22px] border border-zinc-200 bg-white px-5 py-4 shadow-[0_14px_35px_rgba(24,24,27,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-medium text-zinc-800">
          <span className="text-[rgb(var(--olive))]">{respondedCount}</span> de {totalCount} responderam
        </p>
        <p className="text-sm font-semibold text-zinc-600">{percent}%</p>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-[rgb(var(--olive))]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function GuestTable({
  guests,
  activeFilter,
}: {
  guests: PresenceGuest[];
  activeFilter: RsvpFilter;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_14px_35px_rgba(24,24,27,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
            Convidados
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Mostrando {guests.length} convidado{guests.length === 1 ? "" : "s"} em {getFilterLabel(activeFilter).toLowerCase()}.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        {guests.length === 0 ? (
          <div className="border-t border-zinc-200 px-5 py-12 text-center text-sm text-zinc-500">
            Nenhum convidado encontrado para este filtro.
          </div>
        ) : (
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr className="border-t border-zinc-200 bg-[rgb(var(--paper))]/70 text-left text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                <th className="px-4 py-3">Convidado</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Familia / Grupo</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <GuestRow key={guest.id} guest={guest} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export function CerimonialDashboard({ guests, summary }: CerimonialDashboardProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<RsvpFilter>("all");
  const normalizedSearch = search.trim().toLowerCase();

  const statusCounts = useMemo(
    () => ({
      total: guests.length,
      confirmed: guests.filter((guest) => guest.status === "confirmed").length,
      declined: guests.filter((guest) => guest.status === "declined").length,
      pending: guests.filter((guest) => guest.status === "pending").length,
      notes: guests.filter((guest) => guest.responseNote || guest.note).length,
    }),
    [guests],
  );

  const displayedGuests = useMemo(
    () =>
      guests.filter(
        (guest) =>
          matchesSearch(guest, normalizedSearch) && matchesFilter(guest, activeFilter),
      ),
    [activeFilter, guests, normalizedSearch],
  );

  const filterItems: Array<{ id: RsvpFilter; label: string }> = [
    { id: "all", label: "Todos" },
    { id: "pending", label: "Pendentes" },
    { id: "confirmed", label: "Confirmados" },
    { id: "declined", label: "Recusados" },
    { id: "children", label: "Criancas" },
    { id: "notes", label: "Com observacao" },
  ];

  return (
    <CerimonialShell title="Area da Cerimonialista">
      <div>
        <h1 className="text-[2.8rem] font-semibold tracking-[-0.05em] text-[rgb(var(--olive))]">
          Confirmacao de presenca
        </h1>
        <p className="mt-2 max-w-3xl text-lg text-zinc-700">
          Acompanhe as respostas e acione rapidamente os convidados pelo WhatsApp.
        </p>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        <MetricCard label="Total de convidados" value={summary.totalGuests || statusCounts.total} />
        <MetricCard label="Confirmados" value={statusCounts.confirmed} tone="confirmed" />
        <MetricCard label="Recusados" value={statusCounts.declined} tone="declined" />
        <MetricCard label="Pendentes" value={statusCounts.pending} tone="pending" />
        <MetricCard label="Com observacao" value={statusCounts.notes} tone="notes" />
      </div>

      <div className="mt-5">
        <ProgressPanel
          respondedCount={statusCounts.confirmed + statusCounts.declined}
          totalCount={statusCounts.total}
        />
      </div>

      <div className="mt-5 rounded-[22px] border border-zinc-200 bg-white p-4 shadow-[0_14px_35px_rgba(24,24,27,0.04)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterItems.map((item) => (
              <FilterButton
                key={item.id}
                label={item.label}
                count={getFilterCount(guests, item.id)}
                isActive={activeFilter === item.id}
                onClick={() => setActiveFilter(item.id)}
              />
            ))}
          </div>

          <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 xl:min-w-[22rem]">
            <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar convidado ou familia..."
              className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
            />
          </label>
        </div>
      </div>

      {normalizedSearch ? (
        <p className="mt-4 text-sm text-zinc-600">
          Mostrando {displayedGuests.length} resultado{displayedGuests.length === 1 ? "" : "s"} para{" "}
          <span className="font-medium text-zinc-900">"{search}"</span>.
        </p>
      ) : null}

      <div className="mt-5">
        <GuestTable guests={displayedGuests} activeFilter={activeFilter} />
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

function XCircleIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </SvgIcon>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </SvgIcon>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5a8.5 8.5 0 1 1 17 0Z" />
    </SvgIcon>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </SvgIcon>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M20 11.5A8.5 8.5 0 0 1 7.4 19l-3.4 1 1.08-3.2A8.5 8.5 0 1 1 20 11.5Z" />
      <path d="M9.2 8.8c.2-.45.42-.46.61-.47h.52c.16 0 .42.06.64.53.21.48.73 1.67.79 1.79.07.12.11.26.02.42-.08.16-.13.26-.26.4-.12.14-.26.31-.36.42-.12.12-.24.25-.1.49.14.23.62 1.03 1.34 1.67.92.82 1.69 1.08 1.93 1.2.24.11.38.09.52-.07.14-.16.58-.67.73-.9.15-.23.31-.19.52-.11.21.07 1.35.64 1.58.76.23.11.38.17.43.27.05.09.05.56-.13 1.11-.17.55-1 1.07-1.38 1.13-.35.06-.8.09-1.29-.07-.3-.1-.68-.22-1.18-.43-.95-.41-1.98-1.35-2.72-2.27-.74-.92-1.3-2.05-1.45-2.28-.15-.23-.63-.84-.63-1.6 0-.76.4-1.13.54-1.29Z" />
    </SvgIcon>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="m6 9 6 6 6-6" />
    </SvgIcon>
  );
}
