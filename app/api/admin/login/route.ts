import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminSession, validateAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());

    if (!validateAdminPassword(payload.password)) {
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

    await createAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ADMIN_LOGIN_FAILED",
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
