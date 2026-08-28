import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('@claim:demo-ready opens twelve ready sample frames', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  await expect(page.locator('#work-status')).toHaveText('12 frames ready');
});

test('@claim:demo-isolation never reads or changes real saved data', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:flipbook-trace', 'real-user-license');
    localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() }));
    const originalGetItem = Storage.prototype.getItem;
    (window as unknown as { __storageReads: string[] }).__storageReads = [];
    Storage.prototype.getItem = function getItem(key: string): string | null {
      if (this === localStorage) (window as unknown as { __storageReads: string[] }).__storageReads.push(key);
      return originalGetItem.call(this, key);
    };
  });
  await page.goto('/demo');
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  expect(await page.evaluate(() => (window as unknown as { __storageReads: string[] }).__storageReads)).not.toContain('sb_license:flipbook-trace');
  expect(await page.evaluate(() => (window as unknown as { __storageReads: string[] }).__storageReads)).not.toContain('sb_license:flipbook-trace:verdict');

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('flipbook-trace', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('preferences');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const transaction = request.result.transaction('preferences', 'readwrite');
        transaction.objectStore('preferences').put({ marker: 'real-data' }, 'current');
        transaction.oncomplete = () => resolve();
      };
    });
  });
  await page.locator('#threshold').fill('199');
  await page.locator('#quality').selectOption('1920');
  await expect(page.locator('#quality')).toHaveValue('960');
  await expect(page.getByRole('alert')).toContainText('needs Studio');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#threshold')).toHaveValue('142');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:flipbook-trace'))).toBe('real-user-license');
  expect(await page.evaluate(async () => new Promise((resolve) => {
    const request = indexedDB.open('flipbook-trace', 1);
    request.onsuccess = () => {
      const get = request.result.transaction('preferences').objectStore('preferences').get('current');
      get.onsuccess = () => resolve(get.result);
    };
  }))).toEqual({ marker: 'real-data' });
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

test('@claim:ephemeral-project drops the source clip and frames on reload', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 100;
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.start();
    const context = canvas.getContext('2d')!;
    for (let frame = 0; frame < 12; frame += 1) {
      context.fillStyle = frame % 2 ? '#0b5f71' : '#ad352d';
      context.fillRect(0, 0, 160, 100);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop(); });
    const transfer = new DataTransfer();
    transfer.items.add(new File(chunks, 'private-clip.webm', { type: 'video/webm' }));
    const input = document.querySelector<HTMLInputElement>('#video-file')!;
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.locator('#frame-strip figure')).toHaveCount(0);
  await expect(page.locator('#video-file')).toHaveValue('');
  const stored = await page.evaluate(async () => new Promise<unknown>((resolve) => {
    const request = indexedDB.open('flipbook-trace', 1);
    request.onsuccess = () => {
      const get = request.result.transaction('preferences').objectStore('preferences').get('current');
      get.onsuccess = () => resolve(get.result);
    };
  }));
  expect(JSON.stringify(stored)).not.toContain('private-clip');
});

test('@claim:trace-controls applies every trace style, frame rate, and onion skin', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  await expect(page.locator('#fps option')).toHaveCount(5);
  expect(await page.locator('#fps option').evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))).toEqual(['2', '4', '6', '8', '12']);
  const image = async () => page.locator('#frame-strip canvas').nth(1).evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  const edges = await image();
  await page.getByRole('radio', { name: 'High contrast' }).check();
  const threshold = await image();
  await page.getByRole('radio', { name: 'Grayscale' }).check();
  const gray = await image();
  await page.getByRole('checkbox', { name: 'Show the previous frame in red' }).check();
  const onion = await image();
  expect(new Set([edges, threshold, gray, onion]).size).toBe(4);
});

test('@claim:settings-portability exports, imports, and persists control settings', async ({ page }) => {
  await page.goto('/');
  await page.locator('#fps').selectOption('8');
  await page.getByRole('radio', { name: 'Grayscale' }).check();
  await page.locator('#threshold').fill('177');
  await page.getByRole('checkbox', { name: 'Show the previous frame in red' }).check();
  await page.getByText('Move saved settings').click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export settings' }).click();
  const download = await downloadEvent;
  const path = await download.path();
  expect(path).toBeTruthy();

  await page.locator('#fps').selectOption('2');
  await page.getByRole('radio', { name: 'Pencil edges' }).check();
  await page.locator('#import-settings').setInputFiles(path!);
  await expect(page.locator('#fps')).toHaveValue('8');
  await expect(page.getByRole('radio', { name: 'Grayscale' })).toBeChecked();
  await expect(page.locator('#threshold')).toHaveValue('177');
  await expect(page.locator('#onion')).toBeChecked();
  await page.reload();
  await expect(page.locator('#fps')).toHaveValue('8');
  await expect(page.getByRole('radio', { name: 'Grayscale' })).toBeChecked();
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

test('@claim:local-processing sends no local video or frame data off-site', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') external.push(request.url());
  });
  await page.goto('/');
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 100;
    const context = canvas.getContext('2d')!;
    const recorder = new MediaRecorder(canvas.captureStream(10), { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.start();
    const started = performance.now();
    while (performance.now() - started < 1200) {
      context.fillStyle = '#fffaf0';
      context.fillRect(0, 0, 160, 100);
      context.fillStyle = '#0b5f71';
      context.fillRect((performance.now() - started) / 10, 25, 30, 30);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop(); });
    const transfer = new DataTransfer();
    transfer.items.add(new File(chunks, 'local-only.webm', { type: 'video/webm' }));
    const input = document.querySelector<HTMLInputElement>('#video-file')!;
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 15_000 });
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
  const appAsset = await page.locator('script[type="module"]').getAttribute('src');
  expect(appAsset).toMatch(/^\/assets\/index-[A-Za-z0-9_-]+\.js$/);
  await expect.poll(() => page.evaluate(async (asset) => Boolean(await caches.match(asset!)), appAsset)).toBe(true);
  await expect.poll(() => page.evaluate(async () => Boolean(await caches.match('/demo')))).toBe(true);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Trace a paper bird in twelve frames' })).toBeVisible();
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
});

test('@claim:pwa-installable ships a standalone manifest and controlling service worker', async ({ page }) => {
  await page.goto('/demo');
  const manifest = await page.evaluate(async () => fetch('/manifest.webmanifest').then((response) => response.json())) as {
    display: string;
    start_url: string;
    icons: Array<{ sizes: string; purpose?: string }>;
  };
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toMatch(/^\/\?source=pwa&v=/);
  expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
  expect(manifest.icons.some((icon) => icon.sizes === '512x512')).toBe(true);
  expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
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

test('@claim:studio-purchase opens the registered $9 hosted checkout', async ({ request, page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=returned-test', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok' }),
  }));
  await page.goto('/?license=returned-test');
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:flipbook-trace'))).toBe('returned-test');
  await expect(page.getByText('Studio is active on this device.')).toBeVisible();
  const checkout = page.getByRole('link', { name: 'Buy Studio for $9' });
  await expect(checkout).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/flipbook-trace/checkout');
  const response = await request.get(await checkout.getAttribute('href') as string, { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  expect(response.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
});
