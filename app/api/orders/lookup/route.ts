import { NextResponse } from "next/server";

import { serializeOrder } from "@/lib/orders";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    const orderNsu = searchParams.get("orderNsu");

    if (!publicId && !orderNsu) {
      return NextResponse.json({ error: { code: "INVALID_LOOKUP", message: "Informe publicId ou orderNsu para localizar o pedido." } }, { status: 400 });
    }

    const prisma = getPrisma();
    const order = await prisma.order.findFirst({
      where: publicId ? { publicId } : { providerOrderNsu: orderNsu ?? undefined },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: { code: "ORDER_NOT_FOUND", message: "Pedido nao encontrado." } }, { status: 404 });
    }

    return NextResponse.json(serializeOrder(order));
  } catch (error) {
    return NextResponse.json({ error: { code: "ORDER_LOOKUP_FAILED", message: error instanceof Error ? error.message : "Nao foi possivel localizar o pedido." } }, { status: 500 });
  }
}
