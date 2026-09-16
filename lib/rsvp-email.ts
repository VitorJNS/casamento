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

type RsvpCoupleEmailInput = RsvpEmailInput & {
  rsvpId: string;
  note?: string | null;
};

const COUPLE_EMAILS = ["iaresisa@gmail.com", "vitorjosedonascimento2002@gmail.com"];

export function renderRsvpCoupleEmail(input: RsvpCoupleEmailInput) {
  const confirmedNames = input.responses
    .filter((response) => response.attendance === "confirmed")
    .map((response) => response.guestName);
  const confirmedCount = confirmedNames.length;
  const declinedCount = input.responses.length - confirmedCount;
  const subject = confirmedNames.length === 1
    ? `${confirmedNames[0]} confirmou presença`
    : `${confirmedNames.length} pessoas confirmaram presença`;
  const emailSubject =
    confirmedCount === 1
      ? `${confirmedNames[0]} confirmou presen\u00e7a`
      : `${confirmedCount} pessoas confirmaram presen\u00e7a`;
  const text = [
    "Yasmim & Vitor — Nova confirmação de presença",
    `Resposta enviada por: ${input.respondentName}`,
    `E-mail de contato: ${input.email}`,
    input.familyLabel ? `Grupo: ${input.familyLabel}` : "",
    "",
    ...input.responses.map((response) => `${response.guestName}: ${response.attendance === "confirmed" ? "Presença confirmada" : "Não irá"}`),
    "",
    `Observação: ${input.note?.trim() || "Nenhuma"}`,
  ].join("\n");
  const html = `<html lang="pt-BR"><body style="font-family:Arial,sans-serif;color:#27272a;padding:24px;">
    <h1 style="font-size:24px;">Nova confirmação de presença</h1>
    <p style="white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;">${escapeHtml(text)}</p>
  </body></html>`;
  const summaryText =
    confirmedCount === 1
      ? "1 presen\u00e7a confirmada"
      : `${confirmedCount} presen\u00e7as confirmadas`;
  const note = input.note?.trim() || "Nenhuma observa\u00e7\u00e3o enviada.";
  const groupHtml = input.familyLabel
    ? `<span style="display:inline-block;margin-top:8px;border:1px solid #d8dece;border-radius:999px;background:#ffffff;padding:8px 12px;font-size:13px;font-weight:700;color:#58664a;">Grupo: ${escapeHtml(input.familyLabel)}</span>`
    : "";
  const responseRows = input.responses
    .map((response) => {
      const isConfirmed = response.attendance === "confirmed";
      const color = isConfirmed ? "#047857" : "#be123c";
      const background = isConfirmed ? "#ecfdf5" : "#fff1f2";
      const border = isConfirmed ? "#a7f3d0" : "#fecdd3";
      const label = isConfirmed ? "Confirmou presen\u00e7a" : "N\u00e3o ir\u00e1";

      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e4e4e7;">
            <div style="font-size:15px;font-weight:700;color:#18181b;">${escapeHtml(response.guestName)}</div>
          </td>
          <td align="right" style="padding:14px 0;border-bottom:1px solid #e4e4e7;">
            <span style="display:inline-block;border:1px solid ${border};border-radius:999px;background:${background};padding:8px 12px;font-size:12px;font-weight:700;color:${color};white-space:nowrap;">${label}</span>
          </td>
        </tr>`;
    })
    .join("");
  const styledHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>${escapeHtml(emailSubject)}</title>
    <style>
      :root { color-scheme: light only; supported-color-schemes: light only; }
      body, table, td, div, p, h1 { color-scheme: light only; }
      @media screen and (max-width: 560px) {
        .email-shell { padding: 14px 8px !important; }
        .email-card { border-radius: 22px !important; }
        .email-hero, .email-body { padding: 26px 22px !important; }
        .email-title { font-size: 32px !important; line-height: 1.08 !important; }
        .email-summary-cell, .email-count-cell {
          display: block !important;
          width: 100% !important;
          text-align: left !important;
        }
        .email-count-pill { margin-top: 16px !important; }
        .email-contact-card {
          display: block !important;
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body style="margin:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;color:#27272a;color-scheme:light only;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(summaryText)} para o casamento de Yasmim &amp; Vitor.</div>
    <table class="email-shell" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f3ef;padding:28px 12px;">
      <tr>
        <td align="center">
          <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;overflow:hidden;border:1px solid #e4e4e7;border-radius:28px;background:#ffffff;box-shadow:0 22px 70px rgba(24,24,27,0.10);">
            <tr>
              <td class="email-hero" bgcolor="#fbfaf8" style="padding:38px 34px;background-color:#fbfaf8;background-image:linear-gradient(135deg,#fbfaf8,#ffffff);">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:#b89543;">Yasmim &amp; Vitor</div>
                <h1 class="email-title" style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.05;font-weight:700;color:#4f6146;">Nova confirma&ccedil;&atilde;o de presen&ccedil;a</h1>
                <p style="margin:16px 0 0;max-width:540px;font-size:15px;line-height:1.7;color:#52525b;">Uma resposta acabou de chegar pelo formul&aacute;rio do site.</p>
              </td>
            </tr>
            <tr>
              <td class="email-body" bgcolor="#ffffff" style="padding:32px;background-color:#ffffff;">
                <div style="border:1px solid #d8dece;border-radius:24px;background:#fafaf7;padding:22px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td class="email-summary-cell" valign="top">
                        <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">Resumo</div>
                        <div style="margin-top:8px;font-size:24px;font-weight:800;color:#18181b;">${escapeHtml(summaryText)}</div>
                        <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#52525b;">${declinedCount > 0 ? `${declinedCount} resposta${declinedCount === 1 ? "" : "s"} marcada${declinedCount === 1 ? "" : "s"} como n\u00e3o ir\u00e1.` : "Nenhuma recusa neste envio."}</div>
                        ${groupHtml}
                      </td>
                      <td class="email-count-cell" align="right" valign="top">
                        <span class="email-count-pill" style="display:inline-block;border-radius:999px;background:#4f6146;padding:12px 18px;font-size:15px;font-weight:800;color:#fffdf3;">${confirmedCount}</span>
                      </td>
                    </tr>
                  </table>
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                  <tr>
                    <td class="email-contact-card" width="50%" valign="top" style="padding:0 8px 12px 0;">
                      <div style="height:100%;border:1px solid #e4e4e7;border-radius:20px;background:#ffffff;padding:18px;">
                        <div style="font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">Respondido por</div>
                        <div style="margin-top:8px;font-size:17px;font-weight:800;color:#18181b;">${escapeHtml(input.respondentName)}</div>
                      </div>
                    </td>
                    <td class="email-contact-card" width="50%" valign="top" style="padding:0 0 12px 8px;">
                      <div style="height:100%;border:1px solid #e4e4e7;border-radius:20px;background:#ffffff;padding:18px;">
                        <div style="font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">E-mail de contato</div>
                        <div style="margin-top:8px;font-size:15px;font-weight:700;color:#18181b;overflow-wrap:anywhere;">${escapeHtml(input.email)}</div>
                      </div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:14px;">
                  <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">Nomes respondidos</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
                    ${responseRows}
                  </table>
                </div>
                <div style="margin-top:28px;border-left:4px solid #b89543;border-radius:20px;background:#fbfaf8;padding:18px 20px;">
                  <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">Observa&ccedil;&atilde;o</div>
                  <p style="margin:8px 0 0;font-size:15px;line-height:1.7;color:#3f3f46;white-space:pre-wrap;overflow-wrap:anywhere;">${escapeHtml(note)}</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return { subject: emailSubject, text: text || subject, html: styledHtml || html };
}

export async function sendRsvpCoupleEmail(input: RsvpCoupleEmailInput) {
  if (!input.responses.some((response) => response.attendance === "confirmed")) {
    return { skipped: true };
  }
  const env = getOptionalServerEnv();
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.warn("Aviso aos noivos ignorado: RESEND_API_KEY ou EMAIL_FROM nao configurado.");
    return { skipped: true };
  }
  const rendered = renderRsvpCoupleEmail(input);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `rsvp-couple-${input.rsvpId}`,
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: COUPLE_EMAILS,
      ...rendered,
    }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Resend falhou ao avisar os noivos (${response.status}): ${JSON.stringify(body)}`);
  }
  return { skipped: false, id: body?.id as string | undefined };
}

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
