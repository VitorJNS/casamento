import { formatPriceCents } from "@/lib/currency";
import { getOptionalServerEnv, getSiteUrl } from "@/lib/env";

type GiftEmailItem = {
  title: string;
  quantity: number;
  lineTotalCents: number;
};

type GiftEmailInput = {
  publicId: string;
  guestName: string;
  guestEmail: string;
  introText: string;
  subtotalCents: number;
  paidCents?: number;
  statusLabel: string;
  statusDescription: string;
  items: GiftEmailItem[];
  paymentMethod?: string | null;
  receiptUrl?: string | null;
};

type SendGiftEmailInput = GiftEmailInput & {
  subject: string;
  previewText: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getTrackingUrl(publicId: string) {
  return `${getSiteUrl()}/pagamento/sucesso?orderId=${encodeURIComponent(publicId)}`;
}

export function renderGiftStatusEmail(input: SendGiftEmailInput) {
  const trackingUrl = getTrackingUrl(input.publicId);
  const totalLabel = formatPriceCents(input.paidCents ?? input.subtotalCents);
  const itemsHtml = input.items
    .map(
      (item) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e4e4e7;">
            <div style="font-weight:700;color:#18181b;">${escapeHtml(item.title)}</div>
            <div style="margin-top:4px;font-size:14px;color:#71717a;">Quantidade: ${item.quantity}</div>
          </td>
          <td align="right" style="padding:16px 0;border-bottom:1px solid #e4e4e7;font-weight:700;color:#27272a;white-space:nowrap;">
            ${formatPriceCents(item.lineTotalCents)}
          </td>
        </tr>`,
    )
    .join("");

  const receiptHtml = input.receiptUrl
    ? `
      <p style="margin:16px 0 0;text-align:center;">
        <a href="${escapeHtml(input.receiptUrl)}" style="color:#58664a;font-size:14px;font-weight:700;text-decoration:underline;">Abrir recibo da InfinitePay</a>
      </p>`
    : "";

  const paymentMethodHtml = input.paymentMethod
    ? `<div style="margin-top:8px;font-size:13px;color:#71717a;">Metodo: ${escapeHtml(input.paymentMethod)}</div>`
    : "";

  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>${escapeHtml(input.subject)}</title>
    <style>
      :root { color-scheme: light only; supported-color-schemes: light only; }
      body, table, td, div, p, h1, a { color-scheme: light only; }
      @media screen and (max-width: 520px) {
        .email-shell { padding: 14px 8px !important; }
        .email-card { border-radius: 22px !important; }
        .email-hero { padding: 30px 22px !important; }
        .email-title { font-size: 34px !important; line-height: 1.08 !important; }
        .email-body { padding: 24px 22px !important; }
        .email-status-row, .email-status-cell, .email-total-cell {
          display: block !important;
          width: 100% !important;
          text-align: left !important;
        }
        .email-total-pill { margin-top: 14px !important; }
        .email-cta { display: block !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;color:#27272a;color-scheme:light only;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.previewText)}</div>
    <table class="email-shell" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f3ef;padding:28px 12px;">
      <tr>
        <td align="center">
          <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;overflow:hidden;border:1px solid #e4e4e7;border-radius:28px;background:#ffffff;box-shadow:0 22px 70px rgba(24,24,27,0.10);">
            <tr>
              <td class="email-hero" align="center" bgcolor="#fbfaf8" style="padding:40px 32px;background-color:#fbfaf8;background-image:linear-gradient(135deg,#fbfaf8,#ffffff);">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:#71717a;">Yasmim &amp; Vitor</div>
                <h1 class="email-title" style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.05;font-weight:700;color:#18181b;">Recebemos seu presente</h1>
                <p style="margin:16px auto 0;max-width:480px;font-size:15px;line-height:1.7;color:#52525b;">Obrigado por fazer parte da nossa historia e por celebrar esse momento tao especial com a gente.</p>
              </td>
            </tr>
            <tr>
              <td class="email-body" bgcolor="#ffffff" style="padding:32px;background-color:#ffffff;">
                <p style="margin:0;font-size:16px;line-height:1.7;color:#3f3f46;">Ola, <strong style="color:#18181b;">${escapeHtml(input.guestName)}</strong>! ${escapeHtml(input.introText)}</p>

                <div style="margin-top:24px;border:1px solid #e4e4e7;border-radius:24px;background-color:#fafaf9;padding:22px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr class="email-status-row">
                      <td class="email-status-cell">
                        <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">Status</div>
                        <div style="margin-top:6px;font-size:22px;font-weight:700;color:#58664a;">${escapeHtml(input.statusLabel)}</div>
                        ${paymentMethodHtml}
                      </td>
                      <td class="email-total-cell" align="right" valign="top">
                        <div class="email-total-pill" style="display:inline-block;border:1px solid #d8dece;border-radius:999px;background-color:#ffffff;padding:10px 16px;font-size:15px;font-weight:700;color:#58664a;">${totalLabel}</div>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:18px 0 0;font-size:14px;line-height:1.7;color:#52525b;">${escapeHtml(input.statusDescription)}</p>
                </div>

                <div style="margin-top:26px;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">Resumo do presente</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
                    ${itemsHtml}
                  </table>
                </div>

                <div style="margin-top:26px;border:1px solid #e4e4e7;border-radius:22px;background:#fafafa;padding:18px;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#71717a;">E-mail usado na compra</div>
                  <div style="margin-top:6px;font-size:14px;font-weight:700;color:#27272a;word-break:break-all;">${escapeHtml(input.guestEmail)}</div>
                </div>

                <div style="margin-top:30px;text-align:center;">
                  <a class="email-cta" href="${escapeHtml(trackingUrl)}" style="display:inline-block;border-radius:999px;background-color:#58664a;padding:14px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Acompanhar meu presente</a>
                  ${receiptHtml}
                  <p style="margin:18px auto 0;max-width:420px;font-size:12px;line-height:1.7;color:#71717a;">Se o pagamento ja foi aprovado, pode levar alguns instantes para o status aparecer como confirmado.</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "Yasmim & Vitor",
    "",
    `Ola, ${input.guestName}!`,
    input.statusLabel,
    input.statusDescription,
    "",
    "Resumo do presente:",
    ...input.items.map(
      (item) =>
        `${item.quantity}x ${item.title} - ${formatPriceCents(item.lineTotalCents)}`,
    ),
    "",
    `Total: ${totalLabel}`,
    `Acompanhar: ${trackingUrl}`,
    input.receiptUrl ? `Recibo: ${input.receiptUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}

export async function sendGiftStatusEmail(input: SendGiftEmailInput) {
  const env = getOptionalServerEnv();

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.info("Email de presente ignorado: RESEND_API_KEY ou EMAIL_FROM nao configurado.");
    return { skipped: true };
  }

  const rendered = renderGiftStatusEmail(input);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: input.guestEmail,
      subject: input.subject,
      html: rendered.html,
      text: rendered.text,
    }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Resend falhou (${response.status}): ${JSON.stringify(body)}`);
  }

  return { skipped: false, id: body?.id as string | undefined };
}

export function buildGiftCreatedEmail(
  input: Omit<GiftEmailInput, "introText" | "statusLabel" | "statusDescription">,
) {
  return {
    ...input,
    introText: "Seu pedido de presente foi criado com sucesso.",
    subject: "Recebemos seu presente para Yasmim & Vitor",
    previewText: "Acompanhe o status do seu presente e veja os detalhes da compra.",
    statusLabel: "Pagamento em acompanhamento",
    statusDescription:
      "Assim que a InfinitePay confirmar o pagamento, os noivos tambem conseguirao ver seu presente na area deles.",
  };
}

export function buildGiftPaidEmail(
  input: Omit<GiftEmailInput, "introText" | "statusLabel" | "statusDescription">,
) {
  return {
    ...input,
    introText: "Seu pagamento foi confirmado com sucesso.",
    subject: "Pagamento confirmado - presente para Yasmim & Vitor",
    previewText: "Seu pagamento foi confirmado. Obrigado pelo carinho!",
    statusLabel: "Pagamento confirmado",
    statusDescription:
      "Seu presente foi confirmado com sucesso. Obrigado por fazer parte desse momento tao especial.",
  };
}
