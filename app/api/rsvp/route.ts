import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PRESENCE_TAG } from "@/lib/presence-dashboard";
import { getPrisma } from "@/lib/prisma";
import { sendRsvpConfirmationEmail } from "@/lib/rsvp-email";
import {
  ensureGuestListTable,
  ensureRsvpTable,
  getGuestListColumnAvailability,
  normalizeWhatsapp,
  RSVP_TAG,
type GuestListEntryRow,
} from "@/lib/rsvp-store";

export const runtime = "nodejs";

const guestResponseSchema = z.object({
  guestId: z.string().trim().min(1),
  attendance: z.enum(["confirmed", "declined"]),
});

const rsvpSchema = z.object({
  guestName: z.string().trim().min(2).max(140),
  whatsapp: z.string().trim().min(8).max(40),
  email: z.string().trim().email().max(160).optional(),
  note: z.string().trim().max(600).optional(),
  guests: z.array(guestResponseSchema).min(1).max(20),
});

function mapGuestRow(row: GuestListEntryRow) {
  return {
    id: row.id,
    guestName: row.guest_name,
    familyLabel: row.family_label,
    isChild: row.is_child,
    whatsapp: row.whatsapp,
  };
}

type LatestGuestResponseRow = {
  guest_id: string;
  attendance: "confirmed" | "declined";
};

async function loadGuestsByWhatsapp(whatsapp: string) {
  await ensureGuestListTable();
  const columns = await getGuestListColumnAvailability();
  const prisma = getPrisma();

  return prisma.$queryRawUnsafe<GuestListEntryRow[]>(
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
        ${columns.companionNames ? "companion_names" : "'[]'::jsonb AS companion_names"},
        ${columns.familyLabel ? "family_label" : "NULL AS family_label"},
        ${columns.isChild ? "is_child" : "FALSE AS is_child"},
        note,
        is_active,
        created_at,
        updated_at
      FROM guest_list_entries
      WHERE is_active = TRUE
        AND whatsapp_normalized = $1
      ORDER BY guest_name ASC
    `,
    normalizeWhatsapp(whatsapp),
  );
}

async function loadInviteGroupByWhatsapp(whatsapp: string) {
  const directGuests = await loadGuestsByWhatsapp(whatsapp);

  if (directGuests.length === 0) {
    return [];
  }

  const familyLabel = directGuests.find((guest) => guest.family_label)?.family_label?.trim();

  if (!familyLabel) {
    return directGuests;
  }

  const columns = await getGuestListColumnAvailability();
  const prisma = getPrisma();

  return prisma.$queryRawUnsafe<GuestListEntryRow[]>(
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
        ${columns.companionNames ? "companion_names" : "'[]'::jsonb AS companion_names"},
        ${columns.familyLabel ? "family_label" : "NULL AS family_label"},
        ${columns.isChild ? "is_child" : "FALSE AS is_child"},
        note,
        is_active,
        created_at,
        updated_at
      FROM guest_list_entries
      WHERE is_active = TRUE
        AND (
          family_label = $1
          OR whatsapp_normalized = $2
        )
      ORDER BY guest_name ASC
    `,
    familyLabel,
    normalizeWhatsapp(whatsapp),
  );
}

async function loadLatestGuestResponses(guestIds: string[]) {
  if (guestIds.length === 0) {
    return new Map<string, "confirmed" | "declined">();
  }

  const prisma = getPrisma();
  const rows = await prisma.$queryRawUnsafe<LatestGuestResponseRow[]>(
    `
      WITH expanded_responses AS (
        SELECT
          rsvp.created_at,
          response_item ->> 'guestId' AS guest_id,
          response_item ->> 'attendance' AS attendance
        FROM rsvp_confirmations rsvp
        CROSS JOIN LATERAL jsonb_array_elements(
          CASE
            WHEN jsonb_typeof(rsvp.guest_responses) = 'array' THEN rsvp.guest_responses
            ELSE '[]'::jsonb
          END
        ) response_item
      )
      SELECT DISTINCT ON (guest_id)
        guest_id,
        attendance
      FROM expanded_responses
      WHERE guest_id = ANY($1::text[])
        AND attendance IN ('confirmed', 'declined')
      ORDER BY guest_id, created_at DESC
    `,
    guestIds,
  );

  return new Map(rows.map((row) => [row.guest_id, row.attendance]));
}

export async function GET(request: NextRequest) {
  const whatsapp = request.nextUrl.searchParams.get("whatsapp")?.trim();

  if (!whatsapp) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_WHATSAPP",
          message: "Informe o WhatsApp para localizar seu convite.",
        },
      },
      { status: 400 },
    );
  }

  const guests = await loadInviteGroupByWhatsapp(whatsapp);

  if (guests.length === 0) {
    return NextResponse.json(
      {
        error: {
          code: "INVITE_NOT_FOUND",
          message: "Nao encontramos convidados cadastrados com esse WhatsApp.",
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    whatsapp: guests[0].whatsapp,
    familyLabel: guests.find((guest) => guest.family_label)?.family_label ?? null,
    guests: guests.map(mapGuestRow),
    latestResponses: Object.fromEntries(
      (
        await loadLatestGuestResponses(guests.map((guest) => guest.id))
      ).entries(),
    ),
  });
}

export async function POST(request: Request) {
  try {
    const payload = rsvpSchema.parse(await request.json());
    await ensureRsvpTable();
    await ensureGuestListTable();

    const invitedGuests = await loadInviteGroupByWhatsapp(payload.whatsapp);
    const invitedGuestMap = new Map(invitedGuests.map((guest) => [guest.id, guest]));
    const latestResponses = await loadLatestGuestResponses(
      invitedGuests.map((guest) => guest.id),
    );

    const normalizedGuestResponses = payload.guests.map((guest) => {
      const invitedGuest = invitedGuestMap.get(guest.guestId);

      if (!invitedGuest) {
        throw new Error("Um dos convidados selecionados nao pertence a este WhatsApp.");
      }

      return {
        guestId: invitedGuest.id,
        guestName: invitedGuest.guest_name,
        attendance: guest.attendance,
      };
    });

    const alreadyRespondedGuests = normalizedGuestResponses.filter((guest) =>
      latestResponses.has(guest.guestId),
    );

    if (alreadyRespondedGuests.length > 0) {
      throw new Error(
        `Estes convidados ja responderam anteriormente: ${alreadyRespondedGuests
          .map((guest) => guest.guestName)
          .join(", ")}.`,
      );
    }

    const prisma = getPrisma();
    const id = `rsvp_${crypto.randomUUID().replace(/-/g, "")}`;
    const confirmedGuests = normalizedGuestResponses.filter(
      (guest) => guest.attendance === "confirmed",
    );
    const confirmedChildren = confirmedGuests.filter(
      (guest) => invitedGuestMap.get(guest.guestId)?.is_child,
    ).length;

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
          guest_responses,
          note,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, CURRENT_TIMESTAMP)
      `,
      id,
      payload.guestName,
      payload.whatsapp,
      normalizeWhatsapp(payload.whatsapp),
      payload.email ?? null,
      confirmedGuests.length > 0 ? "confirmed" : "declined",
      confirmedGuests.length,
      confirmedChildren,
      JSON.stringify([]),
      JSON.stringify(normalizedGuestResponses),
      payload.note ?? null,
    );

    if (payload.email) {
      try {
        await sendRsvpConfirmationEmail({
          respondentName: payload.guestName,
          email: payload.email,
          familyLabel: invitedGuests.find((guest) => guest.family_label)?.family_label ?? null,
          responses: normalizedGuestResponses.map((guest) => ({
            guestName: guest.guestName,
            attendance: guest.attendance,
          })),
        });
      } catch (emailError) {
        console.error("Nao foi possivel enviar email de confirmacao de presenca.", emailError);
      }
    }

    revalidateTag(RSVP_TAG, "max");
    revalidateTag(PRESENCE_TAG, "max");
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
