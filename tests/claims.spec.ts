import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('@claim:demo-ready opens twelve ready sample frames', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  await expect(page.locator('#work-status')).toHaveText('12 frames ready');
});

test('@claim:clip-workflow turns a local video section into tracing frames', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 200;
    const context = canvas.getContext('2d')!;
    const stream = canvas.captureStream(12);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.start();
    const started = performance.now();
    await new Promise<void>((resolve) => {
      const draw = () => {
        const elapsed = performance.now() - started;
        context.fillStyle = '#fffaf0';
        context.fillRect(0, 0, 320, 200);
        context.fillStyle = '#0b5f71';
        context.fillRect(20 + (elapsed / 2200) * 240, 70, 55, 55);
        if (elapsed < 2200) requestAnimationFrame(draw); else resolve();
      };
      draw();
    });
    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop(); });
    const file = new File(chunks, 'motion-study.webm', { type: 'video/webm' });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    const input = document.querySelector<HTMLInputElement>('#video-file')!;
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 15_000 });
  expect(await page.locator('#frame-strip figure').count()).toBeGreaterThanOrEqual(12);
  await page.locator('#trim-end').fill('0.5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await expect(page.getByRole('alert')).toContainText('must be 1–5 seconds');
});

test('@claim:png-export exports numbered PNGs in a ZIP', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('flipbook-trace-frames.zip');
  const path = await download.path();
  expect(path).toBeTruthy();
  const bytes = await readFile(path!);
  expect(bytes.subarray(0, 4).toString('hex')).toBe('504b0304');
  expect(bytes.toString('latin1')).toContain('flipbook-frame-012.png');
});

test('@claim:pdf-export exports a printable PDF contact sheet', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF sheet' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('flipbook-trace-sheet.pdf');
  const path = await download.path();
  const bytes = await readFile(path!);
  expect(bytes.subarray(0, 8).toString()).toBe('%PDF-1.4');
  expect(bytes.length).toBeGreaterThan(20_000);
});

test('@claim:local-processing sends no demo frame data off-site', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') external.push(request.url());
  });
  await page.goto('/demo');
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  await downloadEvent;
  expect(external).toEqual([]);
});

test('@claim:offline-reload reloads the demo without a network', async ({ context, page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
  });
  await page.goto('/demo');
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    }
  });
  await expect.poll(() => page.evaluate(async () => Boolean(await caches.match('/assets/app.js')))).toBe(true);
  await expect.poll(() => page.evaluate(async () => Boolean(await caches.match('/demo')))).toBe(true);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Trace a paper bird in twelve frames' })).toBeVisible();
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
});

test('@claim:studio-quality makes larger widths available with a valid cached license', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:flipbook-trace', 'test-license');
    localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() }));
  });
  await page.goto('/');
  await page.locator('#quality').selectOption('1920');
  await page.locator('#columns').selectOption('6');
  await expect(page.locator('#quality')).toHaveValue('1920');
  await expect(page.locator('#columns')).toHaveValue('6');
  await expect(page.getByText('Studio is active on this device.')).toBeVisible();
});
