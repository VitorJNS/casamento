import { NextResponse } from "next/server";

import { isCerimonialAuthenticated } from "@/lib/cerimonial-auth";

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
  _context: { params: Promise<{ id: string }> },
) {
  const authError = await requireCerimonialApiAuth();
  if (authError) return authError;

  return NextResponse.json(
    {
      error: {
        code: "FORBIDDEN",
        message: "A exclusao de fornecedores deve ser feita na area dos noivos.",
      },
    },
    { status: 403 },
  );
}
