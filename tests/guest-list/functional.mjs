import assert from "node:assert/strict";
import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  const requests = [];
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/admin/guest-list", async (route) => {
    const request = route.request();

    if (request.method() !== "POST") {
      return route.continue();
    }

    const startedAt = Date.now();
    const payload = request.postDataJSON();
    requests.push({ payload, ms: Date.now() - startedAt });

    await route.fulfill({
      status: 200,
      json: {
        guest: {
          id: "guest_refresh_1",
          guestName: payload.guestName,
          whatsapp: payload.whatsapp,
          secondaryWhatsapp: null,
          email: null,
          familyLabel: payload.familyLabel || null,
          isChild: payload.isChild ?? false,
          note: payload.note || null,
          isActive: true,
          createdAt: "2026-09-07T12:00:00.000Z",
          updatedAt: "2026-09-07T12:00:00.000Z",
        },
      },
    });
  });

  await page.goto(
    `${process.env.SUPPLIER_TEST_URL || "http://localhost:3000"}/guest-refresh-test`,
  );

  await page.getByRole("button", { name: "Adicionar convidado", exact: true }).click();
  await page.getByPlaceholder("Nome do convidado").fill("Ana Cache Teste");
  await page.getByPlaceholder("WhatsApp individual do convidado").fill("(11) 98888-7777");
  await page.getByPlaceholder("Ex.: Familia Silva").fill("Familia Cache");
  await page.getByRole("button", { name: "Salvar convidado", exact: true }).click();

  await page.getByRole("button", { name: "Adicionar convidado", exact: true }).waitFor();
  await page.getByText("Ana Cache Teste").waitFor();
  await page.getByText("1 pendentes").waitFor();

  assert.equal(requests.length, 1);
  assert.equal(requests[0].payload.guestName, "Ana Cache Teste");
  assert.deepEqual(errors, []);

  console.log("PASS: guest create updates visible list and pending count without manual refresh");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
