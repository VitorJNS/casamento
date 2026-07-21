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
  const [isExpanded, setIsExpanded] = useState(false);
  const whatsappMessage =
    "Ola, tudo bem? Meu nome e Karine, eu sou a Cerimonialista responsavel pelo casamento dos noivos Yasmim e Vitor. Estou entrando em contato para saber se ja confirmaram presenca no evento.";
  const whatsappHref = `https://wa.me/${guest.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <article className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(24,24,27,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[1.65rem] font-semibold leading-none text-zinc-950">
            {guest.guestName}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-[rgb(var(--olive))] transition hover:bg-zinc-50"
            aria-label={`Abrir WhatsApp de ${guest.guestName}`}
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50"
            aria-label={isExpanded ? "Ocultar detalhes" : "Mostrar detalhes"}
          >
            <ChevronIcon
              className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InfoBox
          label="Total"
          value={formatPeopleLabel(guest.countableGuestCount, "pessoa", "pessoas")}
        />
        <InfoBox
          label="Criancas"
          value={guest.guestCount !== null ? String(guest.childCount) : "Sem resposta"}
        />
        <InfoBox label="Status" value={formatStatus(guest.status)} tone={guest.status} />
      </div>

      {isExpanded ? (
        <div className="mt-4 border-t border-zinc-100 pt-4">
          <p className="break-all text-sm text-zinc-600">{guest.whatsapp}</p>
          {guest.secondaryWhatsapp ? (
            <p className="break-all text-sm text-zinc-500">{guest.secondaryWhatsapp}</p>
          ) : null}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailRow
              label="Resposta"
              value={
                guest.respondedAt
                  ? new Date(guest.respondedAt).toLocaleString("pt-BR")
                  : "Ainda nao respondeu"
              }
            />
            <DetailRow label="Email" value={guest.email || "Nao informado"} breakAll />
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Pessoas do mesmo grupo
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {guest.adultNames.length > 0 ? (
                guest.adultNames.map((name) => (
                  <span
                    key={`${guest.id}-adult-${name}`}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700"
                  >
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-zinc-500">Nenhum outro nome vinculado.</span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Tipo de cadastro
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                {guest.isChild ? "Crianca" : "Adulto"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Observacao
            </p>
            <p className="mt-2 rounded-[18px] bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700">
              {guest.responseNote || guest.note || "Sem observacoes registradas."}
            </p>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function InfoBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: PresenceStatus;
}) {
  const valueClassName =
    tone === "confirmed"
      ? "text-emerald-700"
      : tone === "declined"
        ? "text-rose-600"
        : tone === "pending"
          ? "text-amber-700"
          : "text-zinc-950";

  return (
    <div className="rounded-[18px] bg-zinc-100 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-1.5 text-base font-semibold ${valueClassName}`}>{value}</p>
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
      <p className={`mt-1.5 text-sm leading-6 text-zinc-700 ${breakAll ? "break-all" : ""}`}>
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
          value={summary.confirmedCountableGuests + summary.confirmedChildren}
          helper={
            summary.confirmedChildren > 0
              ? `${summary.confirmedCountableGuests} adultos + ${summary.confirmedChildren} criancas`
              : `${summary.confirmedCountableGuests} adultos`
          }
        />
        <MetricCard
          label="Nao comparecem"
          value={summary.declinedCountableGuests}
          helper={
            summary.declinedGuests === 1
              ? "1 resposta negativa registrada."
              : `${summary.declinedGuests} respostas negativas registradas.`
          }
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
