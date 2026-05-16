import Image from "next/image";

type WeddingGiftCardProps = {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  category?: string;
  imageSrc?: string;
  quantityInCart: number;
  onAddToCart: (giftId: string) => void;
  onIncreaseCartItem: (giftId: string) => void;
  onDecreaseCartItem: (giftId: string) => void;
};

export function WeddingGiftCard({
  id,
  title,
  description,
  priceLabel,
  category,
  imageSrc,
  quantityInCart,
  onAddToCart,
  onIncreaseCartItem,
  onDecreaseCartItem,
}: WeddingGiftCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:rounded-[26px]">
      <div className="relative aspect-[4/3] border-b border-zinc-200">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgb(var(--lavender) / 0.32), transparent 42%), linear-gradient(160deg, rgb(var(--lavender) / 0.14), rgb(var(--olive) / 0.12))",
            }}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="min-h-14 sm:min-h-16">
          {category ? (
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:block">
              {category}
            </p>
          ) : null}
          <h3 className="mt-1 line-clamp-2 text-center text-[0.96rem] font-medium leading-6 text-zinc-900 sm:mt-1 sm:text-left sm:text-base sm:font-semibold sm:leading-6">
            {title}
          </h3>
        </div>

        <p className="mt-2 hidden line-clamp-2 min-h-10 text-sm leading-5 text-zinc-600 sm:block">
          {description}
        </p>

        <div className="mt-3 flex items-center justify-center sm:mt-5">
          <div
            className="text-center text-[0.98rem] font-semibold text-[rgb(var(--olive))] sm:px-3 sm:text-base sm:text-zinc-900"
            style={{
              backgroundColor: "transparent",
            }}
          >
            {priceLabel}
          </div>
        </div>

        <div className="mt-auto pt-4 sm:pt-6">
          {quantityInCart > 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-[14px] border border-zinc-200 bg-zinc-50 px-3 py-2.5 sm:gap-3 sm:rounded-full sm:bg-transparent sm:px-0 sm:py-0">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                onClick={() => onDecreaseCartItem(id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-500 shadow-sm transition hover:border-zinc-400 hover:text-zinc-800 sm:h-10 sm:w-10"
              >
                <span className="-mt-0.5 text-[1.4rem] leading-none sm:text-[1.7rem]">-</span>
              </button>
              <span className="min-w-6 text-center text-sm font-semibold text-zinc-900 sm:min-w-7 sm:text-base">
                {quantityInCart}
              </span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                onClick={() => onIncreaseCartItem(id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-[rgb(var(--olive))] shadow-sm transition hover:border-[rgb(var(--olive))/0.45] hover:bg-[rgb(var(--olive))/0.08] sm:h-10 sm:w-10"
              >
                <span className="-mt-0.5 text-[1.4rem] leading-none sm:text-[1.7rem]">+</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(id)}
              className="btn-primary flex w-full items-center justify-center rounded-[12px] px-4 py-2.5 text-sm font-semibold transition sm:rounded-full sm:py-3"
            >
              Adicionar ao carrinho
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
