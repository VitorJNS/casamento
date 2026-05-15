type WeddingGiftCardProps = {
  title: string;
  description: string;
  priceLabel: string;
  category?: string;
  note?: string;
  infinityPay?: string;
  stripeLink?: string;
};

export function WeddingGiftCard({
  title,
  description,
  priceLabel,
  category,
  note,
  infinityPay,
  stripeLink,
}: WeddingGiftCardProps) {
  const hasPaymentLink = Boolean(infinityPay || stripeLink);

  return (
    <article className="rounded-3xl border border-zinc-200 bg-white/82 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          {category ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {category}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-semibold text-zinc-900">{title}</h3>
        </div>

        <div
          className="rounded-full px-3 py-1 text-sm font-semibold text-zinc-900"
          style={{ backgroundColor: "rgb(var(--lavender) / 0.16)" }}
        >
          {priceLabel}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-700">{description}</p>

      {note ? <p className="mt-2 text-xs text-zinc-500">{note}</p> : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {infinityPay ? (
          <a
            href={infinityPay}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            Presentear
          </a>
        ) : null}

        {stripeLink ? (
          <a
            href={stripeLink}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            Stripe
          </a>
        ) : null}
      </div>

      {!hasPaymentLink ? (
        <p className="mt-3 text-sm text-zinc-500">
          Falta adicionar o link deste presente.
        </p>
      ) : null}
    </article>
  );
}
