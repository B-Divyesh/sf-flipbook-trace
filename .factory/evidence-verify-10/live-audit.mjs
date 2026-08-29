import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const base = 'https://flipbook-trace.sociobot.in';
const browser = await chromium.launch({ headless: true });
const result = {
  routes: {},
  coldRequests: [],
  demo: {},
  keyboard: {},
  reducedMotion: {},
  offline: {},
  startup: {},
  headers: {},
  manifest: {},
};

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !(route === '/missing-page' && message.text().includes('404'))) errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    if (viewport.name === 'desktop' && route === '/') {
      page.on('request', (request) => result.coldRequests.push({ method: request.method(), url: request.url() }));
    }
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    if (route === '/demo') await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
    const axe = await new AxeBuilder({ page }).analyze();
    const seriousOrCritical = axe.violations
      .filter(({ impact }) => impact === 'serious' || impact === 'critical')
      .map(({ id, impact }) => ({ id, impact }));
    const visibleTargets = page.locator('a:visible, button:visible, input:visible, select:visible');
    const undersized = [];
    for (let index = 0; index < await visibleTargets.count(); index += 1) {
      const target = visibleTargets.nth(index);
      const box = await target.evaluate((element) => {
        const hitTarget = element.matches('input[type="radio"], input[type="checkbox"]') ? element.closest('label') : element;
        const rect = hitTarget?.getBoundingClientRect();
        return rect ? { width: rect.width, height: rect.height } : null;
      });
      if (box && (box.width < 44 || box.height < 44)) undersized.push({ label: (await target.getAttribute('aria-label')) || (await target.innerText().catch(() => '')), width: box.width, height: box.height });
    }
    result.routes[`${viewport.name}${route}`] = {
      status: response?.status(),
      title: await page.title(),
      lang: await page.locator('html').getAttribute('lang'),
      h1: await page.locator('h1').count(),
      main: await page.locator('main').count(),
      horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
      seriousOrCritical,
      errors,
      undersized,
    };
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const runtimeRequests = [];
  page.on('request', (request) => runtimeRequests.push({ method: request.method(), url: request.url() }));
  const pngEvent = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const png = await pngEvent;
  const pngBytes = await readFile(await png.path());
  const pdfEvent = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const pdf = await pdfEvent;
  const pdfBytes = await readFile(await pdf.path());
  await page.locator('#fps').selectOption('12');
  await page.locator('#trim-end').fill('5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor();
  const generatedCount = await page.locator('#frame-strip figure').count();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  result.demo = {
    generatedCount,
    resetCount: await page.locator('#frame-strip figure').count(),
    png: { filename: png.suggestedFilename(), bytes: pngBytes.length, signature: pngBytes.subarray(0, 4).toString('hex') },
    pdf: { filename: pdf.suggestedFilename(), bytes: pdfBytes.length, signature: pdfBytes.subarray(0, 8).toString('latin1') },
    runtimeRequests,
    errors,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  await page.keyboard.press('Tab');
  const firstTab = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.locator('#threshold').focus();
  const before = Number(await page.locator('#threshold').inputValue());
  await page.keyboard.press('ArrowRight');
  const after = Number(await page.locator('#threshold').inputValue());
  const focus = await page.locator('#threshold').evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor };
  });
  result.keyboard = { firstTab, before, after, focus };
  await context.close();
}

{
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  result.reducedMotion = await page.locator('.hero-art').evaluate((element) => {
    const style = getComputedStyle(element);
    return { animationDuration: style.animationDuration, transitionDuration: style.transitionDuration };
  });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  const cacheNames = await page.evaluate(() => caches.keys());
  const worker = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL);
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  result.offline = { status: response?.status(), frames: await page.locator('#frame-strip figure').count(), cacheNames, worker };
  await context.close();
}

{
  const longestTasks = [];
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.75 });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      const tasks = [];
      new PerformanceObserver((list) => tasks.push(...list.getEntries().map((entry) => entry.duration))).observe({ type: 'longtask', buffered: true });
      window.__startupLongTasks = tasks;
    });
    await page.goto(`${base}/?demo=1`);
    await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
    longestTasks.push(await page.evaluate(() => Math.max(0, ...window.__startupLongTasks)));
    await context.close();
  }
  result.startup = { longestTasks, maximumMs: Math.max(...longestTasks), passesUnder200: longestTasks.every((value) => value < 200) };
}

for (const [name, path] of [
  ['home', '/'],
  ['demo', '/demo'],
  ['worker', '/sw.js'],
  ['asset', '/assets/index-C0D3_r2N.js'],
  ['manifest', '/manifest.webmanifest'],
  ['missing', '/missing-page'],
]) {
  const response = await fetch(`${base}${path}`);
  result.headers[name] = Object.fromEntries([
    ['status', response.status],
    ['cacheControl', response.headers.get('cache-control')],
    ['contentType', response.headers.get('content-type')],
    ['csp', response.headers.get('content-security-policy')],
    ['hsts', response.headers.get('strict-transport-security')],
    ['nosniff', response.headers.get('x-content-type-options')],
    ['referrerPolicy', response.headers.get('referrer-policy')],
    ['permissionsPolicy', response.headers.get('permissions-policy')],
  ]);
}
result.manifest = await (await fetch(`${base}/manifest.webmanifest`)).json();

assert.equal(result.demo.generatedCount, 60);
assert.equal(result.demo.resetCount, 12);
assert.equal(result.demo.runtimeRequests.length, 0);
assert.equal(result.demo.errors.length, 0);
assert.equal(result.offline.frames, 12);

await browser.close();
await writeFile('.factory/evidence-verify-10/live-audit.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
