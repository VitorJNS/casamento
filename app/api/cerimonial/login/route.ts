import { NextResponse } from "next/server";
import { z } from "zod";

import { clearAdminSession } from "@/lib/admin-auth";
import {
  createCerimonialSession,
  validateCerimonialPassword,
} from "@/lib/cerimonial-auth";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());

    if (!validateCerimonialPassword(payload.password)) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Senha invalida.",
          },
        },
        { status: 401 },
      );
    }

    await clearAdminSession();
    await createCerimonialSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "CERIMONIAL_LOGIN_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel realizar o login.",
        },
      },
      { status: 500 },
    );
  }
}

