import { formatPriceCents } from "@/lib/currency";
import { toIsoString, toIsoStringOrNull } from "@/lib/date";

type OrderStatusValue =
  | "draft"
  | "checkout_created"
  | "pending_payment"
  | "paid"
  | "failed"
  | "canceled"
  | "expired";

type OrderWithItems = {
  publicId: string;
  guestName: string;
  guestEmail: string;
  guestMessage: string | null;
  status: OrderStatusValue;
  subtotalCents: number;
  paidCents: number;
  paymentMethod: string | null;
  receiptUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    giftItemId: string;
    titleSnapshot: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }>;
};

export const ORDERS_TAG = "orders";

export function createPublicOrderId() {
  return `ord_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

export function createProviderOrderNsu(publicId: string) {
  return `casamento_${publicId}`;
}

export function getOrderStatusLabel(status: OrderStatusValue) {
  switch (status) {
    case "paid":
      return "Pago";
    case "failed":
      return "Falhou";
    case "canceled":
      return "Cancelado";
    case "expired":
      return "Expirado";
    default:
      return "Aguardando confirmacao";
  }
}

export function serializeOrder(order: OrderWithItems) {
  return {
    publicId: order.publicId,
    guestName: order.guestName,
    guestEmail: order.guestEmail,
    guestMessage: order.guestMessage,
    status: order.status,
    statusLabel: getOrderStatusLabel(order.status),
    subtotalCents: order.subtotalCents,
    subtotalLabel: formatPriceCents(order.subtotalCents),
    paidCents: order.paidCents,
    paidLabel: formatPriceCents(order.paidCents),
    paymentMethod: order.paymentMethod,
    receiptUrl: order.receiptUrl,
    paidAt: toIsoStringOrNull(order.paidAt),
    createdAt: toIsoString(order.createdAt),
    updatedAt: toIsoString(order.updatedAt),
    items: order.items.map((item) => ({
      id: item.id,
      giftId: item.giftItemId,
      title: item.titleSnapshot,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      unitPriceLabel: formatPriceCents(item.unitPriceCents),
      lineTotalCents: item.lineTotalCents,
      lineTotalLabel: formatPriceCents(item.lineTotalCents),
    })),
  };
}
