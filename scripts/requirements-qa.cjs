const { chromium } = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  fs.mkdirSync('docs/qa', { recursive: true });
  try {
    for (const path of ['/', '/historia', '/evento', '/inscricao', '/acompanhamento', '/conta']) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('a[href^="/admin"]').count(), 0, `Public admin link at ${path}`);
    }
    await page.goto(base + '/admin/reservas', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Acesso administrativo', exact: true }).waitFor();
    await page.goto(base + '/inscricao', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page.getByLabel('CEP', { exact: true }).fill('01001-000');
    await page.getByText('Endereço preenchido pelo ViaCEP.', { exact: false }).waitFor();
    assert.equal(await page.getByLabel('Cidade', { exact: true }).inputValue(), 'São Paulo');
    assert.equal(await page.getByLabel('Estado', { exact: true }).inputValue(), 'SP');
    await page.getByLabel('Número', { exact: true }).fill('100');
    await page.getByLabel('Complemento', { exact: false }).fill('Exemplo');
    await page.getByLabel('CEP', { exact: true }).fill('99999999');
    await page.getByText('CEP não encontrado.', { exact: false }).waitFor();
    await page.getByLabel('Endereço', { exact: true }).fill('Endereço manual');
    assert.equal(await page.getByLabel('Número', { exact: true }).inputValue(), '100');
    await page.screenshot({ path: 'docs/qa/viacep-form.png', fullPage: true });
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.goto(base + '/admin', { waitUntil: 'networkidle' });
    await page.getByLabel('E-mail', { exact: true }).fill(process.env.TEST_ADMIN_EMAIL);
    await page.getByLabel('Senha', { exact: true }).fill(process.env.TEST_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Entrar no painel', exact: true }).click();
    await page.getByRole('heading', { name: 'Visão geral', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Perguntas frequentes', exact: true }).click();
    await page.getByRole('button', { name: 'Adicionar item', exact: false }).click();
    const marker = `QA interface ${Date.now()}`;
    await page.locator('#field-question').fill(marker);
    await page.locator('#field-answer').fill('Registro temporário para validar o painel.');
    await page.getByLabel('Ativo no site', { exact: true }).uncheck();
    const create = page.waitForResponse(response => response.url().endsWith('/api/admin/content/faq') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    assert.equal((await create).status(), 201);
    const row = page.locator('.content-row').filter({ hasText: marker });
    await row.waitFor();
    await row.getByRole('button', { name: 'Editar item', exact: true }).click();
    await page.locator('#field-answer').fill('Edição confirmada pela interface.');
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await row.getByText('Edição confirmada pela interface.', { exact: true }).waitFor();
    await row.getByRole('button', { name: 'Excluir item', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir item', exact: true }).click();
    await row.waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await page.getByRole('heading', { name: 'Bem-vinda ao painel', exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ base, publicLinks: 'hidden', demoAdmin: 'protected', viaCep: 'passed', manualAddress: 'passed', adminCrud: 'passed', errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
