const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) throw new Error('App root is missing.');

const app = appRoot;
const BUILD_ID = 'v1.0.16';
const FRAME_WIDTH = 120;
const FRAME_HEIGHT = 75;
let drawingGeneration = 0;
let overviewGeneration = 0;

function header(): string {
  return `<header class="site-header"><a class="wordmark" href="/"><span aria-hidden="true">FT</span> Flipbook Trace</a><nav aria-label="Main navigation"><a href="/?demo=1">Demo</a><a href="/#how">How it works</a><a href="/privacy">Privacy</a></nav></header>`;
}

function footer(): string {
  return `<footer class="site-footer"><p>Turn your video into printable tracing frames.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://sociobot.in" target="_blank" rel="noreferrer">Built by Param Factory <span class="sr-only">(opens in a new tab)</span></a></div><p>${BUILD_ID} · Original generated artwork</p></footer>`;
}

function drawSampleTrace(canvas: HTMLCanvasElement, index: number): void {
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) return;
  const phase = index / 11;
  const x = 22 + phase * 74;
  const y = 38 + Math.sin(phase * Math.PI * 2) * 8;
  context.fillStyle = '#fffaf0';
  context.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
  context.strokeStyle = '#d4c6ab';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(14, 0);
  context.lineTo(22, FRAME_HEIGHT);
  context.moveTo(68, 0);
  context.lineTo(76, FRAME_HEIGHT);
  context.stroke();
  context.strokeStyle = '#181713';
  context.lineWidth = 2;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.ellipse(x, y, 11, 8, 0, 0, Math.PI * 2);
  context.moveTo(x - 2, y);
  context.quadraticCurveTo(x - 17, y - 14 - Math.sin(phase * Math.PI * 2) * 6, x - 21, y - 2);
  context.quadraticCurveTo(x - 10, y + 7, x - 2, y + 5);
  context.moveTo(x + 10, y - 2);
  context.lineTo(x + 18, y + 1);
  context.lineTo(x + 10, y + 4);
  context.moveTo(9, 61);
  context.quadraticCurveTo(58, 56, 111, 61);
  context.stroke();
}

function yieldTask(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

/**
 * Paint the useful sample in small browser tasks. On a throttled phone the
 * twelve visual frames otherwise make the first interaction task noisy enough
 * to hide the ready sample behind a long task. The editor replaces this light
 * shell with its real canvas frames after it has hydrated.
 */
async function drawFrames(): Promise<void> {
  const run = ++drawingGeneration;
  const strip = document.querySelector<HTMLDivElement>('#frame-strip');
  if (!strip) return;
  strip.replaceChildren();
  // Keep initial route markup/JS parsing out of the same task as the first
  // frame-card allocation. This is the cold-start spike on throttled phones.
  await yieldTask();
  for (let index = 0; index < 12; index += 1) {
    if (run !== drawingGeneration) return;
    const figure = document.createElement('figure');
    figure.className = 'sample-shell-frame';
    const trace = document.createElement('span');
    trace.className = 'sample-trace';
    trace.setAttribute('role', 'img');
    trace.setAttribute('aria-label', `Tracing frame ${index + 1} of 12`);
    const caption = document.createElement('figcaption');
    caption.textContent = String(index + 1).padStart(2, '0');
    figure.append(trace, caption);
    strip.append(figure);
    // One card is comfortably below the mobile task budget. Yield before the
    // next card so allocation and layout cannot coalesce.
    if (index < 11) await yieldTask();
  }
  if (run !== drawingGeneration) return;
  const status = document.querySelector<HTMLOutputElement>('#work-status');
  if (status) status.value = '12 frames ready';
}

async function drawOverview(): Promise<void> {
  const run = ++overviewGeneration;
  const overview = document.querySelector<HTMLDivElement>('#demo-strip');
  if (!overview) return;
  overview.replaceChildren();
  for (let index = 0; index < 12; index += 1) {
    if (run !== overviewGeneration) return;
    const preview = document.createElement('canvas');
    drawSampleTrace(preview, index);
    preview.setAttribute('role', 'img');
    preview.setAttribute('aria-label', `Sample tracing frame ${index + 1} of 12`);
    overview.append(preview);
    if (index < 11) await yieldTask();
  }
}

function queueOverview(): void {
  window.setTimeout(() => { void drawOverview(); }, 200);
}

async function boot(): Promise<void> {
  // Let the browser lay out the first-read shell before adding the frame grid.
  // At 4x CPU throttling, creating both regions in the route-entry task made
  // style/layout and the first canvas draw occasionally merge past 200 ms.
  app.innerHTML = `${header()}<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><div><button id="reset-demo" type="button">Reset demo</button><a href="/">Start for real</a></div></aside><main id="main" class="demo-main"><section id="demo-intro" class="demo-intro"><p class="eyebrow">Paper-bird sample</p><h1 tabindex="-1">Trace a paper bird in twelve frames</h1><p>The sample is built into the app and works without a network.</p><div class="demo-peek" aria-label="Twelve sample tracing frames"><div id="demo-strip" class="demo-strip"></div><p>12 ready frames · frame controls are loading</p></div></section><div id="demo-workspace"></div></main><div id="route-status" class="sr-only" aria-live="polite"></div>${footer()}`;
  document.title = 'Demo — Flipbook Trace';
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', 'Try twelve ready paper-bird tracing frames.');
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', 'https://flipbook-trace.sociobot.in/demo');
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', 'Demo — Flipbook Trace');
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', 'Demo — Flipbook Trace');
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', 'https://flipbook-trace.sociobot.in/demo');
  await yieldTask();
  const workspace = document.querySelector<HTMLDivElement>('#demo-workspace');
  if (!workspace) return;
  workspace.innerHTML = `<section class="workspace" aria-labelledby="workspace-heading"><div class="section-kicker">01 / Prepare</div><div class="workspace-heading-row"><div><h2 id="workspace-heading">Make the tracing frames</h2><p>The paper-bird sample is ready. Frame controls will appear below.</p></div><output id="work-status" class="status-stamp" aria-live="polite">Preparing sample frames…</output></div><div class="preview-zone"><div id="frame-strip" class="frame-strip" aria-label="Tracing frame preview"></div></div></section>`;
  const readyFrames = drawFrames();
  void readyFrames.then(queueOverview);
  document.querySelector<HTMLButtonElement>('#reset-demo')?.addEventListener('click', () => { void drawFrames().then(queueOverview); });
  await readyFrames;
}

const sampleReady = boot();

// The useful sample is ready immediately. Hydrate the controls in a later
// turn so slow devices paint and expose the sample before parsing the editor,
// ZIP, and PDF paths. The runtime repeats the sample setup with interactive
// controls; it never persists demo state.
void sampleReady.then(() => {
  window.setTimeout(() => {
    void import('./demo-runtime').then(({ mountDemoRuntime }) => mountDemoRuntime());
  }, 750);
});
