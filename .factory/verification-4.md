# Flipbook Trace independent verification 4

- Work order: `flipbook-trace-verify-4`
- Candidate commit: `30c6c2bca48ffa46ed6de765ef75c61ec17200eb`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Product class: local-first offline PWA with Sociobot paid-license verification
- Result: **FAIL — the core trace-preview interaction exceeds the required 200 ms responsiveness budget**

## Release-blocking finding

### High — changing the trace preview takes 384 ms median and up to 2,024 ms

The supplied performance contract requires INP below 200 ms. Fresh Chromium Event Timing measurements on the deployed `/demo` route exceed that limit on the product's core **Line detail** interaction, without CPU throttling:

| State and viewport | Interaction duration |
| --- | ---: |
| 12 ready sample frames, 390×844, five separate ArrowRight interactions | 376, 376, 384, 472, and 520 ms |
| 12 ready sample frames, 390×844, median | **384 ms** |
| 12 ready sample frames, 1440×900 | **760 ms** |
| 60 frames (the supported 5 seconds at 12 fps), 390×844 | **2,024 ms** |
| Reset the 12-frame demo | 392–432 ms |
| Regenerate the default 12 frames | 432 ms |

For the 60-frame case, the keydown handler itself occupied about 1,790 ms. The control synchronously refilters and repaints every 640×400 frame on each range-input event. This makes a normal supported workflow visibly unresponsive and fails the explicit interaction budget even though initial-load Lighthouse remains strong.

Required repair: move expensive filtering off the input event's critical path. Suitable approaches include a low-resolution preview, debouncing/coalescing slider input, incremental rendering, or a worker/`OffscreenCanvas`. Re-run Event Timing on 12 and 60 frames and require every measured core interaction to stay below 200 ms.

## Mandatory first-read and demo gate — PASS

Cold at 390×844, the first screen answers the three required questions in plain words:

- What it does: **“Turn your video into tracing frames.”**
- Who it is for: **“For short-form creators making a hand-drawn flipbook without uploading their video.”**
- What to click: **“Try it with sample data.”** The adjacent line says it opens a ready 12-frame paper-bird sample.

The action, its explanation, and all three privacy/offline/free facts fit in the first viewport. One click opened `/?demo=1`, rendered 12 frames, and showed the persistent **“Demo — sample data, nothing is saved”** banner with **Reset demo** and **Start for real**. The first-read acceptance gate passes.

## Claims gate — PASS

`.factory/claims.json` exists and contains 19 claims. Each ID appears exactly once as a test tag. After `npm ci`, every listed command was executed independently and passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| `clip-workflow` | `npm test -- --grep @claim:clip-workflow` | PASS |
| `demo-ready` | `npm test -- --grep @claim:demo-ready` | PASS |
| `demo-workflow` | `npm test -- --grep @claim:demo-workflow` | PASS |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS |
| `png-export` | `npm test -- --grep @claim:png-export` | PASS |
| `pdf-export` | `npm test -- --grep @claim:pdf-export` | PASS |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS |
| `ephemeral-project` | `npm test -- --grep @claim:ephemeral-project` | PASS |
| `trace-controls` | `npm test -- --grep @claim:trace-controls` | PASS |
| `settings-portability` | `npm test -- --grep @claim:settings-portability` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `pwa-installable` | `npm test -- --grep @claim:pwa-installable` | PASS |
| `free-quality` | `npm test -- --grep @claim:free-quality` | PASS |
| `studio-quality` | `npm test -- --grep @claim:studio-quality` | PASS |
| `studio-purchase` | `npm test -- --grep @claim:studio-purchase` | PASS |
| `studio-license-check` | `npm test -- --grep @claim:studio-license-check` | PASS |
| `studio-license-cache` | `npm test -- --grep @claim:studio-license-cache` | PASS |
| `browser-data-deletion` | `npm test -- --grep @claim:browser-data-deletion` | PASS |
| `app-update-check` | `npm test -- --grep @claim:app-update-check` | PASS |

The live landing page, README, privacy and terms routes, demo contract, and copy audit were cross-checked. Their functional and privacy promises map to registered tests; no unlisted product claim was found. Passing the claims gate does not waive the separate performance budget above.

## Repository gates — PASS

| Check | Result |
| --- | --- |
| Candidate identity | HEAD exactly `30c6c2bca48ffa46ed6de765ef75c61ec17200eb` before verification |
| `npm ci` | PASS; 141 packages installed, 142 audited, 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS; 3/3 tests |
| `npm run build` | PASS; exact production build produced `dist/` |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm test` | PASS; 49/49 Chromium tests in 1.8 minutes |

The checkout already contained unrelated modified/generated `graphify-out` files when verification began. They do not participate in the product build or runtime and were left untouched.

## End-to-end workflow — PASS apart from interaction latency

Fresh production demo evidence:

- One click opened the isolated 12-frame paper-bird sample.
- 5 seconds at 12 fps regenerated 60 frames.
- A 0.5-second selection produced the specific 1–5 second recovery message; correcting it restored 12 frames.
- PNG export downloaded `flipbook-trace-frames.zip`, 160,148 bytes, with ZIP magic `504b0304`.
- PDF export downloaded `flipbook-trace-sheet.pdf`, 202,367 bytes, beginning `%PDF-1.4`.
- No request occurred while changing the sample or making either export.

Fresh production local-video evidence used a generated six-second 320×200 WebM:

- 1 second at 2 fps produced 2 frames.
- 5 seconds at 12 fps produced 60 frames.
- 5.1 seconds produced the documented recovery message; correcting it restored 12 frames.
- Runtime networking consisted only of a local `blob:` read. No video or frame request left the origin.
- Reload removed the chosen file and all frames.
- A text file produced **“That file is not a video. Choose a video this browser can play.”** Choosing a valid video recovered to six frames.

Invalid settings JSON produced a specific error. A valid settings JSON then restored fps 8, grayscale, threshold 151, and onion skin, and cleared the error. Choosing a paid width without a license reset to 960 px and explained the next step. Empty license verification made no request and asked for a token.

## Privacy, billing, headers, and request allowance — PASS

- Cold `/`, `/demo`, `/privacy`, `/terms`, and the 404 route made no cross-origin request.
- The complete sample flow made no request after the shell settled.
- Real local-video processing made only a `blob:` read; video and frame data did not leave the browser.
- No analytics, remote font, third-party runtime script, or Azure model endpoint was observed.
- Explicit invalid-license verification made one GET to Sociobot. Reload made no second request and retained **“This license is not active.”**
- A fresh valid cached verdict made zero requests across two loads and kept paid controls available.
- A simulated stale-valid-to-revoked response made one request total across reload, retained the revoked notice, and reset export width to 960 px. This freshly confirms the previous deployment-only/lifecycle failure is repaired.
- The checkout endpoint returned HTTP 303 to `checkout.dodopayments.com`; the `studio-purchase` claim independently confirmed Flipbook Trace Studio, USD 9.00, and one-time billing.
- Requests 1–30 to the live verification endpoint returned 200. Request 31 returned **429** with **`Retry-After: 3`**. Observed allowance: 30 requests per client window.

Live HTML responses include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive Permissions Policy, and a CSP restricted to self plus the Sociobot API. The verify response uses `Cache-Control: no-store` and CORS allows the deployed origin.

## Accessibility, keyboard, responsive behavior, and errors — PASS

- Standard axe scans found zero serious/critical findings on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` at 390 px.
- Each route has `lang=en`, one H1, one main landmark, a route-specific title, and zero horizontal overflow.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title/language/main/H1/alt/button checks, and no console/page errors.
- Keyboard traversal begins at **Skip to main content**, reaches the Line detail slider after 12 Tabs, changes 142 to 143 with ArrowRight, reaches **Export PNG pack** after six more Tabs, and downloads with Enter.
- Focus is a visible solid 3 px red outline. Demo actions measure at least 44 px high.
- At 200% text size, the H1 and demo action remain visible and horizontal overflow stays zero. Zoom is not disabled.
- Reduced-motion mode matches and reports zero running animations.
- No application console or page error appeared during normal, demo, export, invalid-input, offline, or license flows.

Non-blocking advisory: Lighthouse's experimental label-in-name audit flags the visible **FT** monogram because the wordmark link's accessible name is **“Flipbook Trace home.”** Standard axe reports no violation and the Lighthouse accessibility score remains 100, but hiding the decorative monogram from the accessibility tree would remove the ambiguity for voice-control users.

## PWA, routing, caching, deployment identity, and load performance — PASS

- The live manifest uses `display: standalone`, start URL `/?source=pwa&v=6`, matching theme/background colors, and 192, 512, and maskable icons.
- The controlling worker is `/sw.js`. Its versioned shell cache contains home, demo, privacy, terms, offline fallback, JS/CSS, icons, and artwork.
- After the first visit, live `/demo` reloaded offline with its banner and all 12 frames.
- The `app-update-check` claim served a changed worker, activated it, replaced the shell cache, and announced the update.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns the designed HTTP 404. All discovered navigation targets resolve; the purchase link intentionally redirects.
- Every deployed build artifact is byte-for-byte identical to candidate `dist/`, including HTML, JS, CSS, source map, worker, manifest, icons, artwork, social card, 404, offline page, robots, and sitemap.
- Representative SHA-256 values: index `6d085f0f…def0d`, JS `ebc1928c…19a67`, CSS `bea09084…d24f`, worker `59f93e16…9730`.
- Hashed JS/CSS use one-year immutable caching. HTML revalidates after 30 seconds. `sw.js` is `no-cache, no-store, must-revalidate`.

Fresh Lighthouse 12.8.2 mobile result:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 95 | 100 | 100 | 100 | 0.9 s | 1.9 s | 240 ms | 0 | 189 KiB |

Build payloads are within budget: JavaScript 32.67 KB raw / 11.53 KB gzip, CSS 15.88 KB raw / 4.36 KB gzip, mobile hero 44.80 KB, and no font download. Lighthouse load metrics do not measure the failing post-load core interaction.

This product is not a library, CLI, authenticated app, or product backend. Consumer-package, CLI, sign-in authority, health/build endpoint, server persistence, and concurrency checks do not apply. The only server endpoint in product scope is Sociobot billing, whose allowance was verified above. The deterministic local workflow does not benefit from an AI runtime feature.

## Defects by severity

- **High / release-blocking:** Core trace-preview interactions measure 384 ms median for 12 frames and 2,024 ms for the supported 60-frame case, exceeding the 200 ms budget.
- **Medium:** None found.
- **Low / advisory:** Experimental label-in-name audit flags the visible `FT` monogram on the home link.

## Evidence

- Fresh screenshots, URL-verifier output, and Lighthouse JSON: `.factory/evidence-verify-4/`
- Exact individual claim outputs: `/tmp/flipbook-claim-results.log`
- Full-suite output: `/tmp/flipbook-full-test.log`
- Candidate/live byte comparison: `/tmp/flipbook-parity.log`

## Decision

**FAIL.** The deployment matches the candidate and the previous license-lifecycle failure is fixed. Do not release candidate `30c6c2bca48ffa46ed6de765ef75c61ec17200eb` until the trace-preview interaction stays below 200 ms for both the default 12-frame sample and the supported 60-frame boundary. After repair, re-run all 19 claim commands, the full suite/build, live request and license checks, offline/update tests, axe, Lighthouse, deployment parity, and the Event Timing scenarios above.
