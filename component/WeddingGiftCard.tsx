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
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#ded6c5] bg-[#f8f5ed]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
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

      <div className="flex flex-1 flex-col pt-3">
        <div className="min-h-[5.25rem] sm:min-h-[5.5rem]">
          {category ? (
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b8f75] sm:block">
              {category}
            </p>
          ) : null}
          <h3
            className="line-clamp-3 break-words text-[0.9rem] font-medium leading-5 text-[#2f352b] sm:text-base"
            title={title}
          >
            {title}
          </h3>
        </div>

        <p className="mt-1 hidden line-clamp-2 min-h-10 text-xs leading-5 text-[#6d705f] sm:block">
          {description}
        </p>

        <div className="mt-auto flex items-center pt-2 sm:pt-3">
          <div className="text-[0.95rem] font-semibold text-[rgb(var(--olive))]">
            {priceLabel}
          </div>
        </div>

        <div className="h-10 pt-3">
          {quantityInCart > 0 ? (
            <div className="flex h-10 items-center justify-between rounded-lg border border-[rgb(var(--olive))/0.35] bg-[#fffefa]/85 px-2">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                onClick={() => onDecreaseCartItem(id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d8ddcf] bg-white text-base leading-none text-[#66745c] transition hover:border-[rgb(var(--olive))]"
              >
                <span className="-mt-0.5">-</span>
              </button>
              <span className="min-w-6 text-center text-sm font-semibold text-[#2f352b]">
                {quantityInCart}
              </span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                onClick={() => onIncreaseCartItem(id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d8ddcf] bg-white text-base leading-none text-[rgb(var(--olive))] transition hover:border-[rgb(var(--olive))] hover:bg-[rgb(var(--olive))/0.08]"
              >
                <span className="-mt-0.5">+</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(id)}
              className="flex h-10 w-full items-center justify-center rounded-lg border border-[rgb(var(--olive))/0.65] bg-[#fffefa]/80 px-3 text-sm font-medium text-[rgb(var(--olive))] transition hover:bg-[rgb(var(--olive))/0.08]"
            >
              Adicionar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
