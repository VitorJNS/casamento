import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { toIsoString } from "@/lib/date";
import { getPrisma } from "@/lib/prisma";
import {
  ensureGuestListTable,
  getGuestListColumnAvailability,
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
  secondaryWhatsapp: z.string().trim().min(8).max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  adultNames: z.array(z.string().trim().min(2).max(140)).min(1).max(10).default([]),
  childCount: z.number().int().min(0).max(12).default(0),
  note: z.string().trim().max(600).optional(),
});

function mapGuestEntry(row: GuestListEntryRow) {
  return {
    id: row.id,
    guestName: row.guest_name,
    whatsapp: row.whatsapp,
    secondaryWhatsapp: row.secondary_whatsapp,
    email: row.email,
    adultNames: Array.isArray(row.adult_names)
      ? row.adult_names.filter((item): item is string => typeof item === "string")
      : [],
    childCount: row.child_count,
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
  const columns = await getGuestListColumnAvailability();
  const prisma = getPrisma();
  const [row] = await prisma.$queryRawUnsafe<GuestListEntryRow[]>(
    `
      SELECT
        id,
        guest_name,
        whatsapp,
        whatsapp_normalized,
        ${columns.secondaryWhatsapp ? "secondary_whatsapp" : "NULL AS secondary_whatsapp"},
        ${
          columns.secondaryWhatsappNormalized
            ? "secondary_whatsapp_normalized"
            : "NULL AS secondary_whatsapp_normalized"
        },
        ${columns.email ? "email" : "NULL AS email"},
        ${columns.adultNames ? "adult_names" : "'[]'::jsonb AS adult_names"},
        ${columns.childCount ? "child_count" : "0 AS child_count"},
        note,
        ${columns.companionNames ? "companion_names" : "'[]'::jsonb AS companion_names"},
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
    const columns = await getGuestListColumnAvailability();
    const { id } = await context.params;
    const prisma = getPrisma();
    const values: unknown[] = [id];
    const setClauses: string[] = [];

    const pushSet = (column: string, value: unknown, options?: { jsonb?: boolean }) => {
      const parameterIndex = values.push(value);
      setClauses.push(
        `${column} = $${parameterIndex}${options?.jsonb ? "::jsonb" : ""}`,
      );
    };

    pushSet("guest_name", payload.guestName);
    pushSet("whatsapp", payload.whatsapp);
    pushSet("whatsapp_normalized", normalizeWhatsapp(payload.whatsapp));

    if (columns.secondaryWhatsapp) {
      pushSet("secondary_whatsapp", payload.secondaryWhatsapp || null);
    }

    if (columns.secondaryWhatsappNormalized) {
      pushSet(
        "secondary_whatsapp_normalized",
        payload.secondaryWhatsapp ? normalizeWhatsapp(payload.secondaryWhatsapp) : null,
      );
    }

    if (columns.email) {
      pushSet("email", payload.email || null);
    }

    if (columns.adultNames) {
      pushSet("adult_names", JSON.stringify(payload.adultNames), { jsonb: true });
    }

    if (columns.childCount) {
      pushSet("child_count", payload.childCount);
    }

    pushSet("note", payload.note ?? null);
    setClauses.push("updated_at = CURRENT_TIMESTAMP");

    await prisma.$executeRawUnsafe(
      `
        UPDATE guest_list_entries
        SET
          ${setClauses.join(",\n          ")}
        WHERE id = $1
      `,
      ...values,
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

