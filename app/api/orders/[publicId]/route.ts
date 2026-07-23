import { NextResponse } from "next/server";

import { serializeOrder } from "@/lib/orders";
import { getPrisma, withPrismaRetry } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await context.params;

  try {
    const prisma = getPrisma();
    const order = await withPrismaRetry(() => prisma.order.findUnique({
      where: { publicId },
      include: { items: true },
    }));

    if (!order) {
      return NextResponse.json({ error: { code: "ORDER_NOT_FOUND", message: "Pedido nao encontrado." } }, { status: 404 });
    }

    return NextResponse.json(serializeOrder(order));
  } catch (error) {
    return NextResponse.json({ error: { code: "ORDER_LOOKUP_FAILED", message: error instanceof Error ? error.message : "Nao foi possivel consultar o pedido." } }, { status: 500 });
  }
}
