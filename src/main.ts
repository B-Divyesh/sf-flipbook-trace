import './style.css';
import {
  applyTraceFilter,
  defaultSettings,
  downloadBlob,
  drawDemoFrame,
  loadPreferences,
  makePdf,
  makePngZip,
  normalizeSettings,
  savePreferences,
  type FrameSettings,
} from './core';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) throw new Error('App root is missing.');
const app: HTMLDivElement = appRoot;

const PRODUCT = 'flipbook-trace';
const BILLING_BASE = import.meta.env.VITE_BILLING_BASE || 'https://api.sociobot.in';
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
const BUILD_ID = 'v1.0.5';

let isDemo = false;
let isPro = false;
let licenseInitialized = false;
let settings: FrameSettings = { ...defaultSettings };
let sourceFrames: HTMLCanvasElement[] = [];
let outputFrames: HTMLCanvasElement[] = [];
let loadedVideo: HTMLVideoElement | null = null;
let loadedVideoUrl = '';

function routePath(url = new URL(window.location.href)): string {
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  return pathname === '/demo' || url.searchParams.get('demo') === '1' ? '/demo' : pathname;
}

function navLink(path: string, label: string): string {
  return `<a href="${path}" data-route>${label}</a>`;
}

function shell(content: string): string {
  return `
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-route aria-label="Flipbook Trace home"><span aria-hidden="true">FT</span> Flipbook Trace</a>
      <nav aria-label="Main navigation">
        ${navLink('/?demo=1', 'Demo')}
        <a href="/#how">How it works</a>
        ${navLink('/privacy', 'Privacy')}
      </nav>
    </header>
    ${content}
    <div id="route-status" class="sr-only" aria-live="polite"></div>
    <footer class="site-footer">
      <p>Turn your video into printable tracing frames.</p>
      <div>${navLink('/privacy', 'Privacy')} ${navLink('/terms', 'Terms')} <a href="https://sociobot.in" target="_blank" rel="noreferrer">Built by Param Factory <span class="sr-only">(opens in a new tab)</span></a></div>
      <p>${BUILD_ID} · Original generated artwork</p>
    </footer>`;
}

function workspaceTemplate(demo: boolean): string {
  return `
    <section class="workspace" id="workspace" aria-labelledby="workspace-heading">
      <div class="section-kicker">01 / Prepare</div>
      <div class="workspace-heading-row">
        <div>
          <h2 id="workspace-heading">Make the tracing frames</h2>
          <p>${demo ? 'The paper-bird sample is ready. Set a 1–5 second section, choose a rate, then make frames.' : 'Choose a video you own. The video and frames disappear on reload.'}</p>
        </div>
        <output id="work-status" class="status-stamp" aria-live="polite">${demo ? '12 frames ready' : 'Waiting for a video'}</output>
      </div>
      <div class="work-grid">
        <form id="controls" class="controls" aria-label="Frame controls">
          <div class="field file-field">
            <label for="video-file">Your video</label>
            <input id="video-file" type="file" accept="video/*" />
            <span class="field-note">Choose a video this browser can play.</span>
          </div>
          <div class="time-pair">
            <div class="field"><label for="trim-start">Start time</label><div class="unit-field"><input id="trim-start" type="number" value="0" min="0" max="4" step="0.1" /><span>s</span></div></div>
            <div class="field"><label for="trim-end">End time</label><div class="unit-field"><input id="trim-end" type="number" value="2" min="1" max="5" step="0.1" /><span>s</span></div></div>
          </div>
          <div class="field">
            <label for="fps">Frames each second</label>
            <select id="fps"><option value="2">2 — loose study</option><option value="4">4</option><option value="6" selected>6 — balanced</option><option value="8">8</option><option value="12">12 — detailed</option></select>
          </div>
          <fieldset>
            <legend>Trace style</legend>
            <label class="radio"><input type="radio" name="mode" value="edges" checked /> Pencil edges</label>
            <label class="radio"><input type="radio" name="mode" value="threshold" /> High contrast</label>
            <label class="radio"><input type="radio" name="mode" value="gray" /> Grayscale</label>
          </fieldset>
          <div class="field">
            <div class="label-row"><label for="threshold">Line detail</label><output id="threshold-value">142</output></div>
            <input id="threshold" type="range" min="70" max="220" value="142" />
            <span class="field-note">Move right to keep more dark areas.</span>
          </div>
          <label class="check"><input id="onion" type="checkbox" /> Show the previous frame in red</label>
          <div class="field">
            <label for="quality">Export width</label>
            <select id="quality"><option value="960">960 px — free</option><option value="1920">1920 px — Studio</option><option value="0">Original video width — Studio</option></select>
            <span id="quality-note" class="field-note">Studio controls need a license.</span>
          </div>
          <div class="field">
            <label for="columns">PDF trace sheet columns</label>
            <select id="columns"><option value="4">4 columns — free</option><option value="6">6 columns — Studio</option></select>
          </div>
          <button class="button button-dark" id="make-frames" type="button" ${demo ? '' : 'disabled'}>Make tracing frames</button>
          <details class="settings-tools"><summary>Import or export settings</summary><button id="export-settings" type="button" aria-label="Export settings">Export settings</button><label for="import-settings">Import settings</label><input id="import-settings" type="file" accept="application/json" /></details>
          <p id="form-error" class="error" role="alert" hidden></p>
        </form>
        <div class="preview-zone">
          <div id="empty-preview" class="empty-preview" ${demo ? 'hidden' : ''}>
            <span class="empty-number" aria-hidden="true">00</span>
            <h3>Your frames will appear here</h3>
            <p>Choose a video, then set a 1–5 second section.</p>
            <label class="button button-blue" for="video-file">Choose a video</label>
          </div>
          <div id="frame-strip" class="frame-strip" aria-label="Tracing frame preview"></div>
          <div id="export-bar" class="export-bar" ${demo ? '' : 'hidden'}>
            <div><strong id="export-count">12 frames</strong><span>Numbered and ready to trace</span></div>
            <button class="button button-blue" id="export-png" type="button">Export PNG pack</button>
            <button class="button button-paper" id="export-pdf" type="button">Export PDF trace sheet</button>
          </div>
        </div>
      </div>
    </section>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><div><button id="reset-demo" type="button">Reset demo</button><a href="/" data-route>Start for real</a></div></aside>`;
}

function homePage(): string {
  return shell(`
    <main id="main">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Local video → printable trace sheet</p>
          <h1 tabindex="-1">Turn your video into tracing frames</h1>
          <p class="lede">For short-form creators making a hand-drawn flipbook without uploading their video.</p>
          <div class="hero-actions">
            <a class="button button-blue" href="/?demo=1" data-route>Try it with sample data</a>
            <span>It opens a ready 12-frame paper-bird sample.</span>
          </div>
          <label class="text-action" for="video-file">Or choose your own video ↓</label>
          <ul class="fact-list" aria-label="Product facts">
            <li>Video stays in this browser.</li>
            <li>Works offline after the first visit.</li>
            <li>Free: PNG pack and PDF trace sheet.</li>
          </ul>
        </div>
        <figure class="hero-art">
          <span class="registration registration-one" aria-hidden="true"></span>
          <picture>
            <source srcset="/assets/hero-worktable-640.webp 640w, /assets/hero-worktable.webp 1200w" sizes="(max-width: 800px) 100vw, 54vw" type="image/webp" />
            <img src="/assets/hero-worktable.webp" width="1200" height="800" alt="Hands arrange six bird drawings into a hand-drawn flipbook." fetchpriority="high" decoding="async" />
          </picture>
          <figcaption>Six moments become six frames to trace.</figcaption>
        </figure>
      </section>
      ${workspaceTemplate(false)}
      <section id="how" class="steps" aria-labelledby="how-heading">
        <div class="section-kicker">02 / Method</div>
        <h2 id="how-heading">How to make a trace sheet</h2>
        <ol>
          <li><span>1</span><div><h3>Choose and trim</h3><p>Pick a 1–5 second section from a video you own.</p></div></li>
          <li><span>2</span><div><h3>Set the lines</h3><p>Choose the frame rate and adjust the trace preview.</p></div></li>
          <li><span>3</span><div><h3>Print or draw</h3><p>Export numbered PNGs or one PDF trace sheet.</p></div></li>
        </ol>
      </section>
      <section class="privacy-panel" aria-labelledby="limits-heading">
        <div class="torn-note"><span aria-hidden="true">NO CLOUD</span></div>
        <div><div class="section-kicker">03 / Boundaries</div><h2 id="limits-heading">A preparation tool, not a video editor</h2><p>Flipbook Trace does not publish, host, or generate video. It does not retain your video. Use a video you own or have permission to trace.</p><p>Large or long videos may use more memory. Trim the video before loading it if your device slows down.</p></div>
      </section>
      ${paidSection()}
    </main>`);
}

function paidSection(): string {
  return `<section class="paid" aria-labelledby="paid-heading">
    <div class="paid-mark" aria-hidden="true">STUDIO<br />PASS</div>
    <div><div class="section-kicker">04 / Optional</div><h2 id="paid-heading">Print larger with Studio</h2><p><strong>$9 once.</strong> Keep the free PNG and PDF trace sheet exports. Studio adds 1920 px, exports at your video's original width, and a six-column PDF trace sheet.</p><p class="legal-note">Dodo opens checkout for Sociobot.</p></div>
    <div class="license-actions">
      <a class="button button-red" href="${BILLING_BASE}/api/v1/products/${PRODUCT}/checkout">Buy Studio for $9</a>
      <p id="license-status" class="license-status" aria-live="polite">${isPro ? 'Studio is active on this device.' : ''}</p>
      <details><summary>Have a license?</summary><label for="license-input">Paste your license</label><input id="license-input" type="text" autocomplete="off" /><button id="verify-license" class="button button-paper" type="button" aria-label="Verify license">Verify license</button></details>
      <p><a href="/privacy" data-route>Privacy</a> · <a href="/terms" data-route>Terms</a></p>
    </div>
  </section>`;
}

function demoPage(): string {
  return shell(`${demoBanner()}<main id="main" class="demo-main"><section class="demo-intro"><p class="eyebrow">Paper-bird sample</p><h1 tabindex="-1">Trace a paper bird in twelve frames</h1><p>The sample is built into the app and works without a network.</p><div class="demo-peek" aria-label="Twelve sample tracing frames"><div id="demo-strip" class="demo-strip"></div><p>12 ready frames · set the section and rate below</p></div></section>${workspaceTemplate(true)}</main>`);
}

function privacyPage(): string {
  return shell(`<main id="main" class="prose-page"><p class="eyebrow">Plain-language policy</p><h1 tabindex="-1">Privacy without an upload</h1><p class="lede">Your video stays in your browser while you work.</p><h2>What stays on your device</h2><p>Video decoding, frame selection, filtering, and exports run in your browser. The video and generated frames disappear on reload. Your control settings use browser storage.</p><h2>When the network is used</h2><p>The installed app checks this site for updates. If you verify Studio, your browser sends the license token to Sociobot for that check.</p><h2>Delete local data</h2><p>Clear this site's browser data to remove settings and a saved license. Demo mode does not read or change real settings or licenses.</p><h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with privacy questions.</p></main>`);
}

function termsPage(): string {
  return shell(`<main id="main" class="prose-page"><p class="eyebrow">Use terms</p><h1 tabindex="-1">Terms for making trace sheets</h1><p class="lede">Use Flipbook Trace with a video you own or can lawfully use.</p><h2>Your responsibility</h2><p>You are responsible for the videos you open and the files you create. Do not use the app to copy a video without permission.</p><h2>The service</h2><p>The app is provided as-is. Video support varies by browser. We may change the app to fix problems or improve compatibility.</p><h2>Studio purchase</h2><p>Studio costs $9 as a one-time purchase. Dodo opens checkout for Sociobot. Studio enables the larger export choices.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for purchase help.</p></main>`);
}

function notFoundPage(): string {
  return shell(`<main id="main" class="not-found"><div class="lost-frame" aria-hidden="true">?</div><h1 tabindex="-1">Page not found</h1><p>The address does not match a page in Flipbook Trace.</p><a class="button button-blue" href="/" data-route>Open Flipbook Trace</a></main>`);
}

function updateMeta(path: string): void {
  const details: Record<string, [string, string]> = {
    '/': ['Flipbook Trace — Turn video into tracing frames', 'Choose a local video, pick frames, and export numbered PNGs or a printable PDF trace sheet.'],
    '/demo': ['Demo — Flipbook Trace', 'Try twelve ready paper-bird tracing frames.'],
    '/privacy': ['Privacy — Flipbook Trace', 'How Flipbook Trace handles local video, settings, and licenses.'],
    '/terms': ['Terms — Flipbook Trace', 'Terms for using Flipbook Trace and buying Studio.'],
  };
  const [title, description] = details[path] || ['Page not found — Flipbook Trace', 'This page does not exist. Open Flipbook Trace.'];
  const canonical = `https://flipbook-trace.sociobot.in${path}`;
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
}

async function render(path = routePath(), focus = false): Promise<void> {
  cleanupVideo();
  isDemo = path === '/demo';
  if (path === '/') await initLicense();
  settings = isDemo ? { ...defaultSettings } : await loadPreferences();
  sourceFrames = [];
  outputFrames = [];
  if (path === '/') app.innerHTML = homePage();
  else if (path === '/demo') app.innerHTML = demoPage();
  else if (path === '/privacy') app.innerHTML = privacyPage();
  else if (path === '/terms') app.innerHTML = termsPage();
  else app.innerHTML = notFoundPage();
  updateMeta(path);
  bindNavigation();
  if (path === '/' || path === '/demo') {
    bindWorkspace();
    if (isDemo) loadDemoFrames();
    if (path === '/') bindLicense();
  }
  if (focus) {
    window.scrollTo({ top: 0 });
    const heading = document.querySelector<HTMLHeadingElement>('main h1');
    heading?.focus();
    const status = document.querySelector('#route-status');
    if (status && heading) status.textContent = heading.textContent;
  }
}

function bindNavigation(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-route]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      history.pushState({}, '', url.pathname + url.search + url.hash);
      void render(routePath(url), true);
    });
  });
}

function value<T extends HTMLElement>(id: string): T {
  const element = document.querySelector<T>(`#${id}`);
  if (!element) throw new Error(`${id} is missing.`);
  return element;
}

function bindWorkspace(): void {
  const file = value<HTMLInputElement>('video-file');
  const make = value<HTMLButtonElement>('make-frames');
  const threshold = value<HTMLInputElement>('threshold');
  const reset = document.querySelector<HTMLButtonElement>('#reset-demo');
  value<HTMLSelectElement>('fps').value = String(settings.fps);
  threshold.value = String(settings.threshold);
  value<HTMLOutputElement>('threshold-value').value = String(settings.threshold);
  value<HTMLInputElement>('onion').checked = settings.onion;
  value<HTMLSelectElement>('quality').value = String(settings.quality);
  value<HTMLSelectElement>('columns').value = String(settings.columns);
  const mode = document.querySelector<HTMLInputElement>(`input[name="mode"][value="${settings.mode}"]`);
  if (mode) mode.checked = true;
  file.addEventListener('change', () => void loadVideo(file.files?.[0]));
  make.addEventListener('click', () => void makeFramesFromVideo());
  threshold.addEventListener('input', () => {
    value<HTMLOutputElement>('threshold-value').value = threshold.value;
    updateSettings();
    rebuildOutputFrames();
  });
  document.querySelectorAll<HTMLInputElement>('input[name="mode"], #onion').forEach((input) => input.addEventListener('change', () => {
    updateSettings();
    rebuildOutputFrames();
  }));
  value<HTMLSelectElement>('fps').addEventListener('change', updateSettings);
  value<HTMLSelectElement>('quality').addEventListener('change', (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    if (!hasStudioAccess() && select.value !== '960') {
      select.value = '960';
      showError('That export width needs Studio. Buy or restore a license below.');
    }
    updateSettings();
  });
  value<HTMLSelectElement>('columns').addEventListener('change', (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    if (!hasStudioAccess() && select.value !== '4') {
      select.value = '4';
      showError('The six-column sheet needs Studio. Buy or restore a license below.');
    }
    updateSettings();
  });
  document.querySelector<HTMLButtonElement>('#export-settings')?.addEventListener('click', () => {
    downloadBlob(new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' }), 'flipbook-trace-settings.json');
  });
  document.querySelector<HTMLInputElement>('#import-settings')?.addEventListener('change', (event) => void importSettings((event.currentTarget as HTMLInputElement).files?.[0]));
  document.querySelector<HTMLButtonElement>('#export-png')?.addEventListener('click', exportPng);
  document.querySelector<HTMLButtonElement>('#export-pdf')?.addEventListener('click', exportPdf);
  reset?.addEventListener('click', () => {
    settings = { ...defaultSettings };
    void render('/demo');
  });
}

function updateSettings(): void {
  settings.fps = Number(value<HTMLSelectElement>('fps').value);
  settings.threshold = Number(value<HTMLInputElement>('threshold').value);
  settings.mode = document.querySelector<HTMLInputElement>('input[name="mode"]:checked')?.value as FrameSettings['mode'] || 'edges';
  settings.onion = value<HTMLInputElement>('onion').checked;
  settings.quality = Number(value<HTMLSelectElement>('quality').value);
  settings.columns = Number(value<HTMLSelectElement>('columns').value);
  if (!isDemo) void savePreferences(settings);
}

async function importSettings(file?: File): Promise<void> {
  if (!file) return;
  try {
    settings = normalizeSettings(JSON.parse(await file.text()), hasStudioAccess());
    if (!isDemo) await savePreferences(settings);
    await render(routePath());
  } catch {
    showError('Those settings could not be imported. Choose a Flipbook Trace settings file.');
  }
}

function loadDemoFrames(count = 12): void {
  sourceFrames = Array.from({ length: count }, (_, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 400;
    drawDemoFrame(canvas, index, count);
    return canvas;
  });
  rebuildOutputFrames();
}

function makeDemoFrames(): void {
  clearError();
  updateSettings();
  const start = Number(value<HTMLInputElement>('trim-start').value);
  const end = Number(value<HTMLInputElement>('trim-end').value);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > 5 || end - start < 1 || end - start > 5) {
    showError('The selected section must be 1–5 seconds inside the paper-bird sample. Change the start or end time.');
    return;
  }
  loadDemoFrames(Math.max(2, Math.floor((end - start) * settings.fps)));
}

function paintDemoPeek(): void {
  const strip = document.querySelector<HTMLDivElement>('#demo-strip');
  if (!strip) return;
  strip.replaceChildren();
  outputFrames.forEach((frame, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;
    canvas.getContext('2d')?.drawImage(frame, 0, 0);
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Sample tracing frame ${index + 1} of ${outputFrames.length}`);
    strip.append(canvas);
  });
}

async function loadVideo(file?: File): Promise<void> {
  clearError();
  if (!file) return;
  if (!file.type.startsWith('video/')) {
    showError('That file is not a video. Choose a video this browser can play.');
    return;
  }
  if (file.size > 500 * 1024 * 1024) {
    showError('That video is over 500 MB and may exhaust memory. Trim it on your device, then choose the shorter file.');
    return;
  }
  cleanupVideo();
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';
  loadedVideoUrl = URL.createObjectURL(file);
  video.src = loadedVideoUrl;
  setStatus('Reading video…');
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('This browser could not decode that video format.'));
    });
    if (!Number.isFinite(video.duration) || video.duration < 1) throw new Error('The video must be at least one second long.');
    loadedVideo = video;
    const end = Math.min(3, video.duration);
    const startInput = value<HTMLInputElement>('trim-start');
    const endInput = value<HTMLInputElement>('trim-end');
    startInput.max = String(Math.max(0, video.duration - 1));
    endInput.max = String(video.duration);
    startInput.value = '0';
    endInput.value = String(Math.round(end * 10) / 10);
    value<HTMLButtonElement>('make-frames').disabled = false;
    setStatus(`${file.name} · ${video.duration.toFixed(1)} seconds`);
    await makeFramesFromVideo();
  } catch (error) {
    showError(`${error instanceof Error ? error.message : 'The video could not be read.'} Choose another video.`);
    setStatus('Video could not be read');
  }
}

async function seek(video: HTMLVideoElement, time: number): Promise<void> {
  if (Math.abs(video.currentTime - time) < 0.01 && video.readyState >= 2) return;
  await new Promise<void>((resolve, reject) => {
    const done = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new Error('A frame could not be decoded.')); };
    const cleanup = () => { video.removeEventListener('seeked', done); video.removeEventListener('error', failed); };
    video.addEventListener('seeked', done);
    video.addEventListener('error', failed);
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.01));
  });
}

async function makeFramesFromVideo(): Promise<void> {
  if (isDemo && !loadedVideo) {
    makeDemoFrames();
    return;
  }
  if (!loadedVideo) return;
  clearError();
  updateSettings();
  const start = Number(value<HTMLInputElement>('trim-start').value);
  const end = Number(value<HTMLInputElement>('trim-end').value);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end - start < 1 || end - start > 5 || start < 0 || end > loadedVideo.duration + 0.05) {
    showError('The selected section must be 1–5 seconds inside the video. Change the start or end time.');
    return;
  }
  const count = Math.max(2, Math.floor((end - start) * settings.fps));
  const desiredWidth = settings.quality === 0 ? loadedVideo.videoWidth : settings.quality;
  const width = Math.max(1, desiredWidth);
  const height = Math.round(width * loadedVideo.videoHeight / loadedVideo.videoWidth);
  sourceFrames = [];
  setStatus(`Making 0 of ${count} frames…`);
  value<HTMLButtonElement>('make-frames').disabled = true;
  try {
    for (let index = 0; index < count; index += 1) {
      await seek(loadedVideo, start + index / settings.fps);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')?.drawImage(loadedVideo, 0, 0, width, height);
      sourceFrames.push(canvas);
      setStatus(`Making ${index + 1} of ${count} frames…`);
    }
    rebuildOutputFrames();
  } catch (error) {
    showError(`${error instanceof Error ? error.message : 'Frames could not be made.'} Try a shorter section or another video.`);
  } finally {
    value<HTMLButtonElement>('make-frames').disabled = false;
  }
}

function rebuildOutputFrames(): void {
  if (!sourceFrames.length) return;
  outputFrames = sourceFrames.map((source, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext('2d');
    context?.drawImage(source, 0, 0);
    applyTraceFilter(canvas, settings.mode, settings.threshold);
    if (settings.onion && index > 0 && context) {
      context.save();
      context.globalAlpha = 0.16;
      context.globalCompositeOperation = 'multiply';
      context.drawImage(sourceFrames[index - 1], 0, 0);
      context.restore();
    }
    return canvas;
  });
  paintFrames();
  if (isDemo) paintDemoPeek();
}

function paintFrames(): void {
  const strip = document.querySelector<HTMLDivElement>('#frame-strip');
  const empty = document.querySelector<HTMLElement>('#empty-preview');
  const exports = document.querySelector<HTMLElement>('#export-bar');
  if (!strip || !empty || !exports) return;
  strip.replaceChildren();
  outputFrames.forEach((canvas, index) => {
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = String(index + 1).padStart(2, '0');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Tracing frame ${index + 1} of ${outputFrames.length}`);
    figure.append(canvas, caption);
    strip.append(figure);
  });
  empty.hidden = true;
  exports.hidden = false;
  value<HTMLElement>('export-count').textContent = `${outputFrames.length} frames`;
  setStatus(`${outputFrames.length} frames ready`);
}

async function exportPng(): Promise<void> {
  if (!outputFrames.length) return;
  setStatus('Packing numbered PNGs…');
  try {
    downloadBlob(await makePngZip(outputFrames), 'flipbook-trace-frames.zip');
    setStatus(`${outputFrames.length} PNGs exported`);
  } catch {
    showError('The PNG pack could not be made. Try fewer frames.');
  }
}

async function exportPdf(): Promise<void> {
  if (!outputFrames.length) return;
  setStatus('Laying out the PDF trace sheet…');
  try {
    downloadBlob(await makePdf(outputFrames, hasStudioAccess() ? settings.columns : 4), 'flipbook-trace-sheet.pdf');
    setStatus('PDF trace sheet exported');
  } catch {
    showError('The PDF trace sheet could not be made. Try fewer frames.');
  }
}

function setStatus(message: string): void {
  const status = document.querySelector<HTMLOutputElement>('#work-status');
  if (status) status.value = message;
}

function showError(message: string): void {
  const error = document.querySelector<HTMLElement>('#form-error');
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
}

function clearError(): void {
  const error = document.querySelector<HTMLElement>('#form-error');
  if (error) error.hidden = true;
}

function cleanupVideo(): void {
  if (loadedVideoUrl) URL.revokeObjectURL(loadedVideoUrl);
  loadedVideo = null;
  loadedVideoUrl = '';
}

function hasStudioAccess(): boolean {
  return !isDemo && isPro;
}

async function verifyLicense(token: string, force = false): Promise<void> {
  const status = document.querySelector<HTMLElement>('#license-status');
  const cached = localStorage.getItem(LICENSE_CACHE_KEY);
  if (!force && cached) {
    const record = JSON.parse(cached) as { valid: boolean; checked: number };
    if (record.valid && Date.now() - record.checked < 86_400_000) {
      isPro = true;
      if (status) status.textContent = 'Studio is active on this device.';
      return;
    }
  }
  if (status) status.textContent = 'Checking the license…';
  try {
    const response = await fetch(`${BILLING_BASE}/api/v1/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`);
    const verdict = await response.json() as { valid: boolean; reason?: string };
    isPro = verdict.valid;
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ valid: isPro, checked: Date.now() }));
    if (status) status.textContent = isPro ? 'Studio is active on this device.' : 'This license is not active. Check the token or buy Studio.';
  } catch {
    if (status) status.textContent = 'The license could not be checked. The free exports still work.';
  }
}

function bindLicense(): void {
  document.querySelector<HTMLButtonElement>('#verify-license')?.addEventListener('click', () => {
    const token = value<HTMLInputElement>('license-input').value.trim();
    if (!token) {
      value<HTMLElement>('license-status').textContent = 'Paste a license token first.';
      return;
    }
    localStorage.setItem(LICENSE_KEY, token);
    void verifyLicense(token, true);
  });
}

async function initLicense(): Promise<void> {
  if (routePath() !== '/' || licenseInitialized) return;
  licenseInitialized = true;
  const params = new URLSearchParams(location.search);
  const returned = params.get('license');
  if (returned) {
    localStorage.setItem(LICENSE_KEY, returned);
    params.delete('license');
    history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
  }
  const token = returned || localStorage.getItem(LICENSE_KEY);
  if (token) await verifyLicense(token);
}

window.addEventListener('popstate', () => void render(routePath(), true));
window.addEventListener('online', () => setStatus('Back online. Your local work is unchanged.'));
window.addEventListener('offline', () => setStatus('Offline. Local video and exports still work.'));

async function start(): Promise<void> {
  await render();
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) setStatus('An update is ready. Reload to use it.');
        });
      });
    } catch {
      setStatus('Offline setup is unavailable. The app still works while this page is open.');
    }
  }
}

void start();
