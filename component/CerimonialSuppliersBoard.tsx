"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { CerimonialShell } from "@/component/CerimonialShell";
import { ListPagination } from "@/component/ListPagination";

export type CerimonialSupplierView = {
  id: string;
  supplierName: string;
  category: string;
  supplierStatus: "contratado" | "pendente" | "negociacao";
  contactName: string | null;
  phone: string;
  email: string | null;
  note: string | null;
  updatedAt: string;
};

const SUPPLIERS_PER_PAGE = 10;

export function CerimonialSuppliersBoard({
  initialSuppliers,
}: {
  initialSuppliers: CerimonialSupplierView[];
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const normalizedSearch = search.trim().toLowerCase();

  const suppliers = useMemo(() => {
    if (!normalizedSearch) return initialSuppliers;

    return initialSuppliers.filter((supplier) =>
      [
        supplier.supplierName,
        supplier.category,
        supplier.contactName,
        supplier.phone,
        supplier.email,
        supplier.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [initialSuppliers, normalizedSearch]);

  const categoryCount = useMemo(
    () =>
      new Set(
        initialSuppliers
          .map((supplier) => supplier.category.trim())
          .filter(Boolean),
      ).size,
    [initialSuppliers],
  );
  const totalPages = Math.max(1, Math.ceil(suppliers.length / SUPPLIERS_PER_PAGE));
  const visibleSuppliers = useMemo(() => {
    const start = (page - 1) * SUPPLIERS_PER_PAGE;
    return suppliers.slice(start, start + SUPPLIERS_PER_PAGE);
  }, [page, suppliers]);
  const startItem = suppliers.length === 0 ? 0 : (page - 1) * SUPPLIERS_PER_PAGE + 1;
  const endItem = Math.min(page * SUPPLIERS_PER_PAGE, suppliers.length);

  useEffect(() => {
    setPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <CerimonialShell
      title="Area da Cerimonialista"
      topRight={<SupplierSearch search={search} setSearch={setSearch} />}
    >
      <div>
        <h1 className="text-[2.8rem] font-semibold tracking-[-0.05em] text-zinc-950">
          Fornecedores
        </h1>
        <p className="mt-2 max-w-3xl text-xl text-zinc-700">
          Consulte os fornecedores cadastrados pelos noivos e acompanhe os contatos e observacoes importantes.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Fornecedores ativos"
          value={String(initialSuppliers.length).padStart(2, "0")}
          helper="Parceiros visiveis para a cerimonialista."
        />
        <MetricCard
          label="Categorias"
          value={String(categoryCount).padStart(2, "0")}
          helper="Areas diferentes ja cadastradas."
        />
        <MetricCard
          label="Com observacoes"
          value={String(
            initialSuppliers.filter((supplier) => supplier.note?.trim()).length,
          ).padStart(2, "0")}
          helper="Fornecedores com instrucoes registradas."
        />
      </div>

      {normalizedSearch ? (
        <p className="mt-5 text-sm text-zinc-600">
          Mostrando {suppliers.length} resultado{suppliers.length === 1 ? "" : "s"} para{" "}
          <span className="font-medium text-zinc-900">"{search}"</span>.
        </p>
      ) : null}

      <div className="mt-8 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {suppliers.length === 0 ? (
          <EmptyState />
        ) : (
          visibleSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))
        )}
      </div>

      <ListPagination
        page={page}
        totalPages={totalPages}
        totalItems={suppliers.length}
        startItem={startItem}
        endItem={endItem}
        itemLabel="fornecedores"
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      />
    </CerimonialShell>
  );
}

function SupplierSearch({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 py-3 shadow-sm xl:min-w-[18rem] xl:flex-none xl:px-6">
      <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar fornecedor..."
        className="w-full bg-transparent text-base text-zinc-800 outline-none placeholder:text-zinc-400"
      />
    </label>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-[24px] border border-zinc-200 bg-white px-6 py-5 shadow-[0_16px_45px_rgba(24,24,27,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-5 text-5xl font-light tracking-[-0.04em] text-zinc-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{helper}</p>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="lg:col-span-2 2xl:col-span-3">
      <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[28px] border border-dashed border-zinc-300 bg-white/65 px-6 py-10 text-center shadow-[0_20px_60px_rgba(24,24,27,0.05)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
          <HandshakeIcon className="h-8 w-8" />
        </div>
        <p className="mt-5 text-lg text-zinc-700">
          Nenhum fornecedor encontrado no momento.
        </p>
      </div>
    </div>
  );
}

function SupplierCard({ supplier }: { supplier: CerimonialSupplierView }) {
  const whatsappHref = `https://wa.me/${supplier.phone.replace(/\D/g, "")}`;
  const emailHref = supplier.email ? `mailto:${supplier.email}` : null;

  return (
    <article className="rounded-[18px] border border-zinc-200 bg-white p-4 shadow-[0_10px_28px_rgba(24,24,27,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-zinc-950">
            {supplier.supplierName}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="olive">{supplier.category}</Badge>
            <Badge tone={getStatusTone(supplier.supplierStatus)}>
              {getStatusLabel(supplier.supplierStatus)}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-zinc-500">
          {new Date(supplier.updatedAt).toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <InfoBox label="Responsavel" value={supplier.contactName || "Nao informado"} />
        <InfoBox label="WhatsApp" value={supplier.phone} />
        <InfoBox label="Email" value={supplier.email || "Nao informado"} breakAll />
        <InfoBox
          label="Atualizado em"
          value={new Date(supplier.updatedAt).toLocaleString("pt-BR")}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-600">
        <ActionLink href={whatsappHref} label="WhatsApp">
          <PhoneIcon className="h-3.5 w-3.5" />
        </ActionLink>
        {emailHref ? (
          <ActionLink href={emailHref} label="Email">
            <MailIcon className="h-3.5 w-3.5" />
          </ActionLink>
        ) : null}
      </div>

      <div className="mt-3 line-clamp-2 rounded-[14px] bg-zinc-50 px-3 py-2 text-xs leading-5 text-zinc-700">
        {supplier.note || "Sem observacoes registradas ate o momento."}
      </div>
    </article>
  );
}

function InfoBox({
  label,
  value,
  breakAll = false,
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="rounded-[14px] bg-zinc-100 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-xs font-medium text-zinc-900 ${breakAll ? "break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ActionLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex items-center gap-2 transition hover:text-zinc-900"
    >
      {children}
      <span>{label}</span>
    </a>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "olive" | "green" | "amber" | "zinc";
}) {
  const className =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : tone === "zinc"
          ? "border-zinc-200 bg-zinc-100 text-zinc-700"
          : "border-[rgb(var(--lavender)/0.25)] bg-[rgb(var(--lavender)/0.10)] text-[rgb(var(--olive))]";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] ${className}`}>
      {children}
    </span>
  );
}

function getStatusLabel(status: CerimonialSupplierView["supplierStatus"]) {
  if (status === "contratado") return "Contratado";
  if (status === "negociacao") return "Em negociacao";
  return "Pendente";
}

function getStatusTone(
  status: CerimonialSupplierView["supplierStatus"],
): "green" | "amber" | "zinc" {
  if (status === "contratado") return "green";
  if (status === "negociacao") return "amber";
  return "zinc";
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

function HandshakeIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="m11 12 2 2a2 2 0 0 0 2.83 0l3.34-3.34a2 2 0 0 0 0-2.83l-2-2a2 2 0 0 0-2.83 0L12 8" />
      <path d="m13 12-2-2a2 2 0 0 0-2.83 0l-3.34 3.34a2 2 0 0 0 0 2.83l2 2a2 2 0 0 0 2.83 0L12 16" />
      <path d="m7 7 2 2" />
      <path d="m15 15 2 2" />
    </SvgIcon>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.63 2.6a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.48-1.29a2 2 0 0 1 2.11-.45c.84.3 1.71.51 2.6.63A2 2 0 0 1 22 16.92Z" />
    </SvgIcon>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </SvgIcon>
  );
}
