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
  imageSrc?: string;
};

type WeddingGiftListProps = {
  gifts: WeddingGift[];
  itemsPerPage?: number;
};

export function WeddingGiftList({
  gifts,
  itemsPerPage = 8,
}: WeddingGiftListProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(gifts.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * itemsPerPage;
  const visibleGifts = gifts.slice(start, start + itemsPerPage);
  const startItem = gifts.length === 0 ? 0 : start + 1;
  const endItem = Math.min(start + itemsPerPage, gifts.length);

  return (
    <div>
      <div className="mb-4 rounded-[24px] border border-zinc-200 bg-white/80 p-3 shadow-sm sm:mb-5 sm:rounded-3xl sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Lista de presentes
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Mostrando {startItem}-{endItem} de {gifts.length} presentes
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 sm:flex">
            <span className="font-medium">Carrinho vazio</span>
            <span className="text-zinc-400">|</span>
            <span>Ver carrinho (0 presentes)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {visibleGifts.map((gift) => (
          <WeddingGiftCard
            key={gift.id}
            title={gift.title}
            description={gift.description}
            priceLabel={gift.priceLabel}
            category={gift.category}
            infinityPay={gift.infinityPay}
            imageSrc={gift.imageSrc}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const nextPage = index + 1;
            const isActive = nextPage === currentPage;

            return (
              <button
                key={nextPage}
                type="button"
                onClick={() => setPage(nextPage)}
                className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-black text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {nextPage}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Proxima
          </button>
        </div>
      ) : null}
    </div>
  );
}
