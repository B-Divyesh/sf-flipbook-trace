import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function loadRecordedVideo(page: Page, options: { name: string; seconds?: number; width?: number; height?: number } = { name: 'motion-study.webm' }): Promise<void> {
  await page.evaluate(async ({ name, seconds = 1.3, width = 320, height = 200 }) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d')!;
    const recorder = new MediaRecorder(canvas.captureStream(10), { mimeType: 'video/webm' });
    const chunks: Blob[] = []; recorder.ondataavailable = (event) => chunks.push(event.data); recorder.start();
    const started = performance.now();
    while (performance.now() - started < seconds * 1000) {
      const elapsed = performance.now() - started;
      context.fillStyle = '#fffaf0'; context.fillRect(0, 0, width, height);
      context.fillStyle = '#0b5f71'; context.fillRect((elapsed / (seconds * 1000)) * (width - 55), height * .35, 55, 55);
      context.fillStyle = '#ad352d'; context.beginPath(); context.arc(width * .5, height * .25, 18, 0, Math.PI * 2); context.fill();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop(); });
    const transfer = new DataTransfer(); transfer.items.add(new File(chunks, name, { type: 'video/webm' }));
    const input = document.querySelector<HTMLInputElement>('#video-file')!; input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  }, options);
}

function pngDimensionsInZip(bytes: Buffer): { width: number; height: number } {
  expect(bytes.readUInt32LE(0)).toBe(0x04034b50);
  const png = 30 + bytes.readUInt16LE(26) + bytes.readUInt16LE(28);
  expect(bytes.subarray(png, png + 8).toString('hex')).toBe('89504e470d0a1a0a');
  return { width: bytes.readUInt32BE(png + 16), height: bytes.readUInt32BE(png + 20) };
}

async function idbValue(page: Page): Promise<unknown> {
  return page.evaluate(async () => new Promise((resolve, reject) => {
    const request = indexedDB.open('flipbook-trace', 1); request.onerror = () => reject(request.error);
    request.onsuccess = () => { const get = request.result.transaction('preferences').objectStore('preferences').get('current'); get.onsuccess = () => resolve(get.result); get.onerror = () => reject(get.error); };
  }));
}

test('@claim:demo-ready opens twelve ready sample frames with one click', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/); await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#demo-strip canvas')).toHaveCount(12); await expect(page.locator('#frame-strip figure')).toHaveCount(12); await expect(page.locator('#work-status')).toHaveText('12 frames ready');
  const frame = await page.locator('#demo-strip canvas').first().boundingBox(); expect(frame!.y + frame!.height).toBeLessThanOrEqual(844);
});

test('@claim:demo-isolation never opens, reads, or changes real saved data', async ({ page }) => {
  await page.goto('/privacy');
  await page.evaluate(async () => {
    localStorage.setItem('sb_license:flipbook-trace', 'real-user-license'); localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() }));
    await new Promise<void>((resolve, reject) => { const request = indexedDB.open('flipbook-trace', 1); request.onupgradeneeded = () => request.result.createObjectStore('preferences'); request.onerror = () => reject(request.error); request.onsuccess = () => { const transaction = request.result.transaction('preferences', 'readwrite'); transaction.objectStore('preferences').put({ fps: 8, threshold: 199, mode: 'gray', onion: true, quality: 960, columns: 4 }, 'current'); transaction.oncomplete = () => resolve(); }; });
  });
  const beforeStorage = await page.evaluate(() => ({ ...localStorage })); const beforePreferences = await idbValue(page);
  await page.addInitScript(() => {
    const reads: string[] = []; const opens: string[] = []; const getItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key: string): string | null { if (this === localStorage) reads.push(key); return getItem.call(this, key); };
    const open = indexedDB.open.bind(indexedDB); indexedDB.open = ((name: string, version?: number) => { opens.push(name); return open(name, version); }) as IDBFactory['open'];
    (window as unknown as { __demoStorageReads: string[]; __demoIdbOpens: string[] }).__demoStorageReads = reads;
    (window as unknown as { __demoStorageReads: string[]; __demoIdbOpens: string[] }).__demoIdbOpens = opens;
  });
  await page.goto('/?demo=1'); await expect(page.locator('#frame-strip figure')).toHaveCount(12); await expect(page.locator('#threshold')).toHaveValue('142');
  expect(await page.evaluate(() => (window as unknown as { __demoStorageReads: string[] }).__demoStorageReads)).toEqual([]);
  expect(await page.evaluate(() => (window as unknown as { __demoIdbOpens: string[] }).__demoIdbOpens)).toEqual([]);
  await page.locator('#threshold').fill('199'); await page.locator('#quality').selectOption('1920'); await expect(page.locator('#quality')).toHaveValue('960'); await expect(page.getByRole('alert')).toContainText('needs Studio');
  await page.getByRole('button', { name: 'Reset demo' }).click(); await expect(page.locator('#threshold')).toHaveValue('142'); expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(beforeStorage); expect(await idbValue(page)).toEqual(beforePreferences);
  await page.getByRole('link', { name: 'Start for real' }).click(); await expect(page).toHaveURL('/'); await expect(page.locator('#threshold')).toHaveValue('199');
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(beforeStorage); expect(await idbValue(page)).toEqual(beforePreferences);
  await page.locator('#quality').selectOption('1920'); await expect(page.locator('#quality')).toHaveValue('1920');
});

test('@claim:clip-workflow accepts one to five seconds and rejects other lengths', async ({ page }) => {
  test.setTimeout(60_000); await page.goto('/'); await page.locator('#fps').selectOption('2'); await loadRecordedVideo(page, { name: 'six-seconds.webm', seconds: 6.1 }); await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 20_000 });
  for (const [end, expected] of [['1', '2 frames ready'], ['5', '10 frames ready']] as const) { await page.locator('#trim-start').fill('0'); await page.locator('#trim-end').fill(end); await page.getByRole('button', { name: 'Make tracing frames' }).click(); await expect(page.locator('#work-status')).toHaveText(expected, { timeout: 20_000 }); }
  for (const end of ['0.5', '5.1']) { await page.locator('#trim-end').fill(end); await page.getByRole('button', { name: 'Make tracing frames' }).click(); await expect(page.getByRole('alert')).toContainText('must be 1–5 seconds'); }
});

test('@claim:ephemeral-project keeps video and frames out of persistent browser stores', async ({ page }) => {
  await page.goto('/'); await loadRecordedVideo(page, { name: 'private-clip.webm' }); await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 20_000 });
  const persistent = await page.evaluate(async () => {
    const databases = await indexedDB.databases(); const values: unknown[] = [];
    for (const database of databases) { if (!database.name) continue; const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open(database.name!); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); for (const store of Array.from(db.objectStoreNames)) { const records = await new Promise<unknown[]>((resolve, reject) => { const request = db.transaction(store).objectStore(store).getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); values.push(...records); } }
    const cacheEntries = (await Promise.all((await caches.keys()).map(async (key) => (await caches.open(key)).keys()))).flat().map((request) => request.url);
    const directory = await navigator.storage.getDirectory?.(); const opfsEntries: string[] = []; if (directory) for await (const [name] of directory.entries()) opfsEntries.push(name);
    return { values: JSON.stringify(values), hasBlob: values.some((value) => value instanceof Blob || value instanceof ArrayBuffer), cacheEntries, opfsEntries };
  });
  expect(persistent.values).not.toContain('private-clip'); expect(persistent.hasBlob).toBe(false); expect(persistent.cacheEntries.join('\n')).not.toContain('private-clip'); expect(persistent.opfsEntries).toEqual([]);
  await page.reload(); await expect(page.locator('#frame-strip figure')).toHaveCount(0); await expect(page.locator('#video-file')).toHaveValue('');
});

test('@claim:trace-controls applies every trace style, frame rate, and previous-frame overlay', async ({ page }) => {
  await page.goto('/?demo=1'); await expect(page.locator('#frame-strip figure')).toHaveCount(12); expect(await page.locator('#fps option').evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))).toEqual(['2', '4', '6', '8', '12']);
  const image = async () => page.locator('#frame-strip canvas').nth(1).evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL()); const edges = await image(); await page.getByRole('radio', { name: 'High contrast' }).check(); const threshold = await image(); await page.getByRole('radio', { name: 'Grayscale' }).check(); const gray = await image(); await page.getByRole('checkbox', { name: 'Show the previous frame in red' }).check(); expect(new Set([edges, threshold, gray, await image()]).size).toBe(4);
});

test('@claim:settings-portability exports, imports, and persists control settings', async ({ page }) => {
  await page.goto('/'); await page.locator('#fps').selectOption('8'); await page.getByRole('radio', { name: 'Grayscale' }).check(); await page.locator('#threshold').fill('177'); await page.getByRole('checkbox', { name: 'Show the previous frame in red' }).check(); await page.getByText('Move saved settings').click();
  const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export settings' }).click(); const path = await (await event).path(); await page.locator('#fps').selectOption('2'); await page.getByRole('radio', { name: 'Pencil edges' }).check(); await page.locator('#import-settings').setInputFiles(path!); await expect(page.locator('#fps')).toHaveValue('8'); await expect(page.getByRole('radio', { name: 'Grayscale' })).toBeChecked(); await expect(page.locator('#threshold')).toHaveValue('177'); await page.reload(); await expect(page.locator('#fps')).toHaveValue('8');
});

test('@claim:png-export exports twelve numbered PNGs in a ZIP', async ({ page }) => {
  await page.goto('/?demo=1'); const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export PNG pack' }).click(); const download = await event; const bytes = await readFile((await download.path())!); expect(download.suggestedFilename()).toBe('flipbook-trace-frames.zip'); expect(bytes.toString('latin1')).toContain('flipbook-frame-012.png');
});

test('@claim:pdf-export exports a non-blank twelve-frame printable PDF trace sheet', async ({ page }) => {
  await page.goto('/?demo=1');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const bytes = await readFile((await (await download).path())!);
  const pdf = bytes.toString('latin1');
  expect(pdf.startsWith('%PDF-1.4')).toBe(true);
  expect(pdf).toContain('/Type /Pages /Kids [3 0 R] /Count 1');
  expect(pdf).toContain('/FlipbookTraceFrameCount 12 /FlipbookTraceColumns 4');
  expect(pdf).toContain('/FlipbookTraceCellNumbers [1 2 3 4 5 6 7 8 9 10 11 12]');
  expect(pdf).toContain('/Width 1240 /Height 1754');
  expect(pdf).toContain('/Filter /DCTDecode');
  expect(bytes.length).toBeGreaterThan(20_000);
});

test('@claim:local-processing sends no video or frame data to any server', async ({ page }) => {
  await page.goto('/'); const requests: Array<{ method: string; url: string; body: string | null }> = []; page.on('request', (request) => requests.push({ method: request.method(), url: request.url(), body: request.postData() })); await loadRecordedVideo(page, { name: 'local-only.webm' }); await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 20_000 }); const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export PNG pack' }).click(); await event; expect(requests.filter((request) => !['GET', 'HEAD'].includes(request.method))).toEqual([]); expect(requests.filter((request) => request.body !== null)).toEqual([]); expect(requests.filter((request) => new URL(request.url).origin !== 'http://127.0.0.1:4173')).toEqual([]);
});

test('@claim:offline-reload reloads the demo without a network', async ({ context, page }) => {
  await page.goto('/?demo=1'); await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })); }); await context.setOffline(true); await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.getByRole('heading', { level: 1, name: 'Trace a paper bird in twelve frames' })).toBeVisible(); await expect(page.locator('#frame-strip figure')).toHaveCount(12);
});

test('@claim:pwa-installable ships a standalone manifest and controlling service worker', async ({ page }) => {
  await page.goto('/?demo=1'); const manifest = await page.evaluate(async () => fetch('/manifest.webmanifest').then((response) => response.json())) as { display: string; start_url: string; icons: Array<{ sizes: string; purpose?: string }> }; expect(manifest.display).toBe('standalone'); expect(manifest.start_url).toMatch(/^\/\?source=pwa&v=/); expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true); expect(manifest.icons.some((icon) => icon.sizes === '512x512')).toBe(true); expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true); await page.evaluate(async () => navigator.serviceWorker.ready); expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
});

test('@claim:studio-quality exports 1920 px, original-width PNGs, and six-column sheets', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => { localStorage.setItem('sb_license:flipbook-trace', 'test-license'); localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() })); });
  await page.goto('/'); await page.locator('#fps').selectOption('2'); await page.locator('#quality').selectOption('1920'); await page.locator('#columns').selectOption('6');
  await loadRecordedVideo(page, { name: 'source-width.webm', width: 320, height: 200 }); await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 30_000 });
  let download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export PNG pack' }).click();
  expect(pngDimensionsInZip(await readFile((await (await download).path())!))).toEqual({ width: 1920, height: 1200 });
  await page.locator('#quality').selectOption('0'); await page.getByRole('button', { name: 'Make tracing frames' }).click(); await expect(page.locator('#work-status')).toContainText('frames ready', { timeout: 30_000 });
  download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export PNG pack' }).click();
  expect(pngDimensionsInZip(await readFile((await (await download).path())!))).toEqual({ width: 320, height: 200 });
  download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  expect((await readFile((await (await download).path())!)).toString('latin1')).toContain('/FlipbookTraceColumns 6');
});

test('@claim:studio-purchase shows USD 9 one-time checkout for Flipbook Trace Studio', async ({ request, page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=returned-test', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) })); await page.goto('/?license=returned-test'); expect(await page.evaluate(() => localStorage.getItem('sb_license:flipbook-trace'))).toBe('returned-test'); const checkout = page.getByRole('link', { name: 'Buy Studio for $9' }); const response = await request.get(await checkout.getAttribute('href') as string, { maxRedirects: 0 }); expect(response.status()).toBe(303); const location = response.headers().location!; expect(location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//); const body = await (await request.get(location)).text(); expect(body).toContain('Flipbook Trace Studio'); expect(body).toContain('$9.00'); expect(body).toContain('One-time');
});

test('@claim:studio-license-check sends a pasted license only to Sociobot verification', async ({ page }) => {
  const verification = 'https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=pasted-test';
  await page.route(verification, (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': 'http://127.0.0.1:4173' }, body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('verify?license=')) requests.push(request.url()); });
  await page.goto('/');
  await page.getByText('Have a license?').click();
  await page.getByLabel('Paste your license').fill('pasted-test');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Studio is active on this device.')).toBeVisible();
  expect(requests).toEqual([verification]);
});

test('@claim:browser-data-deletion clears settings and a saved license', async ({ context, page }) => {
  await page.goto('/'); await page.locator('#threshold').fill('177'); await page.locator('#fps').selectOption('8'); await page.evaluate(() => localStorage.setItem('sb_license:flipbook-trace', 'saved-license')); const client = await context.newCDPSession(page); await client.send('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:4173', storageTypes: 'all' }); await page.reload(); await expect(page.locator('#threshold')).toHaveValue('142'); await expect(page.locator('#fps')).toHaveValue('6'); expect(await page.evaluate(() => localStorage.getItem('sb_license:flipbook-trace'))).toBeNull();
});
