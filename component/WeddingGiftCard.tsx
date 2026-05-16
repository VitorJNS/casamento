import Image from "next/image";

type WeddingGiftCardProps = {
  title: string;
  description: string;
  priceLabel: string;
  category?: string;
  infinityPay?: string;
  imageSrc?: string;
};

export function WeddingGiftCard({
  title,
  description,
  priceLabel,
  category,
  infinityPay,
  imageSrc,
}: WeddingGiftCardProps) {
  const actionHref = infinityPay;
  const actionLabel = "Presentear";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-sm sm:rounded-[26px]">
      <div className="relative aspect-[4/3] border-b border-zinc-200">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
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
          {actionHref ? (
            <a
              href={actionHref}
              target="_blank"
              rel="noreferrer"
              className="btn-primary flex w-full items-center justify-center rounded-[12px] px-4 py-2.5 text-sm font-semibold transition sm:rounded-full sm:py-3"
            >
              {actionLabel}
            </a>
          ) : (
            <div className="rounded-[12px] border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-center text-sm font-medium text-zinc-500 sm:rounded-full sm:py-3">
              Em breve
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
