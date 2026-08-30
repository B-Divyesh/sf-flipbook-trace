# Repair 14 handoff — deployed

Repaired every release blocker from verifier report commit `15eea71a3004623f61e2fb4b521c938cab486d2c` for candidate `0b38b51ff3ec514b6973806c40e6805e4d89af2c`.

## Fixed

1. Cold mobile demo startup now paints a small, useful 12-frame sample shell before the editor, filter, ZIP, and PDF paths hydrate. The interactive editor mounts only after its own sample refresh completes, so controls cannot race a partial preview. Five fresh `390×844`, DPR `1.75`, 4× CPU-throttled loads measured `132, 106, 123, 108, 92 ms` long-task maxima: max `132 ms`, median `108 ms`, under the `200 ms` hard and `150 ms` median gates. Evidence: [`startup-longtasks.json`](evidence-repair-14/startup-longtasks.json).
2. Frame cards no longer animate opacity. Their paper and dark frame numbers remain fully opaque while cards move into place, preventing the transient blue-workspace contrast failure. The regression test checks computed paper/ink colors and runs axe during entry.
3. Studio purchase copy now clearly says Dodo is Sociobot's merchant of record, Dodo handles refunds, and refunds revoke the Studio license. The exact checkout claim test asserts these disclosures on the landing page, Terms, and README.

The static PWA/deployment class is unchanged. Demo data remains memory-only and sample-only; the real video workflow, local preferences, paid license verification, exports, service worker, and existing passed behaviour remain intact.

## Verification

- Clean dependency install: `npm ci` — passed (0 vulnerabilities reported by production audit).
- Full browser/unit/integration suite: `npm test` — **59 passed**.
- Strict startup regression after the complete suite: `npm test -- --grep "demo startup chunks"` — passed with the `150 ms` median guard.
- Repeat regression run: `npm test -- --grep "demo startup chunks|demo frame entry preserves|production entry keeps|demo startup fetches" --repeat-each=5` — **20 passed**.
- Type/lint/build: `npm run typecheck`, `npm run lint`, `npm run build` — passed; `dist/` produced.
- Dependency audit: `npm audit --omit=dev --audit-level=high` — 0 vulnerabilities.
- Local browser checks: `/opt/fleet/lib/verify-url.sh` passed for `/`, `/demo`, `/privacy`, and `/terms`, with no console errors, one H1 and main landmark per route, `lang=en`, and no missing image alt text. Evidence: [`evidence-repair-14`](evidence-repair-14/).
- Accessibility: Playwright Axe scans across every route and the transient demo-entry regression passed with no serious/critical violations. `@axe-core/cli` was also invoked, but its bundled ChromeDriver only supports Chrome 152 while the provided browser is Chrome 145; the supported Playwright Axe integration is the authoritative passing scan in this environment.
- Keyboard/mobile: the suite verifies Tab skip links, 44px actions at 390px, Arrow-key line-detail adjustment, Enter PNG export, and desktop/mobile interaction budgets.
- Privacy/offline/update: claim tests verify no video/frame network traffic or persistent storage, offline demo reload, installed PWA/service-worker control, and update activation/cache replacement.
- Response policy: production `staticwebapp.config.json` keeps CSP (`'self'` plus the explicit Sociobot API endpoint), `frame-ancestors 'none'`, `nosniff`, strict referrer policy, permissions policy, immutable hashed assets, no-cache service-worker policy, and a designed static 404.
- Local mobile Lighthouse for `/demo`: **100 performance, 100 accessibility, 100 best practices, 100 SEO**; LCP 1355 ms, CLS 0.031, TBT 0 ms. Evidence: [`lighthouse-local-demo.json`](evidence-repair-14/lighthouse-local-demo.json).

Initial JS is 1.60 kB gzip; the direct demo shell is 1.95 kB gzip; CSS is 4.47 kB gzip.

## Run locally

```bash
npm ci
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/?demo=1` for the isolated sample demo.

## Deployment

Deployed static `dist/` from repair commit `bfcf989` on 2026-08-30. Azure Static Web Apps deployment `8e2a44eb-a530-471c-ba2a-26af7d490561` completed successfully.

- Live URL: https://flipbook-trace.sociobot.in
- Live artifact identity: the fetched `/` SHA-256 was `8847ddc304bb92718cccdcc50cda826caf63cdc6b114b0af3d23ad936a1e90df`, exactly matching `dist/index.html`; both reference `assets/index-BX25q4jx.js`. The live footer reports `v1.0.15`.
- Live route checks: `/`, `/demo`, `/privacy`, and `/terms` each returned 200 in `/opt/fleet/lib/verify-url.sh`; all had no console errors, one H1, a main landmark, `lang=en`, and no missing image alt attributes. Evidence: [`evidence-repair-14/live-home`](evidence-repair-14/live-home/), [`live-demo`](evidence-repair-14/live-demo/), [`live-privacy`](evidence-repair-14/live-privacy/), and [`live-terms`](evidence-repair-14/live-terms/).
- Live PWA/privacy check at 390×844: after an online service-worker-controlled reload, the demo showed 12 frames and `v1.0.15`; an offline reload again showed 12 frames and `12 frames ready`. Captured requests used only `https://flipbook-trace.sociobot.in`; the first Tab focused the skip link. Evidence: [`live-runtime.json`](evidence-repair-14/live-runtime.json).
- Live response policy: HTTPS responses include the expected CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict referrer policy, locked-down permissions policy, and `no-cache, no-store, must-revalidate` for `/sw.js`.

Deployment command:

```bash
/opt/fleet/lib/deploy-static.sh flipbook-trace dist
```

## Known gaps

None. The pre-existing modified `graphify-out/` files were preserved and deliberately excluded from this repair commit.
