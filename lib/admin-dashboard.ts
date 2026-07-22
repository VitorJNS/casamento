import { unstable_cache } from "next/cache";

import { formatPriceCents } from "@/lib/currency";
import { toIsoString, toIsoStringOrNull } from "@/lib/date";
import { ORDERS_TAG } from "@/lib/orders";
import { getPresenceDashboardData, PRESENCE_TAG } from "@/lib/presence-dashboard";
import { getPrisma } from "@/lib/prisma";
import {
  ensureRsvpTable,
  GUEST_LIST_TAG,
  listGuestListEntries,
  normalizeWhatsapp,
  RSVP_TAG,
} from "@/lib/rsvp-store";

type RsvpRow = {
  id: string;
  guest_name: string;
  whatsapp: string;
  email: string | null;
  attendance: string;
  guest_count: number;
  child_count: number;
  companion_names: unknown;
  guest_responses: unknown;
  note: string | null;
  created_at: Date;
};

type RsvpGuestResponse = {
  guestId: string;
  guestName: string;
  attendance: "confirmed" | "declined";
};

function normalizeCompanionNames(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeGuestResponses(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is RsvpGuestResponse => {
    if (!item || typeof item !== "object") return false;

    return (
      "guestId" in item &&
      typeof item.guestId === "string" &&
      "guestName" in item &&
      typeof item.guestName === "string" &&
      "attendance" in item &&
      (item.attendance === "confirmed" || item.attendance === "declined")
    );
  });
}

export async function getAdminDashboardData() {
  const prisma = getPrisma();
  await ensureRsvpTable();

  const [orders, paidOrders, paidAggregate, rsvpRows, presenceData] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.findMany({
      where: { status: "paid" },
      orderBy: { paidAt: "desc" },
      include: { items: true },
    }),
    prisma.order.aggregate({
      where: { status: "paid" },
      _sum: { paidCents: true, subtotalCents: true },
      _count: { _all: true },
    }),
    prisma.$queryRawUnsafe<RsvpRow[]>(`
      SELECT
        id,
        guest_name,
        whatsapp,
        email,
        attendance,
        guest_count,
        child_count,
        companion_names,
        guest_responses,
        note,
        created_at
      FROM rsvp_confirmations
      ORDER BY created_at DESC
    `),
    getPresenceDashboardData(),
  ]);

  const paidGiftUnits = paidOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  const rsvpConfirmed = rsvpRows.filter((row) => row.attendance === "confirmed");
  const rsvpDeclined = rsvpRows.filter((row) => row.attendance === "declined");
  const confirmedGuests = presenceData.summary.confirmedCountableGuests;
  const confirmedChildren = presenceData.summary.confirmedChildren;
  const declinedGuests = presenceData.summary.declinedCountableGuests;
  const declinedChildren = presenceData.summary.declinedChildren;
  const guestListEntries = await listGuestListEntries({ includeInactive: false });
  const presenceById = new Map(dataToPresenceMap(presenceData.guests).map((entry) => [entry.id, entry]));

  return {
    summary: {
      totalRsvps: rsvpRows.length,
      confirmedRsvps: rsvpConfirmed.length,
      declinedRsvps: rsvpDeclined.length,
      confirmedGuests,
      confirmedChildren,
      declinedGuests,
      declinedChildren,
      totalOrders: orders.length,
      paidOrders: paidAggregate._count._all,
      totalReceivedCents: paidAggregate._sum.subtotalCents ?? 0,
      totalReceivedLabel: formatPriceCents(paidAggregate._sum.subtotalCents ?? 0),
      totalCheckoutPaidCents: paidAggregate._sum.paidCents ?? 0,
      totalCheckoutPaidLabel: formatPriceCents(paidAggregate._sum.paidCents ?? 0),
      totalCheckoutDifferenceCents:
        (paidAggregate._sum.paidCents ?? 0) - (paidAggregate._sum.subtotalCents ?? 0),
      totalCheckoutDifferenceLabel: formatPriceCents(
        (paidAggregate._sum.paidCents ?? 0) - (paidAggregate._sum.subtotalCents ?? 0),
      ),
      paidGiftUnits,
    },
    rsvps: rsvpRows.map((row) => ({
      id: row.id,
      guestName: row.guest_name,
      whatsapp: row.whatsapp,
      email: row.email,
      attendance: row.attendance,
      guestCount: row.guest_count,
      childCount: row.child_count,
      countableGuestCount: Math.max(row.guest_count - row.child_count, 0),
      companionNames: normalizeCompanionNames(row.companion_names),
      guestResponses: normalizeGuestResponses(row.guest_responses),
      note: row.note,
      createdAt: toIsoString(row.created_at),
    })),
    paidOrders: paidOrders.map((order) => ({
      publicId: order.publicId,
      guestName: order.guestName,
      guestEmail: order.guestEmail,
      subtotalCents: order.subtotalCents,
      subtotalLabel: formatPriceCents(order.subtotalCents),
      paidCents: order.paidCents,
      paidLabel: formatPriceCents(order.paidCents),
      checkoutDifferenceCents: order.paidCents - order.subtotalCents,
      checkoutDifferenceLabel: formatPriceCents(order.paidCents - order.subtotalCents),
      paidAt: toIsoStringOrNull(order.paidAt),
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => ({
        id: item.id,
        title: item.titleSnapshot,
        quantity: item.quantity,
        lineTotalLabel: formatPriceCents(item.lineTotalCents),
        })),
    })),
    guestPresence: presenceData,
    guestList: guestListEntries.map((guest) => {
      const presence = presenceById.get(guest.id);

      return {
        id: guest.id,
        guestName: guest.guest_name,
        whatsapp: guest.whatsapp,
        secondaryWhatsapp: guest.secondary_whatsapp,
        note: guest.note,
        familyLabel: guest.family_label,
        isChild: guest.is_child,
        status: presence?.status ?? "pending",
        rsvpId: presence?.rsvpId ?? null,
        email: presence?.email ?? guest.email ?? null,
        guestCount: presence?.guestCount ?? null,
        childCount: presence?.childCount ?? 0,
        countableGuestCount: presence?.countableGuestCount ?? null,
        companionNames: presence?.companionNames ?? [],
        adultNames: presence?.adultNames ?? [],
        householdMembers: presence?.householdMembers ?? [],
        responseNote: presence?.responseNote ?? null,
        respondedAt: presence?.respondedAt ?? null,
        sourceKind: "guest-list" as const,
        whatsappNormalized: normalizeWhatsapp(guest.whatsapp),
      };
    }),
  };
}

function dataToPresenceMap(
  guests: Awaited<ReturnType<typeof getPresenceDashboardData>>["guests"],
) {
  return guests;
}

export async function getAdminGuestsData() {
  return getAdminGuestsDataCached();
}

const getAdminGuestsDataCached = unstable_cache(
  async () => {
  const prisma = getPrisma();
  await ensureRsvpTable();

  const [rsvpRows, presenceData, guestListEntries] = await Promise.all([
    prisma.$queryRawUnsafe<RsvpRow[]>(`
      SELECT
        id,
        guest_name,
        whatsapp,
        email,
        attendance,
        guest_count,
        child_count,
        companion_names,
        guest_responses,
        note,
        created_at
      FROM rsvp_confirmations
      ORDER BY created_at DESC
    `),
    getPresenceDashboardData(),
    listGuestListEntries({ includeInactive: false }),
  ]);

  const rsvpConfirmed = rsvpRows.filter((row) => row.attendance === "confirmed");
  const rsvpDeclined = rsvpRows.filter((row) => row.attendance === "declined");
  const confirmedGuests = presenceData.summary.confirmedCountableGuests;
  const confirmedChildren = presenceData.summary.confirmedChildren;
  const declinedGuests = presenceData.summary.declinedCountableGuests;
  const declinedChildren = presenceData.summary.declinedChildren;

  const presenceById = new Map(dataToPresenceMap(presenceData.guests).map((entry) => [entry.id, entry]));

  return {
    summary: {
      totalRsvps: rsvpRows.length,
      confirmedRsvps: rsvpConfirmed.length,
      declinedRsvps: rsvpDeclined.length,
      confirmedGuests,
      confirmedChildren,
      declinedGuests,
      declinedChildren,
    },
    rsvps: rsvpRows.map((row) => ({
      id: row.id,
      guestName: row.guest_name,
      whatsapp: row.whatsapp,
      email: row.email,
      attendance: row.attendance,
      guestCount: row.guest_count,
      childCount: row.child_count,
      countableGuestCount: Math.max(row.guest_count - row.child_count, 0),
      companionNames: normalizeCompanionNames(row.companion_names),
      guestResponses: normalizeGuestResponses(row.guest_responses),
      note: row.note,
      createdAt: toIsoString(row.created_at),
    })),
    guestPresence: presenceData,
    guestList: guestListEntries.map((guest) => {
      const presence = presenceById.get(guest.id);

      return {
        id: guest.id,
        guestName: guest.guest_name,
        whatsapp: guest.whatsapp,
        secondaryWhatsapp: guest.secondary_whatsapp,
        note: guest.note,
        familyLabel: guest.family_label,
        isChild: guest.is_child,
        status: presence?.status ?? "pending",
        rsvpId: presence?.rsvpId ?? null,
        email: presence?.email ?? guest.email ?? null,
        guestCount: presence?.guestCount ?? null,
        childCount: presence?.childCount ?? 0,
        countableGuestCount: presence?.countableGuestCount ?? null,
        companionNames: presence?.companionNames ?? [],
        adultNames: presence?.adultNames ?? [],
        householdMembers: presence?.householdMembers ?? [],
        responseNote: presence?.responseNote ?? null,
        respondedAt: presence?.respondedAt ?? null,
        sourceKind: "guest-list" as const,
        whatsappNormalized: normalizeWhatsapp(guest.whatsapp),
      };
    }),
  };
  },
  ["admin-guests"],
  { revalidate: 15, tags: [RSVP_TAG, GUEST_LIST_TAG, PRESENCE_TAG] },
);

export async function getAdminGiftsData() {
  return getAdminGiftsDataCached();
}

const getAdminGiftsDataCached = unstable_cache(
  async () => {
  const prisma = getPrisma();

  const [paidOrders, paidAggregate] = await Promise.all([
    prisma.order.findMany({
      where: { status: "paid" },
      orderBy: { paidAt: "desc" },
      include: { items: true },
    }),
    prisma.order.aggregate({
      where: { status: "paid" },
      _sum: { paidCents: true, subtotalCents: true },
      _count: { _all: true },
    }),
  ]);

  const paidGiftUnits = paidOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  return {
    summary: {
      paidOrders: paidAggregate._count._all,
      totalReceivedCents: paidAggregate._sum.subtotalCents ?? 0,
      totalReceivedLabel: formatPriceCents(paidAggregate._sum.subtotalCents ?? 0),
      totalCheckoutPaidCents: paidAggregate._sum.paidCents ?? 0,
      totalCheckoutPaidLabel: formatPriceCents(paidAggregate._sum.paidCents ?? 0),
      totalCheckoutDifferenceCents:
        (paidAggregate._sum.paidCents ?? 0) - (paidAggregate._sum.subtotalCents ?? 0),
      totalCheckoutDifferenceLabel: formatPriceCents(
        (paidAggregate._sum.paidCents ?? 0) - (paidAggregate._sum.subtotalCents ?? 0),
      ),
      paidGiftUnits,
    },
    paidOrders: paidOrders.map((order) => ({
      publicId: order.publicId,
      guestName: order.guestName,
      guestEmail: order.guestEmail,
      subtotalCents: order.subtotalCents,
      subtotalLabel: formatPriceCents(order.subtotalCents),
      paidCents: order.paidCents,
      paidLabel: formatPriceCents(order.paidCents),
      checkoutDifferenceCents: order.paidCents - order.subtotalCents,
      checkoutDifferenceLabel: formatPriceCents(order.paidCents - order.subtotalCents),
      paidAt: toIsoStringOrNull(order.paidAt),
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => ({
        id: item.id,
        title: item.titleSnapshot,
        quantity: item.quantity,
        lineTotalLabel: formatPriceCents(item.lineTotalCents),
      })),
    })),
  };
  },
  ["admin-gifts"],
  { revalidate: 15, tags: [ORDERS_TAG] },
);
