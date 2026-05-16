"use client";

import { useEffect, useMemo, useState } from "react";

type OrderStatusResponse = {
  publicId: string;
  status: string;
  statusLabel: string;
  subtotalLabel: string;
  paymentMethod?: string | null;
  receiptUrl?: string | null;
  items: Array<{ id: string; title: string; quantity: number; lineTotalLabel: string }>;
};

export function OrderStatusCard({ orderId, orderNsu, autoCheck = false }: { orderId?: string; orderNsu?: string; autoCheck?: boolean }) {
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  async function loadOrder() {
    if (!orderId && !orderNsu) {
      setIsLoading(false);
      return;
    }
    try {
      setErrorMessage(null);
      const params = new URLSearchParams();
      if (orderId) params.set("publicId", orderId);
      if (orderNsu) params.set("orderNsu", orderNsu);
      const response = await fetch(`/api/orders/lookup?${params.toString()}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Pedido nao encontrado.");
      setData(body);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel carregar o pedido.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckStatus() {
    if (!orderId && !orderNsu) return;
    try {
      setIsChecking(true);
      const response = await fetch("/api/payments/infinitepay/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: orderId, orderId, orderNsu, order_nsu: orderNsu }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Nao foi possivel verificar o pagamento.");
      await loadOrder();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel verificar o pagamento.");
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    void loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, orderNsu]);

  useEffect(() => {
    if (autoCheck && (orderId || orderNsu)) {
      void handleCheckStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCheck, orderId, orderNsu]);

  const helperText = useMemo(() => {
    if (!data) return "";
    return data.status === "paid"
      ? "Pagamento confirmado com sucesso."
      : "Recebemos seu retorno, mas a confirmacao final acontece pelo webhook ou pela consulta do pagamento.";
  }, [data]);

  if (!orderId && !orderNsu) return <div className="rounded-[28px] border border-zinc-200 bg-white/80 p-5 shadow-sm"><p className="text-sm text-zinc-600">Nao encontramos o identificador do pedido para acompanhar este pagamento.</p></div>;
  if (isLoading) return <div className="rounded-[28px] border border-zinc-200 bg-white/80 p-5 shadow-sm"><p className="text-sm text-zinc-600">Carregando status do pedido...</p></div>;
  if (errorMessage) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 shadow-sm"><p className="text-sm text-rose-700">{errorMessage}</p></div>;
  if (!data) return null;

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white/85 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Pedido {data.publicId}</p>
          <h3 className="mt-1 text-xl font-semibold text-zinc-900">{data.statusLabel}</h3>
        </div>
        <button type="button" onClick={handleCheckStatus} disabled={isChecking} className="btn-secondary rounded-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60">
          {isChecking ? "Verificando..." : "Atualizar status"}
        </button>
      </div>
      <p className="mt-3 text-sm text-zinc-600">{helperText}</p>
      <div className="mt-5 rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-zinc-600">Total do pedido</span>
          <span className="font-semibold text-zinc-900">{data.subtotalLabel}</span>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {data.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-zinc-200 bg-white p-4">
            <div>
              <p className="font-medium text-zinc-900">{item.title}</p>
              <p className="text-sm text-zinc-600">Quantidade: {item.quantity}</p>
            </div>
            <p className="font-semibold text-zinc-900">{item.lineTotalLabel}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
