import { siteContent } from "@/content/siteContent";
import { formatPriceCents, parsePriceLabelToCents } from "@/lib/currency";
import { hasDatabaseUrl } from "@/lib/env";
import { getPrisma, withPrismaRetry } from "@/lib/prisma";

export type DisplayGift = {
  id: string;
  category?: string;
  title: string;
  description: string;
  priceLabel: string;
  priceCents: number;
  imageSrc?: string;
};

type StaticGiftSeed = {
  slug: string;
  title: string;
  description: string;
  category?: string;
  priceCents: number;
  imageSrc?: string;
  displayOrder: number;
};

type GiftRecord = {
  slug: string;
  title: string;
  description: string;
  category?: string | null;
  priceCents: number;
  imageSrc?: string | null;
};

const globalForGiftSeed = globalThis as typeof globalThis & {
  ensureGiftCatalogSeededPromise?: Promise<void>;
  ensureGiftCatalogSeededSignature?: string;
};

function getStaticGiftSeeds(): StaticGiftSeed[] {
  return siteContent.weddingGifts.map((gift, index) => ({
    slug: gift.id,
    title: gift.title,
    description: gift.description,
    category: gift.category,
    priceCents: parsePriceLabelToCents(gift.priceLabel),
    imageSrc: gift.imageSrc,
    displayOrder: index,
  }));
}

function mapGiftItemToDisplayGift(gift: GiftRecord): DisplayGift {
  return {
    id: gift.slug,
    category: gift.category ?? undefined,
    title: gift.title,
    description: gift.description,
    priceCents: gift.priceCents,
    priceLabel: formatPriceCents(gift.priceCents),
    imageSrc: gift.imageSrc ?? undefined,
  };
}

export function getStaticDisplayGifts(): DisplayGift[] {
  return getStaticGiftSeeds().map((gift) => ({
    id: gift.slug,
    category: gift.category,
    title: gift.title,
    description: gift.description,
    priceCents: gift.priceCents,
    priceLabel: formatPriceCents(gift.priceCents),
    imageSrc: gift.imageSrc,
  }));
}

export async function ensureGiftCatalogSeeded() {
  if (!hasDatabaseUrl()) {
    return;
  }

  const seeds = getStaticGiftSeeds();
  const seedSignature = JSON.stringify(
    seeds.map((gift) => [
      gift.slug,
      gift.title,
      gift.description,
      gift.category,
      gift.priceCents,
      gift.imageSrc,
      gift.displayOrder,
    ]),
  );

  if (
    globalForGiftSeed.ensureGiftCatalogSeededPromise &&
    globalForGiftSeed.ensureGiftCatalogSeededSignature === seedSignature
  ) {
    return globalForGiftSeed.ensureGiftCatalogSeededPromise;
  }

  globalForGiftSeed.ensureGiftCatalogSeededSignature = seedSignature;
  globalForGiftSeed.ensureGiftCatalogSeededPromise = withPrismaRetry(async () => {
    const prisma = getPrisma();
    const activeSeedSlugs = seeds.map((gift) => gift.slug);

    await prisma.giftItem.updateMany({
      where: {
        isActive: true,
        slug: {
          notIn: activeSeedSlugs,
        },
      },
      data: {
        isActive: false,
      },
    });

    await Promise.all(
      seeds.map((gift) =>
        prisma.giftItem.upsert({
          where: { slug: gift.slug },
          create: {
            slug: gift.slug,
            title: gift.title,
            description: gift.description,
            category: gift.category,
            priceCents: gift.priceCents,
            imageSrc: gift.imageSrc,
            isActive: true,
            displayOrder: gift.displayOrder,
          },
          update: {
            title: gift.title,
            description: gift.description,
            category: gift.category,
            priceCents: gift.priceCents,
            imageSrc: gift.imageSrc,
            isActive: true,
            displayOrder: gift.displayOrder,
          },
        }),
      ),
    );
  }).catch((error) => {
    globalForGiftSeed.ensureGiftCatalogSeededPromise = undefined;
    globalForGiftSeed.ensureGiftCatalogSeededSignature = undefined;
    throw error;
  });

  return globalForGiftSeed.ensureGiftCatalogSeededPromise;
}

export async function getDisplayGiftCatalog() {
  if (!hasDatabaseUrl()) {
    return getStaticDisplayGifts();
  }

  const gifts = await withPrismaRetry(async () => {
    await ensureGiftCatalogSeeded();

    const prisma = getPrisma();
    return prisma.giftItem.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
  });

  return gifts.map((gift) =>
    mapGiftItemToDisplayGift({
      slug: gift.slug,
      title: gift.title,
      description: gift.description,
      category: gift.category,
      priceCents: gift.priceCents,
      imageSrc: gift.imageSrc,
    }),
  );
}
