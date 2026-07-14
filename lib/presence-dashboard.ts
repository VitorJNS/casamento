import { unstable_cache } from "next/cache";

import { getPrisma } from "@/lib/prisma";
import {
  ensurePresenceTables,
  getGuestListColumnAvailability,
  GUEST_LIST_TAG,
  RSVP_TAG,
} from "@/lib/rsvp-store";

type PresenceRow = {
  guest_id: string;
  guest_name: string;
  guest_whatsapp: string;
  guest_secondary_whatsapp: string | null;
  guest_whatsapp_normalized: string;
  guest_note: string | null;
  guest_adult_names: unknown;
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
  secondaryWhatsapp: string | null;
  whatsappNormalized: string;
  note: string | null;
  adultNames: string[];
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

export const PRESENCE_TAG = "presence-dashboard";

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
  return getPresenceDashboardDataCached();
}

const getPresenceDashboardDataCached = unstable_cache(
  async () => {
  await ensurePresenceTables();
  const prisma = getPrisma();
  const guestListColumns = await getGuestListColumnAvailability();

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
        ${
          guestListColumns.secondaryWhatsapp
            ? "guest.secondary_whatsapp"
            : "NULL"
        } AS guest_secondary_whatsapp,
        guest.whatsapp_normalized AS guest_whatsapp_normalized,
        guest.note AS guest_note,
        ${guestListColumns.adultNames ? "guest.adult_names" : "'[]'::jsonb"} AS guest_adult_names,
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
      LEFT JOIN LATERAL (
        SELECT *
        FROM latest_rsvps latest
        WHERE latest.whatsapp_normalized = guest.whatsapp_normalized
          ${
            guestListColumns.secondaryWhatsappNormalized
              ? "OR latest.whatsapp_normalized = guest.secondary_whatsapp_normalized"
              : ""
          }
        ORDER BY latest.created_at DESC
        LIMIT 1
      ) latest ON TRUE
      WHERE guest.is_active = TRUE

      UNION ALL

      SELECT
        latest.id AS guest_id,
        latest.guest_name,
        latest.whatsapp AS guest_whatsapp,
        NULL AS guest_secondary_whatsapp,
        latest.whatsapp_normalized AS guest_whatsapp_normalized,
        NULL AS guest_note,
        latest.companion_names AS guest_adult_names,
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
        ON (
          guest.whatsapp_normalized = latest.whatsapp_normalized
          ${
            guestListColumns.secondaryWhatsappNormalized
              ? "OR guest.secondary_whatsapp_normalized = latest.whatsapp_normalized"
              : ""
          }
        )
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
      secondaryWhatsapp: row.guest_secondary_whatsapp,
      whatsappNormalized: row.guest_whatsapp_normalized,
      note: row.guest_note,
      adultNames: normalizeCompanionNames(row.guest_adult_names),
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
  const pendingCountableGuests = pending.reduce(
    (sum, guest) => sum + (guest.countableGuestCount ?? 0),
    0,
  );
  const pendingChildren = pending.reduce((sum, guest) => sum + guest.childCount, 0);
  const totalRegisteredGuests = guests.filter((guest) => guest.sourceKind === "guest-list").length;
  const pendingRegisteredGuests = pending.filter(
    (guest) => guest.sourceKind === "guest-list",
  ).length;
  const hasRegisteredGuestList = totalRegisteredGuests > 0;

  return {
    summary: {
      totalGuests: hasRegisteredGuestList ? totalRegisteredGuests : guests.length,
      confirmedGuests: confirmed.length,
      declinedGuests: declined.length,
      pendingGuests: hasRegisteredGuestList ? pendingRegisteredGuests : 0,
      confirmedCountableGuests,
      confirmedChildren,
      declinedCountableGuests,
      pendingCountableGuests,
      pendingChildren,
    },
    guests,
  };
  },
  ["presence-dashboard"],
  { revalidate: 15, tags: [PRESENCE_TAG, RSVP_TAG, GUEST_LIST_TAG] },
);
