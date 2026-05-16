"use client";

import { useEffect, useMemo, useState } from "react";

import { WeddingGiftList } from "@/component/WeddingGiftList";
import { formatPriceCents } from "@/lib/currency";
import type { DisplayGift } from "@/lib/gifts";

type CartItem = { giftId: string; quantity: number };
type CheckoutState = { guestName: string; guestEmail: string; guestMessage: string };

const CART_STORAGE_KEY = "casamento-cart-v1";

function readCartStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function GiftRegistry({ gifts }: { gifts: DisplayGift[] }) {
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ guestName: "", guestEmail: "", guestMessage: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCart(readCartStorage());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  const giftById = useMemo(() => new Map(gifts.map((gift) => [gift.id, gift])), [gifts]);

  const cartDetails = useMemo(
    () =>
      cart
        .map((item) => {
          const gift = giftById.get(item.giftId);
          if (!gift) return null;
          return { ...item, gift, lineTotalCents: gift.priceCents * item.quantity };
        })
        .filter(Boolean) as Array<CartItem & { gift: DisplayGift; lineTotalCents: number }>,
    [cart, giftById],
  );

  const cartQuantity = cartDetails.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalCents = cartDetails.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const cartSubtotalLabel = formatPriceCents(cartSubtotalCents);

  function updateCart(next: CartItem[]) {
    setCart(next.filter((item) => item.quantity > 0));
  }

  function addToCart(giftId: string) {
    setErrorMessage(null);
    setCart((current) => {
      const existing = current.find((item) => item.giftId === giftId);
      if (!existing) return [...current, { giftId, quantity: 1 }];
      return current.map((item) =>
        item.giftId === giftId ? { ...item, quantity: Math.min(item.quantity + 1, 10) } : item,
      );
    });
  }

  async function handleCheckout() {
    if (cartDetails.length === 0) {
      setErrorMessage("Adicione pelo menos um presente ao carrinho.");
      return;
    }
    if (!checkoutState.guestName.trim() || !checkoutState.guestEmail.trim()) {
      setErrorMessage("Preencha seu nome e email para continuar.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const checkoutWindow = window.open("", "_blank");

    if (checkoutWindow) {
      checkoutWindow.document.write(`<title>Abrindo checkout...</title><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fafaf9;color:#27272a;"><div style="text-align:center;padding:24px;"><p style="font-size:16px;margin:0 0 8px;">Abrindo checkout seguro...</p><p style="font-size:14px;margin:0;color:#71717a;">Voce pode voltar para a aba do site a qualquer momento.</p></div></body>`);
      checkoutWindow.document.close();
    }

    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: checkoutState.guestName,
          guestEmail: checkoutState.guestEmail,
          guestMessage: checkoutState.guestMessage,
          items: cartDetails.map((item) => ({ giftId: item.gift.id, quantity: item.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "Nao foi possivel iniciar o checkout.");

      window.localStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);
      if (checkoutWindow) {
        checkoutWindow.location.href = data.checkoutUrl;
      } else {
        setErrorMessage("O navegador bloqueou a nova aba do checkout. Permita pop-ups e tente novamente.");
      }
    } catch (error) {
      if (checkoutWindow && !checkoutWindow.closed) checkoutWindow.close();
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel iniciar o checkout.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <WeddingGiftList
        gifts={gifts}
        page={page}
        onPageChange={setPage}
        cartQuantity={cartQuantity}
        cartSubtotalLabel={cartSubtotalLabel}
        onOpenCart={() => setDrawerOpen(true)}
        getQuantityInCart={(giftId) => cart.find((item) => item.giftId === giftId)?.quantity ?? 0}
        onAddToCart={addToCart}
      />

      {cartQuantity > 0 ? (
        <button type="button" onClick={() => setDrawerOpen(true)} className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-[rgb(var(--olive))] px-5 py-3 text-sm font-semibold text-white shadow-lg sm:hidden">
          <span>{cartQuantity} presentes</span>
          <span>{cartSubtotalLabel}</span>
        </button>
      ) : null}

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 bg-black/35">
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[rgb(var(--paper))] shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Carrinho</p>
                <p className="mt-1 text-sm text-zinc-700">{cartQuantity} presentes selecionados</p>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700">Fechar</button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {cartDetails.map((item) => (
                <div key={item.gift.id} className="rounded-[22px] border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">{item.gift.title}</p>
                      <p className="mt-1 text-sm text-zinc-600">{item.gift.priceLabel} cada</p>
                    </div>
                    <button type="button" onClick={() => updateCart(cart.filter((cartItem) => cartItem.giftId !== item.gift.id))} className="text-sm text-zinc-500 underline underline-offset-2">Remover</button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateCart(cart.map((cartItem) => cartItem.giftId === item.gift.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem))} className="h-9 w-9 rounded-full border border-zinc-300 text-lg text-zinc-700">-</button>
                      <span className="min-w-6 text-center text-sm font-semibold text-zinc-900">{item.quantity}</span>
                      <button type="button" onClick={() => updateCart(cart.map((cartItem) => cartItem.giftId === item.gift.id ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, 10) } : cartItem))} className="h-9 w-9 rounded-full border border-zinc-300 text-lg text-zinc-700">+</button>
                    </div>
                    <p className="font-semibold text-zinc-900">{formatPriceCents(item.lineTotalCents)}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-[26px] border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Seus dados</p>
                <div className="mt-4 space-y-3">
                  <input value={checkoutState.guestName} onChange={(event) => setCheckoutState((current) => ({ ...current, guestName: event.target.value }))} className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-[rgb(var(--olive))]" placeholder="Seu nome" />
                  <input type="email" value={checkoutState.guestEmail} onChange={(event) => setCheckoutState((current) => ({ ...current, guestEmail: event.target.value }))} className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-[rgb(var(--olive))]" placeholder="voce@email.com" />
                  <textarea value={checkoutState.guestMessage} onChange={(event) => setCheckoutState((current) => ({ ...current, guestMessage: event.target.value }))} rows={4} className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-[rgb(var(--olive))]" placeholder="Escreva uma mensagem carinhosa, se quiser." />
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200 bg-white px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-sm text-zinc-700">
                <span>Total</span>
                <span className="text-lg font-semibold text-zinc-900">{cartSubtotalLabel}</span>
              </div>
              {errorMessage ? <p className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p> : null}
              <button type="button" disabled={isSubmitting || cartDetails.length === 0} onClick={handleCheckout} className="btn-primary flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Criando checkout..." : "Ir para o pagamento"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
