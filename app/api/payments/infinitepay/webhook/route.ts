import { NextResponse } from "next/server";
import { z } from "zod";

import { getOptionalServerEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const webhookSchema = z.object({
  invoice_slug: z.string().optional(),
  amount: z.number().int().optional(),
  paid_amount: z.number().int().optional(),
  installments: z.number().int().optional(),
  capture_method: z.string().optional(),
  transaction_nsu: z.string().optional(),
  order_nsu: z.string().optional(),
  receipt_url: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    const env = getOptionalServerEnv();
    const url = new URL(request.url);
    if (env.INFINITEPAY_WEBHOOK_SECRET && url.searchParams.get("token") !== env.INFINITEPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: { code: "INVALID_WEBHOOK_TOKEN", message: "Token do webhook invalido." } }, { status: 401 });
    }

    const payload = webhookSchema.parse(await request.json());
    if (!payload.order_nsu) {
      return NextResponse.json({ error: { code: "MISSING_ORDER_NSU", message: "Webhook sem order_nsu." } }, { status: 400 });
    }

    const prisma = getPrisma();
    const orWhere: Array<{ providerOrderNsu?: string; providerTransactionNsu?: string }> = [{ providerOrderNsu: payload.order_nsu }];
    if (payload.transaction_nsu) orWhere.push({ providerTransactionNsu: payload.transaction_nsu });

    const order = await prisma.order.findFirst({ where: { OR: orWhere } });
    if (!order) {
      return NextResponse.json({ error: { code: "ORDER_NOT_FOUND", message: "Pedido do webhook nao encontrado." } }, { status: 404 });
    }

    const dedupeKey = payload.transaction_nsu ?? `${payload.order_nsu}:${payload.invoice_slug ?? "no-slug"}:${payload.paid_amount ?? payload.amount ?? 0}`;
    try {
      await prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          providerEventId: payload.transaction_nsu,
          dedupeKey,
          providerPayload: payload,
          status: "received",
          processedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "P2002") {
        return NextResponse.json({ received: true, deduplicated: true });
      }
      throw error;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paidCents: payload.paid_amount ?? payload.amount ?? order.subtotalCents,
        paymentMethod: payload.capture_method ?? order.paymentMethod,
        providerSlug: payload.invoice_slug ?? order.providerSlug,
        providerTransactionNsu: payload.transaction_nsu ?? order.providerTransactionNsu,
        receiptUrl: payload.receipt_url ?? order.receiptUrl,
        paidAt: new Date(),
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: { code: "INVALID_WEBHOOK_PAYLOAD", message: "Payload do webhook invalido.", details: error.flatten() } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: "WEBHOOK_PROCESSING_FAILED", message: error instanceof Error ? error.message : "Nao foi possivel processar o webhook." } }, { status: 500 });
  }
}
