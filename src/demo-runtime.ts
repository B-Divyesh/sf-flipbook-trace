type FilterMode = 'edges' | 'threshold' | 'gray';

type FrameSettings = {
  columns: number;
  fps: number;
  mode: FilterMode;
  onion: boolean;
  quality: number;
  threshold: number;
};

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) throw new Error('App root is missing.');
const app: HTMLDivElement = appRoot;

const BUILD_ID = 'v1.0.18';
const SOURCE_WIDTH = 120;
const SOURCE_HEIGHT = 75;
const OVERVIEW_WIDTH = 64;
const OVERVIEW_HEIGHT = 40;
const defaultSettings: FrameSettings = { fps: 6, threshold: 142, mode: 'edges', onion: false, quality: 960, columns: 4 };

let settings = { ...defaultSettings };
let sourceFrames: HTMLCanvasElement[] = [];
let outputFrames: HTMLCanvasElement[] = [];
let generation = 0;
let frameProcessor: Promise<typeof import('./frame-processor')> | undefined;
let exportProcessor: Promise<typeof import('./core')> | undefined;
let previewTimer: number | undefined;

function loadFrameProcessor(): Promise<typeof import('./frame-processor')> {
  frameProcessor ??= import('./frame-processor');
  return frameProcessor;
}

function loadExportProcessor(): Promise<typeof import('./core')> {
  exportProcessor ??= import('./core');
  return exportProcessor;
}

function yieldTask(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

function yieldPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function header(): string {
  return `<header class="site-header"><a class="wordmark" href="/"><span aria-hidden="true">FT</span> Flipbook Trace</a><nav aria-label="Main navigation"><a href="/?demo=1">Demo</a><a href="/#how">How it works</a><a href="/privacy">Privacy</a></nav></header>`;
}

function footer(): string {
  return `<footer class="site-footer"><p>Turn your video into printable tracing frames.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://sociobot.in" target="_blank" rel="noreferrer">Built by Param Factory <span class="sr-only">(opens in a new tab)</span></a></div><p>${BUILD_ID} · Original generated artwork</p></footer>`;
}

function controlsTemplate(): string {
  return `<form id="controls" class="controls" aria-label="Frame controls">
    <div class="time-pair"><div class="field"><label for="trim-start">Start time</label><div class="unit-field"><input id="trim-start" type="number" value="0" min="0" max="4" step="0.1" /><span>s</span></div></div><div class="field"><label for="trim-end">End time</label><div class="unit-field"><input id="trim-end" type="number" value="2" min="1" max="5" step="0.1" /><span>s</span></div></div></div>
    <div class="field"><label for="fps">Frames each second</label><select id="fps"><option value="2">2 — loose study</option><option value="4">4</option><option value="6" selected>6 — balanced</option><option value="8">8</option><option value="12">12 — detailed</option></select></div>
    <fieldset><legend>Trace style</legend><label class="radio"><input type="radio" name="mode" value="edges" checked /> Pencil edges</label><label class="radio"><input type="radio" name="mode" value="threshold" /> High contrast</label><label class="radio"><input type="radio" name="mode" value="gray" /> Grayscale</label></fieldset>
    <div class="field"><div class="label-row"><label for="threshold">Line detail</label><output id="threshold-value">142</output></div><input id="threshold" type="range" min="70" max="220" value="142" /><span class="field-note">Move right to keep more dark areas.</span></div>
    <label class="check"><input id="onion" type="checkbox" /> Show the previous frame in red</label>
    <div class="field"><label for="quality">Export width</label><select id="quality"><option value="960">960 px — free</option><option value="1920">1920 px — Studio</option><option value="0">Original video width — Studio</option></select><span id="quality-note" class="field-note">Studio controls need a license.</span></div>
    <div class="field"><label for="columns">PDF trace sheet columns</label><select id="columns"><option value="4">4 columns — free</option><option value="6">6 columns — Studio</option></select></div>
    <button class="button button-dark" id="make-frames" type="button" disabled>Make tracing frames</button>
    <details class="settings-tools"><summary>Import or export settings</summary><button id="export-settings" type="button" aria-label="Export settings">Export settings</button><label for="import-settings">Import settings</label><input id="import-settings" type="file" accept="application/json" /></details>
    <p id="form-error" class="error" role="alert" hidden></p>
  </form>`;
}

function previewTemplate(): string {
  return `<div class="preview-zone"><div id="frame-strip" class="frame-strip" aria-label="Tracing frame preview"></div><div id="export-bar" class="export-bar"><div><strong id="export-count">12 frames</strong><span>Numbered and ready to trace</span></div><button class="button button-blue" id="export-png" type="button" disabled>Export numbered PNG pack</button><button class="button button-paper" id="export-pdf" type="button" disabled>Export PDF trace sheet</button></div></div>`;
}

function workspaceHeading(): string {
  return `<div class="section-kicker">1 / Choose a video</div><div class="workspace-heading-row"><div><h2 id="workspace-heading">Make the tracing frames</h2><p>The paper-bird sample is ready. Set a 1–5 second section, choose how many frames to make each second, then make frames.</p></div><output id="work-status" class="status-stamp" aria-live="polite">Preparing sample frames…</output></div>`;
}

function initialPage(): string {
  return `${header()}<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><div><button id="reset-demo" type="button">Reset demo</button><a href="/">Start for real</a></div></aside><main id="main" class="demo-main"><section id="demo-intro" class="demo-intro"><p class="eyebrow">Paper-bird sample</p><h1 tabindex="-1">Trace a paper bird in twelve frames</h1><p>The sample is built into the app and works without a network.</p><div class="demo-peek" aria-label="Twelve sample tracing frames"><div id="demo-strip" class="demo-strip"></div><p>12 ready frames · set the section and frames each second below</p></div></section><div id="demo-workspace" aria-busy="true"></div></main><div id="route-status" class="sr-only" aria-live="polite"></div>${footer()}`;
}

function element<T extends HTMLElement>(id: string): T {
  const found = document.querySelector<T>(`#${id}`);
  if (!found) throw new Error(`${id} is missing.`);
  return found;
}

function setStatus(message: string): void {
  const status = document.querySelector<HTMLOutputElement>('#work-status');
  if (status) status.value = message;
}

function setExportsDisabled(disabled: boolean): void {
  document.querySelectorAll<HTMLButtonElement>('#export-png, #export-pdf').forEach((button) => { button.disabled = disabled; });
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

function syncSettingsFromControls(): void {
  settings.fps = Number(element<HTMLSelectElement>('fps').value);
  settings.threshold = Number(element<HTMLInputElement>('threshold').value);
  settings.mode = document.querySelector<HTMLInputElement>('input[name="mode"]:checked')?.value as FilterMode || 'edges';
  settings.onion = element<HTMLInputElement>('onion').checked;
  settings.quality = 960;
  settings.columns = 4;
}

function writeSettingsToControls(): void {
  element<HTMLSelectElement>('fps').value = String(settings.fps);
  element<HTMLInputElement>('threshold').value = String(settings.threshold);
  element<HTMLOutputElement>('threshold-value').value = String(settings.threshold);
  element<HTMLInputElement>('onion').checked = settings.onion;
  element<HTMLSelectElement>('quality').value = '960';
  element<HTMLSelectElement>('columns').value = '4';
  const mode = document.querySelector<HTMLInputElement>(`input[name="mode"][value="${settings.mode}"]`);
  if (mode) mode.checked = true;
}

function download(blob: Blob, name: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function ensureSourceFrames(run: number, count = outputFrames.length): Promise<boolean> {
  if (sourceFrames.length === count && count > 0) return true;
  const { drawDemoFrame } = await loadFrameProcessor();
  const next: HTMLCanvasElement[] = [];
  await yieldTask();
  for (let index = 0; index < count; index += 1) {
    if (run !== generation) return false;
    const canvas = document.createElement('canvas');
    canvas.width = SOURCE_WIDTH;
    canvas.height = SOURCE_HEIGHT;
    drawDemoFrame(canvas, index, count);
    next.push(canvas);
    await yieldTask();
  }
  if (run !== generation) return false;
  sourceFrames = next;
  return true;
}

function traceFrame(source: HTMLCanvasElement, index: number, sources: HTMLCanvasElement[], applyFilter: (canvas: HTMLCanvasElement, mode: FilterMode, threshold: number) => void): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext('2d');
  context?.drawImage(source, 0, 0);
  applyFilter(canvas, settings.mode, settings.threshold);
  if (settings.onion && index > 0 && context) {
    context.save();
    context.globalAlpha = 0.16;
    context.globalCompositeOperation = 'multiply';
    context.drawImage(sources[index - 1], 0, 0);
    context.restore();
  }
  return canvas;
}

async function paintOverview(run: number): Promise<void> {
  const strip = document.querySelector<HTMLDivElement>('#demo-strip');
  if (!strip) return;
  strip.replaceChildren();
  for (let index = 0; index < Math.min(12, outputFrames.length); index += 1) {
    if (run !== generation) return;
    const canvas = document.createElement('canvas');
    canvas.width = OVERVIEW_WIDTH;
    canvas.height = OVERVIEW_HEIGHT;
    canvas.getContext('2d')?.drawImage(outputFrames[index], 0, 0, canvas.width, canvas.height);
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Sample tracing frame ${index + 1} of ${Math.min(12, outputFrames.length)}`);
    strip.append(canvas);
    await yieldPaint();
  }
}

async function paintFrames(run: number): Promise<void> {
  const strip = document.querySelector<HTMLDivElement>('#frame-strip');
  if (!strip) return;
  strip.replaceChildren();
  for (let index = 0; index < outputFrames.length; index += 1) {
    if (run !== generation) return;
    const canvas = outputFrames[index];
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Tracing frame ${index + 1} of ${outputFrames.length}`);
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = String(index + 1).padStart(2, '0');
    figure.append(canvas, caption);
    strip.append(figure);
    await yieldPaint();
  }
  if (run !== generation) return;
  element<HTMLElement>('export-count').textContent = `${outputFrames.length} frames`;
  const makeFramesButton = document.querySelector<HTMLButtonElement>('#make-frames');
  if (makeFramesButton) makeFramesButton.disabled = false;
  if (makeFramesButton) setExportsDisabled(false);
  setStatus(`${outputFrames.length} frames ready`);
  document.querySelector('#demo-workspace')?.setAttribute('aria-busy', 'false');
}

async function loadDemoFrames(count = 12): Promise<void> {
  const run = ++generation;
  sourceFrames = [];
  outputFrames = [];
  const makeFramesButton = document.querySelector<HTMLButtonElement>('#make-frames');
  if (makeFramesButton) makeFramesButton.disabled = true;
  setExportsDisabled(true);
  setStatus('Preparing sample frames…');
  const { drawDemoTraceFrame } = await loadFrameProcessor();
  await yieldTask();
  for (let index = 0; index < count; index += 1) {
    if (run !== generation) return;
    const canvas = document.createElement('canvas');
    canvas.width = SOURCE_WIDTH;
    canvas.height = SOURCE_HEIGHT;
    drawDemoTraceFrame(canvas, index, count);
    outputFrames.push(canvas);
    await yieldTask();
  }
  if (run !== generation) return;
  await paintOverview(run);
  await paintFrames(run);
  if (settings.mode !== 'edges' || settings.threshold !== defaultSettings.threshold || settings.onion) schedulePreview();
}

function schedulePreview(delay = 0): void {
  if (!outputFrames.length) return;
  generation += 1;
  const run = generation;
  if (previewTimer !== undefined) window.clearTimeout(previewTimer);
  setExportsDisabled(true);
  setStatus('Updating preview…');
  previewTimer = window.setTimeout(() => { previewTimer = undefined; void rebuildPreview(run); }, delay);
}

async function rebuildPreview(run: number): Promise<void> {
  if (!await ensureSourceFrames(run)) return;
  const sources = [...sourceFrames];
  const { applyTraceFilter } = await loadFrameProcessor();
  const next: HTMLCanvasElement[] = [];
  await yieldTask();
  for (let index = 0; index < sources.length; index += 1) {
    if (run !== generation) return;
    next.push(traceFrame(sources[index], index, sources, applyTraceFilter));
    await yieldTask();
  }
  if (run !== generation) return;
  outputFrames = next;
  await paintOverview(run);
  await paintFrames(run);
}

async function makeFrames(): Promise<void> {
  clearError();
  syncSettingsFromControls();
  const start = Number(element<HTMLInputElement>('trim-start').value);
  const end = Number(element<HTMLInputElement>('trim-end').value);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > 5 || end - start < 1 || end - start > 5) {
    showError('The selected section must be 1–5 seconds inside the paper-bird sample. Change the start or end time.');
    return;
  }
  await yieldTask();
  await loadDemoFrames(Math.max(2, Math.floor((end - start) * settings.fps)));
}

async function exportPng(): Promise<void> {
  if (!outputFrames.length) return;
  const count = outputFrames.length;
  const button = element<HTMLButtonElement>('export-png');
  button.disabled = true;
  setStatus('Packing the numbered PNG pack…');
  try {
    const run = generation;
    if (!await ensureSourceFrames(run)) return;
    const sources = [...sourceFrames];
    const { applyTraceFilter } = await loadFrameProcessor();
    const { makePngZip } = await loadExportProcessor();
    const stream = (async function* frames(): AsyncGenerator<HTMLCanvasElement> {
      for (let index = 0; index < sources.length; index += 1) {
        setStatus(`Packing PNG ${index + 1} of ${sources.length}…`);
        yield traceFrame(sources[index], index, sources, applyTraceFilter);
        await yieldTask();
      }
    })();
    download(await makePngZip(stream), 'flipbook-trace-frames.zip');
    setStatus(`Numbered PNG pack exported (${count} files)`);
  } catch {
    showError('The numbered PNG pack could not be made. Try fewer frames.');
  } finally {
    if (button.isConnected) button.disabled = false;
  }
}

async function exportPdf(): Promise<void> {
  if (!outputFrames.length) return;
  setStatus('Laying out the PDF trace sheet…');
  try {
    const run = generation;
    if (!await ensureSourceFrames(run)) return;
    const sources = [...sourceFrames];
    const { applyTraceFilter } = await loadFrameProcessor();
    const frames: HTMLCanvasElement[] = [];
    for (let index = 0; index < sources.length; index += 1) {
      frames.push(traceFrame(sources[index], index, sources, applyTraceFilter));
      await yieldTask();
    }
    const { makePdf } = await loadExportProcessor();
    download(await makePdf(frames, 4), 'flipbook-trace-sheet.pdf');
    setStatus('PDF trace sheet exported');
  } catch {
    showError('The PDF trace sheet could not be made. Try fewer frames.');
  }
}

async function importSettings(file?: File): Promise<void> {
  if (!file) return;
  try {
    const incoming = JSON.parse(await file.text()) as Partial<FrameSettings>;
    if (![2, 4, 6, 8, 12].includes(incoming.fps ?? 0) || !['edges', 'threshold', 'gray'].includes(incoming.mode ?? '') || typeof incoming.threshold !== 'number' || incoming.threshold < 70 || incoming.threshold > 220 || typeof incoming.onion !== 'boolean') throw new Error('Invalid settings');
    settings = { ...defaultSettings, ...incoming, quality: 960, columns: 4 };
    writeSettingsToControls();
    schedulePreview();
    clearError();
  } catch {
    showError('Those settings could not be imported. Choose a Flipbook Trace settings file.');
  }
}

function bindControls(): void {
  writeSettingsToControls();
  element<HTMLInputElement>('threshold').addEventListener('input', (event) => {
    element<HTMLOutputElement>('threshold-value').value = (event.currentTarget as HTMLInputElement).value;
    syncSettingsFromControls();
    schedulePreview(120);
  });
  document.querySelectorAll<HTMLInputElement>('input[name="mode"], #onion').forEach((input) => input.addEventListener('change', () => {
    syncSettingsFromControls();
    schedulePreview();
  }));
  element<HTMLSelectElement>('fps').addEventListener('change', syncSettingsFromControls);
  element<HTMLSelectElement>('quality').addEventListener('change', (event) => {
    (event.currentTarget as HTMLSelectElement).value = '960';
    showError('That export width needs Studio. Buy or restore a license below.');
  });
  element<HTMLSelectElement>('columns').addEventListener('change', (event) => {
    (event.currentTarget as HTMLSelectElement).value = '4';
    showError('The six-column sheet needs Studio. Buy or restore a license below.');
  });
  element<HTMLButtonElement>('make-frames').addEventListener('click', () => void makeFrames());
  element<HTMLButtonElement>('export-png').addEventListener('click', () => void exportPng());
  element<HTMLButtonElement>('export-pdf').addEventListener('click', () => void exportPdf());
  element<HTMLButtonElement>('export-settings').addEventListener('click', () => download(new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' }), 'flipbook-trace-settings.json'));
  element<HTMLInputElement>('import-settings').addEventListener('change', (event) => void importSettings((event.currentTarget as HTMLInputElement).files?.[0]));
  element<HTMLButtonElement>('reset-demo').addEventListener('click', async () => {
    settings = { ...defaultSettings };
    writeSettingsToControls();
    clearError();
    setStatus('Resetting the sample…');
    await yieldTask();
    await loadDemoFrames();
  });
}

function updateMeta(): void {
  document.title = 'Demo — Flipbook Trace';
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', 'Try twelve ready paper-bird tracing frames.');
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', 'https://flipbook-trace.sociobot.in/demo');
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', 'Demo — Flipbook Trace');
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', 'Demo — Flipbook Trace');
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', 'https://flipbook-trace.sociobot.in/demo');
}

async function mount(): Promise<void> {
  app.innerHTML = initialPage();
  updateMeta();
  await yieldPaint();
  const workspace = element<HTMLDivElement>('demo-workspace');
  workspace.innerHTML = `<section class="workspace" id="workspace" aria-labelledby="workspace-heading">${workspaceHeading()}<div id="demo-work-grid" class="work-grid" aria-busy="true"></div></section>`;
  await yieldPaint();
  const grid = element<HTMLDivElement>('demo-work-grid');
  grid.insertAdjacentHTML('beforeend', previewTemplate());
  await loadDemoFrames();
  grid.insertAdjacentHTML('afterbegin', controlsTemplate());
  bindControls();
  element<HTMLButtonElement>('make-frames').disabled = false;
  setExportsDisabled(false);
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
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

window.addEventListener('online', () => setStatus('Back online. Your local work is unchanged.'));
window.addEventListener('offline', () => setStatus('Offline. Local video and exports still work.'));

/**
 * Mount the full editor after the light sample shell has become interactive.
 * The boot module deliberately owns that shell so markup, canvas setup, and
 * editor code cannot merge into one long task on a throttled phone.
 */
export function mountDemoRuntime(): void {
  void mount();
  void registerServiceWorker();
}
