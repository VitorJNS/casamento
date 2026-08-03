"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { WeddingGiftList } from "@/component/WeddingGiftList";
import { formatPriceCents } from "@/lib/currency";
import type { DisplayGift } from "@/lib/gifts";

type CartItem = { giftId: string; quantity: number };
type CheckoutState = {
  guestName: string;
  guestEmail: string;
  guestMessage: string;
};

const CART_STORAGE_KEY = "casamento-cart-v1";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

export function GiftRegistry({
  gifts,
  introText,
}: {
  gifts: DisplayGift[];
  introText?: string;
}) {
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    guestName: "",
    guestEmail: "",
    guestMessage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cartHydrated, setCartHydrated] = useState(false);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCart(readCartStorage());
    setCartHydrated(true);
  }, []);

  useEffect(() => {
    if (cartHydrated && typeof window !== "undefined") {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    if (modalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    modalScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [modalOpen]);

  const giftById = useMemo(
    () => new Map(gifts.map((gift) => [gift.id, gift])),
    [gifts],
  );

  const cartDetails = useMemo(
    () =>
      cart
        .map((item) => {
          const gift = giftById.get(item.giftId);
          if (!gift) return null;
          return {
            ...item,
            gift,
            lineTotalCents: gift.priceCents * item.quantity,
          };
        })
        .filter(Boolean) as Array<
        CartItem & { gift: DisplayGift; lineTotalCents: number }
      >,
    [cart, giftById],
  );

  const cartQuantity = cartDetails.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalCents = cartDetails.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0,
  );
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
        item.giftId === giftId
          ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
          : item,
      );
    });
    setModalOpen(true);
  }

  function decreaseItem(giftId: string) {
    updateCart(
      cart.map((item) =>
        item.giftId === giftId ? { ...item, quantity: item.quantity - 1 } : item,
      ),
    );
  }

  function increaseItem(giftId: string) {
    updateCart(
      cart.map((item) =>
        item.giftId === giftId
          ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
          : item,
      ),
    );
  }

  function removeItem(giftId: string) {
    updateCart(cart.filter((item) => item.giftId !== giftId));
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
      checkoutWindow.document.write(`
        <title>Abrindo checkout...</title>
        <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fafaf9;color:#27272a;">
          <div style="text-align:center;padding:24px;">
            <p style="font-size:16px;margin:0 0 8px;">Abrindo checkout seguro...</p>
            <p style="font-size:14px;margin:0;color:#71717a;">Você pode voltar para a aba do site a qualquer momento.</p>
          </div>
        </body>
      `);
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
          items: cartDetails.map((item) => ({
            giftId: item.gift.id,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "Nao foi possivel iniciar o checkout.",
        );
      }

      setModalOpen(false);
      if (checkoutWindow) {
        checkoutWindow.location.href = data.checkoutUrl;
      } else {
        setErrorMessage(
          "O navegador bloqueou a nova aba do checkout. Permita pop-ups e tente novamente.",
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel iniciar o checkout.";

      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.document.body.innerHTML = `
          <div style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fafaf9;color:#27272a;">
            <div style="max-width:460px;text-align:center;padding:24px;">
              <p style="font-size:18px;font-weight:700;margin:0 0 8px;">Nao conseguimos abrir o checkout</p>
              <p style="font-size:14px;line-height:1.6;margin:0;color:#71717a;">${escapeHtml(message)}</p>
              <p style="font-size:14px;line-height:1.6;margin:16px 0 0;color:#71717a;">Volte para a aba do site e tente novamente.</p>
            </div>
          </div>
        `;
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const cartModal =
    modalOpen && typeof document !== "undefined" ? (
      <div className="fixed inset-0 z-[120]">
        <button
          type="button"
          aria-label="Fechar carrinho"
          onClick={() => setModalOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
        />

        <div className="absolute inset-x-4 top-4 flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden overscroll-contain rounded-[28px] border border-zinc-200 bg-white shadow-2xl sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-h-[88vh] sm:w-[min(860px,calc(100vw-3rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px]">
          <div className="border-b border-zinc-200 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-zinc-900">
                  Meu carrinho
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  {cartQuantity > 0
                    ? `${cartQuantity} ${cartQuantity === 1 ? "item selecionado" : "itens selecionados"}`
                    : "Seu carrinho esta vazio"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700"
              >
                Fechar
              </button>
            </div>
          </div>

          <div className="hidden items-center justify-between border-b border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-800 sm:flex">
            <span>Descricao do presente</span>
            <span>Valor</span>
          </div>

          <div
            ref={modalScrollRef}
            className="min-h-0 flex-1 overflow-y-auto px-5 pb-69 pt-4 sm:pb-52"
          >
            {cartDetails.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-5 py-10 text-center">
                <p className="text-lg font-semibold text-zinc-900">
                  Seu carrinho esta vazio
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Escolha presentes da lista para montar seu pedido.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartDetails.map((item) => (
                  <div
                    key={item.gift.id}
                    className="border-b border-zinc-200 pb-4 last:border-b-0"
                  >
                    <div className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[12px] border border-zinc-200 bg-zinc-100">
                        {item.gift.imageSrc ? (
                          <Image
                            src={item.gift.imageSrc}
                            alt={item.gift.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-medium text-zinc-500">
                            Sem imagem
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:hidden">
                              Descricao do presente
                            </p>
                            <p className="font-semibold text-zinc-900">
                              {item.gift.title}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItem(item.gift.id)}
                              className="mt-2 text-sm text-rose-600 underline-offset-2 hover:underline"
                            >
                              Remover
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:hidden">
                              Valor
                            </p>
                            <p className="mt-1 text-lg font-semibold text-zinc-900 sm:mt-0">
                              {formatPriceCents(item.lineTotalCents)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decreaseItem(item.gift.id)}
                            className="h-9 w-9 rounded-full border border-zinc-300 bg-white text-lg text-zinc-700"
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseItem(item.gift.id)}
                            className="h-9 w-9 rounded-full border border-zinc-300 bg-white text-lg text-zinc-700"
                          >
                            +
                          </button>
                          <p className="ml-auto text-sm text-zinc-500">
                            {item.gift.priceLabel} por presente
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Seus dados
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    Esses dados acompanham o pedido e ajudam na identificacao do presente.
                  </p>

                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Nome
                      </span>
                      <input
                        value={checkoutState.guestName}
                        onChange={(event) =>
                          setCheckoutState((current) => ({
                            ...current,
                            guestName: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                        placeholder="Seu nome"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Email
                      </span>
                      <input
                        type="email"
                        value={checkoutState.guestEmail}
                        onChange={(event) =>
                          setCheckoutState((current) => ({
                            ...current,
                            guestEmail: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                        placeholder="voce@email.com"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Mensagem para os noivos
                      </span>
                      <textarea
                        value={checkoutState.guestMessage}
                        onChange={(event) =>
                          setCheckoutState((current) => ({
                            ...current,
                            guestMessage: event.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.28]"
                        placeholder="Escreva uma mensagem carinhosa, se quiser."
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 border-t border-zinc-200 bg-white/98 px-5 py-4 shadow-[0_-18px_40px_rgba(24,24,27,0.12)] backdrop-blur">
            <div className="flex items-center justify-end gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Total
                </p>
                <p className="mt-1 text-right text-2xl font-semibold text-zinc-900">
                  {cartSubtotalLabel}
                </p>
              </div>
            </div>

            {errorMessage ? (
              <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-[14px] bg-zinc-600 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-zinc-700"
              >
                Adicionar mais itens
              </button>

              <button
                type="button"
                disabled={isSubmitting || cartDetails.length === 0}
                onClick={handleCheckout}
                className="rounded-[14px] bg-[rgb(var(--lavender))] px-5 py-3.5 text-base font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Criando checkout..." : "Finalizar compra"}
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-zinc-500">
              O checkout abrira em uma nova aba segura da InfinitePay.
            </p>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className={cartQuantity > 0 ? "pb-24 sm:pb-0" : undefined}>
        <WeddingGiftList
          gifts={gifts}
          page={page}
          onPageChange={setPage}
          cartQuantity={cartQuantity}
          cartSubtotalLabel={cartSubtotalLabel}
          introText={introText}
          onOpenCart={() => setModalOpen(true)}
          getQuantityInCart={(giftId) =>
            cart.find((item) => item.giftId === giftId)?.quantity ?? 0
          }
          onAddToCart={addToCart}
          onIncreaseCartItem={increaseItem}
          onDecreaseCartItem={decreaseItem}
        />
      </div>

      {cartQuantity > 0 ? (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-[rgb(var(--olive))] px-5 py-3 text-sm font-semibold text-white shadow-lg sm:hidden"
        >
          <span>{cartQuantity} itens no carrinho</span>
          <span>{cartSubtotalLabel}</span>
        </button>
      ) : null}
      {cartModal ? createPortal(cartModal, document.body) : null}
    </>
  );
}
