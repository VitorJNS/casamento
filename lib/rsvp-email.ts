import { getOptionalServerEnv } from "@/lib/env";

type RsvpEmailResponse = {
  guestName: string;
  attendance: "confirmed" | "declined";
};

type RsvpEmailInput = {
  respondentName: string;
  email: string;
  familyLabel?: string | null;
  responses: RsvpEmailResponse[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getAttendanceLabel(attendance: RsvpEmailResponse["attendance"]) {
  return attendance === "confirmed" ? "Irei" : "Nao irei";
}

function getAttendanceColor(attendance: RsvpEmailResponse["attendance"]) {
  return attendance === "confirmed" ? "#58664a" : "#be123c";
}

export function renderRsvpConfirmationEmail(input: RsvpEmailInput) {
  const confirmedCount = input.responses.filter(
    (response) => response.attendance === "confirmed",
  ).length;
  const declinedCount = input.responses.length - confirmedCount;
  const summaryText =
    confirmedCount > 0
      ? `${confirmedCount} confirmado${confirmedCount === 1 ? "" : "s"}`
      : `${declinedCount} recusado${declinedCount === 1 ? "" : "s"}`;
  const responseRows = input.responses
    .map(
      (response) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e4e4e7;">
            <div style="font-weight:700;color:#18181b;">${escapeHtml(response.guestName)}</div>
          </td>
          <td align="right" style="padding:16px 0;border-bottom:1px solid #e4e4e7;white-space:nowrap;">
            <span style="display:inline-block;border-radius:999px;background-color:#ffffff;border:1px solid #e4e4e7;padding:8px 12px;font-size:13px;font-weight:700;color:${getAttendanceColor(response.attendance)};">
              ${getAttendanceLabel(response.attendance)}
            </span>
          </td>
        </tr>`,
    )
    .join("");

  const groupHtml = input.familyLabel
    ? `<div style="margin-top:8px;font-size:13px;color:#71717a;">Grupo: ${escapeHtml(input.familyLabel)}</div>`
    : "";

  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>Sua confirmação de presença foi registrada</title>
    <style>
      :root { color-scheme: light only; supported-color-schemes: light only; }
      body, table, td, div, p, h1, a { color-scheme: light only; }
      @media screen and (max-width: 520px) {
        .email-shell { padding: 14px 8px !important; }
        .email-card { border-radius: 22px !important; }
        .email-hero { padding: 30px 22px !important; }
        .email-title { font-size: 34px !important; line-height: 1.08 !important; }
        .email-body { padding: 24px 22px !important; }
        .email-summary-row, .email-summary-cell, .email-count-cell {
          display: block !important;
          width: 100% !important;
          text-align: left !important;
        }
        .email-count-pill { margin-top: 14px !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;color:#27272a;color-scheme:light only;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Recebemos sua resposta para o casamento de Yasmim & Vitor.</div>
    <table class="email-shell" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f3ef;padding:28px 12px;">
      <tr>
        <td align="center">
          <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;overflow:hidden;border:1px solid #e4e4e7;border-radius:28px;background:#ffffff;box-shadow:0 22px 70px rgba(24,24,27,0.10);">
            <tr>
              <td class="email-hero" align="center" bgcolor="#fbfaf8" style="padding:40px 32px;background-color:#fbfaf8;background-image:linear-gradient(135deg,#fbfaf8,#ffffff);">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:#71717a;">Yasmim &amp; Vitor</div>
                <h1 class="email-title" style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.05;font-weight:700;color:#18181b;">Confirmação registrada</h1>
                <p style="margin:16px auto 0;max-width:480px;font-size:15px;line-height:1.7;color:#52525b;">Obrigado por responder. Isso nos ajuda muito na organização do nosso grande dia.</p>
              </td>
            </tr>
            <tr>
              <td class="email-body" bgcolor="#ffffff" style="padding:32px;background-color:#ffffff;">
                <p style="margin:0;font-size:16px;line-height:1.7;color:#3f3f46;">Ola, <strong style="color:#18181b;">${escapeHtml(input.respondentName)}</strong>! Recebemos sua confirmação de presença.</p>

                <div style="margin-top:24px;border:1px solid #e4e4e7;border-radius:24px;background-color:#fafaf9;padding:22px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr class="email-summary-row">
                      <td class="email-summary-cell">
                        <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">Resumo</div>
                        <div style="margin-top:6px;font-size:22px;font-weight:700;color:#58664a;">Resposta salva</div>
                        ${groupHtml}
                      </td>
                      <td class="email-count-cell" align="right" valign="top">
                        <div class="email-count-pill" style="display:inline-block;border:1px solid #d8dece;border-radius:999px;background-color:#ffffff;padding:10px 16px;font-size:15px;font-weight:700;color:#58664a;">${summaryText}</div>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:18px 0 0;font-size:14px;line-height:1.7;color:#52525b;">Guardamos abaixo todos os nomes respondidos neste envio.</p>
                </div>

                <div style="margin-top:26px;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">Nomes respondidos</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
                    ${responseRows}
                  </table>
                </div>

                <div style="margin-top:28px;border:1px solid #e4e4e7;border-radius:22px;background:#fafafa;padding:18px;">
                  <p style="margin:0;font-size:14px;line-height:1.7;color:#52525b;">Se precisar alterar alguma resposta depois, fale diretamente com a cerimonialista.</p>
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
    `Ola, ${input.respondentName}! Recebemos sua confirmação de presença.`,
    input.familyLabel ? `Grupo: ${input.familyLabel}` : "",
    "",
    "Nomes respondidos:",
    ...input.responses.map(
      (response) => `${response.guestName}: ${getAttendanceLabel(response.attendance)}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}

export async function sendRsvpConfirmationEmail(input: RsvpEmailInput) {
  const env = getOptionalServerEnv();

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.info("Email de RSVP ignorado: RESEND_API_KEY ou EMAIL_FROM nao configurado.");
    return { skipped: true };
  }

  const rendered = renderRsvpConfirmationEmail(input);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: input.email,
      subject: "Sua confirmação de presença foi registrada",
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
