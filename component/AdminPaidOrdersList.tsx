"use client";

import { useMemo, useState } from "react";

type PaidOrderItem = {
  id: string;
  title: string;
  quantity: number;
  lineTotalLabel: string;
};

export type PaidOrder = {
  publicId: string;
  guestName: string;
  guestEmail: string;
  subtotalLabel: string;
  paidLabel: string;
  paymentMethod: string | null;
  items: PaidOrderItem[];
};

const ORDERS_PER_PAGE = 10;

export function AdminPaidOrdersList({ orders }: { orders: PaidOrder[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));

  const visibleOrders = useMemo(() => {
    const start = (page - 1) * ORDERS_PER_PAGE;
    return orders.slice(start, start + ORDERS_PER_PAGE);
  }, [orders, page]);

  const startItem = orders.length === 0 ? 0 : (page - 1) * ORDERS_PER_PAGE + 1;
  const endItem = Math.min(page * ORDERS_PER_PAGE, orders.length);

  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600">
        Nenhum presente pago ainda.
      </p>
    );
  }

  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {visibleOrders.map((order) => (
          <article
            key={order.publicId}
            className="rounded-[18px] border border-zinc-200 bg-[rgb(var(--paper))] p-3 shadow-[0_10px_28px_rgba(24,24,27,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-zinc-900">
                  {order.guestName}
                </h2>
                <p className="mt-0.5 truncate text-xs text-zinc-600">
                  {order.guestEmail}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-base font-semibold text-zinc-900">
                  {order.subtotalLabel}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">Presente</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                {order.paymentMethod || "Metodo nao informado"}
              </span>
              <span className="rounded-full border border-[rgb(var(--olive)/0.22)] bg-white px-2.5 py-1 text-[11px] font-medium text-[rgb(var(--olive))]">
                Checkout: {order.paidLabel}
              </span>
            </div>

            <ul className="mt-3 space-y-1.5">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/65 px-3 py-2 text-xs text-zinc-700"
                >
                  <span className="min-w-0 truncate">
                    {item.quantity}x {item.title}
                  </span>
                  <span className="shrink-0 font-semibold text-zinc-900">
                    {item.lineTotalLabel}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          Mostrando {startItem}-{endItem} de {orders.length} pedidos pagos
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proxima
          </button>
        </div>
      </div>
    </div>
  );
}
