import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const base = 'https://flipbook-trace.sociobot.in';
const evidenceDir = '.factory/verification-artifacts-15';
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const result = {
  testedAt: new Date().toISOString(),
  base,
  routes: {},
  firstRead: {},
  demoFlow: {},
  keyboard: {},
  reducedMotion: {},
  textResize: {},
  pwa: {},
  startup: {},
  headers: {},
  links: [],
};

function listenForErrors(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  return errors;
}

async function visibleTargets(page) {
  return page.locator('a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), summary, label.button, .text-action').evaluateAll((elements) => elements.flatMap((candidate) => {
    if (!(candidate instanceof HTMLElement)) return [];
    const input = candidate instanceof HTMLInputElement ? candidate : null;
    const target = input && ['checkbox', 'radio'].includes(input.type)
      ? input.closest('label') || document.querySelector(`label[for="${CSS.escape(input.id)}"]`)
      : candidate;
    if (!(target instanceof HTMLElement)) return [];
    const style = getComputedStyle(target);
    const rect = target.getBoundingClientRect();
    if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) return [];
    return [{
      label: (target.getAttribute('aria-label') || target.textContent || target.id || target.tagName).trim().replace(/\s+/g, ' ').slice(0, 100),
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
    }];
  }));
}

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = listenForErrors(page);
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 60_000 });
    if (route === '/demo') await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
    const axe = await new AxeBuilder({ page }).analyze();
    const targets = await visibleTargets(page);
    result.routes[`${viewport.name}:${route}`] = {
      status: response?.status(),
      title: await page.title(),
      lang: await page.locator('html').getAttribute('lang'),
      h1: await page.locator('h1').allTextContents(),
      mainCount: await page.locator('main').count(),
      horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
      seriousOrCritical: axe.violations.filter(({ impact }) => ['serious', 'critical'].includes(impact || '')).map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
      undersizedTargets: targets.filter(({ width, height }) => width < 44 || height < 44),
      errors,
    };
    if (route === '/' || route === '/demo') {
      const name = route === '/' ? 'home' : 'demo';
      await page.screenshot({ path: `${evidenceDir}/live-${name}-${viewport.name}.png`, fullPage: true });
    }
    if (route === '/') {
      const facts = await page.locator('.fact-list').boundingBox();
      const action = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
      result.firstRead[viewport.name] = {
        viewport,
        h1: await page.locator('h1').innerText(),
        audience: await page.locator('.lede').first().innerText(),
        action: await page.getByRole('link', { name: 'Try it with sample data' }).innerText(),
        outcome: await page.locator('.hero-actions span').innerText(),
        facts: await page.locator('.fact-list li').allTextContents(),
        actionBottom: action ? action.y + action.height : null,
        factsBottom: facts ? facts.y + facts.height : null,
      };
    }
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = listenForErrors(page);
  const coldRequests = [];
  page.on('request', (request) => coldRequests.push({ method: request.method(), url: request.url() }));
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  await page.locator('#controls').waitFor();
  await page.waitForLoadState('networkidle');
  const coldRequestSnapshot = [...coldRequests];
  const runtimeRequests = [];
  page.on('request', (request) => runtimeRequests.push({ method: request.method(), url: request.url() }));

  await page.locator('#fps').selectOption('12');
  await page.locator('#trim-end').fill('5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '60 frames ready' }).waitFor();
  const maximumFrames = await page.locator('#frame-strip figure').count();

  await page.locator('#trim-end').fill('0.5');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  const invalidError = await page.locator('#form-error').innerText();
  const framesAfterInvalid = await page.locator('#frame-strip figure').count();
  await page.locator('#trim-end').fill('1');
  await page.getByRole('button', { name: 'Make tracing frames' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const recoveryErrorHidden = await page.locator('#form-error').getAttribute('hidden');

  const pngEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).click();
  const png = await pngEvent;
  const pngBytes = await readFile(await png.path());
  const pdfEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF trace sheet' }).click();
  const pdf = await pdfEvent;
  const pdfBytes = await readFile(await pdf.path());

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  result.demoFlow = {
    banner: await page.locator('.demo-banner').innerText(),
    coldRequestCount: coldRequestSnapshot.length,
    coldRequests: coldRequestSnapshot,
    allColdRequestsSameOrigin: coldRequestSnapshot.every(({ url }) => new URL(url).origin === base),
    runtimeRequests: runtimeRequests.slice(0),
    maximumFrames,
    invalidError,
    framesAfterInvalid,
    recoveryErrorHidden: recoveryErrorHidden !== null,
    resetFrames: await page.locator('#frame-strip figure').count(),
    png: { filename: png.suggestedFilename(), bytes: pngBytes.length, signature: pngBytes.subarray(0, 4).toString('hex') },
    pdf: { filename: pdf.suggestedFilename(), bytes: pdfBytes.length, signature: pdfBytes.subarray(0, 8).toString('latin1') },
    errors,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  await page.keyboard.press('Tab');
  const firstTab = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href') }));
  await page.locator('#threshold').focus();
  const before = Number(await page.locator('#threshold').inputValue());
  const focus = await page.locator('#threshold').evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineColor: style.outlineColor, outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineOffset: style.outlineOffset };
  });
  await page.keyboard.press('ArrowRight');
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  const after = Number(await page.locator('#threshold').inputValue());
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG pack' }).focus();
  await page.keyboard.press('Enter');
  const keyboardDownload = await downloadEvent;
  result.keyboard = { firstTab, before, after, focus, download: keyboardDownload.suggestedFilename() };
  await context.close();
}

{
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  result.reducedMotion = await page.evaluate(() => {
    const parseMs = (value) => Math.max(...value.split(',').map((part) => part.trim().endsWith('ms') ? Number.parseFloat(part) : Number.parseFloat(part) * 1000));
    const durations = [...document.querySelectorAll('*')].map((element) => {
      const style = getComputedStyle(element);
      return { animationMs: parseMs(style.animationDuration), transitionMs: parseMs(style.transitionDuration) };
    });
    return {
      matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      maximumAnimationMs: Math.max(...durations.map(({ animationMs }) => animationMs)),
      maximumTransitionMs: Math.max(...durations.map(({ transitionMs }) => transitionMs)),
      elementsAboveOneMs: durations.filter(({ animationMs, transitionMs }) => animationMs > 1 || transitionMs > 1).length,
    };
  });
  await context.close();
}

for (const route of ['/', '/demo', '/privacy', '/terms']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  if (route === '/demo') await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  result.textResize[route] = {
    horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
    clientWidth: await page.evaluate(() => document.documentElement.clientWidth),
  };
  await context.close();
}

{
  const firstControl = [];
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${base}/?demo=1`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    firstControl.push(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)));
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = listenForErrors(page);
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  await page.waitForFunction(() => document.querySelectorAll('#frame-strip figure').length === 12);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await page.waitForFunction(() => document.querySelectorAll('#frame-strip figure').length === 12);
  const online = {
    controller: await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL || null),
    caches: await page.evaluate(() => caches.keys()),
    frames: await page.locator('#frame-strip figure').count(),
  };
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
  result.pwa = {
    immediateControllerAfterReady: firstControl,
    online,
    offline: { responseStatus: response?.status(), frames: await page.locator('#frame-strip figure').count(), status: await page.locator('#work-status').innerText() },
    errors,
  };
  await context.close();
}

{
  const longestTasks = [];
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.75 });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      const tasks = [];
      new PerformanceObserver((list) => tasks.push(...list.getEntries().map((entry) => entry.duration))).observe({ type: 'longtask', buffered: true });
      window.__qaStartupTasks = tasks;
    });
    await page.goto(`${base}/?demo=1`);
    await page.locator('#frame-strip figure').count();
    await page.locator('#work-status').filter({ hasText: '12 frames ready' }).waitFor();
    longestTasks.push(Math.round(await page.evaluate(() => Math.max(0, ...window.__qaStartupTasks))));
    await context.close();
  }
  const sorted = [...longestTasks].sort((a, b) => a - b);
  result.startup = { longestTasks, medianMs: sorted[2], maximumMs: Math.max(...longestTasks), allUnder200: longestTasks.every((value) => value < 200), medianUnder150: sorted[2] < 150 };
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  const response = await page.goto(base, { waitUntil: 'networkidle' });
  const asset = await page.evaluate(() => performance.getEntriesByType('resource').map(({ name }) => name).find((name) => /\/assets\/index-[^/]+\.js$/.test(name)));
  for (const [name, url] of [['document', base + '/'], ['worker', base + '/sw.js'], ['manifest', base + '/manifest.webmanifest'], ['asset', asset]]) {
    const fetched = await context.request.get(url);
    const headers = fetched.headers();
    result.headers[name] = {
      url,
      status: fetched.status(),
      cacheControl: headers['cache-control'] || null,
      contentType: headers['content-type'] || null,
      csp: headers['content-security-policy'] || null,
      hsts: headers['strict-transport-security'] || null,
      nosniff: headers['x-content-type-options'] || null,
      referrerPolicy: headers['referrer-policy'] || null,
      permissionsPolicy: headers['permissions-policy'] || null,
    };
  }
  result.headers.browserDocumentStatus = response?.status();
  const hrefs = await page.locator('a[href]').evaluateAll((links) => [...new Set(links.map((link) => link.href))]);
  for (const href of hrefs) {
    if (href.startsWith('mailto:') || href.includes('#')) {
      result.links.push({ href, skipped: true });
      continue;
    }
    const linkResponse = await context.request.get(href, { maxRedirects: 0 });
    result.links.push({ href, status: linkResponse.status(), location: linkResponse.headers().location || null });
  }
  await context.close();
}

await browser.close();
await writeFile(`${evidenceDir}/live-audit.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
