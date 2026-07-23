import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPrisma, withPrismaRetry } from "@/lib/prisma";
import { ensureSuppliersTable, SUPPLIERS_TAG } from "@/lib/suppliers-store";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

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
