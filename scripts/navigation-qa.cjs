const { chromium } = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  fs.mkdirSync('docs/qa', { recursive: true });
  let clicks = 0;
  async function openMenu() {
    const toggle = page.getByRole('button', { name: 'Abrir menu', exact: true });
    if (await toggle.isVisible()) await toggle.click();
  }
  async function current(href) {
    await page.waitForFunction(href => {
      const links = [...document.querySelectorAll('#main-nav a[aria-current]')];
      return links.length === 1 && links[0].getAttribute('href') === href;
    }, href);
    assert.equal(await page.locator('#main-nav .active').count(), 1);
  }
  async function clickAnchor(id) {
    await openMenu();
    await page.locator(`#main-nav a[href="/#${id}"]`).click();
    await current('/#' + id);
    await page.waitForFunction(id => {
      const element = document.getElementById(id);
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
      const target = Math.max(0, Math.min(scrollY + element.getBoundingClientRect().top - padding, document.documentElement.scrollHeight - innerHeight));
      return Math.abs(scrollY - target) < 3;
    }, id);
    clicks++;
  }
  try {
    for (const [width, height] of [[1440, 900], [1440, 1200], [768, 900], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(base + '/#inicio', { waitUntil: 'networkidle' });
      for (const id of ['sobre', 'valores', 'galeria', 'patrocinadores', 'contato', 'inicio']) await clickAnchor(id);
      await openMenu();
      await page.locator('#main-nav a[href="/historia"]').click();
      await page.waitForURL('**/historia');
      await current('/historia');
      await page.locator('.history-page h1').waitFor();
      await openMenu();
      await page.locator('#main-nav a[href="/#contato"]').click();
      await page.waitForURL('**/#contato');
      await current('/#contato');
      await openMenu();
      await page.locator('#main-nav a[href="/evento"]').click();
      await page.waitForURL('**/evento');
      await page.locator('h1').waitFor({ state: 'visible' });
      await page.goto(base + '/#valores', { waitUntil: 'networkidle' });
      await current('/#valores');
      await page.reload({ waitUntil: 'networkidle' });
      await current('/#valores');
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await current('/#contato');
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await current('/#inicio');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(base + '/#inicio', { waitUntil: 'networkidle' });
    await clickAnchor('contato');
    await clickAnchor('patrocinadores');
    await clickAnchor('valores');
    await page.locator('#main-nav a[href="/#inicio"]').hover();
    await page.waitForTimeout(350);
    const underlines = await page.locator('#main-nav a').evaluateAll(links => links.filter(link => parseFloat(getComputedStyle(link, '::after').width) > 1).map(link => link.getAttribute('href')));
    assert.deepEqual(underlines, ['/#valores']);
    await page.screenshot({ path: 'docs/qa/menu-corrigido.png' });
    await page.goBack({ waitUntil: 'networkidle' });
    await current('/#patrocinadores');
    await page.mouse.wheel(0, -10000);
    await current('/#inicio');

    if (process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD) {
      await page.goto(base + '/admin', { waitUntil: 'networkidle' });
      await page.getByLabel('E-mail', { exact: true }).fill(process.env.TEST_ADMIN_EMAIL);
      await page.getByLabel('Senha', { exact: true }).fill(process.env.TEST_ADMIN_PASSWORD);
      await page.getByRole('button', { name: 'Entrar no painel', exact: true }).click();
      await page.getByRole('heading', { name: 'Visão geral', exact: true }).waitFor();
      await page.locator('.dashboard-event').waitFor();
      assert.equal(await page.locator('.dashboard-pending').count(), 0);
      assert.equal(await page.locator('.dashboard-stats button').count(), 4);
      await page.screenshot({ path: 'docs/qa/admin-simplificado.png', fullPage: true });
      await page.getByRole('button', { name: 'Sair', exact: true }).click();
      await page.getByRole('heading', { name: 'Entrar no painel', exact: true }).waitFor();
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ base, clicks, sizes: 4, history: 'passed', event: 'passed', hashReload: 'passed', back: 'passed', manualScroll: 'passed', singleUnderline: 'passed', errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
