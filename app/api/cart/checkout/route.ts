import { NextResponse } from "next/server";
import { z } from "zod";

import { ensureGiftCatalogSeeded } from "@/lib/gifts";
import { createInfinitePayCheckoutLink } from "@/lib/infinitepay";
import { createProviderOrderNsu, createPublicOrderId } from "@/lib/orders";
import { getPrisma, withPrismaRetry } from "@/lib/prisma";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  guestName: z.string().trim().min(2).max(120),
  guestEmail: z.string().trim().email().max(160),
  guestMessage: z.string().trim().max(500).optional().default(""),
  items: z.array(z.object({
    giftId: z.string().min(1),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(20),
});

type GiftRecord = {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
};

function getSafeCheckoutDescription(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\w\s.,:;!?'"()/-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: Request) {
  try {
    const payload = checkoutSchema.parse(await request.json());
    const prisma = getPrisma();
    const uniqueIds = [...new Set(payload.items.map((item) => item.giftId))];
    const giftItems = (await withPrismaRetry(async () => {
      await ensureGiftCatalogSeeded();

      return prisma.giftItem.findMany({
        where: { slug: { in: uniqueIds }, isActive: true },
      });
    })) as GiftRecord[];

    if (giftItems.length !== uniqueIds.length) {
      return NextResponse.json({ error: { code: "INVALID_ITEMS", message: "Um ou mais presentes do carrinho nao estao disponiveis." } }, { status: 400 });
    }

    const giftBySlug = new Map<string, GiftRecord>();
    for (const gift of giftItems) {
      giftBySlug.set(gift.slug, gift);
    }

    const lineItems = payload.items.map((item) => {
      const gift = giftBySlug.get(item.giftId);
      if (!gift) throw new Error(`Presente ${item.giftId} nao encontrado.`);
      return { gift, quantity: item.quantity, lineTotalCents: gift.priceCents * item.quantity };
    });

    const subtotalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const publicId = createPublicOrderId();
    const providerOrderNsu = createProviderOrderNsu(publicId);

    const order = await withPrismaRetry(() => prisma.order.create({
      data: {
        publicId,
        guestName: payload.guestName,
        guestEmail: payload.guestEmail,
        guestMessage: payload.guestMessage || null,
        status: "draft",
        subtotalCents,
        provider: "infinitepay",
        providerOrderNsu,
        items: {
          create: lineItems.map((item) => ({
            giftItemId: item.gift.id,
            titleSnapshot: item.gift.title,
            unitPriceCents: item.gift.priceCents,
            quantity: item.quantity,
            lineTotalCents: item.lineTotalCents,
          })),
        },
      },
    }));

    try {
      const checkout = await createInfinitePayCheckoutLink({
        orderPublicId: publicId,
        orderNsu: providerOrderNsu,
        guestName: payload.guestName,
        guestEmail: payload.guestEmail,
        items: lineItems.map((item) => ({
          quantity: item.quantity,
          price: item.gift.priceCents,
          description: getSafeCheckoutDescription(item.gift.title),
        })),
      });

      await withPrismaRetry(() => prisma.order.update({
        where: { id: order.id },
        data: {
          status: "checkout_created",
          providerSlug: checkout.slug,
          providerCheckoutUrl: checkout.checkoutUrl,
        },
      }));

      return NextResponse.json({ orderPublicId: publicId, checkoutUrl: checkout.checkoutUrl });
    } catch (error) {
      await withPrismaRetry(() =>
        prisma.order.update({ where: { id: order.id }, data: { status: "failed" } }),
      );
      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Dados do checkout invalidos.", details: error.flatten() } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: "CHECKOUT_CREATE_FAILED", message: error instanceof Error ? error.message : "Nao foi possivel criar o checkout." } }, { status: 500 });
  }
}
