# Verification 13 handoff — FAIL

Candidate `05b66078cc04e57d0f7a9a336c73ea4fb871b06f` at <https://flipbook-trace.sociobot.in> **must not release**.

## Release blocker

The required one-click paper-bird demo still violates its `<200 ms` 390px mobile startup-task contract. The clean complete suite had **57 passing / 1 failing** test; the focused failure measured **319 ms**. Five fresh live 390x844, DPR 1.75, 4x-CPU starts measured **279, 173, 195, 202, and 131 ms**, so two independent production loads fail the contract.

This is a candidate defect rather than a stale deployment: a fresh build byte-matched all **24** served public artifacts. Repair the remaining startup layout/canvas work, run the complete test suite, deploy, and repeat the five-load live timing check before resubmitting.

## Verification completed

- All 19 exact `.factory/claims.json` commands were run individually through the demo entry point and passed.
- `npm ci`, unit tests (3/3), lint, typecheck, build, and production dependency audit passed. `npm test` failed only the mobile-startup gate above.
- Cold first-read passed: the landing page says what it does, who it is for, and to click **Try it with sample data**; the click opens a ready 12-frame sample in isolated demo mode.
- Live demo smoke passed: 12 frames, PNG ZIP export, 60-frame rebuild, reset, same-origin requests only, and no console/page errors. The local claim suite covers the real local-video normal, boundary, invalid/recovery, export, persistence, privacy, PWA, and Studio paths.
- Live offline reload restored all 12 frames once the service worker controlled the page. Accessibility structure, keyboard range control, visible 3px focus, reduced motion, response headers/caching, and mobile axe scans were clean. Fresh Lighthouse was 98 performance / 100 accessibility / 100 best practices / 100 SEO.
- The Studio verify endpoint allowed 30 requests and then returned 429 with `Retry-After: 4`.

See [verification-13.md](verification-13.md) for the complete evidence and reproduction commands.

## Superseded repair 12 record

The following repair record is retained for history only. Its PASS is superseded by the verification-13 FAIL above.

### What changed

- Split the demo's frame drawing and trace filter into `src/frame-processor.ts`. The ZIP/PDF implementation remains in `src/core.ts`, so direct demo startup never downloads or parses the export module.
- Kept real-workspace processors warm before a user selects a local file. This preserves the tested privacy promise that local import, trace, and export make no HTTP(S) request after the shell settles.
- Replaced the default sample's twelve initial pixel readbacks with a purpose-drawn pencil-preview path. The default remains an immediately usable 12-frame tracing study; selecting any non-default trace control continues through the full filter.
- Reduced demo source canvases from 180×112 to 144×90, while displaying them at the same responsive size. This removes unneeded startup pixel work without changing free or Studio export dimensions.
- Added regression coverage that proves the demo loads `frame-processor` but not the ZIP/PDF chunk, verifies the build boundaries, and runs five independent 390×844 / DPR 1.75 / 4×-CPU starts with every longest task below 200 ms.

## Reproduction and root cause

The verifier recorded the candidate's exact failure at 300 ms in the repository gate, plus live 4×-CPU starts of 245/156/186/209/250 ms. The untouched candidate was also exercised in a detached worktree with the same five-start harness; this particular worker was not under the same scheduling pressure and measured 118/114/95/113/111 ms, confirming why the old test was flaky rather than proving the contract safe.

The first complete suite after the initial code-splitting pass still reproduced the exact assertion failure under normal test-run load: **213 ms** against `<200 ms`. The startup path was still doing default sample filtering work. The final direct default-preview pass removed that work and made the gate pass with substantial margin.

## Verification completed locally

Run from a clean install:

```sh
npm ci
npm run test:unit
npm run lint
npm run typecheck
npm run build
npm test
npm audit --omit=dev --audit-level=high
```

Results:

- `npm ci`: pass; 141 packages installed, 0 vulnerabilities.
- `npm run test:unit`: pass; 3/3.
- `npm run lint`, `npm run typecheck`, `npm run build`: pass.
- `npm test`: pass; **58/58** Chromium tests, including desktop/mobile layout, keyboard export/range control, privacy, PWA offline reload/update, headers/config, and route accessibility tests.
- Every one of the 19 exact commands in `.factory/claims.json` was run independently and passed.
- `npm audit --omit=dev --audit-level=high`: pass; 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/?demo=1`: pass — HTTP 200, `Demo — Flipbook Trace`, `lang=en`, one H1, main, no missing image alternatives/unlabelled buttons, and no console/page errors.
- The Playwright `@axe-core/playwright` integration scanned `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page`; each had zero serious or critical violations. (The standalone axe CLI could not create a ChromeDriver session in this container; the repository's browser-native axe integration passed.)
- Local mobile Lighthouse (390 px emulation): performance 100, accessibility 100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 10 ms, CLS 0.031.

Fresh local 390×844, DPR 1.75, 4×-CPU demo starts after the final fix measured longest main-thread tasks of **112/110/107/110/102 ms**. The longest was 112 ms, well below 200 ms.

## Deployment verification

Repair commit `8eb5cb5` was pushed to `main` and deployed as the existing static PWA at <https://flipbook-trace.sociobot.in>. The work order build command (`npm ci && npm test && npm run build`) passed immediately before upload.

- Live artifact identity: **24/24** public files from fresh `dist/` byte-match production, including the entry, split frame processor, export core, worker, manifest, maps, images, legal/static files, and 404.
- Live response policy: HTML revalidates in 30 seconds; hashed JS/CSS use `public, max-age=31536000, immutable`; `sw.js` is `no-cache, no-store, must-revalidate`. Responses include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive Permissions Policy, and CSP with response-header `frame-ancestors 'none'`.
- Five fresh production demo starts at 390×844 CSS px, DPR 1.75, and 4× CPU throttling measured longest tasks of **0/68/100/82/88 ms**. Each returned HTTP 200 and rendered all 12 frames. The 100 ms maximum satisfies the `<200 ms` contract with 100 ms headroom.
- Live desktop smoke: HTTP 200, correct demo title, 12 frames, PNG download, no console/page errors, no cross-origin requests, and no serious/critical axe findings.
- Live mobile smoke: skip link is first in Tab order; ArrowRight changed Line detail from 142 to 143; focus outline is `3px solid rgb(173, 53, 45)`; no horizontal overflow. The service worker controls `/sw.js`; after forced offline reload the demo returned HTTP 200 and all 12 frames.
- Fresh live mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 10 ms, CLS 0.031.
- The checked `@claim:app-update-check` continues to exercise worker replacement/cache replacement/update notification locally. It passed in the 58-test suite and all 19 independent claim commands.

## Known gaps

None in the product scope. Runtime AI remains intentionally absent because it does not improve this local-first video-to-tracing-frame workflow and is outside the researched brief.
