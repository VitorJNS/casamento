import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { toIsoString } from "@/lib/date";
import { getPrisma } from "@/lib/prisma";
import {
  ensureGuestListTable,
  getGuestListColumnAvailability,
  GUEST_LIST_TAG,
  listGuestListEntries,
  normalizeWhatsapp,
  RSVP_TAG,
  type GuestListEntryRow,
} from "@/lib/rsvp-store";
import { PRESENCE_TAG } from "@/lib/presence-dashboard";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

const guestSchema = z.object({
  guestName: z.string().trim().min(2).max(140),
  whatsapp: z.string().trim().min(8).max(40),
  familyLabel: z.string().trim().max(120).optional().or(z.literal("")),
  isChild: z.boolean().optional().default(false),
  note: z.string().trim().max(600).optional(),
});

function mapGuestEntry(row: GuestListEntryRow) {
  return {
    id: row.id,
    guestName: row.guest_name,
    whatsapp: row.whatsapp,
    secondaryWhatsapp: row.secondary_whatsapp,
    email: row.email,
    familyLabel: row.family_label,
    isChild: row.is_child,
    note: row.note,
    isActive: row.is_active,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function isDuplicateWhatsappError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2010"
  ) {
    const metaMessage =
      typeof error.meta?.message === "string" ? error.meta.message : "";
    const metaCode = typeof error.meta?.code === "string" ? error.meta.code : "";

    return (
      metaCode === "23505" ||
      metaMessage.includes("23505") ||
      metaMessage.includes("whatsapp_normalized") ||
      metaMessage.includes("already exists")
    );
  }

  if (error && typeof error === "object" && "code" in error) {
    return error.code === "23505";
  }

  return false;
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

export async function GET() {
  const authError = await requireAdminApiAuth();
  if (authError) return authError;

  const entries = await listGuestListEntries({ includeInactive: true });
  return NextResponse.json({ guests: entries.map(mapGuestEntry) });
}

export async function POST(request: Request) {
  const authError = await requireAdminApiAuth();
  if (authError) return authError;

  try {
    const payload = guestSchema.parse(await request.json());
    await ensureGuestListTable();
    const columns = await getGuestListColumnAvailability();
    const prisma = getPrisma();
    const id = `guest_${crypto.randomUUID().replace(/-/g, "")}`;

    const insertColumns: string[] = [];
    const insertValues: unknown[] = [];

    const pushValue = (column: string, value: unknown, options?: { jsonb?: boolean }) => {
      insertColumns.push(column);
      const parameterIndex = insertValues.push(value);
      return options?.jsonb ? `$${parameterIndex}::jsonb` : `$${parameterIndex}`;
    };

    const placeholders = [
      pushValue("id", id),
      pushValue("guest_name", payload.guestName),
      pushValue("whatsapp", payload.whatsapp),
      pushValue("whatsapp_normalized", normalizeWhatsapp(payload.whatsapp)),
    ];

    if (columns.secondaryWhatsapp) {
      placeholders.push(pushValue("secondary_whatsapp", null));
    }

    if (columns.secondaryWhatsappNormalized) {
      placeholders.push(pushValue("secondary_whatsapp_normalized", null));
    }

    if (columns.email) {
      placeholders.push(pushValue("email", null));
    }

    if (columns.adultNames) {
      placeholders.push(pushValue("adult_names", JSON.stringify([payload.guestName]), { jsonb: true }));
    }

    if (columns.childCount) {
      placeholders.push(pushValue("child_count", 0));
    }

    if (columns.companionNames) {
      placeholders.push(pushValue("companion_names", JSON.stringify([]), { jsonb: true }));
    }

    if (columns.familyLabel) {
      placeholders.push(pushValue("family_label", payload.familyLabel || null));
    }

    if (columns.isChild) {
      placeholders.push(pushValue("is_child", payload.isChild ?? false));
    }

    placeholders.push(pushValue("note", payload.note ?? null));
    insertColumns.push("updated_at");
    placeholders.push("CURRENT_TIMESTAMP");

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO guest_list_entries (
          ${insertColumns.join(", ")}
        ) VALUES (${placeholders.join(", ")})
      `,
      ...insertValues,
    );

    const [created] = await prisma.$queryRawUnsafe<GuestListEntryRow[]>(
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
          ${columns.familyLabel ? "family_label" : "NULL AS family_label"},
          ${columns.isChild ? "is_child" : "FALSE AS is_child"},
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

    revalidateTag(GUEST_LIST_TAG, { expire: 0 });
    revalidateTag(RSVP_TAG, { expire: 0 });
    revalidateTag(PRESENCE_TAG, { expire: 0 });
    return NextResponse.json({ guest: mapGuestEntry(created) });
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

    if (isDuplicateWhatsappError(error)) {
      return NextResponse.json(
        {
          error: {
            code: "DUPLICATE_WHATSAPP",
            message:
              "Ja existe um convidado com este WhatsApp. Se eles devem responder juntos, edite o cadastro existente ou use outro numero para este convidado.",
          },
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "CREATE_GUEST_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel cadastrar o convidado.",
        },
      },
      { status: 500 },
    );
  }
}
