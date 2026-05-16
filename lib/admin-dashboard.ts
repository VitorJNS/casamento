import { formatPriceCents } from "@/lib/currency";
import { getPrisma } from "@/lib/prisma";

type RsvpRow = {
  id: string;
  guest_name: string;
  whatsapp: string;
  email: string | null;
  attendance: string;
  guest_count: number;
  companion_names: unknown;
  note: string | null;
  created_at: Date;
};

function normalizeCompanionNames(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function getAdminDashboardData() {
  const prisma = getPrisma();

  const [orders, paidOrders, paidAggregate, rsvpRows] = await Promise.all([
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
        companion_names,
        note,
        created_at
      FROM rsvp_confirmations
      ORDER BY created_at DESC
    `),
  ]);

  const paidGiftUnits = paidOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  const rsvpConfirmed = rsvpRows.filter((row) => row.attendance === "confirmed");
  const rsvpDeclined = rsvpRows.filter((row) => row.attendance === "declined");
  const confirmedGuests = rsvpConfirmed.reduce(
    (sum, row) => sum + row.guest_count,
    0,
  );

  return {
    summary: {
      totalRsvps: rsvpRows.length,
      confirmedRsvps: rsvpConfirmed.length,
      declinedRsvps: rsvpDeclined.length,
      confirmedGuests,
      totalOrders: orders.length,
      paidOrders: paidAggregate._count._all,
      totalReceivedCents: paidAggregate._sum.paidCents ?? 0,
      totalReceivedLabel: formatPriceCents(paidAggregate._sum.paidCents ?? 0),
      paidGiftUnits,
    },
    rsvps: rsvpRows.map((row) => ({
      id: row.id,
      guestName: row.guest_name,
      whatsapp: row.whatsapp,
      email: row.email,
      attendance: row.attendance,
      guestCount: row.guest_count,
      companionNames: normalizeCompanionNames(row.companion_names),
      note: row.note,
      createdAt: row.created_at.toISOString(),
    })),
    paidOrders: paidOrders.map((order) => ({
      publicId: order.publicId,
      guestName: order.guestName,
      guestEmail: order.guestEmail,
      subtotalCents: order.subtotalCents,
      subtotalLabel: formatPriceCents(order.subtotalCents),
      paidCents: order.paidCents,
      paidLabel: formatPriceCents(order.paidCents),
      paidAt: order.paidAt?.toISOString() ?? null,
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => ({
        id: item.id,
        title: item.titleSnapshot,
        quantity: item.quantity,
        lineTotalLabel: formatPriceCents(item.lineTotalCents),
      })),
    })),
  };
}
