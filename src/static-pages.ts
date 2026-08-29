export type PageMeta = [title: string, description: string];

export function pageMeta(path: string): PageMeta {
  const details: Record<string, PageMeta> = {
    '/': ['Flipbook Trace — Turn video into tracing frames', 'Choose a local video, pick frames, and export numbered PNGs or a printable PDF trace sheet.'],
    '/privacy': ['Privacy — Flipbook Trace', 'How Flipbook Trace handles local video, settings, and licenses.'],
    '/terms': ['Terms — Flipbook Trace', 'Terms for using Flipbook Trace and buying Studio.'],
  };
  return details[path] || ['Page not found — Flipbook Trace', 'This page does not exist. Open Flipbook Trace.'];
}

export function homeContent(workspace: string, paid: string): string {
  return `
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
            <source srcset="/assets/hero-worktable-640.webp 640w, /assets/hero-worktable.webp 1200w" sizes="(max-width: 800px) calc(100vw - 60px), 54vw" type="image/webp" />
            <img src="/assets/hero-worktable.webp" width="1200" height="800" alt="Hands arrange six bird drawings into a hand-drawn flipbook." fetchpriority="high" decoding="async" />
          </picture>
          <figcaption>Six moments become six frames to trace.</figcaption>
        </figure>
      </section>
      ${workspace}
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
      ${paid}
    </main>`;
}

export function paidContent(billingBase: string, product: string, licenseStatus: string, inactive: boolean): string {
  return `<section class="paid" aria-labelledby="paid-heading">
    <div class="paid-mark" aria-hidden="true">STUDIO<br />PASS</div>
    <div><div class="section-kicker">04 / Optional</div><h2 id="paid-heading">Print larger with Studio</h2><p><strong>$9 once.</strong> Keep the free PNG and PDF trace sheet exports. Studio adds 1920 px, exports at your video's original width, and a six-column PDF trace sheet.</p><p class="legal-note">Dodo opens checkout for Sociobot.</p></div>
    <div class="license-actions">
      <a class="button button-red" href="${billingBase}/api/v1/products/${product}/checkout">Buy Studio for $9</a>
      <p id="license-status" class="license-status${inactive ? ' is-inactive' : ''}" aria-live="polite">${licenseStatus}</p>
      <details><summary>Have a license?</summary><label for="license-input">Paste your license</label><input id="license-input" type="text" autocomplete="off" /><button id="verify-license" class="button button-paper" type="button" aria-label="Verify license">Verify license</button></details>
      <p><a href="/privacy" data-route>Privacy</a> · <a href="/terms" data-route>Terms</a></p>
    </div>
  </section>`;
}

export function privacyContent(): string {
  return `<main id="main" class="prose-page"><p class="eyebrow">Plain-language policy</p><h1 tabindex="-1">Privacy without an upload</h1><p class="lede">Your video stays in your browser while you work.</p><h2>What stays on your device</h2><p>Video decoding, frame selection, filtering, and exports run in your browser. The video and generated frames disappear on reload. Your control settings use browser storage.</p><h2>When the network is used</h2><p>The installed app checks this site for updates. If you verify Studio, your browser sends the license token to Sociobot for that check.</p><h2>Delete local data</h2><p>Clear this site's browser data to remove settings and a saved license. Demo mode does not read or change real settings or licenses.</p><h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with privacy questions.</p></main>`;
}

export function termsContent(): string {
  return `<main id="main" class="prose-page"><p class="eyebrow">Use terms</p><h1 tabindex="-1">Terms for making trace sheets</h1><p class="lede">Use Flipbook Trace with a video you own or can lawfully use.</p><h2>Your responsibility</h2><p>You are responsible for the videos you open and the files you create. Do not use the app to copy a video without permission.</p><h2>The service</h2><p>The app is provided as-is. Video support varies by browser. We may change the app to fix problems or improve compatibility.</p><h2>Studio purchase</h2><p>Studio costs $9 as a one-time purchase. Studio enables the larger export choices. Dodo opens checkout for Sociobot.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for purchase help.</p></main>`;
}

export function notFoundContent(): string {
  return `<main id="main" class="not-found"><div class="lost-frame" aria-hidden="true">?</div><h1 tabindex="-1">Page not found</h1><p>The address does not match a page in Flipbook Trace.</p><a class="button button-blue" href="/" data-route>Open Flipbook Trace</a></main>`;
}
