import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const results = [];
    for (const mode of ['admin', 'cerimonial']) {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        let requests = [], fail = false;
        await page.route('**/api/' + mode + '/suppliers**', async (route) => { const req = route.request(); if (!['POST', 'PATCH'].includes(req.method()))
            throw Error('Unexpected mutation ' + req.method()); const data = req.postDataJSON(); requests.push({ method: req.method(), data }); await route.fulfill({ status: fail ? 500 : 200, json: fail ? { error: { message: 'Falha simulada. Tente novamente.' } } : { supplier: { ...data, id: 'test-supplier', isActive: true, createdAt: '2026-09-07T12:00:00.000Z', updatedAt: '2026-09-07T12:00:00.000Z' } } }); });
        await page.goto((process.env.SUPPLIER_TEST_URL || 'http://localhost:3000') + '/supplier-test-preview?mode=' + mode);
        const open = page.getByRole('button', { name: 'Adicionar fornecedor', exact: true });
        await open.click();
        const dialog = page.getByRole('dialog');
        const save = dialog.getByRole('button', { name: 'Salvar fornecedor', exact: true });
        async function geometry(label) { await page.waitForFunction(() => { const d = document.querySelector("dialog"); return Math.abs(parseFloat(d.style.getPropertyValue("--supplier-height")) - window.visualViewport.height) < 2; }); const g = await dialog.evaluate(el => { const f = el.querySelector('footer').getBoundingClientRect(), body = el.querySelector('fieldset').getBoundingClientRect(), b = el.querySelector('button[type=submit]').getBoundingClientRect(); const top = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return { horizontal: el.scrollWidth <= el.clientWidth + 1, pageHorizontal: document.documentElement.scrollWidth <= window.innerWidth + 1, bodyHorizontal: document.body.scrollWidth <= window.innerWidth + 1, bodyAboveFooter: body.bottom <= f.top + 1, saveVisible: b.top >= 0 && b.bottom <= window.innerHeight + 1, hit: top === el.querySelector('button[type=submit]'), modal: el.matches(':modal') }; }); assert.ok(Object.values(g).every(Boolean), label + JSON.stringify(g)); results.push(mode + ' ' + label + ': PASS'); }
        async function pageDoesNotDragSideways(label) { await page.evaluate(() => window.scrollTo(9999, window.scrollY)); const g = await page.evaluate(() => ({ scrollX: window.scrollX, documentFits: document.documentElement.scrollWidth <= window.innerWidth + 1, bodyFits: document.body.scrollWidth <= window.innerWidth + 1 })); assert.equal(g.scrollX, 0, label + JSON.stringify(g)); assert.ok(g.documentFits && g.bodyFits, label + JSON.stringify(g)); results.push(mode + ' ' + label + ': PASS'); }
        await geometry('initial');
        await save.click();
        await dialog.getByRole('alert').waitFor();
        assert.equal(requests.length, 0);
        await geometry('required-errors');
        await dialog.getByLabel('Nome do fornecedor *', { exact: true }).fill('Flores da Vila Eventos Premium');
        await dialog.getByLabel('Categoria *', { exact: true }).fill('Decoração floral e ambientação');
        await dialog.getByLabel('Telefone ou WhatsApp *', { exact: true }).fill('(11) 99999-1234');
        for (const title of ['Contato adicional', 'Contrato e pagamentos', 'Observações'])
            await dialog.locator('summary').filter({ hasText: title }).click();
        await dialog.getByLabel('Nome do responsável', { exact: true }).fill('Marina Costa');
        await dialog.getByLabel('Valor do contrato', { exact: true }).fill('8500');
        await dialog.getByLabel('Valor já pago', { exact: true }).fill('2500');
        await dialog.getByLabel('Data de fechamento do contrato', { exact: true }).fill('2026-09-05');
        await dialog.getByLabel('Observações importantes', { exact: true }).fill('Confirmar flores brancas e horário de montagem.');
        if (mode === 'cerimonial')
            await dialog.getByLabel('Email', { exact: true }).fill('marina@example.com');
        for (const [width, height] of [[320, 568], [390, 844], [430, 932], [844, 390], [1280, 800]]) {
            await page.setViewportSize({ width, height });
            await geometry(width + 'x' + height + ' all sections');
            await page.screenshot({ path: `design/fornecedor-mobile/validacao/${mode}-${width}x${height}.png` });
        }
        await page.setViewportSize({ width: 390, height: 500 });
        await dialog.locator('textarea').focus();
        await geometry('reduced viewport 390x500');
        await page.screenshot({ path: `design/fornecedor-mobile/validacao/${mode}-teclado-simulado.png` });
        await page.setViewportSize({ width: 390, height: 844 });
        await dialog.locator('summary').filter({ hasText: 'Contrato e pagamentos' }).click();
        await dialog.locator('summary').filter({ hasText: 'Contrato e pagamentos' }).click();
        assert.equal(await dialog.getByLabel('Valor do contrato', { exact: true }).inputValue(), 'R$ 8.500,00');
        await dialog.getByLabel('Valor já pago', { exact: true }).fill('9000');
        await save.click();
        assert.equal(requests.length, 0);
        assert.match(await dialog.getByRole('alert').innerText(), /maior/);
        await geometry('invalid payment');
        await dialog.getByLabel('Valor já pago', { exact: true }).fill('2500');
        fail = true;
        await save.click();
        await dialog.getByRole('alert').filter({ hasText: 'Falha simulada' }).waitFor();
        assert.equal(await dialog.getByLabel('Nome do fornecedor *', { exact: true }).inputValue(), 'Flores da Vila Eventos Premium');
        await geometry('api failure keeps draft');
        fail = false;
        await save.click();
        await dialog.waitFor({ state: 'detached' });
        await pageDoesNotDragSideways('supplier list no horizontal drag');
        const payload = requests.at(-1).data;
        assert.equal(payload.contractValueCents, 850000);
        assert.equal(payload.amountPaidCents, 250000);
        assert.equal(payload.contactName, 'Marina Costa');
        assert.equal(payload.note, 'Confirmar flores brancas e horário de montagem.');
        assert.equal(payload.nextPaymentDue, '2026-09-05');
        results.push(mode + ' create payload and currency: PASS');
        if (mode === 'admin') {
            await page.getByRole('button', { name: 'Editar Flores da Vila Eventos Premium', exact: true }).click();
            await dialog.waitFor();
            await dialog.getByLabel('Nome do fornecedor *', { exact: true }).fill('Flores da Vila editado');
            await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
            await dialog.waitFor({ state: 'detached' });
            assert.equal(requests.at(-1).method, 'PATCH');
            assert.equal(requests.at(-1).data.note, payload.note);
            results.push('admin edit keeps optional data: PASS');
        }
        await open.click();
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
        assert.ok(await open.evaluate(el => el === document.activeElement));
        assert.equal(await page.evaluate(() => document.body.style.overflow), '');
        assert.deepEqual(errors, []);
        await open.click();
        await dialog.getByLabel('Nome do fornecedor *', { exact: true }).fill('Fornecedor essencial');
        await dialog.getByLabel('Categoria *', { exact: true }).fill('Buffet');
        await dialog.getByLabel('Telefone ou WhatsApp *', { exact: true }).fill('11999991234');
        await dialog.locator('button[type=submit]').click();
        await dialog.waitFor({ state: 'detached' });
        assert.equal(requests.at(-1).data.contractValueCents, null);
        assert.equal(requests.at(-1).data.amountPaidCents, 0);
        assert.equal(requests.at(-1).data.note, '');
        results.push(mode + ' essential-only save: PASS');
        results.push(mode + ' escape, focus restore, console: PASS');
        await page.close();
    }
    fs.writeFileSync('design/fornecedor-mobile/validacao/results.json', JSON.stringify(results, null, 2));
    console.log(results.join('\n'));
    await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
