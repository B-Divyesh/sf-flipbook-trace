import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const base = 'https://flipbook-trace.sociobot.in';
const browser = await chromium.launch({ headless: true });
const result = { headers: {}, routes: {}, exports: {}, keyboard: {}, offline: {}, startup: {} };

for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !(route === '/missing-page' && message.text().includes('404'))) errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  if (route === '/demo') await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const axe = await new AxeBuilder({ page }).analyze();
  const seriousOrCriticalAxe = axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical').map(({ id }) => id);
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.equal(await page.locator('main').count(), 1);
  assert.equal(await page.locator('h1').count(), 1);
  assert.deepEqual(seriousOrCriticalAxe, []);
  assert.deepEqual(errors, []);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  result.routes[route] = { status: response?.status(), title: await page.title(), seriousOrCriticalAxe };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const runtimeRequests = [];
  page.on('request', (request) => runtimeRequests.push(request.url()));
  const pngEvent = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const png = await pngEvent;
  const pngBytes = await readFile(await png.path());
  assert.equal(png.suggestedFilename(), 'flipbook-trace-frames.zip');
  assert.equal(pngBytes.subarray(0, 4).toString('latin1'), 'PK\x03\x04');
  assert.ok(pngBytes.toString('latin1').includes('flipbook-frame-012.png'));
  const pdfEvent = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const pdf = await pdfEvent;
  const pdfBytes = await readFile(await pdf.path());
  assert.equal(pdf.suggestedFilename(), 'flipbook-trace-sheet.pdf');
  assert.equal(pdfBytes.subarray(0, 8).toString('latin1'), '%PDF-1.4');
  await page.locator('#fps').selectOption('12');
  await page.locator('#trim-end').fill('5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  assert.deepEqual(runtimeRequests, []);
  result.exports = { pngBytes: pngBytes.length, pdfBytes: pdfBytes.length, runtimeRequests };
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
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const after = Number(await page.locator('#threshold').inputValue());
  const outline = await page.locator('#threshold').evaluate((element) => getComputedStyle(element).outlineWidth);
  assert.equal(firstTab, 'Skip to main content');
  assert.equal(after, before + 1);
  assert.equal(outline, '3px');
  result.keyboard = { firstTab, before, after, outline };
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
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  result.offline = { frames: await page.locator('#frame-strip figure').count() };
  assert.equal(result.offline.frames, 12);
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
    const longest = await page.evaluate(() => Math.max(0, ...window.__startupLongTasks));
    assert.ok(longest < 200, `Live startup task ${longest} ms exceeds the 200 ms gate.`);
    longestTasks.push(longest);
    await context.close();
  }
  result.startup = { longestTasks, maximumMs: Math.max(...longestTasks) };
}

for (const [name, path] of [['home', '/'], ['worker', '/sw.js'], ['asset', '/assets/index-C0D3_r2N.js'], ['missing', '/missing-page']]) {
  const response = await fetch(`${base}${path}`);
  result.headers[name] = { status: response.status, cacheControl: response.headers.get('cache-control'), csp: response.headers.get('content-security-policy'), hsts: response.headers.get('strict-transport-security') };
}
assert.equal(result.headers.missing.status, 404);
assert.match(result.headers.worker.cacheControl || '', /no-cache/);
assert.match(result.headers.asset.cacheControl || '', /immutable/);
assert.match(result.headers.home.csp || '', /frame-ancestors 'none'/);

await browser.close();
await writeFile('.factory/evidence-repair-9/live-audit.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
