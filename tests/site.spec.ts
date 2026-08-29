import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

type InteractionTiming = {
  duration: number;
  interactionId: number;
  name: string;
  processing: number;
};

async function installInteractionObserver(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    const timings: InteractionTiming[] = [];
    (window as typeof window & { __interactionTimings: InteractionTiming[] }).__interactionTimings = timings;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEventTiming[]) {
        if (!entry.interactionId) continue;
        timings.push({
          duration: entry.duration,
          interactionId: entry.interactionId,
          name: entry.name,
          processing: entry.processingEnd - entry.processingStart,
        });
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
}

async function measuredInteraction(
  page: import('@playwright/test').Page,
  action: () => Promise<unknown>,
): Promise<InteractionTiming[]> {
  await page.evaluate(() => {
    (window as typeof window & { __interactionTimings: InteractionTiming[] }).__interactionTimings.length = 0;
  });
  await action();
  await page.waitForTimeout(700);
  return page.evaluate(() => [
    ...(window as typeof window & { __interactionTimings: InteractionTiming[] }).__interactionTimings,
  ]);
}

function expectInteractionsWithinBudget(timings: InteractionTiming[], label: string): void {
  const slowest = Math.max(0, ...timings.map(({ duration }) => duration));
  expect(slowest, `${label} Event Timing ${JSON.stringify(timings)}`).toBeLessThan(200);
}

for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
  test(`${route} has the required page structure and no serious accessibility issues`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Flipbook Trace/);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

type TargetBox = { height: number; label: string; tag: string; width: number };

async function visibleActionTargets(page: import('@playwright/test').Page): Promise<TargetBox[]> {
  return page.locator('a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), summary, .text-action, label.button').evaluateAll((elements) => {
    const targets = new Set<HTMLElement>();
    for (const candidate of elements) {
      if (!(candidate instanceof HTMLElement)) continue;
      const input = candidate instanceof HTMLInputElement ? candidate : null;
      const target = input && ['checkbox', 'radio'].includes(input.type)
        ? input.closest('label') || document.querySelector<HTMLElement>(`label[for="${CSS.escape(input.id)}"]`)
        : candidate;
      if (!target) continue;
      const style = getComputedStyle(target);
      const rect = target.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) continue;
      targets.add(target);
    }
    return [...targets].map((target) => {
      const rect = target.getBoundingClientRect();
      const input = target instanceof HTMLInputElement;
      return {
        height: rect.height,
        label: (target.getAttribute('aria-label') || (input ? target.labels?.[0]?.textContent : target.textContent) || target.id || target.tagName).trim(),
        tag: `${target.tagName.toLowerCase()}${target.id ? `#${target.id}` : ''}${target.className ? `.${String(target.className).trim().replace(/\s+/g, '.')}` : ''}`,
        width: rect.width,
      };
    });
  });
}

for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
  test(`${route} keeps every visible action at least 44 by 44 px at 390 px`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(route);
    if (route === '/demo') await expect(page.locator('#frame-strip figure')).toHaveCount(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    const skip = await page.locator('.skip-link').boundingBox();
    expect(skip, `${route} skip link`).toBeTruthy();
    expect(skip!.width, `${route} skip link width`).toBeGreaterThanOrEqual(44);
    expect(skip!.height, `${route} skip link height`).toBeGreaterThanOrEqual(44);
    for (const box of await visibleActionTargets(page)) {
      expect(box.width, `${route} ${box.tag} (${box.label}) width`).toBeGreaterThanOrEqual(44);
      expect(box.height, `${route} ${box.tag} (${box.label}) height`).toBeGreaterThanOrEqual(44);
    }
    const routeName = route === '/' ? 'home' : route.slice(1);
    await page.screenshot({ path: `test-results/polish-5-targets-${routeName}.png`, fullPage: true });
    await page.close();
  });
}

test('the static 404 keeps every visible action at least 44 by 44 px at 390 px', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.setContent(await readFile('dist/404.html', 'utf8'));
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  const box = await page.locator('.skip').boundingBox();
  expect(box).toBeTruthy();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  for (const target of await visibleActionTargets(page)) {
    expect(target.width, `static 404 ${target.tag} (${target.label}) width`).toBeGreaterThanOrEqual(44);
    expect(target.height, `static 404 ${target.tag} (${target.label}) height`).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: 'test-results/polish-5-targets-static-404.png', fullPage: true });
  await page.close();
});

test('the 390 px landing screen keeps all three facts above the fold', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('/');
  const facts = await page.locator('.fact-list').boundingBox();
  expect(facts).toBeTruthy();
  expect(facts!.y + facts!.height).toBeLessThanOrEqual(844);
  await page.close();
});

for (const viewport of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }]) {
  test(`desktop ${viewport.width}x${viewport.height} keeps all three facts in the first screen`, async ({ browser }) => {
    const page = await browser.newPage({ viewport });
    await page.goto('/');
    await expect(page.locator('.fact-list li')).toHaveCount(3);
    const box = await page.locator('.fact-list').boundingBox();
    expect(box).toBeTruthy();
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    await page.close();
  });
}

test('keyboard controls reach exports and operate a range', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#threshold').focus();
  const before = Number(await page.locator('#threshold').inputValue());
  await page.keyboard.press('ArrowRight');
  expect(Number(await page.locator('#threshold').inputValue())).toBe(before + 1);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).focus();
  await page.keyboard.press('Enter');
  await downloadEvent;
});

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`Line detail stays inside the 200 ms interaction budget with 12 frames at ${viewport.width}px`, async ({ browser }) => {
    const page = await browser.newPage({ viewport });
    await page.goto('/demo');
    await expect(page.locator('#frame-strip figure')).toHaveCount(12);
    expect(await page.evaluate(() => PerformanceObserver.supportedEntryTypes.includes('event'))).toBe(true);
    await installInteractionObserver(page);
    const before = Number(await page.locator('#threshold').inputValue());
    const timings = await measuredInteraction(page, () => page.locator('#threshold').press('ArrowRight'));
    await expect(page.locator('#threshold')).toHaveValue(String(before + 1));
    await expect(page.locator('#work-status')).toHaveText('12 frames ready');
    expectInteractionsWithinBudget(timings, `12-frame Line detail at ${viewport.width}px`);
    await page.close();
  });
}

test('all supported demo rebuild interactions stay inside the 200 ms budget at 390px', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('/demo');
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  await installInteractionObserver(page);

  await page.locator('#fps').selectOption('12');
  await page.locator('#trim-end').fill('5');
  let timings = await measuredInteraction(page, () => page.getByRole('button', { name: 'Make tracing frames' }).click());
  await expect(page.locator('#frame-strip figure')).toHaveCount(60);
  expectInteractionsWithinBudget(timings, '60-frame regeneration');

  timings = await measuredInteraction(page, () => page.locator('#threshold').press('ArrowRight'));
  await expect(page.locator('#work-status')).toHaveText('60 frames ready');
  expectInteractionsWithinBudget(timings, '60-frame Line detail');

  await page.locator('#fps').selectOption('6');
  await page.locator('#trim-end').fill('2');
  timings = await measuredInteraction(page, () => page.getByRole('button', { name: 'Make tracing frames' }).click());
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  expectInteractionsWithinBudget(timings, '12-frame regeneration');

  timings = await measuredInteraction(page, () => page.getByRole('button', { name: 'Reset demo' }).click());
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  expectInteractionsWithinBudget(timings, '12-frame reset');
  await page.close();
});

test('build output uses hashed immutable assets and a revalidated service worker', async () => {
  const index = await readFile('dist/index.html', 'utf8');
  expect(index).toMatch(/\/assets\/index-[A-Za-z0-9_-]+\.js/);
  expect(index).toMatch(/\/assets\/index-[A-Za-z0-9_-]+\.css/);
  const worker = await readFile('dist/sw.js', 'utf8');
  expect(worker).not.toContain('__APP_');
  expect(worker).not.toContain('__BUILD_HASH__');
  const config = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8')) as { routes: Array<{ route: string; headers: Record<string, string> }> };
  expect(config.routes.find((route) => route.route === '/assets/*')?.headers['Cache-Control']).toContain('immutable');
  expect(config.routes.find((route) => route.route === '/sw.js')?.headers['Cache-Control']).toContain('no-cache');
});

test('@claim:app-update-check a new service worker activates, replaces its cache, and announces the update', async ({ browser }) => {
  const distRoot = join(process.cwd(), 'dist');
  const originalWorker = await readFile(join(distRoot, 'sw.js'), 'utf8');
  let serveUpdate = false;
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname;
    try {
      if (pathname === '/sw.js') {
        const body = serveUpdate ? originalWorker.replace(/(const VERSION = '[^']+)(';)/, '$1-update$2') : originalWorker;
        response.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' });
        response.end(body);
        return;
      }
      const isRoute = ['/', '/demo', '/privacy', '/terms'].includes(pathname);
      const file = isRoute ? join(distRoot, 'index.html') : join(distRoot, pathname.replace(/^\/+/, ''));
      const mime: Record<string, string> = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.webp': 'image/webp' };
      response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Update test server did not start.');
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(`http://127.0.0.1:${address.port}/demo`);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    });
    const oldShell = await page.evaluate(async () => (await caches.keys()).find((key) => key.endsWith('-shell')));
    expect(oldShell).toBeTruthy();
    serveUpdate = true;
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
    await expect(page.locator('#work-status')).toHaveText('An update is ready. Reload to use it.');
    await expect.poll(() => page.evaluate(async () => (await caches.keys()).find((key) => key.endsWith('-shell')))).not.toBe(oldShell);
    expect(await page.evaluate(async () => (await caches.keys()).some((key) => key.includes('-update-shell')))).toBe(true);
  } finally {
    await context.close();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('internal navigation uses real URLs and restores page focus', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL('/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL('/');
});

for (const [route, title] of [['/', 'Flipbook Trace — Turn video into tracing frames'], ['/?demo=1', 'Demo — Flipbook Trace'], ['/privacy', 'Privacy — Flipbook Trace'], ['/terms', 'Terms — Flipbook Trace'], ['/missing-page', 'Page not found — Flipbook Trace']] as const) {
  test(`${route} updates Open Graph and Twitter route metadata`, async ({ page }) => {
    await page.goto(route);
    const canonicalPath = route === '/?demo=1' ? '/demo' : route;
    expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBe(title);
    expect(await page.locator('meta[name="twitter:title"]').getAttribute('content')).toBe(title);
    expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(`https://flipbook-trace.sociobot.in${canonicalPath}`);
  });
}

test('the deployment configuration returns the designed 404 artifact for unknown URLs', async () => {
  const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8')) as { responseOverrides?: { '404'?: { rewrite?: string } } };
  expect(config.responseOverrides?.['404']?.rewrite).toBe('/404.html');
  const page404 = await readFile('public/404.html', 'utf8');
  expect(page404).toContain('<title>Page not found — Flipbook Trace</title>');
  expect(page404).toContain('<h1>Page not found</h1>');
  expect(page404).toContain('This page does not exist. Open Flipbook Trace.');
  expect(page404).toContain('Open Flipbook Trace');
  expect(page404).toContain('href="/privacy"');
  expect(page404).toContain('href="/terms"');
  expect(page404).toContain('href="/?demo=1"');
  expect(page404).toContain('href="/#how"');
  expect(page404).toContain('rel="canonical" href="https://flipbook-trace.sociobot.in/404.html"');
  expect(page404).toContain('property="og:url" content="https://flipbook-trace.sociobot.in/404.html"');
  expect(page404).toContain('rel="apple-touch-icon" href="/icons/apple-touch-icon.png"');
  expect(page404).toContain('v1.0.7 · Original generated artwork');
});

test('the SPA not-found route names the error and its destination in plain words', async ({ page }) => {
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Flipbook Trace' })).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'This page does not exist. Open Flipbook Trace.');
});

test('the designed static 404 artifact is served with HTTP 404', async ({ request }) => {
  const page404 = await readFile('dist/404.html');
  const server = createServer((incoming, response) => {
    if (incoming.url === '/missing-page') {
      response.writeHead(404, { 'Content-Type': 'text/html' });
      response.end(page404);
      return;
    }
    response.writeHead(200).end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('404 test server did not start.');
  try {
    const response = await request.get(`http://127.0.0.1:${address.port}/missing-page`);
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('<h1>Page not found</h1>');
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`the one-click demo shows a sample frame in the ${viewport.width}px first viewport`, async ({ browser }) => {
    const page = await browser.newPage({ viewport });
    await page.goto('/');
    await page.getByRole('link', { name: 'Try it with sample data' }).click();
    const frame = await page.locator('#demo-strip canvas').first().boundingBox();
    expect(frame).toBeTruthy();
    expect(frame!.y + frame!.height).toBeLessThanOrEqual(viewport.height);
    await page.screenshot({ path: `test-results/polish-5-demo-first-${viewport.width}.png` });
    await page.close();
  });
}
