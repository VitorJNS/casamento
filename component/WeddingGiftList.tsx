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
    <div ref={listTopRef} className="relative">
      <div className="mb-7 border-y border-[#c9b88b]/60 px-3 py-3 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-h-11 items-center">
            <p className="text-sm text-[#66745c]">
              Mostrando {startItem}-{endItem} de {sortedGifts.length} presentes
            </p>
          </div>

          <div className="flex w-full items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#d8ddcf] bg-white/80 px-3 py-2 text-sm text-[#4f6146] sm:h-11 sm:w-[190px] sm:flex-none">
              <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f75]">
                Ordenar
              </span>
              <select
                value={sortOrder}
                onChange={(event) =>
                  handleSortChange(
                    event.target.value as "default" | "price-asc" | "price-desc",
                  )
                }
                className="min-w-0 bg-transparent text-sm font-medium text-[#2f352b] outline-none"
              >
                <option value="default">Padrão</option>
                <option value="price-asc">Mais barato</option>
                <option value="price-desc">Mais caro</option>
              </select>
            </label>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Ver carrinho"
              className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--olive))] px-3 text-white shadow-sm transition hover:opacity-95 sm:hidden"
            >
              <span className="relative inline-flex text-xs font-semibold">
                Ver
                {cartQuantity > 0 ? (
                  <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[rgb(var(--olive))]">
                    {cartQuantity}
                  </span>
                ) : null}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="hidden h-11 items-center overflow-hidden rounded-lg border border-[#c9b88b] bg-[#fffefa]/82 text-[#4f6146] shadow-[0_6px_14px_rgba(79,97,70,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(79,97,70,0.10)] sm:flex"
            >
              <span className="flex h-full items-center gap-2.5 px-3">
                <span className="relative h-6 w-6" aria-hidden="true">
                  <span className="absolute bottom-0 left-1/2 h-[0.95rem] w-[1.15rem] -translate-x-1/2 rounded-sm border-[1.5px] border-[#4f6146]" />
                  <span className="absolute left-1/2 top-0.5 h-3.5 w-3.5 -translate-x-1/2 rounded-t-full border-[1.5px] border-b-0 border-[#4f6146]" />
                  {cartQuantity > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b19cd9] px-1 text-[9px] font-semibold text-white">
                      {cartQuantity}
                    </span>
                  ) : null}
                </span>
                <span className="whitespace-nowrap text-sm font-semibold">
                  Ver carrinho
                </span>
              </span>
              <span className="h-full w-px bg-[#c9b88b]" />
              <span className="flex h-full min-w-20 items-center justify-center px-3 text-sm text-[#4f6146]">
                {cartQuantity > 0
                  ? `${cartQuantity} ${cartQuantity === 1 ? "item" : "itens"}`
                  : "Nenhum item"}
              </span>
              <span className="h-full w-px bg-[#c9b88b]" />
              <span className="flex h-full min-w-24 items-center justify-center px-3 text-base font-semibold text-[#4f6146]">
                {cartSubtotalLabel}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 xl:grid-cols-5">
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
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-[#d8ddcf] bg-[#fffefa]/70 px-4 py-2 text-sm font-medium text-[#66745c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
                    ? "bg-[rgb(var(--olive))] text-white"
                    : "border border-[#d8ddcf] bg-[#fffefa]/70 text-[#66745c] hover:bg-white"
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
            className="rounded-full border border-[#d8ddcf] bg-[#fffefa]/70 px-4 py-2 text-sm font-medium text-[#66745c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      ) : null}
    </div>
  );
}
