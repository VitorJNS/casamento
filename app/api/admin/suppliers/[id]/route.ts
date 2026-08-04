import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { toIsoString, toIsoStringOrNull } from "@/lib/date";
import { getPrisma, withPrismaRetry } from "@/lib/prisma";
import {
  ensureSupplierContractUrlColumn,
  ensureSuppliersTable,
  isMissingSupplierContractUrlColumn,
  SUPPLIERS_TAG,
  type SupplierEntryRow,
} from "@/lib/suppliers-store";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

const supplierSchema = z
  .object({
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
    supplierStatus: z.enum(["contratado", "pendente"], {
      message: "Status: escolha Contratado ou Pendente.",
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
    contractUrl: z
      .string()
      .trim()
      .max(1000, "Link do contrato: use no maximo 1000 caracteres.")
      .optional()
      .or(z.literal("")),
    amountPaidCents: z.number().int().min(0).default(0),
    nextPaymentDue: z
      .string()
      .date("Data de fechamento do contrato: informe uma data valida.")
      .optional()
      .or(z.literal("")),
    note: z
      .string()
      .trim()
      .max(600, "Observacoes: reduza o texto para ate 600 caracteres.")
      .optional(),
  })
  .superRefine((data, ctx) => {
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
    contractUrl: row.contract_url,
    amountPaidCents: row.amount_paid_cents,
    nextPaymentDue: toIsoStringOrNull(row.next_payment_due),
    note: row.note,
    isActive: row.is_active,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

async function updateSupplier(
  payload: z.infer<typeof supplierSchema>,
  id: string,
) {
  const prisma = getPrisma();

  try {
    return await withPrismaRetry(() =>
      prisma.$queryRawUnsafe<SupplierEntryRow[]>(
        `
          UPDATE cerimonial_suppliers
          SET
            supplier_name = $2,
            category = $3,
            supplier_status = $4,
            contact_name = $5,
            phone = $6,
            email = $7,
            contract_value_cents = $8,
            contract_url = $9,
            amount_paid_cents = $10,
            next_payment_due = $11::date,
            note = $12,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
            AND is_active = TRUE
          RETURNING
            id,
            supplier_name,
            category,
            supplier_status,
            contact_name,
            phone,
            email,
            contract_value_cents,
            contract_url,
            amount_paid_cents,
            next_payment_due,
            note,
            is_active,
            created_at,
            updated_at
        `,
        id,
        payload.supplierName,
        payload.category,
        payload.supplierStatus,
        payload.contactName || null,
        payload.phone,
        payload.email || null,
        payload.contractValueCents ?? null,
        payload.contractUrl || null,
        payload.amountPaidCents,
        payload.nextPaymentDue || null,
        payload.note || null,
      ),
    );
  } catch (error) {
    if (!isMissingSupplierContractUrlColumn(error)) {
      throw error;
    }

    await ensureSupplierContractUrlColumn();
    return updateSupplier(payload, id);
  }
}

async function requireAdminApiAuth() {
  const authenticated = await isAdminAuthenticated();

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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApiAuth();
  if (authError) return authError;

  try {
    const payload = supplierSchema.parse(await request.json());
    await ensureSuppliersTable();
    const { id } = await context.params;
    const [updated] = await updateSupplier(payload, id);

    if (!updated) {
      return NextResponse.json(
        {
          error: {
            code: "SUPPLIER_NOT_FOUND",
            message: "Fornecedor nao encontrado.",
          },
        },
        { status: 404 },
      );
    }

    revalidateTag(SUPPLIERS_TAG, { expire: 0 });
    return NextResponse.json({ supplier: mapSupplier(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_SUPPLIER",
            message:
              error.issues[0]?.message ?? "Preencha os dados do fornecedor corretamente.",
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "UPDATE_SUPPLIER_FAILED",
          message:
            "Nao foi possivel atualizar o fornecedor agora. Revise os dados e tente novamente.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApiAuth();
  if (authError) return authError;

  try {
    await ensureSuppliersTable();
    const { id } = await context.params;
    const prisma = getPrisma();

    const result = await withPrismaRetry(() =>
      prisma.$executeRawUnsafe(
      `
        UPDATE cerimonial_suppliers
        SET
          is_active = FALSE,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      id,
      ),
    );

    if (result === 0) {
      return NextResponse.json(
        {
          error: {
            code: "SUPPLIER_NOT_FOUND",
            message: "Fornecedor nao encontrado.",
          },
        },
        { status: 404 },
      );
    }

    revalidateTag(SUPPLIERS_TAG, { expire: 0 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "DELETE_SUPPLIER_FAILED",
          message:
            "Nao foi possivel excluir o fornecedor agora. Atualize a pagina e tente novamente.",
        },
      },
      { status: 500 },
    );
  }
}
