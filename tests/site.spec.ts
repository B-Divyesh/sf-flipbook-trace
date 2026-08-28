import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

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

test('the 390 px layout keeps actions inside the viewport', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('/demo');
  await expect(page.locator('#frame-strip figure')).toHaveCount(12);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  for (const selector of ['.wordmark', '.site-header nav a', '#reset-demo', '.demo-banner a', '.site-footer a']) {
    for (const box of await page.locator(selector).evaluateAll((elements) => elements.filter((element) => {
      const style = getComputedStyle(element);
      return style.visibility !== 'hidden' && style.display !== 'none';
    }).map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height, text: element.textContent };
    }))) {
      expect(box.width, `${selector} (${box.text}) width`).toBeGreaterThanOrEqual(44);
      expect(box.height, `${selector} (${box.text}) height`).toBeGreaterThanOrEqual(44);
    }
  }
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
  expect(page404).toContain('This page fell out of the stack');
  expect(page404).toContain('href="/privacy"');
  expect(page404).toContain('href="/terms"');
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
    expect(await response.text()).toContain('This page fell out of the stack');
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
    await page.close();
  });
}
