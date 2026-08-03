"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { WeddingGiftCard } from "@/component/WeddingGiftCard";
import type { DisplayGift } from "@/lib/gifts";

type WeddingGiftListProps = {
  gifts: DisplayGift[];
  itemsPerPage?: number;
  page: number;
  onPageChange: (page: number) => void;
  cartQuantity: number;
  cartSubtotalLabel: string;
  introText?: string;
  onOpenCart: () => void;
  getQuantityInCart: (giftId: string) => number;
  onAddToCart: (giftId: string) => void;
  onIncreaseCartItem: (giftId: string) => void;
  onDecreaseCartItem: (giftId: string) => void;
};

export function WeddingGiftList({
  gifts,
  itemsPerPage = 10,
  page,
  onPageChange,
  cartQuantity,
  cartSubtotalLabel,
  introText,
  onOpenCart,
  getQuantityInCart,
  onAddToCart,
  onIncreaseCartItem,
  onDecreaseCartItem,
}: WeddingGiftListProps) {
  const [sortOrder, setSortOrder] = useState<"default" | "price-asc" | "price-desc">(
    "default",
  );
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef(false);

  const sortedGifts = useMemo(() => {
    const next = [...gifts];

    if (sortOrder === "price-asc") {
      next.sort((a, b) => a.priceCents - b.priceCents);
    } else if (sortOrder === "price-desc") {
      next.sort((a, b) => b.priceCents - a.priceCents);
    }

    return next;
  }, [gifts, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedGifts.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * itemsPerPage;
  const visibleGifts = sortedGifts.slice(start, start + itemsPerPage);
  const startItem = sortedGifts.length === 0 ? 0 : start + 1;
  const endItem = Math.min(start + itemsPerPage, sortedGifts.length);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage, sortOrder]);

  function handleSortChange(value: "default" | "price-asc" | "price-desc") {
    setSortOrder(value);
    onPageChange(1);
  }

  return (
    <div ref={listTopRef}>
      <div className="mb-4 rounded-[24px] border border-zinc-200 bg-white/80 p-3 shadow-sm sm:mb-5 sm:rounded-3xl sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Lista de presentes
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Mostrando {startItem}-{endItem} de {sortedGifts.length} presentes
            </p>
            {introText ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66745c]">
                {introText}
              </p>
            ) : null}
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[18px] border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm sm:min-w-[190px] sm:flex-none sm:rounded-full">
              <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Ordenar
              </span>
              <select
                value={sortOrder}
                onChange={(event) =>
                  handleSortChange(
                    event.target.value as "default" | "price-asc" | "price-desc",
                  )
                }
                className="bg-transparent text-sm font-medium text-zinc-800 outline-none"
              >
                <option value="default">Padrao</option>
                <option value="price-asc">Mais barato</option>
                <option value="price-desc">Mais caro</option>
              </select>
            </label>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Ver carrinho"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[16px] bg-[rgb(var(--olive))] text-white shadow-sm transition hover:opacity-95 sm:hidden"
            >
              <span className="relative inline-flex">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="20" r="1.25" />
                  <circle cx="18" cy="20" r="1.25" />
                  <path d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.76L20 7H7" />
                </svg>
                {cartQuantity > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[rgb(var(--olive))]">
                    {cartQuantity}
                  </span>
                ) : null}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="hidden h-[42px] w-[190px] items-center justify-between rounded-full bg-[rgb(var(--olive))] px-3 py-2 text-left text-white shadow-sm transition hover:opacity-95 sm:flex"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
                  Ver carrinho
                </p>
                <p className="text-xs font-semibold leading-none">
                  {cartQuantity > 0
                    ? `${cartQuantity} ${cartQuantity === 1 ? "item" : "itens"}`
                    : "Nenhum item"}
                </p>
              </div>
              <p className="text-xs font-semibold">{cartSubtotalLabel}</p>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {visibleGifts.map((gift) => (
          <WeddingGiftCard
            key={gift.id}
            id={gift.id}
            title={gift.title}
            description={gift.description}
            priceLabel={gift.priceLabel}
            category={gift.category}
            imageSrc={gift.imageSrc}
            quantityInCart={getQuantityInCart(gift.id)}
            onAddToCart={onAddToCart}
            onIncreaseCartItem={onIncreaseCartItem}
            onDecreaseCartItem={onDecreaseCartItem}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                onClick={() => onPageChange(nextPage)}
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
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
