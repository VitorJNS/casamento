import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { toIsoString } from "@/lib/date";
import { getPrisma } from "@/lib/prisma";
import {
  ensureGuestListTable,
  GUEST_LIST_TAG,
  normalizeWhatsapp,
  RSVP_TAG,
  type GuestListEntryRow,
} from "@/lib/rsvp-store";
import { PRESENCE_TAG } from "@/lib/presence-dashboard";

export const runtime = "nodejs";

const updateGuestSchema = z.object({
  guestName: z.string().trim().min(2).max(140),
  whatsapp: z.string().trim().min(8).max(40),
  note: z.string().trim().max(600).optional(),
});

function mapGuestEntry(row: GuestListEntryRow) {
  return {
    id: row.id,
    guestName: row.guest_name,
    whatsapp: row.whatsapp,
    note: row.note,
    isActive: row.is_active,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
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

async function loadGuest(id: string) {
  const prisma = getPrisma();
  const [row] = await prisma.$queryRawUnsafe<GuestListEntryRow[]>(
    `
      SELECT
        id,
        guest_name,
        whatsapp,
        whatsapp_normalized,
        note,
        is_active,
        created_at,
        updated_at
      FROM guest_list_entries
      WHERE id = $1
    `,
    id,
  );

  return row ?? null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApiAuth();
  if (authError) return authError;

  try {
    await ensureGuestListTable();
    const payload = updateGuestSchema.parse(await request.json());
    const { id } = await context.params;
    const prisma = getPrisma();

    await prisma.$executeRawUnsafe(
      `
        UPDATE guest_list_entries
        SET
          guest_name = $2,
          whatsapp = $3,
          whatsapp_normalized = $4,
          note = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      id,
      payload.guestName,
      payload.whatsapp,
      normalizeWhatsapp(payload.whatsapp),
      payload.note ?? null,
    );

    const updated = await loadGuest(id);

    if (!updated) {
      return NextResponse.json(
        {
          error: {
            code: "GUEST_NOT_FOUND",
            message: "Convidado nao encontrado.",
          },
        },
        { status: 404 },
      );
    }

    revalidateTag(GUEST_LIST_TAG, "max");
    revalidateTag(RSVP_TAG, "max");
    revalidateTag(PRESENCE_TAG, "max");
    return NextResponse.json({ guest: mapGuestEntry(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_GUEST",
            message: "Preencha nome e WhatsApp corretamente.",
            details: error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "DUPLICATE_WHATSAPP",
            message: "Ja existe um convidado com este WhatsApp.",
          },
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "UPDATE_GUEST_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel atualizar o convidado.",
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
    await ensureGuestListTable();
    const { id } = await context.params;
    const prisma = getPrisma();

    await prisma.$executeRawUnsafe(
      `
        UPDATE guest_list_entries
        SET
          is_active = FALSE,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      id,
    );

    revalidateTag(GUEST_LIST_TAG, "max");
    revalidateTag(RSVP_TAG, "max");
    revalidateTag(PRESENCE_TAG, "max");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "DELETE_GUEST_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel desativar o convidado.",
        },
      },
      { status: 500 },
    );
  }
}

