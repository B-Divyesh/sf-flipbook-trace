# Flipbook Trace repair handoff

Work order: `flipbook-trace-repair-1`

Repair base/report: `1fd9cf8cf88ee0ab0477eb01357179b92cf71f6b`

Failed candidate: `626d92760bb77e8037fb596f324bbe0f371fa2cf`

Completed: 2026-08-28

Artifact/deployment class: `pwa-offline` / static; output remains `dist/` with `index.html` at its root.

## Release blockers repaired

- The production Studio product is registered. Its Sociobot checkout now returns HTTP 303 to a `checkout.dodopayments.com/session/...` URL. A live regression also covers the license return, URL cleanup, saved token, and verification result path.
- `npm run test:unit` now scopes Vitest to real unit files. It passes three settings-validation tests instead of collecting Playwright suites.
- `/demo` no longer initializes or reads real license keys. Studio checks also require `!isDemo`, so paid controls remain locked after either direct entry or client-side navigation. The regression preloads a valid real license and real IndexedDB data, records storage reads, exercises/reset the demo, and proves both stores remain unchanged.
- `.factory/claims.json` now lists 13 public claims. Each ID occurs in exactly one Playwright test. New observable coverage proves demo isolation, clip/frame retention, all trace controls, settings JSON round-trip and persistence, PWA metadata/control, and live Studio checkout/return behavior.
- Mobile wordmark, navigation, demo actions, and footer links now measure at least 44×44 CSS px. The 390×844 regression measures every previously failing target and checks horizontal overflow.
- A compact desktop hero treatment keeps all three product facts above the fold at both 1366×768 and 1440×900. Both viewport bounds are asserted.
- Vite restores content hashes for production JS/CSS. The build finalizer injects those exact names and a build hash into the service worker. Static host rules cache hashed assets for one year as immutable while the worker remains `no-store`/revalidated. A controlled browser update test proves a new worker activates, removes the old cache, and announces the update.

## Clean verification evidence

The final release matrix was run from `npm ci` on 2026-08-28:

- `npm ci`: 140 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=high`: passed; 0 vulnerabilities.
- `npm run test:unit`: passed; 3/3 Vitest unit tests.
- `npm run typecheck`: passed with strict TypeScript, unused checks, and no emit.
- `npm run lint`: passed with ESLint 10 and typescript-eslint.
- `npm test`: passed; 25/25 Playwright Chromium tests after the update regression was added.
- Every exact `.factory/claims.json` command: passed independently; 13 claims, one matching test each.
- `npm run build`: passed; hashed production assets and finalized service worker written to `dist/`.
- Package/consumer test: not applicable to this static PWA; the production `dist/` bundle is the shipped artifact.

Production sizes:

- HTML: 1.68 KB / 0.58 KB gzip.
- JavaScript: 29.66 KB / 10.82 KB gzip.
- CSS: 14.86 KB / 4.19 KB gzip.
- Total Lighthouse transfer: 190 KiB.

Browser and product coverage:

- Desktop: 1366×768 and 1440×900 first-screen bounds; full workflow and route checks.
- Mobile: 390×844, no horizontal overflow, measured 44 px targets.
- Keyboard: skip link, range Arrow key, focused export button, Enter-triggered download.
- Accessibility: axe on `/`, `/demo`, `/privacy`, `/terms`, and 404 found zero serious/critical findings. Each route has English language, one H1, one main landmark, valid titles, and no console errors.
- Privacy: an actual generated local WebM was decoded, filtered, and exported with same-origin requests only. Reload removed the source input and frames. Demo did not read or mutate real settings/licenses.
- Offline/install: the controlled `/demo` reload retained all 12 frames offline. Manifest icons, standalone mode, start URL, and controlling worker passed.
- Update: a changed worker activated, replaced the previous versioned cache, and displayed `An update is ready. Reload to use it.`
- Response policy: build assertions cover immutable hashed assets and no-cache service worker rules. CSP, referrer, MIME, permissions, and nosniff headers remain in `staticwebapp.config.json`.
- Checkout identity: production endpoint returned 303 to Dodo hosted checkout; license return and verification integration passed.

`/opt/fleet/lib/verify-url.sh` against the production preview returned HTTP 200, load 799 ms, title/lang/main/H1/alt checks passed, and zero console/page errors.

Lighthouse 12.8.2 mobile against the production preview:

- Performance: 98
- Accessibility: 100
- Best practices: 100
- SEO: 100
- FCP: 0.9 s
- LCP: 2.3 s
- TBT: 120 ms
- CLS: 0

## Run and verify

```sh
npm ci
npm audit --audit-level=high
npm run test:unit
npm run typecheck
npm run lint
npm test
npm run build
```

The demo entry point is `/demo`. Its reset restores the 12 bundled bird frames and default controls. Demo work stays in memory; real preferences use IndexedDB and real licenses use the namespaced local-storage keys documented in `.factory/demo.md`.

## Deployment and live identity

Deployment and post-deploy byte/header checks are recorded below after the static work-order deployment completes.

## Known limits

- Playable video codecs still depend on the browser and operating system.
- Large source-width exports can reach device memory limits. The existing 500 MB warning and recovery guidance remain.
- No AI feature was added because frame extraction and tracing do not benefit from remote inference, and remote processing would weaken the local-first job.
