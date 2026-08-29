import { chromium } from '@playwright/test';

const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch();

async function openDemo(viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/demo`);
  await page.locator('#frame-strip figure').first().waitFor();
  await page.evaluate(() => {
    window.__interactionTimings = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.interactionId) continue;
        window.__interactionTimings.push({
          duration: entry.duration,
          interactionId: entry.interactionId,
          name: entry.name,
          processing: entry.processingEnd - entry.processingStart,
        });
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  return { context, page };
}

async function measure(page, action) {
  await page.evaluate(() => { window.__interactionTimings.length = 0; });
  await action();
  await page.waitForTimeout(700);
  const entries = await page.evaluate(() => [...window.__interactionTimings]);
  return {
    duration_ms: Math.max(0, ...entries.map((entry) => entry.duration)),
    processing_ms: Math.max(0, ...entries.map((entry) => entry.processing)),
    entries,
  };
}

const mobile = await openDemo({ width: 390, height: 844 });
const mobileLineDetail = [];
for (let index = 0; index < 5; index += 1) {
  mobileLineDetail.push(await measure(mobile.page, () => mobile.page.locator('#threshold').press('ArrowRight')));
  await mobile.page.locator('#work-status').getByText('12 frames ready', { exact: true }).waitFor();
}
await mobile.page.locator('#fps').selectOption('12');
await mobile.page.locator('#trim-end').fill('5');
const regenerate60 = await measure(mobile.page, () => mobile.page.getByRole('button', { name: 'Make tracing frames' }).click());
await mobile.page.locator('#frame-strip figure').nth(59).waitFor();
const lineDetail60 = await measure(mobile.page, () => mobile.page.locator('#threshold').press('ArrowRight'));
await mobile.page.locator('#work-status').getByText('60 frames ready', { exact: true }).waitFor();
await mobile.page.locator('#fps').selectOption('6');
await mobile.page.locator('#trim-end').fill('2');
const regenerate12 = await measure(mobile.page, () => mobile.page.getByRole('button', { name: 'Make tracing frames' }).click());
await mobile.page.locator('#frame-strip figure').nth(11).waitFor();
const reset12 = await measure(mobile.page, () => mobile.page.getByRole('button', { name: 'Reset demo' }).click());
await mobile.page.locator('#frame-strip figure').nth(11).waitFor();
await mobile.context.close();

const desktop = await openDemo({ width: 1440, height: 900 });
const desktopLineDetail = await measure(desktop.page, () => desktop.page.locator('#threshold').press('ArrowRight'));
await desktop.page.locator('#work-status').getByText('12 frames ready', { exact: true }).waitFor();
await desktop.context.close();
await browser.close();

const result = {
  url: `${baseUrl}/demo`,
  measured_at: new Date().toISOString(),
  browser: 'Playwright Chromium 1.58.2',
  cpu_throttling: 'none',
  budget_ms: 200,
  line_detail_12_frames_mobile: mobileLineDetail,
  line_detail_12_frames_desktop: desktopLineDetail,
  regenerate_60_frames_mobile: regenerate60,
  line_detail_60_frames_mobile: lineDetail60,
  regenerate_12_frames_mobile: regenerate12,
  reset_12_frames_mobile: reset12,
};

console.log(JSON.stringify(result, null, 2));
