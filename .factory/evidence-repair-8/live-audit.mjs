import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const base = 'https://flipbook-trace.sociobot.in';
const browser = await chromium.launch({ headless: true });
const result = { routes: {}, pngExport: {}, desktopDemo: {}, mobileKeyboard: {}, offline: {} };

for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !(route === '/missing-page' && message.text().includes('404'))) errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  if (route === '/demo') await page.locator('#frame-strip figure').first().waitFor();
  const axe = await new AxeBuilder({ page }).analyze();
  const seriousOrCriticalAxe = axe.violations
    .filter(({ impact }) => impact === 'serious' || impact === 'critical')
    .map(({ id }) => id);
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.equal(await page.locator('main').count(), 1);
  assert.equal(await page.locator('h1').count(), 1);
  assert.deepEqual(seriousOrCriticalAxe, []);
  assert.deepEqual(errors, []);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  result.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    frames: route === '/demo' ? await page.locator('#frame-strip figure').count() : undefined,
    seriousOrCriticalAxe,
  };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const event = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const download = await event;
  const bytes = await readFile(await download.path());
  assert.equal(download.suggestedFilename(), 'flipbook-trace-frames.zip');
  assert.equal(bytes.subarray(0, 4).toString('latin1'), 'PK\x03\x04');
  assert.ok(bytes.toString('latin1').includes('flipbook-frame-012.png'));
  assert.equal(await page.locator('#work-status').textContent(), '12 PNGs exported');
  assert.deepEqual(requests, []);
  result.pngExport = {
    bytes: bytes.length,
    filename: download.suggestedFilename(),
    finalEntry: 'flipbook-frame-012.png',
    requests,
    status: await page.locator('#work-status').textContent(),
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.locator('#frame-strip figure').first().waitFor();
  const initialFrames = await page.locator('#frame-strip figure').count();
  const runtimeRequests = [];
  page.on('request', (request) => runtimeRequests.push(request.url()));
  await page.locator('#fps').selectOption('12');
  await page.locator('#trim-end').fill('5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor();
  const maximumFrames = await page.locator('#frame-strip figure').count();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  assert.equal(initialFrames, 12);
  assert.equal(maximumFrames, 60);
  assert.deepEqual(runtimeRequests, []);
  result.desktopDemo = { initialFrames, maximumFrames, resetFrames: await page.locator('#frame-strip figure').count(), runtimeRequests };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.locator('#frame-strip figure').first().waitFor();
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
  result.mobileKeyboard = { firstTab, before, after, outline };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#frame-strip figure').first().waitFor();
  const frames = await page.locator('#frame-strip figure').count();
  assert.equal(frames, 12);
  result.offline = { frames, banner: await page.getByText('Demo — sample data, nothing is saved').isVisible() };
  await context.close();
}

await browser.close();
await writeFile('.factory/evidence-repair-8/live-audit.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
