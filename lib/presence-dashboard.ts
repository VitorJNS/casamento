import { getPrisma } from "@/lib/prisma";
import { ensurePresenceTables } from "@/lib/rsvp-store";

type PresenceRow = {
  guest_id: string;
  guest_name: string;
  guest_whatsapp: string;
  guest_whatsapp_normalized: string;
  guest_note: string | null;
  rsvp_id: string | null;
  response_email: string | null;
  attendance: string | null;
  guest_count: number | null;
  child_count: number | null;
  companion_names: unknown;
  response_note: string | null;
  response_created_at: Date | null;
  source_kind: "guest-list" | "rsvp-only";
};

export type PresenceStatus = "confirmed" | "declined" | "pending";
export type PresenceGuest = {
  id: string;
  guestName: string;
  whatsapp: string;
  whatsappNormalized: string;
  note: string | null;
  status: PresenceStatus;
  rsvpId: string | null;
  email: string | null;
  guestCount: number | null;
  childCount: number;
  countableGuestCount: number | null;
  companionNames: string[];
  responseNote: string | null;
  respondedAt: string | null;
  sourceKind: "guest-list" | "rsvp-only";
};

function normalizeCompanionNames(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function getPresenceStatus(attendance: string | null): PresenceStatus {
  if (attendance === "confirmed") return "confirmed";
  if (attendance === "declined") return "declined";
  return "pending";
}

export async function getPresenceDashboardData() {
  await ensurePresenceTables();
  const prisma = getPrisma();

  const rows = await prisma.$queryRawUnsafe<PresenceRow[]>(`
    WITH latest_rsvps AS (
      SELECT DISTINCT ON (whatsapp_normalized)
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
        created_at
      FROM rsvp_confirmations
      WHERE whatsapp_normalized IS NOT NULL AND whatsapp_normalized <> ''
      ORDER BY whatsapp_normalized, created_at DESC
    ),
    presence_rows AS (
      SELECT
        guest.id AS guest_id,
        guest.guest_name,
        guest.whatsapp AS guest_whatsapp,
        guest.whatsapp_normalized AS guest_whatsapp_normalized,
        guest.note AS guest_note,
        latest.id AS rsvp_id,
        latest.email AS response_email,
        latest.attendance,
        latest.guest_count,
        latest.child_count,
        latest.companion_names,
        latest.note AS response_note,
        latest.created_at AS response_created_at,
        'guest-list' AS source_kind
      FROM guest_list_entries guest
      LEFT JOIN latest_rsvps latest
        ON latest.whatsapp_normalized = guest.whatsapp_normalized
      WHERE guest.is_active = TRUE

      UNION ALL

      SELECT
        latest.id AS guest_id,
        latest.guest_name,
        latest.whatsapp AS guest_whatsapp,
        latest.whatsapp_normalized AS guest_whatsapp_normalized,
        NULL AS guest_note,
        latest.id AS rsvp_id,
        latest.email AS response_email,
        latest.attendance,
        latest.guest_count,
        latest.child_count,
        latest.companion_names,
        latest.note AS response_note,
        latest.created_at AS response_created_at,
        'rsvp-only' AS source_kind
      FROM latest_rsvps latest
      LEFT JOIN guest_list_entries guest
        ON guest.whatsapp_normalized = latest.whatsapp_normalized
        AND guest.is_active = TRUE
      WHERE guest.id IS NULL
    )
    SELECT *
    FROM presence_rows
    ORDER BY
      CASE
        WHEN attendance IS NULL THEN 0
        WHEN attendance = 'confirmed' THEN 1
        ELSE 2
      END,
      guest_name ASC
  `);

  const guests: PresenceGuest[] = rows.map((row) => {
    const status = getPresenceStatus(row.attendance);
    return {
      id: row.guest_id,
      guestName: row.guest_name,
      whatsapp: row.guest_whatsapp,
      whatsappNormalized: row.guest_whatsapp_normalized,
      note: row.guest_note,
      status,
      rsvpId: row.rsvp_id,
      email: row.response_email,
      guestCount: row.guest_count ?? null,
      childCount: row.child_count ?? 0,
      countableGuestCount:
        row.guest_count !== null ? Math.max(row.guest_count - (row.child_count ?? 0), 0) : null,
      companionNames: normalizeCompanionNames(row.companion_names),
      responseNote: row.response_note,
      respondedAt: row.response_created_at?.toISOString() ?? null,
      sourceKind: row.source_kind,
    };
  });

  const confirmed = guests.filter((guest) => guest.status === "confirmed");
  const declined = guests.filter((guest) => guest.status === "declined");
  const pending = guests.filter((guest) => guest.status === "pending");
  const confirmedCountableGuests = confirmed.reduce(
    (sum, guest) => sum + (guest.countableGuestCount ?? 0),
    0,
  );
  const confirmedChildren = confirmed.reduce((sum, guest) => sum + guest.childCount, 0);
  const declinedCountableGuests = declined.reduce(
    (sum, guest) => sum + (guest.countableGuestCount ?? 0),
    0,
  );
  const declinedChildren = declined.reduce((sum, guest) => sum + guest.childCount, 0);

  return {
    summary: {
      totalGuests: guests.length,
      confirmedGuests: confirmed.length,
      declinedGuests: declined.length,
      pendingGuests: pending.length,
      confirmedCountableGuests,
      confirmedChildren,
      declinedCountableGuests,
      declinedChildren,
    },
    guests,
  };
}
