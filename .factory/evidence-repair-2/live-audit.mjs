import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://flipbook-trace.sociobot.in';
const browser = await chromium.launch({ headless: true });
const evidence = { routes: {}, license: {}, offline: {}, terms: {}, reducedMotion: {} };

for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  evidence.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    h1: await page.locator('h1').count(),
    main: await page.locator('main').count(),
    lang: await page.locator('html').getAttribute('lang'),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    seriousOrCriticalAxe: axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical').map(({ id }) => id),
    crossOriginRequests: requests.filter((url) => new URL(url).origin !== base),
    errors: route === '/missing-page' ? errors.filter((error) => !error.includes('404')) : errors,
  };
  if (route === '/') await page.screenshot({ path: '.factory/evidence-repair-2/live-home-mobile.png', fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.factory/evidence-repair-2/live-home-desktop.png', fullPage: true });
  await context.close();
}

{
  const token = 'repair-invalid-cache';
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
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('sb_license:flipbook-trace:verdict')));
  await page.reload({ waitUntil: 'networkidle' });
  evidence.license.invalid = { calls, stored, noticeAfterReload: await page.locator('#license-status').innerText() };
  await context.close();
}

{
  const token = 'repair-valid-cache';
  const context = await browser.newContext();
  await context.addInitScript(({ savedToken }) => {
    if (!localStorage.getItem('sb_license:flipbook-trace')) {
      localStorage.setItem('sb_license:flipbook-trace', savedToken);
      localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() - 86_399_000, reason: 'ok', token: savedToken }));
    }
  }, { savedToken: token });
  const page = await context.newPage();
  let calls = 0;
  await page.route(`https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=${token}`, (route) => {
    calls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked' }) });
  });
  await page.goto(base);
  await page.reload({ waitUntil: 'networkidle' });
  evidence.license.valid = { calls, noticeAfterReload: await page.locator('#license-status').innerText() };
  await context.close();
}

{
  const token = 'repair-revoked-cache';
  const context = await browser.newContext();
  await context.addInitScript(({ savedToken }) => {
    if (!localStorage.getItem('sb_license:flipbook-trace')) {
      localStorage.setItem('sb_license:flipbook-trace', savedToken);
      localStorage.setItem('sb_license:flipbook-trace:verdict', JSON.stringify({ valid: true, checked: Date.now() - 86_401_000, reason: 'ok', token: savedToken }));
    }
  }, { savedToken: token });
  const page = await context.newPage();
  let calls = 0;
  await page.route(`https://api.sociobot.in/api/v1/products/flipbook-trace/verify?license=${token}`, (route) => {
    calls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked' }) });
  });
  await page.goto(base);
  await page.locator('#license-status').filter({ hasText: 'was revoked' }).waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  evidence.license.revoked = {
    calls,
    noticeAfterReload: await page.locator('#license-status').innerText(),
    inactiveStyle: await page.locator('#license-status').getAttribute('class'),
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  evidence.offline = {
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
  evidence.reducedMotion = {
    matches: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    runningAnimations: await page.evaluate(() => document.getAnimations().filter(({ playState }) => playState === 'running').length),
  };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}/terms`);
  evidence.terms = {
    merchant: await page.getByText('Sociobot/Dodo is the merchant of record and handles refunds.').isVisible(),
    revocation: await page.getByText('A refund automatically revokes the Studio license.').isVisible(),
  };
  await context.close();
}

await browser.close();
await writeFile('.factory/evidence-repair-2/live-audit.json', `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
