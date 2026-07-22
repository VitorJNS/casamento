"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/component/AdminShell";
import { ListPagination } from "@/component/ListPagination";
import { formatPriceCents, parsePriceLabelToCents } from "@/lib/currency";

export type AdminSupplier = {
  id: string;
  supplierName: string;
  category: string;
  supplierStatus: "contratado" | "pendente" | "negociacao";
  contactName: string | null;
  phone: string;
  email: string | null;
  contractValueCents: number | null;
  amountPaidCents: number;
  nextPaymentDue: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type SupplierDraft = {
  supplierName: string;
  category: string;
  supplierStatus: AdminSupplier["supplierStatus"];
  contactName: string;
  phone: string;
  email: string;
  contractValue: string;
  amountPaid: string;
  nextPaymentDue: string;
  note: string;
};

const emptyDraft: SupplierDraft = {
  supplierName: "",
  category: "",
  supplierStatus: "pendente",
  contactName: "",
  phone: "",
  email: "",
  contractValue: "",
  amountPaid: "",
  nextPaymentDue: "",
  note: "",
};

const SUPPLIERS_PER_PAGE = 10;

export function AdminSuppliersManager({
  initialSuppliers,
}: {
  initialSuppliers: AdminSupplier[];
}) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierPendingDelete, setSupplierPendingDelete] =
    useState<AdminSupplier | null>(null);
  const [draft, setDraft] = useState<SupplierDraft>(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(suppliers.map((supplier) => supplier.category.trim()).filter(Boolean)),
    );
    return values.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [suppliers]);

  const quickStats = [
    {
      label: "Total de fornecedores",
      value: String(suppliers.length).padStart(2, "0"),
      tone: "text-[rgb(var(--lavender))]",
    },
    {
      label: "Contratos assinados",
      value: String(
        suppliers.filter((supplier) => supplier.supplierStatus === "contratado").length,
      ).padStart(2, "0"),
      tone: "text-[rgb(var(--olive))]",
    },
    {
      label: "Pagamentos pendentes",
      value: String(
        suppliers.filter(
          (supplier) =>
            supplier.contractValueCents !== null &&
            supplier.amountPaidCents < supplier.contractValueCents,
        ).length,
      ).padStart(2, "0"),
      tone: "text-rose-500",
    },
    {
      label: "Em negociacao",
      value: String(
        suppliers.filter((supplier) => supplier.supplierStatus === "negociacao").length,
      ).padStart(2, "0"),
      tone: "text-zinc-700",
    },
  ];

  const totalPages = Math.max(1, Math.ceil(suppliers.length / SUPPLIERS_PER_PAGE));
  const visibleSuppliers = useMemo(() => {
    const start = (page - 1) * SUPPLIERS_PER_PAGE;
    return suppliers.slice(start, start + SUPPLIERS_PER_PAGE);
  }, [page, suppliers]);
  const startItem = suppliers.length === 0 ? 0 : (page - 1) * SUPPLIERS_PER_PAGE + 1;
  const endItem = Math.min(page * SUPPLIERS_PER_PAGE, suppliers.length);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = validateSupplierDraft(draft);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierName: draft.supplierName,
          category: draft.category,
          supplierStatus: draft.supplierStatus,
          contactName: draft.contactName,
          phone: draft.phone,
          email: draft.email,
          contractValueCents: toCentsOrNull(draft.contractValue),
          amountPaidCents: toCentsOrZero(draft.amountPaid),
          nextPaymentDue: draft.nextPaymentDue,
          note: draft.note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "Nao foi possivel cadastrar o fornecedor.",
        );
      }

      setSuppliers((current) =>
        [...current, data.supplier].sort((a, b) =>
          a.supplierName.localeCompare(b.supplierName, "pt-BR"),
        ),
      );
      setDraft(emptyDraft);
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel cadastrar o fornecedor.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSupplier() {
    if (!supplierPendingDelete) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/suppliers/${supplierPendingDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "Nao foi possivel excluir o fornecedor.",
        );
      }

      setSuppliers((current) =>
        current.filter((supplier) => supplier.id !== supplierPendingDelete.id),
      );
      setSupplierPendingDelete(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir o fornecedor.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function openModal() {
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  return (
    <AdminShell
      title="Area dos Noivos"
      topRight={
        <button
          type="button"
          onClick={openModal}
          className="btn-primary rounded-full px-5 py-3 text-sm font-semibold"
        >
          <PlusUserIcon className="h-4 w-4" />
          Adicionar fornecedor
        </button>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2.8rem] font-semibold tracking-[-0.05em] text-zinc-950">
            Gestao de Fornecedores
          </h1>
          <p className="mt-2 max-w-3xl text-xl text-zinc-700">
            Aqui voces acompanham contratos, pagamentos e observacoes dos parceiros do casamento.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((item) => (
          <article
            key={item.label}
            className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {item.label}
            </p>
            <p className={`mt-2 text-3xl font-semibold tracking-[-0.03em] ${item.tone}`}>
              {item.value}
            </p>
          </article>
        ))}
      </div>

      {categories.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
            >
              {category}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {visibleSuppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            onDelete={() => {
              setErrorMessage(null);
              setSupplierPendingDelete(supplier);
            }}
          />
        ))}
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

      {isModalOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_rgba(24,24,27,0.18)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-zinc-950">
                  Adicionar fornecedor
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  Cadastre o parceiro com dados de contato, contrato e pagamentos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMessage(null);
                }}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                value={draft.supplierName}
                onChange={(value) => setDraft((current) => ({ ...current, supplierName: value }))}
                placeholder="Nome do fornecedor"
              />
              <Field
                value={draft.category}
                onChange={(value) => setDraft((current) => ({ ...current, category: value }))}
                placeholder="Categoria"
              />

              <label className="flex flex-col gap-2 text-sm text-zinc-700">
                <span className="font-medium">Status</span>
                <select
                  value={draft.supplierStatus}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      supplierStatus: event.target.value as AdminSupplier["supplierStatus"],
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                >
                  <option value="contratado">Contratado</option>
                  <option value="pendente">Pendente</option>
                  <option value="negociacao">Em negociacao</option>
                </select>
              </label>
              <Field
                value={draft.contactName}
                onChange={(value) => setDraft((current) => ({ ...current, contactName: value }))}
                placeholder="Responsavel"
                className="md:self-end"
              />
              <Field
                value={draft.phone}
                onChange={(value) => setDraft((current) => ({ ...current, phone: value }))}
                placeholder="Telefone ou WhatsApp"
              />
              <Field
                value={draft.email}
                onChange={(value) => setDraft((current) => ({ ...current, email: value }))}
                placeholder="Email"
                type="email"
              />
              <Field
                value={draft.contractValue}
                onChange={(value) => setDraft((current) => ({ ...current, contractValue: value }))}
                placeholder="Valor do contrato"
                inputMode="numeric"
              />
              <Field
                value={draft.amountPaid}
                onChange={(value) => setDraft((current) => ({ ...current, amountPaid: value }))}
                placeholder="Valor ja pago"
                inputMode="numeric"
              />
              <Field
                value={draft.nextPaymentDue}
                onChange={(value) => setDraft((current) => ({ ...current, nextPaymentDue: value }))}
                placeholder="Proximo pagamento"
                type="date"
              />
              <div className="md:col-span-2">
                <textarea
                  value={draft.note}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, note: event.target.value }))
                  }
                  placeholder="Observacoes importantes"
                  className="min-h-32 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                />
              </div>

              {errorMessage ? (
                <p className="whitespace-pre-line rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700 md:col-span-2">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Salvando..." : "Salvar fornecedor"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMessage(null);
                  }}
                  className="rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {supplierPendingDelete ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_rgba(24,24,27,0.18)]">
            <h2 className="text-2xl font-semibold text-zinc-950">Excluir fornecedor</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Tem certeza que deseja excluir{" "}
              <span className="font-semibold text-zinc-900">
                {supplierPendingDelete.supplierName}
              </span>
              ? Essa acao remove o fornecedor das areas dos noivos e da cerimonialista.
            </p>

            {errorMessage ? (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDeleteSupplier}
                disabled={isDeleting}
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Excluindo..." : "Confirmar exclusao"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSupplierPendingDelete(null);
                  setErrorMessage(null);
                }}
                className="rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

function SupplierCard({
  supplier,
  onDelete,
}: {
  supplier: AdminSupplier;
  onDelete: () => void;
}) {
  const initials = supplier.supplierName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const whatsappHref = `https://wa.me/${supplier.phone.replace(/\D/g, "")}`;
  const emailHref = supplier.email ? `mailto:${supplier.email}` : null;
  const contractValueLabel =
    supplier.contractValueCents !== null
      ? formatPriceCents(supplier.contractValueCents)
      : "---";
  const amountPaidLabel = formatPriceCents(supplier.amountPaidCents);
  const progress = getPaymentProgress(supplier.contractValueCents, supplier.amountPaidCents);
  const paymentSummary = getPaymentSummary(supplier.contractValueCents, supplier.amountPaidCents);
  const nextLabel = getNextPaymentLabel(supplier);

  return (
    <article className="rounded-[18px] border border-zinc-200 bg-white p-4 shadow-[0_10px_28px_rgba(24,24,27,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,rgba(177,156,217,0.28),rgba(88,102,74,0.22))] text-sm font-semibold text-[rgb(var(--olive))]">
            {initials || "FV"}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-zinc-950">
              {supplier.supplierName}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone="olive">{supplier.category}</Badge>
              <Badge tone={getStatusTone(supplier.supplierStatus)}>
                {getStatusLabel(supplier.supplierStatus)}
              </Badge>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Excluir ${supplier.supplierName}`}
          className="rounded-full border border-zinc-200 p-1.5 text-zinc-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
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

      <div className="mt-3 border-t border-zinc-100 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Valor do contrato
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-950">{contractValueLabel}</p>
          </div>
          <div className="text-right text-xs text-zinc-600">
            <p>{supplier.contactName || "Nao informado"}</p>
            <p className="mt-1">{supplier.phone}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Valor ja pago
            </p>
            <p className="mt-1 font-semibold text-zinc-900">{amountPaidLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Progresso
            </p>
            <p className="mt-1 font-semibold text-zinc-900">{progress}%</p>
          </div>
        </div>

        <div className="mt-3 h-1 rounded-full bg-zinc-100">
          <div
            className="h-1 rounded-full bg-[rgb(var(--olive))] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-zinc-600">
          <span>{paymentSummary}</span>
          <span>{nextLabel}</span>
        </div>
      </div>

      <div className="mt-3 line-clamp-2 rounded-[14px] bg-zinc-50 px-3 py-2 text-xs leading-5 text-zinc-700">
        {supplier.note || "Sem observacoes registradas ate o momento."}
      </div>
    </article>
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

function Field({
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  min,
  inputMode,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  step?: string;
  min?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={(event) => {
        if (inputMode === "numeric") {
          onChange(formatCurrencyInput(event.target.value));
        }
      }}
      placeholder={placeholder}
      step={step}
      min={min}
      inputMode={inputMode}
      className={`w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28] ${className ?? ""}`}
    />
  );
}

function getStatusLabel(status: AdminSupplier["supplierStatus"]) {
  if (status === "contratado") return "Contratado";
  if (status === "negociacao") return "Em negociacao";
  return "Pendente";
}

function getStatusTone(status: AdminSupplier["supplierStatus"]): "green" | "amber" | "zinc" {
  if (status === "contratado") return "green";
  if (status === "negociacao") return "amber";
  return "zinc";
}

function getPaymentProgress(contractValueCents: number | null, amountPaidCents: number) {
  if (!contractValueCents || contractValueCents <= 0) return 0;
  return Math.min(Math.round((amountPaidCents / contractValueCents) * 100), 100);
}

function getPaymentSummary(contractValueCents: number | null, amountPaidCents: number) {
  if (!contractValueCents || contractValueCents <= 0) return "Aguardando contrato";
  if (amountPaidCents <= 0) return "Sinal pendente";
  if (amountPaidCents >= contractValueCents) return "Totalmente pago";
  return `${getPaymentProgress(contractValueCents, amountPaidCents)}% pago`;
}

function getNextPaymentLabel(supplier: AdminSupplier) {
  if (!supplier.contractValueCents || supplier.contractValueCents <= 0) {
    return "---";
  }
  if (supplier.amountPaidCents >= supplier.contractValueCents) {
    return "Finalizado";
  }
  if (supplier.nextPaymentDue) {
    return `Proximo: ${new Date(supplier.nextPaymentDue).toLocaleDateString("pt-BR")}`;
  }
  return "Sem data";
}

function toCentsOrNull(value: string) {
  if (!value.trim()) return null;

  try {
    return parsePriceLabelToCents(value);
  } catch {
    return null;
  }
}

function toCentsOrZero(value: string) {
  return toCentsOrNull(value) ?? 0;
}

function validateSupplierDraft(draft: SupplierDraft) {
  const errors: string[] = [];
  const supplierName = draft.supplierName.trim();
  const category = draft.category.trim();
  const phoneDigits = draft.phone.replace(/\D/g, "");
  const email = draft.email.trim();
  const contractValue = draft.contractValue.trim();
  const amountPaid = draft.amountPaid.trim();
  const note = draft.note.trim();
  const contractValueCents = contractValue ? toCentsOrNull(contractValue) : null;
  const amountPaidCents = amountPaid ? toCentsOrNull(amountPaid) : null;

  if (supplierName.length < 2) {
    errors.push("Nome do fornecedor: informe pelo menos 2 caracteres.");
  }

  if (category.length < 2) {
    errors.push("Categoria: informe o tipo de servico, por exemplo buffet, foto ou decoracao.");
  }

  if (phoneDigits.length < 8) {
    errors.push("Telefone ou WhatsApp: informe um numero valido para contato.");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email: confira se o endereco esta correto, como nome@email.com.");
  }

  if (contractValue && contractValueCents === null) {
    errors.push("Valor do contrato: use um valor em reais, por exemplo 1500,00.");
  }

  if (amountPaid && amountPaidCents === null) {
    errors.push("Valor ja pago: use um valor em reais, por exemplo 500,00.");
  }

  if (
    contractValueCents !== null &&
    amountPaidCents !== null &&
    amountPaidCents > contractValueCents
  ) {
    errors.push("Valor ja pago: nao pode ser maior que o valor do contrato.");
  }

  if (note.length > 600) {
    errors.push("Observacoes: reduza o texto para ate 600 caracteres.");
  }

  return errors.length > 0
    ? `Revise os campos abaixo:\n- ${errors.join("\n- ")}`
    : null;
}

function formatCurrencyInput(value: string) {
  if (!value.trim()) return "";

  try {
    const normalized = value.replace(/\s+/g, "");
    const digitsOnly = normalized.replace(/\D/g, "");

    if (digitsOnly && !normalized.includes(",") && !normalized.includes(".")) {
      return formatPriceCents(Number(digitsOnly) * 100);
    }

    return formatPriceCents(parsePriceLabelToCents(value));
  } catch {
    return value;
  }
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

function PlusUserIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M19 8v6" />
      <path d="M16 11h6" />
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </SvgIcon>
  );
}
