import { NextResponse } from "next/server";
import { z } from "zod";

import { getPrisma } from "@/lib/prisma";
import { ensureRsvpTable, normalizeWhatsapp } from "@/lib/rsvp-store";

export const runtime = "nodejs";

const rsvpSchema = z.object({
  guestName: z.string().trim().min(2).max(140),
  whatsapp: z.string().trim().min(8).max(40),
  email: z.string().trim().email().max(160).optional(),
  attendance: z.enum(["confirmed", "declined"]),
  guestCount: z.number().int().min(1).max(6),
  childCount: z.number().int().min(0).max(6).default(0),
  companionNames: z.array(z.string().trim().min(2).max(140)).max(5).default([]),
  note: z.string().trim().max(600).optional(),
}).superRefine((data, ctx) => {
  if (data.childCount > data.guestCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["childCount"],
      message: "A quantidade de criancas nao pode ser maior que o total de pessoas.",
    });
  }

  if (data.attendance === "confirmed") {
    const expectedCompanions = Math.max(data.guestCount - 1, 0);
    if (data.companionNames.length !== expectedCompanions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companionNames"],
        message: "Preencha os nomes dos acompanhantes de acordo com o total de pessoas.",
      });
    }
  }
});

export async function POST(request: Request) {
  try {
    const payload = rsvpSchema.parse(await request.json());
    await ensureRsvpTable();

    const prisma = getPrisma();
    const id = `rsvp_${crypto.randomUUID().replace(/-/g, "")}`;

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO rsvp_confirmations (
          id,
          guest_name,
          whatsapp,
          whatsapp_normalized,
          email,
          attendance,
          guest_count,
          child_count,
          companion_names,
          note,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, CURRENT_TIMESTAMP)
      `,
      id,
      payload.guestName,
      payload.whatsapp,
      normalizeWhatsapp(payload.whatsapp),
      payload.email ?? null,
      payload.attendance,
      payload.guestCount,
      payload.childCount,
      JSON.stringify(payload.companionNames),
      payload.note ?? null,
    );

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_RSVP",
            message: "Preencha os campos obrigatorios da confirmacao.",
            details: error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "RSVP_SAVE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel registrar a confirmacao.",
        },
      },
      { status: 500 },
    );
  }
}
