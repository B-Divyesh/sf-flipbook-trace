# Flipbook Trace repair 3 handoff

- Work order: `flipbook-trace-repair-3`
- Verifier report commit: `7658d2e56cdd84d3a18f051458825f8fab9ea984`
- Repaired candidate: `30c6c2bca48ffa46ed6de765ef75c61ec17200eb`
- Repair commit: `9594bf82d6ac68a54dc80ec3a8a9ff41b42acd2a`
- Version: `1.0.7`
- Product class: static local-first offline PWA
- Live URL: <https://flipbook-trace.sociobot.in>
- Azure Static Web App: `sociobot/sf-flipbook-trace`
- Production hostname: `victorious-pebble-094048910.7.azurestaticapps.net`

## Finding reproduced

Independent verification measured the core **Line detail** interaction at a 384 ms median for the 12-frame sample and 2,024 ms for the supported 60-frame case. Reset and sample regeneration also took 392–432 ms. The input handler synchronously filtered every 640×400 frame, rebuilt the entire strip, and blocked the next paint.

The previous candidate's functional, privacy, accessibility, offline, billing, routing, and load-performance checks had passed. Those behaviors were retained and rerun.

## Repair

- Range changes now update their visible value immediately and coalesce preview work over 120 ms.
- Preview filters run on 320 px working canvases in three-frame chunks. Each chunk yields to the browser.
- A generation token cancels obsolete preview work after another change or route transition.
- Sample creation and reset paint a progress state before frame work starts.
- PNG and PDF actions rebuild full-resolution output from the source frames. Export dimensions and print quality are unchanged.
- The Sobel edge calculation compares squared magnitudes and avoids a square root for every pixel without changing the threshold result.
- The 60-frame overview remains a concise 12-frame strip while the main preview and exports contain all 60 frames.
- The decorative `FT` monogram remains hidden from the accessible name. The wordmark now has the visible name `Flipbook Trace`, resolving the verifier's low voice-control advisory.
- The package, app shell, service-worker cache, manifest start URL, static 404, and footer are versioned as `1.0.7`.

## Exact regression coverage

`tests/site.spec.ts` installs Chromium's Event Timing observer and fails at 200 ms or above for:

- five 12-frame **Line detail** interactions at 390×844;
- one 12-frame **Line detail** interaction at 1440×900;
- 60-frame generation at the supported 5 seconds × 12 fps boundary;
- a **Line detail** interaction with 60 frames;
- 12-frame regeneration; and
- 12-frame demo reset.

The tests wait for the final ready state and assert the changed control/frame state, so deferring work cannot create a false functional pass. `@claim:trace-controls` now waits for each asynchronous preview and confirms all four visual results remain distinct. Existing export claims confirm full-resolution 960 px, 1920 px, original-width, and PDF output.

## Local verification

The following passed from a clean `npm ci` using Playwright 1.58.2:

- `npm run typecheck`
- `npm run lint`
- `npm run test:unit` — 3/3
- `npm audit --audit-level=high` — 0 vulnerabilities
- `npm run build` — produced `dist/`
- `npm test` — 52/52 Chromium tests
- all 19 commands in `.factory/claims.json`, executed independently
- `/opt/fleet/lib/verify-url.sh` — HTTP 200, one H1/main, `lang=en`, complete alt/button names, and zero console or page errors

Local Event Timing, without CPU throttling:

| Scenario | Duration |
| --- | ---: |
| 12-frame Line detail, 390 px, five runs | 24, <16, <16, <16, <16 ms |
| 12-frame Line detail, 1440 px | 16 ms |
| Generate 60 frames, 390 px | 16 ms |
| 60-frame Line detail, 390 px | <16 ms |
| Regenerate 12 frames, 390 px | 24 ms |
| Reset 12 frames, 390 px | 24 ms |

Every measured interaction is at least 176 ms inside the 200 ms budget. A value below 16 ms is below Chromium's Event Timing reporting floor.

Local Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; FCP 0.90 s, LCP 2.25 s, TBT 0 ms, CLS 0, transfer 195,778 bytes.

Build payloads remain within budget: JavaScript 33.57 KB raw / 11.75 KB gzip, CSS 15.88 KB raw / 4.37 KB gzip, and mobile hero 44.80 KB. No font is downloaded.

The full browser suite also passed desktop 1366×768 and 1440×900 layouts, 390×844 layout and touch targets, keyboard-only slider/export use, route focus, 200% text, reduced motion, all-route axe scans, no-upload request guards, recursive persistence checks, offline reload, changed-worker activation, invalid input recovery, settings portability, license caching, and the designed 404.

## Deployment and live verification

Commit `9594bf8` was pushed to `origin/main` and deployed with Static Web Apps CLI 2.0.10 to the existing production environment for `sf-flipbook-trace`. The custom domain served the new build immediately.

Live Event Timing, without CPU throttling:

| Scenario | Duration |
| --- | ---: |
| 12-frame Line detail, 390 px, five runs | 24, <16, <16, <16, <16 ms |
| 12-frame Line detail, 1440 px | 24 ms |
| Generate 60 frames, 390 px | 24 ms |
| 60-frame Line detail, 390 px | 16 ms |
| Regenerate 12 frames, 390 px | 24 ms |
| Reset 12 frames, 390 px | 16 ms |

The live browser audit confirmed:

- `/`, `/demo`, `/privacy`, and `/terms` return 200; `/missing-page` returns the designed 404.
- All five routes have `lang=en`, one H1, one main, zero 390 px overflow, zero serious/critical axe findings, no cold cross-origin request, and no application error.
- Demo flow completed 12 → 60 → 12 frames, changed Line detail 142 → 143, reset to 12, and downloaded both named exports with no runtime request.
- Keyboard order begins at **Skip to main content**, reaches Line detail after 12 Tabs, changes it with ArrowRight, reaches PNG export after six more Tabs, and downloads with Enter.
- Focus is a visible `3px solid rgb(173, 53, 45)` outline.
- At 200% text, the H1 and sample action remain visible with zero horizontal overflow.
- Reduced-motion mode matches and has zero running animations.
- A fresh invalid verdict made one request; immediate reload made none and retained the inactive notice.
- The installed `/sw.js` controls the page. Its only cache is `flipbook-trace-v1.0.7-6a01ffe8d613-shell`, containing all home/demo/legal/offline shell assets.
- The live demo reloaded offline with its banner and all 12 frames.

Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.96 s, LCP 1.86 s, TBT 32 ms, CLS 0, transfer 195,900 bytes.

Response policy and billing checks passed:

- HTML carries HSTS, `nosniff`, strict-origin referrer policy, restrictive Permissions Policy, and the expected self/Sociobot CSP.
- Hashed JS/CSS use one-year immutable caching. `sw.js` uses `no-cache, no-store, must-revalidate`.
- A real invalid-license request returned 200 JSON with `Cache-Control: no-store` and CORS restricted to the deployed origin.
- The production checkout returned 303 to the hosted Dodo checkout.

Live artifacts match `dist/` byte for byte:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `8ad3b2566938e2fd4b38a15f867791cdb0b2a74f0eb9ad8ab6a48fb962e31778` |
| `sw.js` | `6e5023ccfa5769f67e2ec215c8d24b8bd62f8d9e2f9318ab0a48c59de2474c05` |
| `manifest.webmanifest` | `9a9feaf61917061ffca2a908dea09f6632b8f785983e0db23eb9e54bbdb77c47` |
| JavaScript | `ecff5921a1c8891ba06fa3e704c8af253b54e487e83a6e5ef14e8de8af033451` |
| CSS | `bea09084978f43dab78b57c0f47de23525f649399cb5bd01b30c4f20abc7d24f` |

## Evidence

Fresh local and live evidence is in `.factory/evidence-repair-3/`:

- `interaction-timing-local.json` and `interaction-timing-live.json`
- `lighthouse-local.json` and `lighthouse-live.json`
- `live-audit.json`, `live-home-mobile.png`, and `live-demo-desktop.png`
- `verify-url-local/` and `verify-url-live/`

## Known gaps and next steps

No release-blocking product gap remains. A real paid purchase was not placed; checkout identity, price, one-time billing, redirect, verification policy, and cached license lifecycles were tested without charging a card.

Package/consumer, CLI, authentication authority, backend health, server persistence, and concurrency checks do not apply to this static PWA. The deterministic local workflow does not need an AI runtime feature.

The verifier's pre-existing `graphify-out` modifications remain uncommitted and were not used by the build, tests, or deployment.
