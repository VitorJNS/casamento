import { NextResponse } from "next/server";

import { isCerimonialAuthenticated } from "@/lib/cerimonial-auth";
import { getPrisma } from "@/lib/prisma";
import { ensureSuppliersTable } from "@/lib/suppliers-store";

export const runtime = "nodejs";

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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireCerimonialApiAuth();
  if (authError) return authError;

  try {
    await ensureSuppliersTable();
    const { id } = await context.params;
    const prisma = getPrisma();

    const result = await prisma.$executeRawUnsafe(
      `
        UPDATE cerimonial_suppliers
        SET
          is_active = FALSE,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      id,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "DELETE_SUPPLIER_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel excluir o fornecedor.",
        },
      },
      { status: 500 },
    );
  }
}
