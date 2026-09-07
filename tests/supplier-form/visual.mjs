import { chromium } from "playwright";
import assert from "node:assert/strict";
(async () => {
    const b = await chromium.launch({ channel: 'chrome', headless: true });
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await p.goto((process.env.SUPPLIER_TEST_URL || 'http://localhost:3000') + '/supplier-test-preview');
    await p.getByRole('button', { name: 'Adicionar fornecedor', exact: true }).click();
    const d = p.getByRole('dialog');
    await d.getByLabel('Nome do fornecedor *', { exact: true }).fill('Flores da Vila');
    await d.getByLabel('Categoria *', { exact: true }).fill('Decoração');
    await d.getByLabel('Telefone ou WhatsApp *', { exact: true }).fill('(11) 99999-1234');
    await d.getByRole('button', { name: 'Fechar', exact: true }).focus();
    await p.screenshot({ path: 'design/fornecedor-mobile/validacao/final-essencial.png' });
    for (const [title, file] of [['Contato adicional', 'contato'], ['Contrato e pagamentos', 'contrato'], ['Observações', 'observacoes']]) {
        await d.locator('summary').filter({ hasText: title }).click();
        if (file === 'contato') {
            await d.getByLabel('Nome do responsável', { exact: true }).fill('Marina Costa');
            await d.getByRole('button', { name: 'Editar nos dados essenciais' }).click();
            assert.equal(await d.locator('input[type=tel]').evaluate(el => el === document.activeElement), true);
        }
        if (file === 'contrato') {
            await d.getByLabel('Valor do contrato', { exact: true }).fill('8500');
            await d.getByLabel('Valor já pago', { exact: true }).fill('2500');
            await d.getByLabel('Data de fechamento do contrato', { exact: true }).fill('2026-09-05');
        }
        if (file === 'observacoes')
            await d.locator('textarea').fill('Confirmar flores brancas e horário de montagem.');
        await d.locator('summary').filter({ hasText: title }).scrollIntoViewIfNeeded();
        await d.locator('fieldset').evaluate(el => el.scrollTop = el.scrollHeight);
        await p.screenshot({ path: `design/fornecedor-mobile/validacao/final-${file}.png` });
        if (file === 'observacoes') {
            await p.evaluate(() => { Object.defineProperty(window.visualViewport, 'height', { configurable: true, get: () => 480 }); Object.defineProperty(window.visualViewport, 'offsetTop', { configurable: true, get: () => 40 }); window.visualViewport.dispatchEvent(new Event('resize')); });
            const rect = await d.boundingBox();
            assert.equal(rect.y, 40);
            assert.equal(rect.height, 480);
            const save = await d.locator('button[type=submit]').boundingBox();
            assert.ok(save.y + save.height <= 520);
            await p.screenshot({ path: 'design/fornecedor-mobile/validacao/final-visual-viewport.png' });
            await p.evaluate(() => { delete window.visualViewport.height; delete window.visualViewport.offsetTop; window.visualViewport.dispatchEvent(new Event('resize')); });
        }
        await d.locator('summary').filter({ hasText: title }).click();
    }
    await d.locator('summary').filter({ hasText: 'Contrato e pagamentos' }).click();
    await d.locator('input[type=file]').setInputFiles({ name: 'nao-e-pdf.txt', mimeType: 'text/plain', buffer: Buffer.from('teste') });
    assert.match(await d.getByRole('alert').innerText(), /PDF/);
    await d.locator('input[type=file]').setInputFiles({ name: 'grande.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(11 * 1024 * 1024) });
    assert.match(await d.getByRole('alert').innerText(), /10 MB/);
    console.log('PASS: contact shortcut, visualViewport height/offset, invalid PDF, oversized PDF, final captures');
    await b.close();
})().catch(e => { console.error(e); process.exit(1); });
