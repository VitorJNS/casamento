import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PRESENCE_TAG } from "@/lib/presence-dashboard";
import { getPrisma, withPrismaRetry } from "@/lib/prisma";
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
export const preferredRegion = "gru1";

const guestResponseSchema = z.object({
  guestId: z.string().trim().min(1),
  attendance: z.enum(["confirmed", "declined"]),
});

const rsvpSchema = z.object({
  lookupGuestId: z.string().trim().min(1),
  guestName: z.string().trim().min(2).max(140),
  email: z.string().trim().email().max(160),
  note: z.string().trim().max(600).optional(),
  guests: z.array(guestResponseSchema).min(1).max(20),
});

function mapGuestRow(row: GuestListEntryRow) {
  return {
    id: row.id,
    guestName: row.guest_name,
    familyLabel: row.family_label,
    isChild: row.is_child,
  };
}

function mapGuestMatch(row: GuestListEntryRow) {
  return {
    id: row.id,
    guestName: row.guest_name,
    familyLabel: row.family_label,
    isChild: row.is_child,
  };
}

function getInviteGroupKey(row: GuestListEntryRow) {
  const familyLabel = row.family_label?.trim();
  return familyLabel ? `family:${familyLabel}` : `guest:${row.id}`;
}

function uniqueInviteMatches(rows: GuestListEntryRow[]) {
  const matches = new Map<string, GuestListEntryRow>();

  for (const row of rows) {
    const key = getInviteGroupKey(row);
    if (!matches.has(key)) {
      matches.set(key, row);
    }
  }

  return Array.from(matches.values());
}

type LatestGuestResponseRow = {
  guest_id: string;
  attendance: "confirmed" | "declined";
};

function guestSelectSql(columns: Awaited<ReturnType<typeof getGuestListColumnAvailability>>) {
  return `
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
  `;
}

async function searchGuestsByName(name: string) {
  await ensureGuestListTable();
  const columns = await getGuestListColumnAvailability();
  const normalizedName = name.trim();

  return withPrismaRetry(async () => {
    const prisma = getPrisma();

    return prisma.$queryRawUnsafe<GuestListEntryRow[]>(
    `
      SELECT ${guestSelectSql(columns)}
      FROM guest_list_entries
      WHERE is_active = TRUE
        AND guest_name ILIKE $1
      ORDER BY guest_name ASC
      LIMIT 10
    `,
    `%${normalizedName}%`,
    );
  });
}

async function loadGuestById(guestId: string) {
  await ensureGuestListTable();
  const columns = await getGuestListColumnAvailability();

  return withPrismaRetry(async () => {
    const prisma = getPrisma();

    const rows = await prisma.$queryRawUnsafe<GuestListEntryRow[]>(
    `
      SELECT ${guestSelectSql(columns)}
      FROM guest_list_entries
      WHERE is_active = TRUE
        AND id = $1
      LIMIT 1
    `,
    guestId,
    );

    return rows[0] ?? null;
  });
}

async function loadInviteGroupByGuestId(guestId: string) {
  const selectedGuest = await loadGuestById(guestId);

  if (!selectedGuest) {
    return [];
  }

  const familyLabel = selectedGuest.family_label?.trim();

  if (!familyLabel) {
    return [selectedGuest];
  }

  const columns = await getGuestListColumnAvailability();
  if (!columns.familyLabel) {
    return [selectedGuest];
  }

  return withPrismaRetry(async () => {
    const prisma = getPrisma();

    return prisma.$queryRawUnsafe<GuestListEntryRow[]>(
    `
      SELECT ${guestSelectSql(columns)}
      FROM guest_list_entries
      WHERE is_active = TRUE
        AND family_label = $1
      ORDER BY guest_name ASC
    `,
    familyLabel,
    );
  });
}

async function loadLatestGuestResponses(guestIds: string[]) {
  if (guestIds.length === 0) {
    return new Map<string, "confirmed" | "declined">();
  }

  const rows = await withPrismaRetry(async () => {
    const prisma = getPrisma();

    return prisma.$queryRawUnsafe<LatestGuestResponseRow[]>(
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
  });

  return new Map(rows.map((row) => [row.guest_id, row.attendance]));
}

export async function GET(request: NextRequest) {
  try {
    const guestId = request.nextUrl.searchParams.get("guestId")?.trim();
    const name = request.nextUrl.searchParams.get("name")?.trim();

    if (guestId) {
      const guests = await loadInviteGroupByGuestId(guestId);

      if (guests.length === 0) {
        return NextResponse.json(
          {
            error: {
              code: "INVITE_NOT_FOUND",
              message: "Nao encontramos esse convidado na lista.",
            },
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        lookupGuestId: guestId,
        familyLabel: guests.find((guest) => guest.family_label)?.family_label ?? null,
        guests: guests.map(mapGuestRow),
        latestResponses: Object.fromEntries(
          (
            await loadLatestGuestResponses(guests.map((guest) => guest.id))
          ).entries(),
        ),
      });
    }

    if (!name || name.length < 3) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_NAME",
            message: "Digite pelo menos 3 letras do nome para localizar seu convite.",
          },
        },
        { status: 400 },
      );
    }

    const matches = uniqueInviteMatches(await searchGuestsByName(name));

    if (matches.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "INVITE_NOT_FOUND",
            message: "Nao encontramos convidados cadastrados com esse nome.",
          },
        },
        { status: 404 },
      );
    }

    if (matches.length > 1) {
      return NextResponse.json({
        matches: matches.map(mapGuestMatch),
      });
    }

    const guests = await loadInviteGroupByGuestId(matches[0].id);

    return NextResponse.json({
      lookupGuestId: matches[0].id,
      familyLabel: guests.find((guest) => guest.family_label)?.family_label ?? null,
      guests: guests.map(mapGuestRow),
      latestResponses: Object.fromEntries(
        (
          await loadLatestGuestResponses(guests.map((guest) => guest.id))
        ).entries(),
      ),
    });
  } catch (error) {
    console.error("Nao foi possivel buscar convite para RSVP.", error);
    return NextResponse.json(
      {
        error: {
          code: "RSVP_LOOKUP_FAILED",
          message:
            "Nao conseguimos buscar seu convite agora. Aguarde alguns segundos e tente novamente.",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = rsvpSchema.parse(await request.json());
    await ensureRsvpTable();
    await ensureGuestListTable();

    const invitedGuests = await loadInviteGroupByGuestId(payload.lookupGuestId);
    const invitedGuestMap = new Map(invitedGuests.map((guest) => [guest.id, guest]));
    const latestResponses = await loadLatestGuestResponses(
      invitedGuests.map((guest) => guest.id),
    );

    const normalizedGuestResponses = payload.guests.map((guest) => {
      const invitedGuest = invitedGuestMap.get(guest.guestId);

      if (!invitedGuest) {
        throw new Error("Um dos convidados selecionados nao pertence a este convite.");
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
    const respondentName =
      invitedGuestMap.get(payload.lookupGuestId)?.guest_name ??
      normalizedGuestResponses[0]?.guestName ??
      payload.guestName;

    await withPrismaRetry(() =>
      prisma.$executeRawUnsafe(
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
      respondentName,
      invitedGuests[0]?.whatsapp ?? "",
      normalizeWhatsapp(invitedGuests[0]?.whatsapp ?? ""),
      payload.email ?? null,
      confirmedGuests.length > 0 ? "confirmed" : "declined",
      confirmedGuests.length,
      confirmedChildren,
      JSON.stringify([]),
      JSON.stringify(normalizedGuestResponses),
      payload.note ?? null,
      ),
    );

    try {
      await sendRsvpConfirmationEmail({
        respondentName,
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

    revalidateTag(RSVP_TAG, { expire: 0 });
    revalidateTag(PRESENCE_TAG, { expire: 0 });
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
