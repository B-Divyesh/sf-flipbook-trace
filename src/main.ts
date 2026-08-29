import './style.css';
import {
  defaultSettings,
  downloadBlob,
  loadPreferences,
  normalizeSettings,
  savePreferences,
  type FrameSettings,
} from './settings';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) throw new Error('App root is missing.');
const app: HTMLDivElement = appRoot;

const PRODUCT = 'flipbook-trace';
const BILLING_BASE = import.meta.env.VITE_BILLING_BASE || 'https://api.sociobot.in';
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
const LICENSE_CACHE_MS = 24 * 60 * 60 * 1000;
const BUILD_ID = 'v1.0.14';
const PREVIEW_WIDTH = 320;
const PREVIEW_INPUT_DELAY_MS = 120;
const PREVIEW_CHUNK_SIZE = 1;
// The sample frames only need to be sharp at their displayed size. Keeping the
// source close to that size avoids doing full-export-sized pixel work while the
// demo is becoming interactive on a throttled phone.
const DEMO_SOURCE_WIDTH = 144;
const DEMO_SOURCE_HEIGHT = 90;
const DEMO_OVERVIEW_WIDTH = 64;
const DEMO_OVERVIEW_HEIGHT = 40;
const PAINT_CHUNK_SIZE = 1;

type LicenseVerdict = {
  valid: boolean;
  checked: number;
  reason?: string;
  token?: string;
};

let isDemo = false;
let isPro = false;
let licenseInitialized = false;
let licenseVerdict: LicenseVerdict | null = null;
let settings: FrameSettings = { ...defaultSettings };
let sourceFrames: HTMLCanvasElement[] = [];
let outputFrames: HTMLCanvasElement[] = [];
let loadedVideo: HTMLVideoElement | null = null;
let loadedVideoUrl = '';
let previewGeneration = 0;
let previewTimer: number | undefined;
let exportProcessorPromise: Promise<typeof import('./core')> | undefined;
let frameProcessorPromise: Promise<typeof import('./frame-processor')> | undefined;

function loadExportProcessor(): Promise<typeof import('./core')> {
  exportProcessorPromise ??= import('./core');
  return exportProcessorPromise;
}

function loadFrameProcessor(): Promise<typeof import('./frame-processor')> {
  frameProcessorPromise ??= import('./frame-processor');
  return frameProcessorPromise;
}

function routePath(url = new URL(window.location.href)): string {
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  return pathname === '/demo' || url.searchParams.get('demo') === '1' ? '/demo' : pathname;
}

function navLink(path: string, label: string): string {
  return `<a href="${path}" data-route>${label}</a>`;
}

function siteHeader(): string {
  return `<header class="site-header">
    <a class="wordmark" href="/" data-route><span aria-hidden="true">FT</span> Flipbook Trace</a>
    <nav aria-label="Main navigation">
      ${navLink('/?demo=1', 'Demo')}
      <a href="/#how">How it works</a>
      ${navLink('/privacy', 'Privacy')}
    </nav>
  </header>`;
}

function siteFooter(): string {
  return `<footer class="site-footer">
    <p>Turn your video into printable tracing frames.</p>
    <div>${navLink('/privacy', 'Privacy')} ${navLink('/terms', 'Terms')} <a href="https://sociobot.in" target="_blank" rel="noreferrer">Built by Param Factory <span class="sr-only">(opens in a new tab)</span></a></div>
    <p>${BUILD_ID} · Original generated artwork</p>
  </footer>`;
}

function shell(content: string): string {
  return `
    <a class="skip-link" href="#main">Skip to main content</a>
    ${siteHeader()}
    ${content}
    <div id="route-status" class="sr-only" aria-live="polite"></div>
    ${siteFooter()}`;
}

function workspaceHeadingTemplate(demo: boolean): string {
  return `
    <div class="section-kicker">01 / Prepare</div>
    <div class="workspace-heading-row">
      <div>
        <h2 id="workspace-heading">Make the tracing frames</h2>
        <p>${demo ? 'The paper-bird sample is ready. Set a 1–5 second section, choose a rate, then make frames.' : 'Choose a video you own. The video and frames disappear on reload.'}</p>
      </div>
      <output id="work-status" class="status-stamp" aria-live="polite">${demo ? 'Preparing sample frames…' : 'Waiting for a video'}</output>
    </div>`;
}

function workspaceControlsTemplate(): string {
  return `
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
          <button class="button button-dark" id="make-frames" type="button" disabled>Make tracing frames</button>
          <details class="settings-tools"><summary>Import or export settings</summary><button id="export-settings" type="button" aria-label="Export settings">Export settings</button><label for="import-settings">Import settings</label><input id="import-settings" type="file" accept="application/json" /></details>
          <p id="form-error" class="error" role="alert" hidden></p>
    </form>`;
}

function workspacePreviewTemplate(demo: boolean): string {
  return `
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
        <button class="button button-blue" id="export-png" type="button" disabled>Export PNG pack</button>
        <button class="button button-paper" id="export-pdf" type="button" disabled>Export PDF trace sheet</button>
      </div>
    </div>`;
}

function workspaceTemplate(demo: boolean): string {
  return `
    <section class="workspace" id="workspace" aria-labelledby="workspace-heading">
      ${workspaceHeadingTemplate(demo)}
      <div class="work-grid">
        ${workspaceControlsTemplate()}
        ${workspacePreviewTemplate(demo)}
      </div>
    </section>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><div><button id="reset-demo" type="button">Reset demo</button><a href="/" data-route>Start for real</a></div></aside>`;
}

function demoInitialPage(): string {
  // The demo is the required first interaction, so its first layout contains
  // only the navigation, mode notice, and useful explanation. The preview,
  // workspace, and footer are attached over later browser turns below. This
  // prevents style and layout for off-screen controls from joining the first
  // mobile startup task.
  return `
    <a class="skip-link" href="#main">Skip to main content</a>
    ${siteHeader()}
    ${demoBanner()}
    <main id="main" class="demo-main"><section id="demo-intro" class="demo-intro"><p class="eyebrow">Paper-bird sample</p><h1 tabindex="-1">Trace a paper bird in twelve frames</h1><p>The sample is built into the app and works without a network.</p></section></main>
    <div id="route-status" class="sr-only" aria-live="polite"></div>`;
}

function updateMeta(path: string, details: [string, string]): void {
  const [title, description] = details;
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
  cancelPreviewRender();
  cleanupVideo();
  isDemo = path === '/demo';
  const licenseToCheck = path === '/' ? initLicense() : null;
  settings = isDemo ? { ...defaultSettings } : normalizeSettings(await loadPreferences(), hasStudioAccess());
  sourceFrames = [];
  outputFrames = [];
  const staticPages = path === '/demo' ? null : await import('./static-pages');
  if (path === '/') app.innerHTML = shell(staticPages!.homeContent(workspaceTemplate(false), staticPages!.paidContent(BILLING_BASE, PRODUCT, licenseStatusText(), Boolean(licenseVerdict && !isPro))));
  else if (path === '/demo') app.innerHTML = demoInitialPage();
  else if (path === '/privacy') app.innerHTML = shell(staticPages!.privacyContent());
  else if (path === '/terms') app.innerHTML = shell(staticPages!.termsContent());
  else app.innerHTML = shell(staticPages!.notFoundContent());
  updateMeta(path, path === '/demo' ? ['Demo — Flipbook Trace', 'Try twelve ready paper-bird tracing frames.'] : staticPages!.pageMeta(path));
  if (path !== '/demo') bindNavigation();
  if (path === '/') {
    bindWorkspace();
    bindLicense();
    // The real workspace warms its local-only processors before a person
    // chooses a file. That keeps import, tracing, and export free of HTTP
    // activity after the shell has settled. Demo deliberately does not use
    // this path, so its startup never parses the export module.
    void loadFrameProcessor();
    void loadExportProcessor();
    if (licenseToCheck) void verifyLicense(licenseToCheck);
  } else if (path === '/demo') {
    void mountDemoPage();
  }
  if (focus) {
    window.scrollTo({ top: 0 });
    const heading = document.querySelector<HTMLHeadingElement>('main h1');
    heading?.focus();
    const status = document.querySelector('#route-status');
    if (status && heading) status.textContent = heading.textContent;
  }
}

async function mountDemoPage(): Promise<void> {
  const generation = previewGeneration;
  await yieldForPaint();
  if (generation !== previewGeneration || !isDemo) return;
  const intro = document.querySelector<HTMLElement>('#demo-intro');
  const main = document.querySelector<HTMLElement>('#main');
  if (!intro?.isConnected || !main?.isConnected) return;
  // The frame overview and workspace have independent layout. Keep both out
  // of the initial viewport task, then give this small page extension its own
  // paint before mounting the controls.
  intro.insertAdjacentHTML('beforeend', '<div class="demo-peek" aria-label="Twelve sample tracing frames"><div id="demo-strip" class="demo-strip"></div><p>12 ready frames · set the section and rate below</p></div>');
  main.insertAdjacentHTML('beforeend', '<div id="demo-workspace" aria-busy="true"></div>');
  app.insertAdjacentHTML('beforeend', siteFooter());
  bindNavigation();
  await yieldForPaint();
  if (generation !== previewGeneration || !isDemo) return;
  void mountDemoWorkspace();
}

async function mountDemoWorkspace(): Promise<void> {
  const generation = previewGeneration;
  await yieldForPaint();
  if (generation !== previewGeneration || !isDemo) return;
  const mount = document.querySelector<HTMLDivElement>('#demo-workspace');
  if (!mount?.isConnected) return;
  // Demo startup is a one-click promise. Attaching the full form, frame strip,
  // and export controls in one task was a 200+ ms phone-layout task under CPU
  // pressure. Stage the independent pieces over browser turns: the useful
  // demo introduction paints first, then controls, then preview/canvas work.
  mount.innerHTML = `<section class="workspace" id="workspace" aria-labelledby="workspace-heading">${workspaceHeadingTemplate(true)}<div id="demo-work-grid" class="work-grid" aria-busy="true"></div></section>`;
  await yieldForPaint();
  if (generation !== previewGeneration || !isDemo) return;
  const grid = document.querySelector<HTMLDivElement>('#demo-work-grid');
  if (!grid?.isConnected) return;
  grid.insertAdjacentHTML('beforeend', workspaceControlsTemplate());
  await yieldToBrowser();
  if (generation !== previewGeneration || !isDemo || !grid.isConnected) return;
  grid.insertAdjacentHTML('beforeend', workspacePreviewTemplate(true));
  bindWorkspace();
  void loadDemoFrames();
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
    schedulePreviewRender(PREVIEW_INPUT_DELAY_MS);
  });
  document.querySelectorAll<HTMLInputElement>('input[name="mode"], #onion').forEach((input) => input.addEventListener('change', () => {
    updateSettings();
    schedulePreviewRender();
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
  reset?.addEventListener('click', async () => {
    settings = { ...defaultSettings };
    setStatus('Resetting the sample…');
    await yieldAfterInteraction();
    await render('/demo');
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

async function loadDemoFrames(count = 12): Promise<void> {
  const generation = previewGeneration;
  const nextFrames: HTMLCanvasElement[] = [];
  const make = document.querySelector<HTMLButtonElement>('#make-frames');
  if (make) make.disabled = true;
  setExportButtonsDisabled(true);
  setStatus('Preparing sample frames…');
  await yieldToBrowser();
  const { drawDemoFrame, drawDemoTraceFrame } = await loadFrameProcessor();
  // Module parsing and canvas work must stay in separate browser tasks on a
  // throttled phone. This compact source is enlarged only for display, so the
  // ready sample stays legible without spending export-sized pixel work.
  await yieldToBrowser();
  for (let index = 0; index < count; index += 1) {
    if (generation !== previewGeneration) return;
    const canvas = document.createElement('canvas');
    canvas.width = DEMO_SOURCE_WIDTH;
    canvas.height = DEMO_SOURCE_HEIGHT;
    drawDemoFrame(canvas, index, count);
    nextFrames.push(canvas);
    await yieldToBrowser();
  }
  if (generation !== previewGeneration) return;
  sourceFrames = nextFrames;
  if (settings.mode === 'edges' && settings.threshold === defaultSettings.threshold && !settings.onion) {
    const traces: HTMLCanvasElement[] = [];
    // The default sample is already a line drawing. Drawing that representation
    // directly avoids twelve pixel readbacks while the demo is first becoming
    // interactive; changing any trace setting still runs the full filter.
    for (let index = 0; index < count; index += 1) {
      if (generation !== previewGeneration) return;
      const canvas = document.createElement('canvas');
      canvas.width = DEMO_SOURCE_WIDTH;
      canvas.height = DEMO_SOURCE_HEIGHT;
      drawDemoTraceFrame(canvas, index, count);
      traces.push(canvas);
      await yieldToBrowser();
    }
    if (generation !== previewGeneration) return;
    outputFrames = traces;
    await paintFrames(generation);
    if (isDemo) await paintDemoPeek(generation);
    return;
  }
  schedulePreviewRender();
}

async function makeDemoFrames(): Promise<void> {
  clearError();
  updateSettings();
  const start = Number(value<HTMLInputElement>('trim-start').value);
  const end = Number(value<HTMLInputElement>('trim-end').value);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > 5 || end - start < 1 || end - start > 5) {
    showError('The selected section must be 1–5 seconds inside the paper-bird sample. Change the start or end time.');
    return;
  }
  setStatus('Making sample frames…');
  await yieldAfterInteraction();
  await loadDemoFrames(Math.max(2, Math.floor((end - start) * settings.fps)));
}

async function paintDemoPeek(generation: number): Promise<void> {
  const strip = document.querySelector<HTMLDivElement>('#demo-strip');
  if (!strip) return;
  strip.replaceChildren();
  const overviewFrames = outputFrames.slice(0, 12);
  for (let index = 0; index < overviewFrames.length; index += 1) {
    if (generation !== previewGeneration) return;
    const frame = overviewFrames[index];
    const canvas = document.createElement('canvas');
    canvas.width = DEMO_OVERVIEW_WIDTH;
    canvas.height = DEMO_OVERVIEW_HEIGHT;
    canvas.getContext('2d')?.drawImage(frame, 0, 0, canvas.width, canvas.height);
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Sample tracing frame ${index + 1} of ${overviewFrames.length}`);
    strip.append(canvas);
    if ((index + 1) % PAINT_CHUNK_SIZE === 0) await yieldForPaint();
  }
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
    await makeDemoFrames();
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
  setExportButtonsDisabled(true);
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
    schedulePreviewRender();
  } catch (error) {
    showError(`${error instanceof Error ? error.message : 'Frames could not be made.'} Try a shorter section or another video.`);
  } finally {
    value<HTMLButtonElement>('make-frames').disabled = false;
  }
}

function cancelPreviewRender(): void {
  previewGeneration += 1;
  if (previewTimer !== undefined) window.clearTimeout(previewTimer);
  previewTimer = undefined;
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

function yieldAfterInteraction(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => window.setTimeout(resolve, 0)));
}

function yieldForPaint(): Promise<void> {
  // A timer boundary lets scripts run again before the renderer necessarily
  // paints. Two animation frames guarantee that the previous DOM batch has a
  // paint opportunity before adding the next thumbnail.
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function traceFrame(
  source: HTMLCanvasElement,
  index: number,
  sources: HTMLCanvasElement[],
  frameSettings: FrameSettings,
  applyFilter: (canvas: HTMLCanvasElement, mode: FrameSettings['mode'], threshold: number) => void,
  maximumWidth?: number,
): HTMLCanvasElement {
  const scale = maximumWidth ? Math.min(1, maximumWidth / source.width) : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext('2d');
  context?.drawImage(source, 0, 0, canvas.width, canvas.height);
  applyFilter(canvas, frameSettings.mode, frameSettings.threshold);
  if (frameSettings.onion && index > 0 && context) {
    context.save();
    context.globalAlpha = 0.16;
    context.globalCompositeOperation = 'multiply';
    context.drawImage(sources[index - 1], 0, 0, canvas.width, canvas.height);
    context.restore();
  }
  return canvas;
}

function schedulePreviewRender(delay = 0): void {
  if (!sourceFrames.length) return;
  cancelPreviewRender();
  setExportButtonsDisabled(true);
  const generation = previewGeneration;
  setStatus('Updating preview…');
  previewTimer = window.setTimeout(() => {
    previewTimer = undefined;
    void rebuildOutputFrames(generation);
  }, delay);
}

async function rebuildOutputFrames(generation: number): Promise<void> {
  const sources = [...sourceFrames];
  const frameSettings = { ...settings };
  const nextFrames: HTMLCanvasElement[] = [];
  const { applyTraceFilter } = await loadFrameProcessor();
  await yieldToBrowser();
  for (let index = 0; index < sources.length; index += 1) {
    if (generation !== previewGeneration) return;
    nextFrames.push(traceFrame(sources[index], index, sources, frameSettings, applyTraceFilter, PREVIEW_WIDTH));
    if ((index + 1) % PREVIEW_CHUNK_SIZE === 0) await yieldToBrowser();
  }
  if (generation !== previewGeneration) return;
  outputFrames = nextFrames;
  await paintFrames(generation);
  if (isDemo) await paintDemoPeek(generation);
}

function buildExportFrameStream(onFrame?: (index: number, total: number) => void): AsyncGenerator<HTMLCanvasElement> {
  const sources = [...sourceFrames];
  const frameSettings = { ...settings };
  return (async function* exportFrames() {
    const { applyTraceFilter } = await loadFrameProcessor();
    for (let index = 0; index < sources.length; index += 1) {
      onFrame?.(index + 1, sources.length);
      yield traceFrame(sources[index], index, sources, frameSettings, applyTraceFilter);
      // Resume only after makePngZip has encoded the yielded canvas. This
      // keeps one full-resolution export canvas alive at a time and gives the
      // browser a task boundary between frames on small CPU budgets.
      await yieldToBrowser();
    }
  })();
}

async function buildExportFrames(): Promise<HTMLCanvasElement[]> {
  const frames: HTMLCanvasElement[] = [];
  for await (const frame of buildExportFrameStream()) frames.push(frame);
  return frames;
}

async function paintFrames(generation: number): Promise<void> {
  const strip = document.querySelector<HTMLDivElement>('#frame-strip');
  const empty = document.querySelector<HTMLElement>('#empty-preview');
  const exports = document.querySelector<HTMLElement>('#export-bar');
  if (!strip || !empty || !exports) return;
  strip.replaceChildren();
  for (let index = 0; index < outputFrames.length; index += 1) {
    if (generation !== previewGeneration) return;
    const canvas = outputFrames[index];
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = String(index + 1).padStart(2, '0');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Tracing frame ${index + 1} of ${outputFrames.length}`);
    figure.append(canvas, caption);
    strip.append(figure);
    if ((index + 1) % PAINT_CHUNK_SIZE === 0) await yieldForPaint();
  }
  if (generation !== previewGeneration) return;
  empty.hidden = true;
  exports.hidden = false;
  const make = document.querySelector<HTMLButtonElement>('#make-frames');
  if (make) make.disabled = false;
  setExportButtonsDisabled(false);
  value<HTMLElement>('export-count').textContent = `${outputFrames.length} frames`;
  setStatus(`${outputFrames.length} frames ready`);
  document.querySelector('#demo-workspace, #demo-work-grid')?.setAttribute('aria-busy', 'false');
}

async function exportPng(): Promise<void> {
  if (!sourceFrames.length) return;
  const exportButton = value<HTMLButtonElement>('export-png');
  const frameCount = sourceFrames.length;
  exportButton.disabled = true;
  setStatus('Packing numbered PNGs…');
  try {
    await yieldAfterInteraction();
    const frames = buildExportFrameStream((index, total) => setStatus(`Packing PNG ${index} of ${total}…`));
    const { makePngZip } = await loadExportProcessor();
    downloadBlob(await makePngZip(frames), 'flipbook-trace-frames.zip');
    setStatus(`${frameCount} PNGs exported`);
  } catch {
    showError('The PNG pack could not be made. Try fewer frames.');
  } finally {
    if (exportButton.isConnected) exportButton.disabled = false;
  }
}

async function exportPdf(): Promise<void> {
  if (!sourceFrames.length) return;
  setStatus('Laying out the PDF trace sheet…');
  try {
    await yieldAfterInteraction();
    const exportFrames = await buildExportFrames();
    const { makePdf } = await loadExportProcessor();
    downloadBlob(await makePdf(exportFrames, hasStudioAccess() ? settings.columns : 4), 'flipbook-trace-sheet.pdf');
    setStatus('PDF trace sheet exported');
  } catch {
    showError('The PDF trace sheet could not be made. Try fewer frames.');
  }
}

function setStatus(message: string): void {
  const status = document.querySelector<HTMLOutputElement>('#work-status');
  if (status) status.value = message;
}

function setExportButtonsDisabled(disabled: boolean): void {
  document.querySelectorAll<HTMLButtonElement>('#export-png, #export-pdf').forEach((button) => {
    button.disabled = disabled;
  });
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

function readLicenseVerdict(token: string): LicenseVerdict | null {
  const cached = localStorage.getItem(LICENSE_CACHE_KEY);
  if (!cached) return null;
  try {
    const record = JSON.parse(cached) as Partial<LicenseVerdict>;
    if (typeof record.valid !== 'boolean' || typeof record.checked !== 'number' || !Number.isFinite(record.checked)) return null;
    if (record.token && record.token !== token) return null;
    return { valid: record.valid, checked: record.checked, reason: record.reason, token: record.token };
  } catch {
    localStorage.removeItem(LICENSE_CACHE_KEY);
    return null;
  }
}

function licenseStatusText(): string {
  if (isPro) return 'Studio is active on this device.';
  if (!licenseVerdict || licenseVerdict.valid) return '';
  if (licenseVerdict.reason === 'revoked') return 'This Studio license was revoked. Free exports still work. Buy Studio again if you need larger exports.';
  if (licenseVerdict.reason === 'expired') return 'This Studio license expired. Free exports still work.';
  if (licenseVerdict.reason === 'wrong_product') return 'This license is for another product. Free exports still work.';
  return 'This license is not active. Check the token or buy Studio.';
}

function applyLicenseVerdict(verdict: LicenseVerdict): void {
  licenseVerdict = verdict;
  isPro = verdict.valid;
  const status = document.querySelector<HTMLElement>('#license-status');
  if (status) {
    status.textContent = licenseStatusText();
    status.classList.toggle('is-inactive', !verdict.valid);
  }
  if (!verdict.valid && !isDemo) {
    const quality = document.querySelector<HTMLSelectElement>('#quality');
    const columns = document.querySelector<HTMLSelectElement>('#columns');
    if (quality || columns) {
      settings = { ...settings, quality: 960, columns: 4 };
      if (quality) quality.value = '960';
      if (columns) columns.value = '4';
      void savePreferences(settings);
    }
  }
}

async function verifyLicense(token: string): Promise<void> {
  const status = document.querySelector<HTMLElement>('#license-status');
  const cached = readLicenseVerdict(token);
  if (cached) {
    const age = Date.now() - cached.checked;
    if (age >= 0 && age < LICENSE_CACHE_MS) {
      applyLicenseVerdict(cached);
      return;
    }
  }
  if (status) status.textContent = 'Checking the license…';
  try {
    const response = await fetch(`${BILLING_BASE}/api/v1/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error(`License check returned ${response.status}.`);
    const verdict = await response.json() as { valid: boolean; reason?: string };
    if (typeof verdict.valid !== 'boolean') throw new Error('License check returned an invalid response.');
    const record: LicenseVerdict = { valid: verdict.valid, checked: Date.now(), reason: verdict.reason, token };
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify(record));
    applyLicenseVerdict(record);
  } catch {
    if (status) status.textContent = licenseStatusText() || 'The license could not be checked. The free exports still work.';
  }
}

function bindLicense(): void {
  document.querySelector<HTMLButtonElement>('#verify-license')?.addEventListener('click', () => {
    const token = value<HTMLInputElement>('license-input').value.trim();
    if (!token) {
      value<HTMLElement>('license-status').textContent = 'Paste a license token first.';
      return;
    }
    const previousToken = localStorage.getItem(LICENSE_KEY);
    localStorage.setItem(LICENSE_KEY, token);
    if (previousToken !== token) {
      localStorage.removeItem(LICENSE_CACHE_KEY);
      licenseVerdict = null;
      isPro = false;
    }
    void verifyLicense(token);
  });
}

function initLicense(): string | null {
  if (routePath() !== '/' || licenseInitialized) return null;
  licenseInitialized = true;
  const params = new URLSearchParams(location.search);
  const returned = params.get('license');
  if (returned) {
    const previousToken = localStorage.getItem(LICENSE_KEY);
    localStorage.setItem(LICENSE_KEY, returned);
    if (previousToken !== returned) localStorage.removeItem(LICENSE_CACHE_KEY);
    params.delete('license');
    history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
  }
  const token = returned || localStorage.getItem(LICENSE_KEY);
  if (!token) return null;
  const cached = readLicenseVerdict(token);
  if (cached) {
    applyLicenseVerdict(cached);
    const age = Date.now() - cached.checked;
    if (age >= 0 && age < LICENSE_CACHE_MS) return null;
  }
  return token;
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

await start();
