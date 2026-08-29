import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const base = 'https://flipbook-trace.sociobot.in';
const browser = await chromium.launch({ headless: true });
const result = {
  routes: {},
  workflow: {},
  keyboard: {},
  offline: {},
  reducedMotion: {},
  textZoom: {},
  licenseLifecycle: {},
};

for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  result.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    lang: await page.locator('html').getAttribute('lang'),
    h1: await page.locator('h1').count(),
    main: await page.locator('main').count(),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    seriousOrCriticalAxe: axe.violations
      .filter(({ impact }) => impact === 'serious' || impact === 'critical')
      .map(({ id }) => id),
    crossOriginRequests: requests.filter((url) => new URL(url).origin !== base),
    errors: route === '/missing-page' ? errors.filter((error) => !error.includes('404')) : errors,
  };
  if (route === '/') {
    await page.screenshot({ path: '.factory/evidence-repair-3/live-home-mobile.png', fullPage: true });
  }
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.locator('#frame-strip figure').first().waitFor();
  const initialFrames = await page.locator('#frame-strip figure').count();
  const runtimeRequests = [];
  page.on('request', (request) => runtimeRequests.push(request.url()));
  await page.locator('#fps').selectOption('12');
  await page.locator('#trim-end').fill('5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor();
  const maximumFrames = await page.locator('#frame-strip figure').count();
  const beforeDetail = Number(await page.locator('#threshold').inputValue());
  await page.locator('#threshold').press('ArrowRight');
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor();
  const afterDetail = Number(await page.locator('#threshold').inputValue());
  await page.locator('#fps').selectOption('6');
  await page.locator('#trim-end').fill('2');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const zipEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const zip = await zipEvent;
  const pdfEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const pdf = await pdfEvent;
  await page.screenshot({ path: '.factory/evidence-repair-3/live-demo-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  result.workflow = {
    initialFrames,
    maximumFrames,
    beforeDetail,
    afterDetail,
    resetFrames: await page.locator('#frame-strip figure').count(),
    zip: zip.suggestedFilename(),
    pdf: pdf.suggestedFilename(),
    runtimeRequests,
    errors,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const firstTab = await page.evaluate(() => document.activeElement?.textContent?.trim());
  let tabsToThreshold = 0;
  while (tabsToThreshold < 80 && await page.evaluate(() => document.activeElement?.id !== 'threshold')) {
    await page.keyboard.press('Tab');
    tabsToThreshold += 1;
  }
  const thresholdBefore = await page.locator('#threshold').inputValue();
  await page.keyboard.press('ArrowRight');
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const focus = await page.locator('#threshold').evaluate((element) => {
    const style = getComputedStyle(element);
    return `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`;
  });
  let tabsToExport = 0;
  while (tabsToExport < 80 && await page.evaluate(() => document.activeElement?.textContent?.trim() !== 'Export PNG pack')) {
    await page.keyboard.press('Tab');
    tabsToExport += 1;
  }
  const downloadEvent = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  const download = await downloadEvent;
  result.keyboard = {
    firstTab,
    tabsToThreshold,
    thresholdBefore,
    thresholdAfter: await page.locator('#threshold').inputValue(),
    focus,
    tabsToExport,
    download: download.suggestedFilename(),
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  result.textZoom = {
    h1Visible: await page.locator('h1').isVisible(),
    sampleActionVisible: await page.getByRole('link', { name: 'Try it with sample data' }).isVisible(),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#frame-strip figure').first().waitFor();
  result.offline = {
    frames: await page.locator('#frame-strip figure').count(),
    banner: await page.getByText('Demo — sample data, nothing is saved').isVisible(),
  };
  await context.close();
}

{
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/demo`);
  await page.waitForTimeout(500);
  result.reducedMotion = {
    matches: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    runningAnimations: await page.evaluate(() => document.getAnimations().filter(({ playState }) => playState === 'running').length),
  };
  await context.close();
}

{
  const token = 'repair-3-invalid-cache';
  const context = await browser.newContext();
  const page = await context.newPage();
  let calls = 0;
  await page.route(`https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=${token}`, (route) => {
    calls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) });
  });
  await page.goto(base);
  await page.getByText('Have a license?').click();
  await page.getByLabel('Paste your license').fill(token);
  await page.getByRole('button', { name: 'Verify license' }).click();
  await page.locator('#license-status').filter({ hasText: 'not active' }).waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  result.licenseLifecycle = {
    calls,
    noticeAfterReload: await page.locator('#license-status').innerText(),
  };
  await context.close();
}

await browser.close();
await writeFile('.factory/evidence-repair-3/live-audit.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
