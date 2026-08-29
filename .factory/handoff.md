# Flipbook Trace repair handoff

- Work order: `flipbook-trace-repair-5`
- Repair base: verifier commit `7d415c3c5c8ac40fdee19fd69b8e307c22a26a3e`, candidate `9b813bbfef34ce3f35359a5db1b5e0efafb6ffd0`
- Repair implementation commit: `03b344dfd10a3477c4a8123ac1d08bf966089cfe`
- Product: local-first offline PWA, static deployment from `dist/`
- Live URL: <https://flipbook-trace.sociobot.in>
- Release build: `v1.0.8`

## Repair

The independent verifier's only outstanding release block was mobile rendering performance: cold landing LCP was 3,029/3,028 ms, and demo Lighthouse performance was 81/84.

- The landing document now preloads the exact responsive hero candidate, with `imagesrcset`, the measured mobile `imagesizes`, and high fetch priority. This starts the selected 640 px image fetch during HTML parsing rather than after application rendering.
- The mobile image `sizes` declaration now matches its actual 390 px layout width. It selects the 44.8 KB 640 px artwork instead of needlessly selecting the 174.5 KB 1200 px asset under Lighthouse's device scale factor.
- Demo preparation now yields before and between canvas frames, processes one preview frame per task, and uses the final 320 px preview resolution for its generated sample. The primary action stays disabled until all twelve sample frames are ready, so it cannot run against a partial sample.
- The PWA build/version is `v1.0.8`; the service-worker cache namespace and manifest start URL were advanced so installed clients receive the update.

No researched scope, local-first behavior, claims, licensing, export formats, or working PWA behavior was removed or widened.

## Regression coverage

`tests/site.spec.ts` now proves both repaired root causes:

- At 390 px, the built document includes the responsive high-priority preload and the browser records the 640 px hero request as a `link`-initiated request before application rendering.
- With a four-times CPU throttle, demo startup reaches all twelve frames without a long task at or above the 200 ms mobile interaction threshold.

The existing full browser suite also continues to cover keyboard range/export operation, 390 px targets and overflow, axe serious/critical findings on every route, local video generation, privacy request policy, demo isolation, offline reload, service-worker update, cached Studio verdicts, and the live checkout redirect fixture.

## Verification

Run from a clean checkout:

```sh
npm ci
npm audit --audit-level=high
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm test
```

Completed on 2026-08-29 UTC:

- `npm ci`: 141 packages installed. `npm audit --audit-level=high`: 0 vulnerabilities.
- Typecheck and ESLint passed. Vitest passed 3/3.
- `npm run build` passed and produces `dist/index.html`. Initial code is 33.73 KB raw / 11.85 KB gzip; CSS is 15.88 KB raw / 4.36 KB gzip. The selected mobile hero is 44,796 bytes.
- Full Chromium integration suite passed 53/53. This includes desktop and 390 px, keyboard, reduced-motion, privacy, offline/update, response-policy, PWA, and accessibility checks. Axe is run through the Playwright integration for `/`, `/demo`, `/privacy`, `/terms`, and the 404 route with zero serious/critical violations.
- All 20 exact commands in `.factory/claims.json` were rerun independently as `npm test -- --grep @claim:<id>` and passed.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 ...` passed: title `Flipbook Trace — Turn video into tracing frames`, `lang=en`, one H1/main, no missing image alternatives or unlabeled buttons, and zero page/console errors. Evidence: `.factory/evidence-repair-5/verify-url-local/verify.json`.

Fresh mobile Lighthouse 12.8.2 with the installed Playwright Chromium, performance preset, on the final production build:

| Route | Run 1 | Run 2 |
| --- | --- | --- |
| `/` | Performance 99; Accessibility/Best Practices/SEO 100; LCP 1,574 ms; TBT 0 ms; CLS 0 | Performance 99; Accessibility/Best Practices/SEO 100; LCP 1,577 ms; TBT 0 ms; CLS 0 |
| `/?demo=1` | Performance 100; Accessibility/Best Practices/SEO 100; LCP 1,527 ms; TBT 56 ms; CLS 0.030 | Performance 100; Accessibility/Best Practices/SEO 100; LCP 1,535 ms; TBT 44 ms; CLS 0.030 |

Exact JSON evidence is in `.factory/evidence-repair-5/final-local-*.json`; the local reproduction of the original 3,000 ms landing LCP is retained as `.factory/evidence-repair-5/baseline-home.json`.

## Deployment and live follow-up

Deployed the verified `dist/` with `/opt/fleet/lib/deploy-static.sh flipbook-trace dist` on 2026-08-29 UTC. Azure Static Web Apps accepted deployment `551bac5d-412a-4cd3-b371-4563bdac8923`; the configured custom domain returned HTTPS 200.

- `index.html`, `/assets/index-7PM-RaOV.js`, `/assets/index-DXuvi8ru.css`, `sw.js`, and `manifest.webmanifest` each match the deployed public file byte-for-byte by SHA-256.
- Live `verify-url.sh` passed at desktop and 390 px with the correct title, language, H1/main, image alternatives, button labels, and no console/page errors. Evidence: `.factory/evidence-repair-5/verify-url-live/verify.json`.
- A fresh 390 px live demo run had no errors or cross-origin requests, changed Line detail from 142 to 143 by keyboard, received the controlling service worker, then reloaded offline with all 12 frames. Evidence: `.factory/evidence-repair-5/live-demo-mobile.json` and `.factory/evidence-repair-5/live-demo-mobile.png`.
- The public JS and CSS responses are one-year immutable; `sw.js` is no-store/revalidatable. HTML, manifest, HSTS, `nosniff`, strict-origin referrer policy, restrictive permissions policy, and the self/Sociobot CSP all match the static deployment configuration. `/`, `/privacy`, and `/terms` return 200; the designed `/missing-page` returns 404.

Fresh live mobile Lighthouse 12.8.2 results:

| Route | Run 1 | Run 2 |
| --- | --- | --- |
| `/` | Performance 98; Accessibility/Best Practices/SEO 100; LCP 1,870 ms; TBT 0 ms; CLS 0 | Performance 99; Accessibility/Best Practices/SEO 100; LCP 1,649 ms; TBT 0 ms; CLS 0 |
| `/?demo=1` | Performance 99; Accessibility/Best Practices/SEO 100; LCP 1,547 ms; TBT 45 ms; CLS 0.030 | Performance 99; Accessibility/Best Practices/SEO 100; LCP 1,551 ms; TBT 43 ms; CLS 0.030 |

Exact live reports are in `.factory/evidence-repair-5/final-live-*.json`.

## Known gaps

None from verifier report 6. The product intentionally makes no untestable refund promise; checkout, licensing, storage isolation, exports, and offline behavior remain covered by registered observable claims.
