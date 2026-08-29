import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = 'https://flipbook-trace.sociobot.in';
const browser = await chromium.launch({ headless: true });
const result = { routes: {}, workflow: {}, realWorkflow: {}, keyboard: {}, offline: {}, reducedMotion: {}, licenseLifecycle: {} };

async function loadRecordedVideo(page, options = {}) {
  await page.evaluate(async ({ name = 'qa-six-seconds.webm', seconds = 6.1, width = 320, height = 200 }) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const drawing = canvas.getContext('2d');
    const recorder = new MediaRecorder(canvas.captureStream(10), { mimeType: 'video/webm' });
    const chunks = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.start();
    const started = performance.now();
    while (performance.now() - started < seconds * 1000) {
      const elapsed = performance.now() - started;
      drawing.fillStyle = '#fffaf0'; drawing.fillRect(0, 0, width, height);
      drawing.fillStyle = '#0b5f71'; drawing.fillRect((elapsed / (seconds * 1000)) * (width - 55), 70, 55, 55);
      drawing.fillStyle = '#ad352d'; drawing.beginPath(); drawing.arc(160, 50, 18, 0, Math.PI * 2); drawing.fill();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await new Promise((resolve) => { recorder.onstop = resolve; recorder.stop(); });
    const transfer = new DataTransfer();
    transfer.items.add(new File(chunks, name, { type: 'video/webm' }));
    const input = document.querySelector('#video-file');
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, options);
}

for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`));
  page.on('request', (request) => requests.push(`${request.method()} ${request.url()}`));
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
  result.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    lang: await page.locator('html').getAttribute('lang'),
    h1: await page.locator('h1').allTextContents(),
    mains: await page.locator('main').count(),
    horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    seriousAxe: serious.map(({ id, impact, help }) => ({ id, impact, help })),
    errors,
    crossOriginRequests: requests.filter((entry) => new URL(entry.split(' ').slice(1).join(' ')).origin !== base),
  };
  if (route === '/') await page.screenshot({ path: '.factory/evidence-verify-3/live-home-mobile.png', fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { if ('serviceWorker' in navigator) await navigator.serviceWorker.ready; });
  const requests = [];
  page.on('request', (request) => requests.push(`${request.method()} ${request.url()}`));
  await page.locator('#fps').selectOption('2');
  await loadRecordedVideo(page);
  await page.locator('#frame-strip figure').first().waitFor({ timeout: 20000 });
  await page.locator('#trim-start').fill('0');
  await page.locator('#trim-end').fill('1');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '2 frames ready' }).waitFor({ timeout: 20000 });
  const minBoundaryFrames = await page.locator('#frame-strip figure').count();
  await page.locator('#fps').selectOption('12');
  await page.locator('#trim-end').fill('5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor({ timeout: 20000 });
  const maxBoundaryFrames = await page.locator('#frame-strip figure').count();
  await page.locator('#trim-end').fill('5.1');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  const invalidMessage = await page.getByRole('alert').innerText();
  await page.locator('#trim-end').fill('1');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor({ timeout: 20000 });
  const zipEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const zip = await zipEvent;
  const pdfEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const pdf = await pdfEvent;
  await page.reload({ waitUntil: 'networkidle' });
  result.realWorkflow = {
    minBoundaryFrames,
    maxBoundaryFrames,
    invalidMessage,
    recoveredFramesBeforeReload: 12,
    zip: zip.suggestedFilename(),
    pdf: pdf.suggestedFilename(),
    framesAfterReload: await page.locator('#frame-strip figure').count(),
    fileAfterReload: await page.locator('#video-file').inputValue(),
    requests,
    errors,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  const allRequests = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`));
  page.on('request', (request) => allRequests.push(`${request.method()} ${request.url()}`));
  await page.goto(base, { waitUntil: 'networkidle' });
  const firstScreen = {
    h1: await page.locator('h1').innerText(),
    audience: await page.locator('.hero-copy > p').first().innerText(),
    action: await page.getByRole('link', { name: 'Try it with sample data' }).innerText(),
    facts: await page.locator('.fact-list li').allTextContents(),
  };
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForURL(/\?demo=1$/);
  await page.locator('#frame-strip figure').first().waitFor();
  const initialFrames = await page.locator('#frame-strip figure').count();
  const runtimeRequests = [];
  const runtimeListener = (request) => runtimeRequests.push(`${request.method()} ${request.url()}`);
  page.on('request', runtimeListener);
  await page.locator('#trim-end').fill('5');
  await page.locator('#fps').selectOption('12');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor();
  const maxBoundaryFrames = await page.locator('#frame-strip figure').count();
  await page.locator('#trim-end').fill('0.5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  const invalidMessage = await page.getByRole('alert').innerText();
  await page.locator('#trim-end').fill('1');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const recoveredFrames = await page.locator('#frame-strip figure').count();
  const pngEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const pngDownload = await pngEvent;
  const pngStream = await pngDownload.createReadStream();
  let pngBytes = 0;
  let pngHead = Buffer.alloc(0);
  for await (const chunk of pngStream) { pngBytes += chunk.length; if (pngHead.length < 4) pngHead = Buffer.concat([pngHead, chunk]).subarray(0, 4); }
  const pdfEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const pdfDownload = await pdfEvent;
  const pdfStream = await pdfDownload.createReadStream();
  let pdfBytes = 0;
  let pdfHead = Buffer.alloc(0);
  for await (const chunk of pdfStream) { pdfBytes += chunk.length; if (pdfHead.length < 8) pdfHead = Buffer.concat([pdfHead, chunk]).subarray(0, 8); }
  page.off('request', runtimeListener);
  await page.screenshot({ path: '.factory/evidence-verify-3/live-demo-desktop.png', fullPage: true });
  result.workflow = {
    firstScreen,
    urlAfterOneClick: page.url(),
    banner: await page.getByText('Demo — sample data, nothing is saved').innerText(),
    initialFrames,
    maxBoundaryFrames,
    invalidMessage,
    recoveredFrames,
    png: { filename: pngDownload.suggestedFilename(), bytes: pngBytes, magic: pngHead.toString('hex') },
    pdf: { filename: pdfDownload.suggestedFilename(), bytes: pdfBytes, magic: pdfHead.toString('ascii') },
    runtimeRequests,
    allCrossOriginRequests: allRequests.filter((entry) => new URL(entry.split(' ').slice(1).join(' ')).origin !== base),
    errors,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const firstTab = await page.evaluate(() => ({ id: document.activeElement?.id, text: document.activeElement?.textContent?.trim() }));
  let tabsToThreshold = 0;
  while (tabsToThreshold < 80 && await page.evaluate(() => document.activeElement?.id !== 'threshold')) {
    await page.keyboard.press('Tab');
    tabsToThreshold += 1;
  }
  const thresholdBefore = await page.locator('#threshold').inputValue();
  await page.keyboard.press('ArrowRight');
  const thresholdAfter = await page.locator('#threshold').inputValue();
  const focusStyle = await page.locator('#threshold').evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineColor: style.outlineColor, outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  let tabsToExport = 0;
  while (tabsToExport < 80 && !(await page.evaluate(() => document.activeElement?.textContent?.trim() === 'Export PNG pack'))) {
    await page.keyboard.press('Tab');
    tabsToExport += 1;
  }
  const exportFocused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  const event = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  const download = await event;
  result.keyboard = { firstTab, tabsToThreshold, thresholdBefore, thresholdAfter, focusStyle, tabsToExport, exportFocused, download: download.suggestedFilename() };
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
  await page.locator('#frame-strip figure').first().waitFor();
  result.offline = { url: page.url(), frames: await page.locator('#frame-strip figure').count(), banner: await page.getByText('Demo — sample data, nothing is saved').isVisible() };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  result.reducedMotion = {
    mediaMatches: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    activeAnimations: await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length),
  };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  const token = `qa-invalid-cache-${Date.now()}`;
  const calls = [];
  page.on('request', (request) => { if (request.url().includes('/api/v1/products/flipbook-trace/verify')) calls.push(request.url()); });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByText('Have a license?').click();
  await page.getByLabel('Paste your license').fill(token);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes(`verify?license=${token}`)),
    page.getByRole('button', { name: 'Verify license' }).click(),
  ]);
  await page.locator('#license-status').filter({ hasText: 'not active' }).waitFor();
  const storedVerdict = await page.evaluate(() => localStorage.getItem('sb_license:flipbook-trace:verdict'));
  await Promise.all([
    page.waitForResponse((response) => response.url().includes(`verify?license=${token}`)),
    page.reload({ waitUntil: 'networkidle' }),
  ]);
  result.licenseLifecycle.invalidCache = { storedVerdict, verificationCallsAfterImmediateReload: calls.length, statusAfterReload: await page.locator('#license-status').innerText() };
  await context.close();
}

{
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.setItem('sb_license:flipbook-trace', 'qa-revoked-token');
    localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() - 90_000_000 }));
  });
  const page = await context.newPage();
  await page.route('https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=qa-revoked-token', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': base },
    body: JSON.stringify({ valid: false, reason: 'revoked' }),
  }));
  await page.goto(base, { waitUntil: 'networkidle' });
  const statusAfterRevocation = await page.locator('#license-status').innerText();
  await page.locator('#quality').selectOption('1920');
  result.licenseLifecycle.revoked = {
    statusAfterRevocation,
    qualityAfterSelection: await page.locator('#quality').inputValue(),
    alertAfterPaidChoice: await page.getByRole('alert').innerText(),
  };
  await context.close();
}

await browser.close();
console.log(JSON.stringify(result, null, 2));
