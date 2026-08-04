import { z } from "zod";

import { getServerEnv, getSiteUrl } from "@/lib/env";

const createCheckoutResponseSchema = z
  .object({
    url: z.string().url().optional(),
    checkout_url: z.string().url().optional(),
    slug: z.string().optional(),
  })
  .transform((data, context) => {
    const checkoutUrl = data.url ?? data.checkout_url;

    if (!checkoutUrl) {
      context.addIssue({
        code: "custom",
        message: "InfinitePay respondeu sem a URL do checkout.",
      });
      return z.NEVER;
    }

    return {
      checkoutUrl,
      slug: data.slug ?? null,
    };
  });

const paymentCheckResponseSchema = z
  .object({
    success: z.boolean().optional(),
    paid: z.boolean().optional(),
    amount: z.number().int().optional(),
    paid_amount: z.number().int().optional(),
    installments: z.number().int().optional(),
    capture_method: z.string().optional(),
    message: z.string().optional(),
  })
  .passthrough();

export type InfinitePayCheckoutItem = {
  quantity: number;
  price: number;
  description: string;
};

function isPublicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1"
    );
  } catch {
    return false;
  }
}

export async function createInfinitePayCheckoutLink(input: {
  orderPublicId: string;
  orderNsu: string;
  guestName: string;
  guestEmail: string;
  items: InfinitePayCheckoutItem[];
}) {
  const env = getServerEnv();
  const siteUrl = getSiteUrl();
  const webhookToken = env.INFINITEPAY_WEBHOOK_SECRET;
  const shouldSendReturnUrls = isPublicHttpsUrl(siteUrl);
  const webhookUrl = webhookToken
    ? `${siteUrl}/api/payments/infinitepay/webhook?token=${encodeURIComponent(webhookToken)}`
    : `${siteUrl}/api/payments/infinitepay/webhook`;

  const response = await fetch(`${env.INFINITEPAY_API_BASE_URL}/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      handle: env.INFINITEPAY_HANDLE,
      order_nsu: input.orderNsu,
      redirect_url: shouldSendReturnUrls
        ? `${siteUrl}/pagamento/sucesso?orderId=${encodeURIComponent(input.orderPublicId)}`
        : undefined,
      webhook_url: shouldSendReturnUrls ? webhookUrl : undefined,
      customer: {
        name: input.guestName,
        email: input.guestEmail,
      },
      items: input.items,
    }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      `InfinitePay checkout falhou (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  const parsed = createCheckoutResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("InfinitePay respondeu sem a URL do checkout.");
  }

  return {
    checkoutUrl: parsed.data.checkoutUrl,
    slug: parsed.data.slug,
  };
}

export async function checkInfinitePayPayment(input: {
  orderNsu: string;
  transactionNsu?: string | null;
  slug?: string | null;
}) {
  const env = getServerEnv();
  const response = await fetch(`${env.INFINITEPAY_API_BASE_URL}/payment_check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      handle: env.INFINITEPAY_HANDLE,
      order_nsu: input.orderNsu,
      transaction_nsu: input.transactionNsu ?? undefined,
      slug: input.slug ?? undefined,
    }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      `InfinitePay payment_check falhou (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  const parsed = paymentCheckResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error(
      `InfinitePay payment_check respondeu em formato inesperado: ${JSON.stringify(body)}`,
    );
  }

  return {
    success: parsed.data.success ?? true,
    paid: parsed.data.paid ?? false,
    amount: parsed.data.amount,
    paid_amount: parsed.data.paid_amount,
    installments: parsed.data.installments,
    capture_method: parsed.data.capture_method,
    message: parsed.data.message,
  };
}
