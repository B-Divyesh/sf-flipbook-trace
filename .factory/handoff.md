# Repair 11 handoff — ready for static deployment

- Work order: `flipbook-trace-repair-11`
- Base verifier commit: `b7c48749a8a4e5b465bf43b6be7a8b2c25798a24`
- Failed candidate: `4892cd72cd3482637ea6bf606d1d78b5154dccf5`
- Repair version: `1.0.13`
- Repair commit: current `HEAD` (recorded in the delivery)
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

## Deployment and follow-up

Push this repair commit to `main` to use the configured static deployment. After the deployment finishes, verify live build identity is `v1.0.13`, rerun the five-start mobile probe against `https://flipbook-trace.sociobot.in/?demo=1`, and confirm the deployed response headers and asset hashes. No known product gaps remain.
