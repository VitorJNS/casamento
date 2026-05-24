import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import {
  ensureGuestListTable,
  listGuestListEntries,
  normalizeWhatsapp,
  type GuestListEntryRow,
} from "@/lib/rsvp-store";

export const runtime = "nodejs";

const guestSchema = z.object({
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
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
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
    const prisma = getPrisma();
    const id = `guest_${crypto.randomUUID().replace(/-/g, "")}`;

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO guest_list_entries (
          id,
          guest_name,
          whatsapp,
          whatsapp_normalized,
          note,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `,
      id,
      payload.guestName,
      payload.whatsapp,
      normalizeWhatsapp(payload.whatsapp),
      payload.note ?? null,
    );

    const [created] = await prisma.$queryRawUnsafe<GuestListEntryRow[]>(
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
