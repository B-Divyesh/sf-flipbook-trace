import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const [baseUrl, evidenceDir, mode = 'local'] = process.argv.slice(2);
if (!baseUrl || !evidenceDir) throw new Error('Usage: node scripts/polish-8-audit.mjs <base-url> <evidence-dir> [local|live]');

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch();
const results = { baseUrl, mode, routes: [], keyboard: {}, demo: {}, offline: {}, requests: [] };
const expectedRoutes = [
  ['/', 200, 'Flipbook Trace — Turn video into tracing frames', '/'],
  ['/?demo=1', 200, 'Demo — Flipbook Trace', '/demo'],
  ['/demo', 200, 'Demo — Flipbook Trace', '/demo'],
  ['/privacy', 200, 'Privacy — Flipbook Trace', '/privacy'],
  ['/terms', 200, 'Terms — Flipbook Trace', '/terms'],
  ['/missing-page', mode === 'live' ? 404 : 200, 'Page not found — Flipbook Trace', mode === 'live' ? '/404.html' : '/missing-page'],
];

try {
  for (const [path, expectedStatus, title, canonicalPath] of expectedRoutes) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('status of 404')) errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(String(error)));
    const response = await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' });
    const axe = await new AxeBuilder({ page }).analyze();
    const serious = axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    const route = {
      path,
      status: response?.status(),
      title: await page.title(),
      h1: await page.locator('h1').count(),
      main: await page.locator('main').count(),
      lang: await page.locator('html').getAttribute('lang'),
      canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
      axeSeriousOrCritical: serious.length,
      consoleErrors: errors,
    };
    if (route.status !== expectedStatus) throw new Error(`${path} returned ${route.status}; expected ${expectedStatus}`);
    if (route.title !== title || route.h1 !== 1 || route.main !== 1 || route.lang !== 'en') throw new Error(`${path} structure or title failed: ${JSON.stringify(route)}`);
    if (route.canonical !== `https://flipbook-trace.sociobot.in${canonicalPath}`) throw new Error(`${path} canonical failed: ${route.canonical}`);
    if (serious.length || errors.length) throw new Error(`${path} accessibility or console failure: ${JSON.stringify({ serious, errors })}`);
    results.routes.push(route);
    await context.close();
  }

  for (const viewport of [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const facts = await page.locator('.fact-list').boundingBox();
    if (!facts || facts.y + facts.height > viewport.height) throw new Error(`${viewport.name} facts fall below the first screen`);
    await page.screenshot({ path: `${evidenceDir}/home-${viewport.name}.png`, fullPage: true });
    await page.getByRole('link', { name: 'Try it with sample data' }).click();
    await page.locator('#controls').waitFor();
    await page.locator('#export-png:not([disabled])').waitFor();
    const sample = await page.locator('#demo-strip canvas').first().boundingBox();
    if (!sample || sample.y + sample.height > viewport.height) throw new Error(`${viewport.name} sample falls below the first screen`);
    await page.screenshot({ path: `${evidenceDir}/demo-${viewport.name}.png`, fullPage: true });
    await context.close();
  }

  const keyboardContext = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const keyboardPage = await keyboardContext.newPage();
  const requestUrls = [];
  keyboardPage.on('request', (request) => requestUrls.push(request.url()));
  await keyboardPage.goto(new URL('/demo', baseUrl).href, { waitUntil: 'networkidle' });
  await keyboardPage.locator('#controls').waitFor();
  await keyboardPage.locator('#export-png:not([disabled])').waitFor();
  const visited = [];
  const tabTo = async (id) => {
    for (let index = 0; index < 40; index += 1) {
      await keyboardPage.keyboard.press('Tab');
      const active = await keyboardPage.evaluate(() => document.activeElement?.id || '');
      visited.push(active);
      if (active === id) return;
    }
    throw new Error(`Tab order did not reach #${id}: ${JSON.stringify(visited)}`);
  };
  await tabTo('threshold');
  await keyboardPage.keyboard.press('ArrowRight');
  await keyboardPage.locator('#export-png:not([disabled])').waitFor();
  await tabTo('export-png');
  let download = keyboardPage.waitForEvent('download');
  await keyboardPage.keyboard.press('Enter');
  await download;
  await tabTo('export-pdf');
  download = keyboardPage.waitForEvent('download');
  await keyboardPage.keyboard.press('Enter');
  await download;
  results.keyboard = { visited, png: true, pdf: true };

  await keyboardPage.locator('#fps').selectOption('12');
  await keyboardPage.locator('#trim-end').fill('5');
  await keyboardPage.getByRole('button', { name: 'Make tracing frames' }).click();
  await keyboardPage.locator('#frame-strip figure').nth(59).waitFor();
  const expanded = await keyboardPage.locator('#frame-strip figure').count();
  await keyboardPage.getByRole('button', { name: 'Reset demo' }).click();
  await keyboardPage.waitForFunction(() => document.querySelectorAll('#frame-strip figure').length === 12);
  const reset = await keyboardPage.locator('#frame-strip figure').count();
  if (expanded !== 60 || reset !== 12) throw new Error(`Demo reset failed: ${expanded} -> ${reset}`);
  results.demo = { expanded, reset };
  const productOrigin = new URL(baseUrl).origin;
  const offOrigin = requestUrls.filter((url) => new URL(url).origin !== productOrigin);
  if (offOrigin.length) throw new Error(`Demo made off-origin requests: ${JSON.stringify(offOrigin)}`);
  results.requests = requestUrls;
  await keyboardPage.screenshot({ path: `${evidenceDir}/demo-keyboard-mobile.png`, fullPage: true });
  await keyboardContext.close();

  const offlineContext = await browser.newContext();
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(new URL('/?demo=1', baseUrl).href);
  await offlinePage.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await offlineContext.setOffline(true);
  await offlinePage.reload({ waitUntil: 'domcontentloaded' });
  await offlinePage.locator('#frame-strip figure').nth(11).waitFor();
  results.offline = { frames: await offlinePage.locator('#frame-strip figure').count(), banner: await offlinePage.getByText('Demo — sample data, nothing is saved').isVisible() };
  if (results.offline.frames !== 12 || !results.offline.banner) throw new Error(`Offline demo failed: ${JSON.stringify(results.offline)}`);
  await offlineContext.close();

  await writeFile(`${evidenceDir}/audit.json`, `${JSON.stringify(results, null, 2)}\n`);
} finally {
  await browser.close();
}
