# Repair 11 handoff — ready for static deployment

- Work order: `flipbook-trace-repair-11`
- Base verifier commit: `b7c48749a8a4e5b465bf43b6be7a8b2c25798a24`
- Failed candidate: `4892cd72cd3482637ea6bf606d1d78b5154dccf5`
- Repair version: `1.0.13`
- Repair commits: `651915e7a2f25a7196ae51bb8daf33b60c4e6487` and `9284ee5c4a74724dcaac2e162faedfbae7b57309`
- Deployment class: static PWA (`dist/`)

## Repair

The verifier found one release blocker: opening the ready demo at 390×844 with a 4× CPU throttle regularly produced a 200–460 ms main-thread task, above the product's 200 ms startup contract. Its live Lighthouse result was 87 performance with 530 ms total blocking time.

The repair keeps the same twelve-frame paper-bird demo, controls, local-only processing, exports, license flow, and PWA behavior while changing how the startup work is scheduled:

- Moved settings/storage utilities into `src/settings.ts`; the canvas, image-filter, ZIP, and PDF module remains a separate dynamically requested `core` chunk.
- Preloads that local chunk as part of the real workspace shell so choosing a local video never causes a workflow network request. The demo defers its request until after its first shell paint.
- Split demo mounting and thumbnail insertion across actual paint frames, one thumbnail at a time, rather than timer-only batches that Chrome could coalesce before rasterizing.
- Reduced the sample-only source canvas to 180×112, which still exceeds the approximately 170 px-wide 390 px preview card while avoiding unnecessary startup pixel work. Local video and export dimensions are unchanged.
- Bumped the page, 404 artifact, manifest-serving worker cache, and package to `v1.0.13` so installed apps receive the update.

## Regression coverage

- `the production entry defers canvas and export code until the demo needs it` now proves the entry has no static `core` import, has a dynamic import, and leaves the PDF implementation in the separate core chunk.
- `demo startup chunks the initial layout and canvas preparation below the mobile interaction threshold` performs five independent 390×844, device-scale-factor 1.75, 4×-CPU cold demo starts and requires every observed long task to be below 200 ms.
- The existing `@claim:local-processing` request recorder remains exact coverage for the preload boundary: importing, tracing, and exporting a local WebM must emit zero HTTP(S) requests.

Independent post-repair startup probe under that same 390×844 / DPR 1.75 / 4× CPU condition recorded longest tasks of **100, 131, 114, 105, and 111 ms** (all <200 ms).

## Verification

All checks ran from a clean install after the final source changes:

```text
npm ci                                      PASS — 141 packages, 0 audit vulnerabilities
npm run test:unit                           PASS — 3/3
npm run typecheck                           PASS
npm run lint                                PASS
npm run build                               PASS — dist/index.html present
npm audit --omit=dev --audit-level=high     PASS — 0 vulnerabilities
npm test                                    PASS — 57/57 Playwright tests
```

The full browser suite covers all 19 exact claim commands, desktop and 390 px mobile flows, keyboard controls, 200% text, touch targets, reduced motion, request privacy, local-video error recovery, ZIP/PDF exports, IndexedDB isolation, offline reload, PWA update activation, and the static 404 configuration. Package-consumer and CLI checks do not apply: this is a static PWA, not a package or command-line product. There is no sign-in or product backend, so Entra and backend health/concurrency checks do not apply.

Additional browser checks:

- `/opt/fleet/lib/verify-url.sh` passed against local production home and demo: 200, title, `lang=en`, exactly one `h1` and `main`, no missing alt text or unlabeled buttons, and no console/page errors.
- Playwright axe checks passed on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page`: zero serious/critical violations.
- Mobile Lighthouse 12.6.0 on local production `/?demo=1`: **100 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP 0.9 s, LCP 1.4 s, TBT 10 ms, CLS 0.031. Command used Chromium 1208 with `--disable-full-page-screenshot`; report: `/tmp/flipbook-trace-repair-11-lighthouse-clean.json`.
- Final production assets: entry JS 24,673 B raw / 8,470 B gzip; deferred processing JS 5,741 B raw / 2,670 B gzip; CSS 16,122 B raw / 4,430 B gzip; mobile hero 44,796 B. All are within the stated budgets.

## Deployment and live verification

Deployed the final `dist/` with `/opt/fleet/lib/deploy-static.sh flipbook-trace dist`.

- Static deployment: `717e3d86-37e7-4811-a9df-a5d085aa8e02` to the existing Central US Static Web App; the custom domain returned HTTPS 200 during deployment.
- Live identity: all **22** public `dist/` files match the deployed artifact SHA-256 values; `staticwebapp.config.json` correctly returns 404. Live manifest start URL is `/?source=pwa&v=13`; live worker cache is `flipbook-trace-v1.0.13-6c60ed96e509-shell`.
- Five fresh live 390×844 / DPR 1.75 / 4×-CPU demo loads had longest tasks of **111, 75, 101, 85, and 82 ms**. All are below 200 ms.
- Live URL verification passed on home and demo with no console errors and the required title, language, H1, main landmark, image alternatives, and button labels.
- Live axe scans at desktop and 390 px across `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page` found zero serious or critical violations. Normal routes returned 200; the styled missing route returned 404 as intended.
- Live PWA audit: `/sw.js` controls the demo; after network was disabled, reload returned 200 with 12 ready frames.
- Live headers provide HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, a CSP with response-header `frame-ancestors 'none'`, and the restrictive permissions policy. The only allowed external connection is the explicit Sociobot license check.
- Live Lighthouse 12.6.0 mobile demo: **100 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0.031. Report: `/tmp/flipbook-trace-repair-11-live-lighthouse.json`.

## Known gaps

None. The product remains a static, local-first PWA with no sign-in, backend, or runtime AI service.
