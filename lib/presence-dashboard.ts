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
  guest_family_label: string | null;
  guest_is_child: boolean;
  rsvp_id: string | null;
  response_email: string | null;
  attendance: string | null;
  response_note: string | null;
  response_created_at: Date | null;
  household_members: unknown;
};

export type PresenceStatus = "confirmed" | "declined" | "pending";

export type PresenceGuest = {
  id: string;
  guestName: string;
  whatsapp: string;
  secondaryWhatsapp: string | null;
  whatsappNormalized: string;
  note: string | null;
  familyLabel: string | null;
  isChild: boolean;
  householdMembers: string[];
  status: PresenceStatus;
  rsvpId: string | null;
  email: string | null;
  guestCount: number | null;
  childCount: number;
  countableGuestCount: number | null;
  companionNames: string[];
  adultNames: string[];
  responseNote: string | null;
  respondedAt: string | null;
  sourceKind: "guest-list";
};

export const PRESENCE_TAG = "presence-dashboard";

function normalizeStringArray(value: unknown) {
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
      WITH expanded_responses AS (
        SELECT
          rsvp.id AS rsvp_id,
          rsvp.email AS response_email,
          rsvp.note AS response_note,
          rsvp.created_at AS response_created_at,
          response_item ->> 'guestId' AS guest_id,
          response_item ->> 'attendance' AS attendance
        FROM rsvp_confirmations rsvp
        CROSS JOIN LATERAL jsonb_array_elements(
          CASE
            WHEN jsonb_typeof(rsvp.guest_responses) = 'array' THEN rsvp.guest_responses
            ELSE '[]'::jsonb
          END
        ) response_item
      ),
      latest_guest_responses AS (
        SELECT DISTINCT ON (guest_id)
          guest_id,
          rsvp_id,
          response_email,
          response_note,
          response_created_at,
          attendance
        FROM expanded_responses
        WHERE guest_id IS NOT NULL AND guest_id <> ''
        ORDER BY guest_id, response_created_at DESC
      ),
      households AS (
        SELECT
          CASE
            WHEN ${
              guestListColumns.familyLabel
                ? "guest.family_label IS NOT NULL AND btrim(guest.family_label) <> ''"
                : "FALSE"
            }
              THEN 'family:' || btrim(${guestListColumns.familyLabel ? "guest.family_label" : "''"})
            ELSE 'guest:' || guest.id
          END AS group_key,
          jsonb_agg(guest.guest_name ORDER BY guest.guest_name) AS household_members
        FROM guest_list_entries guest
        WHERE guest.is_active = TRUE
        GROUP BY 1
      )
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
        ${guestListColumns.familyLabel ? "guest.family_label" : "NULL"} AS guest_family_label,
        ${guestListColumns.isChild ? "guest.is_child" : "FALSE"} AS guest_is_child,
        latest.rsvp_id,
        latest.response_email,
        latest.attendance,
        latest.response_note,
        latest.response_created_at,
        households.household_members
      FROM guest_list_entries guest
      LEFT JOIN latest_guest_responses latest
        ON latest.guest_id = guest.id
      LEFT JOIN households
        ON households.group_key = CASE
          WHEN ${
            guestListColumns.familyLabel
              ? "guest.family_label IS NOT NULL AND btrim(guest.family_label) <> ''"
              : "FALSE"
          }
            THEN 'family:' || btrim(${guestListColumns.familyLabel ? "guest.family_label" : "''"})
          ELSE 'guest:' || guest.id
        END
      WHERE guest.is_active = TRUE
      ORDER BY
        CASE
          WHEN latest.attendance IS NULL THEN 0
          WHEN latest.attendance = 'confirmed' THEN 1
          ELSE 2
        END,
        guest.guest_name ASC
    `);

    const guests: PresenceGuest[] = rows.map((row) => {
      const status = getPresenceStatus(row.attendance);
      const householdMembers = normalizeStringArray(row.household_members);

      return {
        id: row.guest_id,
        guestName: row.guest_name,
        whatsapp: row.guest_whatsapp,
        secondaryWhatsapp: row.guest_secondary_whatsapp,
        whatsappNormalized: row.guest_whatsapp_normalized,
        note: row.guest_note,
        familyLabel: row.guest_family_label,
        isChild: row.guest_is_child,
        householdMembers,
        status,
        rsvpId: row.rsvp_id,
        email: row.response_email,
        guestCount: row.attendance ? 1 : null,
        childCount: row.attendance === "confirmed" && row.guest_is_child ? 1 : 0,
        countableGuestCount:
          row.attendance === "confirmed" && !row.guest_is_child
            ? 1
            : row.attendance === "declined" || row.attendance === "confirmed"
              ? 0
              : null,
        companionNames: [],
        adultNames: householdMembers.filter((name) => name !== row.guest_name),
        responseNote: row.response_note,
        respondedAt: row.response_created_at?.toISOString() ?? null,
        sourceKind: "guest-list",
      };
    });

    const confirmed = guests.filter((guest) => guest.status === "confirmed");
    const declined = guests.filter((guest) => guest.status === "declined");
    const pending = guests.filter((guest) => guest.status === "pending");

    const confirmedCountableGuests = confirmed.filter((guest) => !guest.isChild).length;
    const confirmedChildren = confirmed.filter((guest) => guest.isChild).length;
    const declinedCountableGuests = declined.filter((guest) => !guest.isChild).length;
    const declinedChildren = declined.filter((guest) => guest.isChild).length;
    const pendingCountableGuests = pending.filter((guest) => !guest.isChild).length;
    const pendingChildren = pending.filter((guest) => guest.isChild).length;

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
        pendingCountableGuests,
        pendingChildren,
      },
      guests,
    };
  },
  ["presence-dashboard"],
  { revalidate: 15, tags: [PRESENCE_TAG, RSVP_TAG, GUEST_LIST_TAG] },
);
