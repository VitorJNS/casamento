import { NextResponse } from "next/server";
import { z } from "zod";

import { isCerimonialAuthenticated } from "@/lib/cerimonial-auth";
import { toIsoString, toIsoStringOrNull } from "@/lib/date";
import { getPrisma } from "@/lib/prisma";
import {
  ensureSuppliersTable,
  listSuppliers,
  type SupplierEntryRow,
} from "@/lib/suppliers-store";

export const runtime = "nodejs";

const supplierSchema = z.object({
  supplierName: z
    .string()
    .trim()
    .min(2, "Nome do fornecedor: informe pelo menos 2 caracteres.")
    .max(140, "Nome do fornecedor: use no maximo 140 caracteres."),
  category: z
    .string()
    .trim()
    .min(2, "Categoria: informe o tipo de servico do fornecedor.")
    .max(80, "Categoria: use no maximo 80 caracteres."),
  supplierStatus: z.enum(["contratado", "pendente", "negociacao"], {
    message: "Status: escolha Contratado, Pendente ou Em negociacao.",
  }),
  contactName: z
    .string()
    .trim()
    .max(140, "Responsavel: use no maximo 140 caracteres.")
    .optional(),
  phone: z
    .string()
    .trim()
    .min(8, "Telefone ou WhatsApp: informe um numero valido para contato.")
    .max(40, "Telefone ou WhatsApp: use no maximo 40 caracteres."),
  email: z
    .string()
    .trim()
    .email("Email: confira se o endereco esta correto, como nome@email.com.")
    .max(160, "Email: use no maximo 160 caracteres.")
    .optional()
    .or(z.literal("")),
  contractValueCents: z.number().int().min(0).nullable().optional(),
  amountPaidCents: z.number().int().min(0).default(0),
  nextPaymentDue: z.string().date().optional().or(z.literal("")),
  note: z
    .string()
    .trim()
    .max(600, "Observacoes: reduza o texto para ate 600 caracteres.")
    .optional(),
}).superRefine((data, ctx) => {
  if (
    data.contractValueCents !== null &&
    data.contractValueCents !== undefined &&
    data.amountPaidCents > data.contractValueCents
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["amountPaidCents"],
      message: "O valor pago nao pode ser maior que o valor do contrato.",
    });
  }
});

function mapSupplier(row: SupplierEntryRow) {
  return {
    id: row.id,
    supplierName: row.supplier_name,
    category: row.category,
    supplierStatus: row.supplier_status,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    contractValueCents: row.contract_value_cents,
    amountPaidCents: row.amount_paid_cents,
    nextPaymentDue: toIsoStringOrNull(row.next_payment_due),
    note: row.note,
    isActive: row.is_active,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function getFirstZodMessage(error: z.ZodError) {
  const firstIssue = error.issues[0];
  return firstIssue?.message ?? "Preencha os dados do fornecedor corretamente.";
}

async function requireCerimonialApiAuth() {
  const authenticated = await isCerimonialAuthenticated();

  if (!authenticated) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Nao autorizado.",
        },
      },
      { status: 401 },
    );
  }

  return null;
}

export async function GET() {
  const authError = await requireCerimonialApiAuth();
  if (authError) return authError;

  const suppliers = await listSuppliers();
  return NextResponse.json({ suppliers: suppliers.map(mapSupplier) });
}

export async function POST(_request: Request) {
  const authError = await requireCerimonialApiAuth();
  if (authError) return authError;

  return NextResponse.json(
    {
      error: {
        code: "FORBIDDEN",
        message: "O cadastro de fornecedores deve ser feito na area dos noivos.",
      },
    },
    { status: 403 },
  );
}
