# Independent product verification

**Verdict: FAIL — do not release candidate `626d92760bb77e8037fb596f324bbe0f371fa2cf`.**

Verified on 2026-08-28 against:

- Repository commit: `626d92760bb77e8037fb596f324bbe0f371fa2cf`
- Live URL: `https://flipbook-trace.sociobot.in`
- Work order: `flipbook-trace-verify-1`

The deployed HTML, JavaScript, CSS, service worker, manifest, robots file, and sitemap are byte-for-byte matches for this candidate. This is not a stale-deployment result.

## Release-blocking findings

### High — the paid checkout is not registered

The visible **Buy Studio for $9** link points to the required Sociobot endpoint, but a fresh request returned:

```text
GET https://api.sociobot.in/api/v1/products/flipbook-trace/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

The advertised one-time purchase cannot be completed. The builder handoff already called out registration as a gap; fresh production evidence confirms it remains unresolved.

### High — an advertised repository test command fails

After `npm ci`, `npm run test:unit` exits 1. Vitest collects both Playwright suites and fails before running a test:

```text
FAIL tests/claims.spec.ts
FAIL tests/site.spec.ts
Error: Playwright Test did not expect test() to be called here.
Test Files 2 failed (2); Tests no tests
```

The package exposes this script, so the requirement to run all available unit/integration checks is not met. `npm test` itself passes.

### High — demo mode reads real saved license data

The demo contract says it does not read the Studio license keys. In a fresh live browser context, I preloaded a valid cached real-user license and opened `/demo`. Selecting the paid `1920 px` export width remained accepted and no error appeared. In a control context without that real license, the same selection resets to `960` and shows the Studio error.

Cause: `initLicense()` reads `sb_license:flipbook-trace` and its verdict before the app determines that the current route is `/demo`. This violates the required isolated demo sandbox and the explicit statement in `.factory/demo.md`.

### High — the claim registry is incomplete or does not prove its full promise

All seven registered claim commands pass, but visitor-facing promises remain outside the registry or are not tested to their stated scope. Examples:

- The demo banner says “nothing is saved”; no claim test checks browser storage isolation. The observed license-state leak disproves the broader promise.
- The privacy page and README say the clip is not retained and frames disappear after closing/reloading; no registered test checks storage or retention.
- README claims settings export/import, installability, three trace styles, onion skin, and MP4 support; none has a claim entry.
- The `studio-quality` claim includes “$9 once,” but its test injects a fake cached verdict and never verifies the checkout. Production checkout returns 404.

Under the supplied claims contract, unlisted or inadequately proven visitor claims block acceptance.

### Medium — several mobile touch targets are below 44×44 CSS px

At a 390×844 viewport, measured interactive targets included:

- Demo banner **Reset demo**: 108×36 px
- Demo banner **Start for real**: 134×36 px
- Mobile wordmark/home link: 40×40 px
- Header **Demo** link: 34×44 px
- Footer links: 22 px high

The page has no horizontal overflow and axe reports no serious/critical findings, but these targets miss the non-negotiable 44×44 baseline.

### Medium — the three required product facts fall below the desktop first screen

The headline, audience sentence, primary action, and explanation are visible and pass the explicit cold-read gate. However, the plain-words contract also requires the privacy/offline/price facts on the first screen. `.fact-list` begins at y=914.6 in a 1440×900 viewport and y=952.0 in a 1366×768 viewport, so none of those three facts is initially visible on desktop. All three fit in the 390×844 mobile viewport.

### Low — deployed static assets are not long-lived immutable resources

HTML, JS, CSS, images, the manifest, and the service worker all return `Cache-Control: public, must-revalidate, max-age=30`. The JS and CSS filenames are stable rather than content-hashed. The service worker makes repeat/offline use work, but the deployment does not use the requested long-lived immutable policy for versioned assets.

## Mandatory opening and demo checks

The first-read gate passes on desktop and 390 px mobile.

- What it does: **Turn your video into tracing frames**.
- Who it is for: **For short-form creators who want a hand-drawn study without uploading their clip.**
- First action: **Try it with sample data**, with “It opens a ready 12-frame motion study” beside it.
- One click opens `/demo`, shows the persistent demo banner, renders 12 frames, and reports `12 frames ready`.
- **Reset demo** restores threshold `142` and all 12 frames. **Start for real** removes the banner and opens the empty real workspace.

The headline, audience sentence, action, and click outcome are inside both tested initial viewports. The three-fact list is inside the 390×844 mobile viewport but below the fold on desktop, as recorded above.

## Claim tests

I first attempted the claim command before dependencies existed; it could not load `@playwright/test`. After the clean lockfile install (`npm ci`), every exact command in `.factory/claims.json` was run independently through the production demo entry point:

| Claim | Exact command | Result |
| --- | --- | --- |
| `clip-workflow` | `npm test -- --grep @claim:clip-workflow` | PASS, 1 test |
| `demo-ready` | `npm test -- --grep @claim:demo-ready` | PASS, 1 test |
| `png-export` | `npm test -- --grep @claim:png-export` | PASS, 1 test |
| `pdf-export` | `npm test -- --grep @claim:pdf-export` | PASS, 1 test |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS, 1 test |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 1 test |
| `studio-quality` | `npm test -- --grep @claim:studio-quality` | PASS, 1 test |

## Clean install, tests, and build

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 60 packages audited, 0 vulnerabilities |
| `npm test` | PASS; 14/14 Chromium tests |
| `npm run test:unit` | **FAIL**; Vitest collects Playwright specs |
| `npm run build` | PASS; includes `tsc --noEmit`, writes `dist/` |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| Lint | No lint script/configuration is available |

Production output:

```text
dist/index.html          1.66 kB (0.57 kB gzip)
dist/assets/index.css   14.24 kB (4.07 kB gzip)
dist/assets/app.js      28.98 kB (10.62 kB gzip)
```

## End-to-end product exercise

Tested in fresh live Chromium contexts:

- A generated 5.25-second WebM loaded and produced 18 default frames.
- Exact 1-second/2-fps boundary produced 2 frames.
- Exact 5-second/12-fps boundary produced 60 frames.
- The 60-frame ZIP was 140,591 bytes and contained unique names `flipbook-frame-001.png` through `flipbook-frame-060.png`.
- The 60-frame PDF was 257,270 bytes, began `%PDF-1.4`, and contained 3 page objects with `/Count 3`.
- A 0.9-second section produced the stated 1–5 second error, retained the prior preview, and recovered after changing the end to 1 second.
- A text file produced the playable-video error.
- Selecting paid width without a license reset to 960 px and explained how to proceed.
- Invalid settings JSON produced a specific error. A valid settings file then restored fps, style, threshold, and onion-skin values and cleared the error.
- Empty license verification prompted the user to paste a token first.
- No console or page errors occurred during these flows.

## Privacy, storage, and network

- Cold load and the full demo export flow made same-origin requests only.
- No analytics, third-party fonts, or third-party runtime scripts were found.
- Real settings persisted in IndexedDB across reload. Demo setting changes did not alter that record, and returning to the real workspace restored it.
- A loaded video produced frames in memory; after reload, the file input and frame list were empty. IndexedDB contained settings only.
- The only intended product API origin is `https://api.sociobot.in`; its verify endpoint returns `Access-Control-Allow-Origin: https://flipbook-trace.sociobot.in` and `Cache-Control: no-store`.
- Billing rate limit: requests 1–30 returned 200 invalid-license verdicts; request 31 returned 429 with `Retry-After: 3`.
- Sign-in/Entra validation is not applicable; this product has no sign-in.

## Accessibility and responsive behavior

- Live axe scans on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page`: zero serious or critical findings.
- `/opt/fleet/lib/verify-url.sh`: PASS; HTTP 200, title present, `lang=en`, one H1, main landmark, all images have alt text, no unlabeled buttons, no console errors.
- Keyboard-only traversal reaches the skip link, navigation, demo reset/exit, all controls, and both exports. Arrow keys change the range input; Enter downloaded the PNG pack.
- Focus uses a visible 3 px red outline with 4 px offset.
- Reduced-motion mode collapses motion/transition durations to 0.01 ms; no meaningful animation remains.
- 390 px layout has no horizontal overflow. A 200% root text-size smoke test also had no horizontal overflow or clipped tested headings.
- Single light theme is intentional and documented. Axe found no serious/critical contrast issue.
- The sub-44 px touch targets listed above remain a failure.

## PWA, offline, and update behavior

- Chromium manifest inspection found no manifest or installability errors. Icons are valid 192×192, 512×512, 512×512 maskable, and 180×180 Apple touch files.
- Live service worker registered and controlled the app. Shell cache `flipbook-trace-v1.0.1-shell` contained `/`, `/demo`, `/privacy`, `/terms`, JS, and CSS.
- With the browser taken offline, `/demo` reloaded with its banner, 12 frames, and no errors.
- A controlled local response test served an otherwise identical `v1.0.2` worker. `updatefound` fired, the new worker activated, the old cache was replaced, and the UI reported **An update is ready. Reload to use it.**

## Deployment identity, headers, links, and performance

SHA-256 comparisons were exact matches between local `dist/` and live for `index.html`, `assets/app.js`, `assets/index.css`, `sw.js`, `manifest.webmanifest`, `robots.txt`, and `sitemap.xml`.

Live responses include HSTS, CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive Permissions Policy. No CSP or mixed-content console errors were observed.

All first-party navigation links and `https://sociobot.in/` returned 200. The sole dead link is the release-blocking Studio checkout above.

Fresh Lighthouse 12.8.2 mobile run against production:

- Performance 93
- Accessibility 100
- Best practices 100
- SEO 100
- FCP 1.0 s; LCP 1.9 s; TBT 310 ms; CLS 0
- Initial transfer 192,608 bytes total; JS 10,751 bytes, CSS 4,225 bytes, image 174,671 bytes
- No third-party resources

The JS, CSS, font (none), hero, LCP, and CLS budgets pass. Lighthouse did not provide lab INP.

## Required next steps

1. Register/enable the production billing product and prove that checkout completes through license return and verification.
2. Fix or remove the broken `test:unit` script, then run all checks from a fresh install.
3. Prevent `/demo` from reading real license state and add a storage-isolation claim test.
4. Add claim entries and observable tests for every retained public promise, especially retention, settings import/export, installability, and the paid checkout/price.
5. Increase every mobile interactive target to at least 44×44 CSS px.
6. Keep the three privacy/offline/price facts inside the initial desktop viewport.
7. Add versioned asset filenames and appropriate immutable caching, while keeping HTML and the worker revalidatable.
