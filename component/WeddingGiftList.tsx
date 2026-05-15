"use client";

import { useState } from "react";

import { WeddingGiftCard } from "@/component/WeddingGiftCard";

type WeddingGift = {
  id: string;
  category?: string;
  title: string;
  description: string;
  priceLabel: string;
  infinityPay?: string;
  stripeLink?: string;
  note?: string;
};

type WeddingGiftListProps = {
  gifts: WeddingGift[];
  initialItems?: number;
  extraItems?: number;
};

export function WeddingGiftList({
  gifts,
  initialItems = 6,
  extraItems = 6,
}: WeddingGiftListProps) {
  const [visibleCount, setVisibleCount] = useState(initialItems);

  const visibleGifts = gifts.slice(0, visibleCount);
  const hasMore = visibleCount < gifts.length;
  const canCollapse = gifts.length > initialItems && visibleCount > initialItems;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
        <p>
          Mostrando {visibleGifts.length} de {gifts.length} presentes
        </p>
        <p className="font-medium">Escolha um presente para abrir o link de pagamento</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleGifts.map((gift) => (
          <WeddingGiftCard
            key={gift.id}
            title={gift.title}
            description={gift.description}
            priceLabel={gift.priceLabel}
            category={gift.category}
            note={gift.note}
            infinityPay={gift.infinityPay}
            stripeLink={gift.stripeLink}
          />
        ))}
      </div>

      {hasMore || canCollapse ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {hasMore ? (
            <button
              type="button"
              onClick={() =>
                setVisibleCount((current) => Math.min(gifts.length, current + extraItems))
              }
              className="btn-secondary"
            >
              Ver mais presentes
            </button>
          ) : null}

          {canCollapse ? (
            <button
              type="button"
              onClick={() => setVisibleCount(initialItems)}
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white"
            >
              Ver menos
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
