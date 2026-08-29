# Flipbook Trace repair handoff

- Work order: `flipbook-trace-repair-7`
- Repair base: `2670be1951a3da156f6b45ed1219f71472123e92`
- Product: PWA/offline static site, deployed from `dist/`
- Version: `1.0.9`

## Repaired release blocker

The one-click `/?demo=1` route previously combined the first full workspace layout with sample canvas setup. On a 390 px viewport with 4x CPU throttling, that produced a 382–514 ms long task (the release-blocking verifier finding).

The demo now paints the banner and sample heading first, mounts the workspace in the next browser task, and reserves the workspace footprint before it mounts. This keeps the main thread available during startup without causing the footer to shift when the sample becomes ready. The same built-in twelve-frame paper-bird demo, controls, exports, storage isolation, and offline behavior remain unchanged.

`tests/site.spec.ts` now performs five independent cold 390 px / 4x-throttled startup runs in the normal test suite. Each waits for all twelve usable frames and asserts every observed long task is below 200 ms.

## Local verification

- Clean install: `npm ci`; `npm audit --audit-level=high` reported 0 vulnerabilities.
- Static checks: `npm run typecheck`, `npm run lint`, and `npm run test:unit` passed (3 unit tests).
- Production artifact: `npm run build` passed and produced `dist/index.html`. Initial app JS is 34,176 B (11,979 B gzip); CSS is 16,122 B (4,434 B gzip).
- Complete integration suite: `npm test` passed, 55/55 Chromium tests. This includes all 19 registered claims, local video boundaries, PNG/PDF exports, demo isolation, privacy request guards, keyboard operation, desktop and 390 px layouts, axe serious/critical checks, reduced motion, offline reload, PWA update activation, and cache/header policy checks.
- Release regression: `npx playwright test tests/site.spec.ts --grep 'demo startup chunks' --reporter=list` passed. Its one test contains five fresh cold starts at the verifier's 390 px / 4x setting.
- Browser smoke: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/?demo=1 .factory/evidence-repair-7/local-url` passed with no console errors, one h1/main, `lang=en`, valid demo title, and no missing image alt or unlabeled button. Desktop and 390 px screenshots were inspected.
- Mobile Lighthouse 13.4.1, local production demo: two runs scored 100 performance and 100 accessibility. LCP was 1,362 ms / 1,357 ms; TBT 51 ms / 12 ms; CLS 0.031 in both. Raw reports: `.factory/evidence-repair-7/lighthouse-demo-local-1.json` and `lighthouse-demo-local-2.json`.

## Deployment and live verification

The static deployment and post-publish identity checks are recorded in the final follow-up to this handoff after the repair commit is pushed.

## Known gaps / next steps

No known functional gaps. The app remains intentionally local-first: source videos and generated frames are page-memory-only and are not uploaded or persisted.
