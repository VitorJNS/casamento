type ListPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  itemLabel: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function ListPagination({
  page,
  totalPages,
  totalItems,
  startItem,
  endItem,
  itemLabel,
  onPrevious,
  onNext,
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-[0_10px_30px_rgba(24,24,27,0.05)]">
      <span>
        Mostrando{" "}
        <strong className="font-semibold text-zinc-900">
          {startItem}-{endItem}
        </strong>{" "}
        de {totalItems} {itemLabel}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={page === 1}
          className="rounded-full border border-zinc-200 px-4 py-2 font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Anterior
        </button>
        <span className="min-w-16 text-center text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={page === totalPages}
          className="rounded-full border border-zinc-200 px-4 py-2 font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Proxima
        </button>
      </div>
    </div>
  );
}
