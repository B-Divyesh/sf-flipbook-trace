import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import jpeg from 'jpeg-js';

type CapturedRequest = { body: string | null; headers: Record<string, string>; method: string; url: string };

async function loadRecordedVideo(page: Page, options: { name: string; seconds?: number; sentinel?: string; width?: number; height?: number } = { name: 'motion-study.webm' }): Promise<void> {
  await page.evaluate(async ({ name, seconds = 1.3, sentinel = '#7d00ff', width = 320, height = 200 }) => {
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
      context.fillStyle = sentinel; context.fillRect(7, 7, 11, 11);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop(); });
    const transfer = new DataTransfer(); transfer.items.add(new File(chunks, name, { type: 'video/webm' }));
    const input = document.querySelector<HTMLInputElement>('#video-file')!; input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  }, options);
}

function assertNoWorkflowRequests(requests: CapturedRequest[]): void {
  const networkRequests = requests.filter((request) => ['http:', 'https:'].includes(new URL(request.url).protocol));
  expect(networkRequests, 'Importing, tracing, and exporting a local video must not make any HTTP request. Local blob reads stay inside the browser.').toEqual([]);
}

function assertOnlyLicenseVerification(requests: CapturedRequest[], token: string): void {
  const verification = `https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=${encodeURIComponent(token)}`;
  expect(requests, 'License verification must make exactly one action-triggered request.').toHaveLength(1);
  expect(requests[0]).toEqual({ body: null, headers: expect.any(Object), method: 'GET', url: verification });
  const tokenCarriers = requests.flatMap((request) => [request.url, request.body || '', ...Object.values(request.headers)])
    .filter((value) => value.includes(token));
  expect(tokenCarriers, 'The token may appear only in the expected Sociobot verification URL.').toEqual([verification]);
}

async function settleShell(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
}

/**
 * `ready` means an active registration exists, not that the current first
 * page is controlled. A new worker claims that page in the following
 * controllerchange task, so wait for that real lifecycle milestone.
 */
async function waitForServiceWorkerControl(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) throw new Error('Service workers are unavailable.');
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
    });
  });
}

async function persistentSnapshot(page: Page): Promise<unknown> {
  return page.evaluate(async () => {
    const digest = async (bytes: ArrayBuffer): Promise<string> => {
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    };
    const inspect = async (value: unknown, seen = new WeakSet<object>()): Promise<unknown> => {
      if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return value;
      if (typeof value === 'undefined') return { type: 'undefined' };
      if (typeof value === 'bigint') return { type: 'bigint', value: String(value) };
      if (typeof value === 'symbol' || typeof value === 'function') return { type: typeof value };
      if (value instanceof Blob) {
        return { binary: { kind: value instanceof File ? 'File' : 'Blob', name: value instanceof File ? value.name : '', sha256: await digest(await value.arrayBuffer()), size: value.size, type: value.type } };
      }
      if (value instanceof ArrayBuffer) return { binary: { kind: 'ArrayBuffer', sha256: await digest(value), size: value.byteLength } };
      if (ArrayBuffer.isView(value)) {
        const bytes = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
        return { binary: { kind: value.constructor.name, sha256: await digest(bytes), size: value.byteLength } };
      }
      if (value instanceof Date) return { date: value.toISOString() };
      if (typeof value === 'object') {
        if (seen.has(value)) return { type: 'cycle' };
        seen.add(value);
        if (Array.isArray(value)) return Promise.all(value.map((entry) => inspect(entry, seen)));
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(value).sort()) result[key] = await inspect((value as Record<string, unknown>)[key], seen);
        return result;
      }
      return { type: typeof value };
    };
    const request = <T>(idbRequest: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
      idbRequest.onsuccess = () => resolve(idbRequest.result);
      idbRequest.onerror = () => reject(idbRequest.error);
    });
    const openDatabase = (name: string): Promise<IDBDatabase> => new Promise((resolve, reject) => {
      const open = indexedDB.open(name);
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    const storage = (surface: Storage) => Object.fromEntries(Array.from({ length: surface.length }, (_, index) => surface.key(index) || '')
      .filter(Boolean).sort().map((key) => [key, surface.getItem(key)]));
    const databases: Record<string, unknown> = {};
    for (const database of (await indexedDB.databases()).filter((entry) => entry.name).sort((a, b) => a.name!.localeCompare(b.name!))) {
      const db = await openDatabase(database.name!);
      const stores: Record<string, unknown> = {};
      for (const storeName of Array.from(db.objectStoreNames).sort()) {
        const transaction = db.transaction(storeName, 'readonly').objectStore(storeName);
        const [keys, values] = await Promise.all([request(transaction.getAllKeys()), request(transaction.getAll())]);
        stores[storeName] = await Promise.all(values.map(async (entry, index) => ({ key: await inspect(keys[index]), value: await inspect(entry) })));
      }
      databases[database.name!] = stores;
      db.close();
    }
    const cacheStorage: Record<string, unknown> = {};
    for (const cacheName of (await caches.keys()).sort()) {
      const cache = await caches.open(cacheName);
      cacheStorage[cacheName] = await Promise.all((await cache.matchAll()).map(async (response, index) => {
        const requestKey = (await cache.keys())[index];
        return {
          request: { headers: [...requestKey.headers].sort(([a], [b]) => a.localeCompare(b)), method: requestKey.method, url: requestKey.url },
          response: { contentType: response.headers.get('content-type'), sha256: await digest(await response.clone().arrayBuffer()), status: response.status },
        };
      }));
    }
    const walk = async (directory: FileSystemDirectoryHandle): Promise<unknown> => {
      const entries: Array<{ name: string; value: unknown }> = [];
      for await (const [name, handle] of directory.entries()) {
        if (handle.kind === 'file') {
          const file = await handle.getFile();
          entries.push({ name, value: { sha256: await digest(await file.arrayBuffer()), size: file.size, type: file.type } });
        } else entries.push({ name, value: await walk(handle) });
      }
      return entries.sort((a, b) => a.name.localeCompare(b.name));
    };
    const root = await navigator.storage.getDirectory?.();
    return { caches: cacheStorage, indexedDb: databases, localStorage: storage(localStorage), opfs: root ? await walk(root) : [], sessionStorage: storage(sessionStorage) };
  });
}

async function sourceFingerprint(page: Page): Promise<{ byteSentinel: string; name: string; sha256: string }> {
  return page.locator('#video-file').evaluate(async (input) => {
    const file = (input as HTMLInputElement).files?.[0];
    if (!file) throw new Error('The generated source video is missing.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    const start = Math.max(0, Math.floor(bytes.length / 2) - 12);
    const byteSentinel = [...bytes.slice(start, start + 24)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return { byteSentinel, name: file.name, sha256: [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('') };
  });
}

function pngDimensionsInZip(bytes: Buffer): { width: number; height: number } {
  expect(bytes.readUInt32LE(0)).toBe(0x04034b50);
  const png = 30 + bytes.readUInt16LE(26) + bytes.readUInt16LE(28);
  expect(bytes.subarray(png, png + 8).toString('hex')).toBe('89504e470d0a1a0a');
  return { width: bytes.readUInt32BE(png + 16), height: bytes.readUInt32BE(png + 20) };
}

function extractRenderedSheet(bytes: Buffer): { width: number; height: number; data: Uint8Array } {
  const markerOffset = bytes.indexOf(Buffer.from('/Filter /DCTDecode'));
  expect(markerOffset).toBeGreaterThan(-1);
  const streamStart = bytes.indexOf(Buffer.from('stream\n'), markerOffset) + Buffer.byteLength('stream\n');
  const streamEnd = bytes.indexOf(Buffer.from('\nendstream'), streamStart);
  expect(streamStart).toBeGreaterThan(markerOffset);
  expect(streamEnd).toBeGreaterThan(streamStart);
  const raster = jpeg.decode(bytes.subarray(streamStart, streamEnd), { useTArray: true });
  return { width: raster.width, height: raster.height, data: raster.data };
}

function expectRenderedCells(bytes: Buffer, columns: number, cells: number): void {
  const sheet = extractRenderedSheet(bytes);
  expect(sheet.width).toBe(1240);
  expect(sheet.height).toBe(1754);
  const pixelSum = (x: number, y: number) => {
    const offset = (Math.round(y) * sheet.width + Math.round(x)) * 4;
    return sheet.data[offset] + sheet.data[offset + 1] + sheet.data[offset + 2];
  };
  const darkestNear = (x: number, y: number) => {
    let darkest = Number.POSITIVE_INFINITY;
    for (let scanY = y - 4; scanY <= y + 4; scanY += 1) for (let scanX = x - 4; scanX <= x + 4; scanX += 1) darkest = Math.min(darkest, pixelSum(scanX, scanY));
    return darkest;
  };
  const margin = 70;
  const gap = 18;
  const cellWidth = (sheet.width - margin * 2 - gap * (columns - 1)) / columns;
  const imageHeight = cellWidth * 0.625;
  const cellHeight = imageHeight + 46;
  for (let index = 0; index < cells; index += 1) {
    const x = margin + (index % columns) * (cellWidth + gap);
    const y = 144 + Math.floor(index / columns) * (cellHeight + gap);
    expect(darkestNear(x, y), `cell ${index + 1} has a visible border`).toBeLessThan(360);
    let darkPixels = 0;
    for (let scanY = y + 14; scanY < y + imageHeight - 14; scanY += 12) for (let scanX = x + 14; scanX < x + cellWidth - 14; scanX += 12) if (pixelSum(scanX, scanY) < 510) darkPixels += 1;
    expect(darkPixels, `cell ${index + 1} has non-blank trace content`).toBeGreaterThan(0);
    let labelInk = 0;
    for (let scanY = y + imageHeight + 4; scanY < y + imageHeight + 38; scanY += 3) for (let scanX = x; scanX < x + Math.min(44, cellWidth); scanX += 3) if (pixelSum(scanX, scanY) < 440) labelInk += 1;
    expect(labelInk, `cell ${index + 1} has its printed number`).toBeGreaterThan(2);
  }
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

test('@claim:demo-workflow regenerates the paper-bird sample for its selected section and frames each second choice', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('#work-status')).toHaveText('12 frames ready');
  await page.locator('#trim-end').fill('5');
  await page.locator('#fps').selectOption('12');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await expect(page.locator('#work-status')).toHaveText('60 frames ready');
  await expect(page.locator('#frame-strip figure')).toHaveCount(60);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#work-status')).toHaveText('12 frames ready');
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
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
  await page.goto('/');
  await settleShell(page);
  await page.locator('#threshold').press('ArrowRight');
  await page.locator('#threshold').press('ArrowLeft');
  await page.waitForTimeout(100);
  await page.reload();
  await settleShell(page);
  const baseline = await persistentSnapshot(page);
  await loadRecordedVideo(page, { name: 'private-clip-ink-sentinel.webm', sentinel: '#7d00ff' });
  const source = await sourceFingerprint(page);
  await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 20_000 });
  const afterFrames = await persistentSnapshot(page);
  expect(afterFrames, 'Every IndexedDB value, cached response body, OPFS file, and web-storage value must match the pre-import baseline.').toEqual(baseline);
  const inspectedContent = JSON.stringify(afterFrames);
  expect(inspectedContent).not.toContain(source.name);
  expect(inspectedContent, 'A known 24-byte source-video sentinel must not appear in any recursively inspected stored value.').not.toContain(source.byteSentinel);
  expect(inspectedContent, 'The known in-memory video-byte sentinel must not be retained in a persistent surface.').not.toContain(source.sha256);
  await page.reload();
  await settleShell(page);
  await expect(page.locator('#frame-strip figure')).toHaveCount(0);
  await expect(page.locator('#video-file')).toHaveValue('');
  expect(await persistentSnapshot(page), 'Reload must not add or retain a source video or generated frame.').toEqual(baseline);
});

test('@claim:trace-controls applies every trace style, frames each second choice, and previous-frame overlay', async ({ page }) => {
  await page.goto('/?demo=1'); await expect(page.locator('#frame-strip figure')).toHaveCount(12); await expect(page.locator('#fps')).toBeVisible(); expect(await page.locator('#fps option').evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))).toEqual(['2', '4', '6', '8', '12']);
  const image = async () => page.locator('#frame-strip canvas').nth(1).evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  const waitForPreview = () => expect(page.locator('#work-status')).toHaveText('12 frames ready');
  const edges = await image();
  await page.getByRole('radio', { name: 'High contrast' }).check(); await waitForPreview(); const threshold = await image();
  await page.getByRole('radio', { name: 'Grayscale' }).check(); await waitForPreview(); const gray = await image();
  await page.getByRole('checkbox', { name: 'Show the previous frame in red' }).check(); await waitForPreview();
  expect(new Set([edges, threshold, gray, await image()]).size).toBe(4);
});

test('@claim:settings-portability exports, imports, and persists control settings', async ({ page }) => {
  await page.goto('/'); await page.locator('#fps').selectOption('8'); await page.getByRole('radio', { name: 'Grayscale' }).check(); await page.locator('#threshold').fill('177'); await page.getByRole('checkbox', { name: 'Show the previous frame in red' }).check(); await page.getByText('Import or export settings').click();
  const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export settings' }).click(); const path = await (await event).path(); await page.locator('#fps').selectOption('2'); await page.getByRole('radio', { name: 'Pencil edges' }).check(); await page.locator('#import-settings').setInputFiles(path!); await expect(page.locator('#fps')).toHaveValue('8'); await expect(page.getByRole('radio', { name: 'Grayscale' })).toBeChecked(); await expect(page.locator('#threshold')).toHaveValue('177'); await page.reload(); await expect(page.locator('#fps')).toHaveValue('8');
});

test('@claim:png-export exports a numbered PNG pack with all twelve frames', async ({ browser }) => {
  test.setTimeout(90_000);
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('/?demo=1', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page.locator('#frame-strip figure')).toHaveCount(12, { timeout: 30_000 });
    await expect(page.locator('#work-status')).toHaveText('12 frames ready', { timeout: 30_000 });
    const exportButton = page.getByRole('button', { name: 'Export numbered PNG pack' });
    await expect(exportButton).toBeEnabled({ timeout: 30_000 });
    const event = page.waitForEvent('download', { timeout: 60_000 });
    await exportButton.click();
    const download = await event;
    await expect(page.locator('#work-status')).toHaveText('Numbered PNG pack exported (12 files)', { timeout: 10_000 });
    const bytes = await readFile((await download.path())!);
    expect(download.suggestedFilename()).toBe('flipbook-trace-frames.zip');
    expect(bytes.subarray(0, 4).toString('latin1')).toBe('PK\x03\x04');
    expect(bytes.toString('latin1')).toContain('flipbook-frame-012.png');
  } finally {
    await context.close();
  }
});

test('@claim:pdf-export exports a non-blank twelve-frame printable PDF trace sheet', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('#work-status')).toHaveText('12 frames ready');
  await expect(page.getByRole('button', { name: 'Export PDF trace sheet' })).toBeEnabled();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const bytes = await readFile((await (await download).path())!);
  expect(bytes.subarray(0, 8).toString('latin1')).toContain('%PDF-1.4');
  expectRenderedCells(bytes, 4, 12);
  expect(bytes.length).toBeGreaterThan(20_000);
});

test('@claim:free-quality exports 960 px images in the free numbered PNG pack', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.locator('#fps').selectOption('2');
  await loadRecordedVideo(page, { name: 'free-960.webm', seconds: 1.3, width: 320, height: 200 });
  await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 30_000 });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export numbered PNG pack' }).click();
  expect(pngDimensionsInZip(await readFile((await (await download).path())!))).toEqual({ width: 960, height: 600 });
});

test('@claim:local-processing sends no video or frame data to any server', async ({ page }) => {
  await page.goto('/');
  await settleShell(page);
  const requests: CapturedRequest[] = [];
  page.on('request', (request) => requests.push({ body: request.postData(), headers: request.headers(), method: request.method(), url: request.url() }));
  await loadRecordedVideo(page, { name: 'local-only.webm' });
  await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 20_000 });
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export numbered PNG pack' }).click();
  await event;
  assertNoWorkflowRequests(requests);
});

test('the local-processing request guard rejects a same-origin collection GET fixture', () => {
  expect(() => assertNoWorkflowRequests([{ body: null, headers: {}, method: 'GET', url: 'http://127.0.0.1:4173/collect?video=sentinel' }])).toThrow();
});

test('@claim:offline-reload reloads the demo without a network', async ({ context, page }) => {
  await page.goto('/?demo=1'); await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })); }); await context.setOffline(true); await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.getByRole('heading', { level: 1, name: 'Trace a paper bird in twelve frames' })).toBeVisible(); await expect(page.locator('#frame-strip figure')).toHaveCount(12);
});

test('@claim:pwa-installable ships a standalone manifest and controlling service worker', async ({ page }) => {
  await page.goto('/?demo=1'); const manifest = await page.evaluate(async () => fetch('/manifest.webmanifest').then((response) => response.json())) as { display: string; start_url: string; icons: Array<{ sizes: string; purpose?: string }> }; expect(manifest.display).toBe('standalone'); expect(manifest.start_url).toMatch(/^\/\?source=pwa&v=/); expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true); expect(manifest.icons.some((icon) => icon.sizes === '512x512')).toBe(true); expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true); await waitForServiceWorkerControl(page); expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
});

test('@claim:studio-quality exports a numbered PNG pack at 1920 px or original width plus six-column sheets', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => { localStorage.setItem('sb_license:flipbook-trace', 'test-license'); localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() })); });
  await page.goto('/'); await page.locator('#fps').selectOption('2'); await page.locator('#columns').selectOption('6'); await page.getByRole('radio', { name: 'High contrast' }).check();
  await loadRecordedVideo(page, { name: 'source-width.webm', seconds: 3.1, width: 320, height: 200 }); await expect(page.locator('#frame-strip figure').first()).toBeVisible({ timeout: 30_000 });
  await page.locator('#quality').selectOption('1920'); await page.locator('#trim-end').fill('1'); await page.getByRole('button', { name: 'Make tracing frames' }).click(); await expect(page.locator('#work-status')).toHaveText('2 frames ready', { timeout: 30_000 });
  let download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export numbered PNG pack' }).click();
  expect(pngDimensionsInZip(await readFile((await (await download).path())!))).toEqual({ width: 1920, height: 1200 });
  await page.locator('#quality').selectOption('0'); await page.locator('#trim-end').fill('3'); await page.getByRole('button', { name: 'Make tracing frames' }).click(); await expect(page.locator('#work-status')).toHaveText('6 frames ready', { timeout: 30_000 });
  download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export numbered PNG pack' }).click();
  expect(pngDimensionsInZip(await readFile((await (await download).path())!))).toEqual({ width: 320, height: 200 });
  download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  expectRenderedCells(await readFile((await (await download).path())!), 6, 6);
});

test('@claim:studio-purchase shows a USD 9 one-time Flipbook Trace Studio checkout on Dodo', async ({ request, page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=returned-test', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/?license=returned-test');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:flipbook-trace'))).toBe('returned-test');
  await expect(page.getByText('Dodo opens the checkout for Sociobot.')).toBeVisible();
  const checkout = page.getByRole('link', { name: 'Buy Studio for $9' });
  const response = await request.get(await checkout.getAttribute('href') as string, { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  const location = response.headers().location!;
  expect(location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
  const body = await (await request.get(location)).text();
  expect(body).toContain('Flipbook Trace Studio');
  expect(body).toContain('$9.00');
  expect(body).toContain('One-time');

  await page.goto('/terms');
  await expect(page.getByText('Dodo opens the checkout for Sociobot.')).toBeVisible();
  const readme = await readFile('README.md', 'utf8');
  const publishedPurchaseTerms = `${await page.locator('main').innerText()}\n${readme}`;
  expect(readme).toContain('Dodo opens the checkout for Sociobot.');
  expect(publishedPurchaseTerms).toMatch(/Dodo opens the checkout for Sociobot\./i);
  expect(publishedPurchaseTerms).not.toMatch(/merchant of record|refund/i);
});

test('@claim:studio-license-check sends a pasted license only to Sociobot verification', async ({ page }) => {
  const token = 'pasted-test';
  const verification = `https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=${token}`;
  await page.route(verification, (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': 'http://127.0.0.1:4173' }, body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/');
  await settleShell(page);
  const requests: CapturedRequest[] = [];
  page.on('request', (request) => requests.push({ body: request.postData(), headers: request.headers(), method: request.method(), url: request.url() }));
  await page.getByText('Verify a Studio license').click();
  await page.getByLabel('Paste your license').fill(token);
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Studio is active on this device.')).toBeVisible();
  assertOnlyLicenseVerification(requests, token);
});

test('@claim:studio-license-cache restores valid, invalid, and revoked verdicts for 24 hours without another request', async ({ browser }) => {
  const invalidToken = 'invalid-cache-test';
  const invalidContext = await browser.newContext();
  const invalidPage = await invalidContext.newPage();
  let invalidCalls = 0;
  await invalidPage.route(`https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=${invalidToken}`, (route) => {
    invalidCalls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) });
  });
  await invalidPage.goto('/');
  await invalidPage.getByText('Verify a Studio license').click();
  await invalidPage.getByLabel('Paste your license').fill(invalidToken);
  await invalidPage.getByRole('button', { name: 'Verify license' }).click();
  await expect(invalidPage.locator('#license-status')).toContainText('not active');
  expect(invalidCalls).toBe(1);
  expect(await invalidPage.evaluate(() => JSON.parse(localStorage.getItem('sb_license:flipbook-trace:verdict') || '{}'))).toMatchObject({ valid: false, reason: 'invalid', token: invalidToken });
  await invalidPage.reload();
  await expect(invalidPage.locator('#license-status')).toContainText('not active');
  await expect(invalidPage.locator('#license-status')).toHaveClass(/is-inactive/);
  expect(invalidCalls, 'A fresh invalid verdict must suppress the reload request.').toBe(1);
  await invalidContext.close();

  const validToken = 'valid-cache-test';
  const validContext = await browser.newContext();
  await validContext.addInitScript(({ token }) => {
    if (!localStorage.getItem('sb_license:flipbook-trace')) {
      localStorage.setItem('sb_license:flipbook-trace', token);
      localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() - 86_399_000, reason: 'ok', token }));
    }
  }, { token: validToken });
  const validPage = await validContext.newPage();
  let validCalls = 0;
  await validPage.route(`https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=${validToken}`, (route) => {
    validCalls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked' }) });
  });
  await validPage.goto('/');
  await expect(validPage.locator('#license-status')).toHaveText('Studio is active on this device.');
  expect(validCalls, 'A valid verdict younger than 24 hours must be restored without a request.').toBe(0);
  await validPage.reload();
  await expect(validPage.locator('#license-status')).toHaveText('Studio is active on this device.');
  expect(validCalls).toBe(0);
  await validContext.close();

  const revokedToken = 'revoked-cache-test';
  const revokedContext = await browser.newContext();
  await revokedContext.addInitScript(({ token }) => {
    if (!localStorage.getItem('sb_license:flipbook-trace')) {
      localStorage.setItem('sb_license:flipbook-trace', token);
      localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() - 86_401_000, reason: 'ok', token }));
    }
  }, { token: revokedToken });
  const revokedPage = await revokedContext.newPage();
  let revokedCalls = 0;
  await revokedPage.route(`https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=${revokedToken}`, (route) => {
    revokedCalls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked' }) });
  });
  await revokedPage.goto('/');
  await expect(revokedPage.locator('#license-status')).toContainText('was revoked');
  expect(revokedCalls, 'A verdict older than 24 hours must be refreshed once.').toBe(1);
  await revokedPage.locator('#quality').selectOption('1920');
  await expect(revokedPage.locator('#quality')).toHaveValue('960');
  await revokedPage.reload();
  await expect(revokedPage.locator('#license-status')).toContainText('was revoked');
  await expect(revokedPage.locator('#license-status')).toHaveClass(/is-inactive/);
  expect(revokedCalls, 'The fresh revoked verdict must suppress the reload request.').toBe(1);
  await revokedContext.close();
});

test('the Studio-license request guard rejects a second token-bearing destination', () => {
  const token = 'pasted-test';
  const verification = `https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=${token}`;
  expect(() => assertOnlyLicenseVerification([
    { body: null, headers: {}, method: 'GET', url: verification },
    { body: null, headers: {}, method: 'GET', url: `http://127.0.0.1:4173/collect?license=${token}` },
  ], token)).toThrow();
});

test('@claim:browser-data-deletion clears settings and a saved license', async ({ context, page }) => {
  await page.goto('/'); await page.locator('#threshold').fill('177'); await page.locator('#fps').selectOption('8'); await page.evaluate(() => localStorage.setItem('sb_license:flipbook-trace', 'saved-license')); const client = await context.newCDPSession(page); await client.send('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:4173', storageTypes: 'all' }); await page.reload(); await expect(page.locator('#threshold')).toHaveValue('142'); await expect(page.locator('#fps')).toHaveValue('6'); expect(await page.evaluate(() => localStorage.getItem('sb_license:flipbook-trace'))).toBeNull();
});
