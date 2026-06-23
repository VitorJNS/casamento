import { NextResponse } from "next/server";
import { z } from "zod";

import { isCerimonialAuthenticated } from "@/lib/cerimonial-auth";
import { getPrisma } from "@/lib/prisma";
import {
  ensureSuppliersTable,
  listSuppliers,
  type SupplierEntryRow,
} from "@/lib/suppliers-store";

export const runtime = "nodejs";

const supplierSchema = z.object({
  supplierName: z.string().trim().min(2).max(140),
  category: z.string().trim().min(2).max(80),
  supplierStatus: z.enum(["contratado", "pendente", "negociacao"]),
  contactName: z.string().trim().max(140).optional(),
  phone: z.string().trim().min(8).max(40),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  contractValueCents: z.number().int().min(0).nullable().optional(),
  amountPaidCents: z.number().int().min(0).default(0),
  nextPaymentDue: z.string().date().optional().or(z.literal("")),
  note: z.string().trim().max(600).optional(),
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
    nextPaymentDue: row.next_payment_due?.toISOString() ?? null,
    note: row.note,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
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
