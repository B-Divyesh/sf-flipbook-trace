import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://flipbook-trace.sociobot.in';
const browser = await chromium.launch({ headless: true });
const report = { measuredAt: new Date().toISOString(), routes: {}, demo: {}, realVideo: {}, errors: {}, keyboard: {}, motion: {}, offline: {}, pwa: {} };

function watch(page) {
  const errors = [];
  const requests = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  page.on('requestfailed', (request) => errors.push(`request failed: ${request.url()} ${request.failure()?.errorText}`));
  page.on('request', (request) => requests.push(`${request.method()} ${request.url()}`));
  return { errors, requests };
}

async function makeVideo(page, seconds = 6.1) {
  await page.evaluate(async ({ seconds }) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    const recorder = new MediaRecorder(canvas.captureStream(10), { mimeType: 'video/webm' });
    const chunks = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.start();
    const start = performance.now();
    while (performance.now() - start < seconds * 1000) {
      const elapsed = performance.now() - start;
      ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, 320, 200);
      ctx.fillStyle = '#0b5f71'; ctx.fillRect((elapsed / (seconds * 1000)) * 260, 70, 55, 55);
      ctx.fillStyle = '#ad352d'; ctx.beginPath(); ctx.arc(160, 50, 18, 0, Math.PI * 2); ctx.fill();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await new Promise((resolve) => { recorder.onstop = resolve; recorder.stop(); });
    const transfer = new DataTransfer();
    transfer.items.add(new File(chunks, 'qa-six-seconds.webm', { type: 'video/webm' }));
    const input = document.querySelector('#video-file');
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, { seconds });
}

for (const route of ['/', '/?demo=1', '/privacy', '/terms', '/missing-page']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const observed = watch(page);
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  report.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    lang: await page.locator('html').getAttribute('lang'),
    h1: await page.locator('h1').allTextContents(),
    mainCount: await page.locator('main').count(),
    horizontalOverflowPx: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    seriousCriticalAxe: axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact || '')).map((v) => ({ id: v.id, impact: v.impact, help: v.help })),
    errors: observed.errors,
    crossOriginRequests: observed.requests.filter((entry) => new URL(entry.split(' ').slice(1).join(' ')).origin !== base),
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const observed = watch(page);
  await page.goto(base, { waitUntil: 'networkidle' });
  const first = {
    h1: await page.locator('h1').innerText(),
    audience: await page.locator('.lede').first().innerText(),
    action: await page.getByRole('link', { name: 'Try it with sample data' }).innerText(),
  };
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForURL(/demo=1/);
  await page.locator('#frame-strip figure').first().waitFor();
  const initialFrames = await page.locator('#frame-strip figure').count();
  const runtimeRequests = [];
  const listener = (request) => runtimeRequests.push(`${request.method()} ${request.url()}`);
  page.on('request', listener);
  await page.locator('#trim-end').fill('5');
  await page.locator('#fps').selectOption('12');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor();
  const maxFrames = await page.locator('#frame-strip figure').count();
  await page.locator('#trim-end').fill('0.5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  const invalid = await page.getByRole('alert').innerText();
  await page.locator('#trim-end').fill('2');
  await page.locator('#fps').selectOption('6');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const zipEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const zip = await zipEvent;
  const pdfEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const pdf = await pdfEvent;
  page.off('request', listener);
  report.demo = { first, urlAfterOneClick: page.url(), banner: await page.getByText('Demo — sample data, nothing is saved').innerText(), initialFrames, maxFrames, invalid, recoveredFrames: await page.locator('#frame-strip figure').count(), zip: zip.suggestedFilename(), pdf: pdf.suggestedFilename(), runtimeRequests, errors: observed.errors };
  await page.screenshot({ path: '.factory/qa-artifacts/live-demo-desktop.png', fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const observed = watch(page);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { if ('serviceWorker' in navigator) await navigator.serviceWorker.ready; });
  observed.requests.length = 0;
  await makeVideo(page);
  await page.locator('#frame-strip figure').first().waitFor({ timeout: 20000 });
  await page.locator('#fps').selectOption('2');
  await page.locator('#trim-start').fill('0');
  await page.locator('#trim-end').fill('1');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '2 frames ready' }).waitFor({ timeout: 20000 });
  const minFrames = await page.locator('#frame-strip figure').count();
  await page.locator('#fps').selectOption('12');
  await page.locator('#trim-end').fill('5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor({ timeout: 20000 });
  const maxFrames = await page.locator('#frame-strip figure').count();
  await page.locator('#trim-end').fill('5.1');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  const invalid = await page.getByRole('alert').innerText();
  await page.locator('#trim-end').fill('1');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor({ timeout: 20000 });
  const zipEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const zip = await zipEvent;
  const pdfEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const pdf = await pdfEvent;
  const requestsBeforeReload = [...observed.requests];
  await page.reload({ waitUntil: 'networkidle' });
  report.realVideo = { minFrames, maxFrames, invalid, zip: zip.suggestedFilename(), pdf: pdf.suggestedFilename(), afterReloadFrames: await page.locator('#frame-strip figure').count(), afterReloadFile: await page.locator('#video-file').inputValue(), requestsDuringWorkflow: requestsBeforeReload, requestsIncludingReload: observed.requests, errors: observed.errors };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const firstTab = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), id: document.activeElement?.id }));
  const skipFocus = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return { outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}` }; });
  let tabCount = 0;
  while (tabCount < 80 && await page.evaluate(() => document.activeElement?.id !== 'threshold')) { await page.keyboard.press('Tab'); tabCount += 1; }
  const before = await page.locator('#threshold').inputValue();
  await page.keyboard.press('ArrowRight');
  const after = await page.locator('#threshold').inputValue();
  const rangeFocus = await page.locator('#threshold').evaluate((el) => { const s = getComputedStyle(el); return `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`; });
  let exportTabs = 0;
  while (exportTabs < 80 && await page.evaluate(() => document.activeElement?.textContent?.trim() !== 'Export PNG pack')) { await page.keyboard.press('Tab'); exportTabs += 1; }
  const downloadEvent = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  const download = await downloadEvent;
  report.keyboard = { firstTab, skipFocus, tabsToRange: tabCount, rangeBefore: before, rangeAfter: after, rangeFocus, tabsToExport: exportTabs, export: download.suggestedFilename() };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  report.motion = { mediaMatches: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), activeAnimations: await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length) };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })); });
  const manifest = await page.evaluate(async () => (await fetch('/manifest.webmanifest')).json());
  const controller = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL || null);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#frame-strip figure').first().waitFor();
  report.offline = { frames: await page.locator('#frame-strip figure').count(), banner: await page.getByText('Demo — sample data, nothing is saved').isVisible(), url: page.url() };
  report.pwa = { controller, manifest };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByText('Have a license?').click();
  await page.getByRole('button', { name: 'Verify license' }).click();
  const emptyLicense = await page.locator('#license-status').innerText();
  await page.locator('#quality').selectOption('1920');
  const paidRecovery = { quality: await page.locator('#quality').inputValue(), alert: await page.getByRole('alert').innerText() };
  await page.locator('#import-settings').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
  const badSettings = await page.locator('#form-error').innerText();
  report.errors = { emptyLicense, paidRecovery, badSettings };
  await context.close();
}

await browser.close();
const output = JSON.stringify(report, null, 2);
await writeFile('.factory/qa-artifacts/live-qa.json', output);
console.log(output);
