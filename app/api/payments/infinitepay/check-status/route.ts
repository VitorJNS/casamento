import { NextResponse } from "next/server";
import { z } from "zod";

import { checkInfinitePayPayment } from "@/lib/infinitepay";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  publicId: z.string().min(1).optional(),
  orderNsu: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const payload = schema.parse({
      publicId: typeof rawBody?.publicId === "string" ? rawBody.publicId : typeof rawBody?.orderId === "string" ? rawBody.orderId : undefined,
      orderNsu: typeof rawBody?.orderNsu === "string" ? rawBody.orderNsu : typeof rawBody?.order_nsu === "string" ? rawBody.order_nsu : undefined,
    });

    if (!payload.publicId && !payload.orderNsu) {
      return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Informe publicId ou orderNsu para reconciliar." } }, { status: 400 });
    }

    const prisma = getPrisma();
    const order = await prisma.order.findFirst({
      where: payload.publicId ? { publicId: payload.publicId } : { providerOrderNsu: payload.orderNsu },
    });

    if (!order || !order.providerOrderNsu) {
      return NextResponse.json({ error: { code: "ORDER_NOT_FOUND", message: "Pedido nao encontrado para reconciliacao." } }, { status: 404 });
    }

    const payment = await checkInfinitePayPayment({
      orderNsu: order.providerOrderNsu,
      transactionNsu: order.providerTransactionNsu,
      slug: order.providerSlug,
    });

    if (payment.success === false && payment.message) {
      return NextResponse.json({ error: { code: "PAYMENT_CHECK_NOT_CONFIRMED", message: payment.message } }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: payment.paid ? "paid" : "pending_payment",
        paymentMethod: payment.capture_method ?? order.paymentMethod,
        paidCents: payment.paid_amount ?? order.paidCents,
        paidAt: payment.paid ? order.paidAt ?? new Date() : order.paidAt,
      },
      include: { items: true },
    });

    return NextResponse.json({
      publicId: updated.publicId,
      status: updated.status,
      paid: payment.paid,
      paymentMethod: updated.paymentMethod,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Pedido invalido para reconciliacao.", details: error.flatten() } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: "PAYMENT_CHECK_FAILED", message: error instanceof Error ? error.message : "Nao foi possivel verificar o pagamento." } }, { status: 500 });
  }
}
