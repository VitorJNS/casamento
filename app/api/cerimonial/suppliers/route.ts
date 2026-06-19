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

export async function POST(request: Request) {
  const authError = await requireCerimonialApiAuth();
  if (authError) return authError;

  try {
    const payload = supplierSchema.parse(await request.json());
    await ensureSuppliersTable();
    const prisma = getPrisma();
    const id = `supplier_${crypto.randomUUID().replace(/-/g, "")}`;

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO cerimonial_suppliers (
          id,
          supplier_name,
          category,
          supplier_status,
          contact_name,
          phone,
          email,
          contract_value_cents,
          amount_paid_cents,
          next_payment_due,
          note,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date, $11, CURRENT_TIMESTAMP)
      `,
      id,
      payload.supplierName,
      payload.category,
      payload.supplierStatus,
      payload.contactName || null,
      payload.phone,
      payload.email || null,
      payload.contractValueCents ?? null,
      payload.amountPaidCents,
      payload.nextPaymentDue || null,
      payload.note || null,
    );

    const [created] = await prisma.$queryRawUnsafe<SupplierEntryRow[]>(
      `
        SELECT
          id,
          supplier_name,
          category,
          supplier_status,
          contact_name,
          phone,
          email,
          contract_value_cents,
          amount_paid_cents,
          next_payment_due,
          note,
          is_active,
          created_at,
          updated_at
        FROM cerimonial_suppliers
        WHERE id = $1
      `,
      id,
    );

    return NextResponse.json({ supplier: mapSupplier(created) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_SUPPLIER",
            message: getFirstZodMessage(error),
            details: error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "CREATE_SUPPLIER_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel cadastrar o fornecedor.",
        },
      },
      { status: 500 },
    );
  }
}
