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

function SvgIcon({
  className,
  children,
  viewBox = "0 0 24 24",
}: {
  className?: string;
  children: React.ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function CartFloralMark() {
  return (
    <div className="hidden h-20 w-20 shrink-0 items-center justify-center text-[rgb(var(--lavender))] sm:flex">
      <Image
        src="/ornaments/lavanda-preto-branco.png"
        alt=""
        width={64}
        height={64}
        className="h-16 w-16 object-contain opacity-75"
      />
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </SvgIcon>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M20 12v8H4v-8" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 7v13" />
      <path d="M12 7H8.5A2.5 2.5 0 1 1 12 3.5Z" />
      <path d="M12 7h3.5A2.5 2.5 0 1 0 12 3.5Z" />
    </SvgIcon>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </SvgIcon>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M9 4h6" />
      <path d="M9 4a3 3 0 0 0 6 0" />
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </SvgIcon>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M6 8h12l-1 13H7Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </SvgIcon>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </SvgIcon>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </SvgIcon>
  );
}

function HeartLineIcon({ className }: { className?: string }) {
  return (
    <SvgIcon className={className} viewBox="0 0 24 24">
      <path d="M12 20s-6.5-3.8-8.6-7.4C1.9 10 3.2 6.7 6.2 6.5c1.7-.1 3.1.8 3.8 2.1.7-1.3 2.1-2.2 3.8-2.1 3 .2 4.3 3.5 2.8 6.1C18.5 16.2 12 20 12 20Z" />
    </SvgIcon>
  );
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
          className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
        />

        <div className="absolute inset-x-3 top-3 flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[10px] border border-[#d8c285] bg-[#fffdf7] shadow-[0_30px_90px_rgba(24,24,27,0.35)] sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[min(90rem,calc(100vw-5rem))] sm:-translate-x-1/2 sm:-translate-y-1/2">
          <div className="flex shrink-0 items-center justify-between border-b border-[#d6bd73] px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex min-w-0 items-center gap-4">
              <CartFloralMark />
              <div>
                <h3 className="font-serif text-4xl leading-none text-[rgb(var(--olive))] sm:text-5xl">
                  Meu carrinho
                </h3>
                <p className="mt-2 text-sm text-[#66745c] sm:text-base">
                  {cartQuantity > 0
                    ? `${cartQuantity} ${cartQuantity === 1 ? "item selecionado" : "itens selecionados"}`
                    : "Seu carrinho esta vazio"}
                </p>
              </div>
            </div>

            <div className="hidden text-center sm:block">
              <p className="font-serif text-2xl uppercase tracking-[0.38em] text-[rgb(var(--olive))]">
                Yasmim <span className="font-normal text-[#bd9647]">&</span> Vitor
              </p>
              <div className="mt-2 flex items-center justify-center gap-3 text-[#bd9647]">
                <span className="h-px w-20 bg-[#d6bd73]" />
                <HeartLineIcon className="h-5 w-5" />
                <span className="h-px w-20 bg-[#d6bd73]" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Fechar carrinho"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[rgb(var(--olive))] transition hover:bg-[#f4efe4]"
            >
              <CloseIcon className="h-8 w-8" />
            </button>
          </div>

          <div
            ref={modalScrollRef}
            className="min-h-0 flex-1 overflow-y-auto md:overflow-hidden"
          >
            {cartDetails.length === 0 ? (
              <div className="flex min-h-[28rem] items-center justify-center px-5 py-10">
                <div className="max-w-md text-center">
                  <GiftIcon className="mx-auto h-14 w-14 text-[rgb(var(--lavender))]" />
                  <p className="mt-5 font-serif text-3xl text-[rgb(var(--olive))]">
                    Seu carrinho esta vazio
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Escolha presentes da lista para montar seu pedido.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid min-h-0 md:h-[46rem] md:grid-cols-[minmax(0,1fr)_minmax(20rem,1.05fr)_minmax(18rem,0.82fr)]">
                <section className="min-h-0 border-b border-[#e2d4aa] px-5 py-5 md:border-b-0 md:border-r md:px-8">
                  <div className="flex items-center gap-4">
                    <GiftIcon className="h-8 w-8 text-[rgb(var(--lavender))]" />
                    <h4 className="font-serif text-2xl text-[rgb(var(--olive))]">
                      Presentes escolhidos
                    </h4>
                  </div>

                  <div className="mt-5 space-y-4 overflow-visible pr-0 md:max-h-[38rem] md:overflow-y-auto md:pr-2">
                    {cartDetails.map((item) => (
                      <div
                        key={item.gift.id}
                        className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-[#e7ddbd] pb-4 last:border-b-0"
                      >
                        <div className="relative h-28 overflow-hidden rounded-[10px] bg-[#eee9df]">
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

                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-serif text-xl leading-tight text-zinc-900">
                              {item.gift.title}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItem(item.gift.id)}
                              aria-label={`Remover ${item.gift.title}`}
                              className="mt-0.5 shrink-0 text-[rgb(var(--lavender))] transition hover:text-rose-600"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="grid h-10 grid-cols-3 overflow-hidden rounded-[8px] border border-[rgb(var(--olive))] bg-[#fffdf7] text-[rgb(var(--olive))]">
                              <button
                                type="button"
                                onClick={() => decreaseItem(item.gift.id)}
                                className="flex w-10 items-center justify-center text-xl transition hover:bg-[#f5f0e5]"
                              >
                                -
                              </button>
                              <span className="flex w-10 items-center justify-center border-x border-[#d8cda8] text-base font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseItem(item.gift.id)}
                                className="flex w-10 items-center justify-center text-xl transition hover:bg-[#f5f0e5]"
                              >
                                +
                              </button>
                            </div>

                            <p className="text-right font-serif text-xl text-[rgb(var(--olive))]">
                              {formatPriceCents(item.lineTotalCents)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border-b border-[#e2d4aa] bg-[rgba(177,156,217,0.07)] px-5 py-5 md:border-b-0 md:border-r md:px-8">
                  <div className="flex items-center gap-4 text-[rgb(var(--lavender))]">
                    <UserIcon className="h-8 w-8" />
                    <h4 className="font-serif text-2xl text-[rgb(var(--lavender))]">
                      Seus dados
                    </h4>
                  </div>

                  <div className="mt-7 space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-zinc-900">
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
                        className="h-14 w-full rounded-[8px] border border-[#cfc8bb] bg-white/75 px-5 text-base outline-none transition placeholder:text-zinc-400 focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.22]"
                        placeholder="Digite seu nome completo"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-zinc-900">
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
                        className="h-14 w-full rounded-[8px] border border-[#cfc8bb] bg-white/75 px-5 text-base outline-none transition placeholder:text-zinc-400 focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.22]"
                        placeholder="seu@email.com.br"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-zinc-900">
                        Mensagem para os noivos{" "}
                        <span className="text-xs text-zinc-500">(opcional)</span>
                      </span>
                      <textarea
                        value={checkoutState.guestMessage}
                        onChange={(event) =>
                          setCheckoutState((current) => ({
                            ...current,
                            guestMessage: event.target.value,
                          }))
                        }
                        rows={4}
                        maxLength={250}
                        className="h-40 w-full resize-none rounded-[8px] border border-[#cfc8bb] bg-white/75 px-5 py-4 text-base outline-none transition placeholder:text-zinc-400 focus:border-[rgb(var(--olive))] focus:ring-2 focus:ring-[rgb(var(--lavender))/0.22]"
                        placeholder="Deixe um recado para Yasmim & Vitor"
                      />
                      <span className="mt-1 block text-right text-xs text-zinc-500">
                        {checkoutState.guestMessage.length}/250
                      </span>
                    </label>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-3 text-[rgb(var(--lavender))]">
                    <span className="h-px w-16 bg-[rgb(var(--lavender))]/40" />
                    <HeartLineIcon className="h-5 w-5" />
                    <span className="h-px w-16 bg-[rgb(var(--lavender))]/40" />
                  </div>
                </section>

                <aside className="bg-[#fbfaf4] px-5 py-5 md:px-8">
                  <div className="flex items-center gap-4">
                    <ClipboardIcon className="h-8 w-8 text-[rgb(var(--olive))]" />
                    <h4 className="font-serif text-2xl text-[rgb(var(--olive))]">
                      Resumo
                    </h4>
                  </div>

                  <div className="mt-8 space-y-5 text-base text-zinc-700">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <ShoppingBagIcon className="h-5 w-5 text-zinc-500" />
                        <span>{cartQuantity} {cartQuantity === 1 ? "item" : "itens"}</span>
                      </div>
                      <span>
                        {cartDetails.length} {cartDetails.length === 1 ? "presente" : "presentes"}
                      </span>
                    </div>

                    <div className="h-px bg-[#d6bd73]" />

                    <div className="flex items-center justify-between gap-4">
                      <span>Subtotal</span>
                      <span>{cartSubtotalLabel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Checkout</span>
                      <span className="text-[rgb(var(--olive))]">InfinitePay</span>
                    </div>

                    <div className="h-px bg-[#d6bd73]" />

                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-serif text-2xl text-zinc-900">Total</span>
                      <span className="font-serif text-3xl font-semibold text-[rgb(var(--olive))]">
                        {cartSubtotalLabel}
                      </span>
                    </div>
                  </div>

                  {errorMessage ? (
                    <p className="mt-6 rounded-[12px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700">
                      {errorMessage}
                    </p>
                  ) : null}

                  <div className="mt-8 flex items-start gap-3 text-sm leading-5 text-zinc-700">
                    <LockIcon className="mt-0.5 h-8 w-8 shrink-0 text-[rgb(var(--olive))]" />
                    <p>
                      Pagamento 100% seguro processado pela{" "}
                      <span className="font-semibold text-zinc-900">InfinitePay</span>.
                    </p>
                  </div>

                  <div className="mt-7 space-y-3">
                    <button
                      type="button"
                      disabled={isSubmitting || cartDetails.length === 0}
                      onClick={handleCheckout}
                      className="flex h-16 w-full items-center justify-center gap-3 rounded-[8px] bg-[rgb(var(--olive))] px-5 font-serif text-xl font-semibold text-white shadow-[0_10px_22px_rgba(88,102,74,0.22)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LockIcon className="h-6 w-6" />
                      {isSubmitting ? "Criando checkout..." : "Finalizar compra"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="h-16 w-full rounded-[8px] border border-[rgb(var(--olive))] bg-transparent px-5 font-serif text-xl font-semibold text-[rgb(var(--olive))] transition hover:bg-[#f5f0e5]"
                    >
                      Adicionar mais itens
                    </button>
                  </div>
                </aside>
              </div>
            )}
          </div>

          <div className="hidden shrink-0 items-center justify-center gap-3 border-t border-[#d6bd73] px-5 py-4 text-sm text-[#66745c] sm:flex">
            <HeartLineIcon className="h-5 w-5 text-[rgb(var(--lavender))]" />
            <span>Obrigado por fazer parte desse momento especial!</span>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className={cartQuantity > 0 ? "pb-24 sm:pb-0" : undefined}>
        {introText ? (
          <p className="mx-auto mb-9 max-w-2xl text-center text-sm leading-7 text-[#66745c]">
            {introText}
          </p>
        ) : null}
        <WeddingGiftList
          gifts={gifts}
          page={page}
          onPageChange={setPage}
          cartQuantity={cartQuantity}
          cartSubtotalLabel={cartSubtotalLabel}
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
          data-mobile-cart-bar
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
