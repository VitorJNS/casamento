import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

const deleteSchema = z.object({
  pathname: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
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

    const payload = deleteSchema.parse(await request.json());

    if (payload.pathname.startsWith("supplier-contracts/")) {
      await del(payload.pathname);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CONTRACT",
            message: "Contrato invalido.",
          },
        },
        { status: 400 },
      );
    }

    console.error("Nao foi possivel remover contrato no Blob.", error);
    return NextResponse.json(
      {
        error: {
          code: "CONTRACT_DELETE_FAILED",
          message:
            "Nao foi possivel remover o arquivo agora. Tente novamente em alguns instantes.",
        },
      },
      { status: 500 },
    );
  }
}
