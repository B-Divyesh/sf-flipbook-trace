# Repair 15 handoff — ready to deploy

Repaired both release blockers in independent verification report commit `181f1e9f43b65b3a9b11908f797505d948791d6c` for candidate `7123baf0faa6c1abbb94ead54b4cb85f4a51dbc1`.

## Fixed

1. The demo’s first useful 12-frame sample now builds in short browser tasks. The light shell uses paper-frame cards first, then paints the overview and hydrates the real canvas editor after the sample is ready. This preserves the one-click sample, later controls, exports, and isolated storage while removing the cold mobile long-task spike.
2. The PWA-installable claim now waits for `controllerchange` after `navigator.serviceWorker.ready`. `ready` only proves that a registration is active; it does not guarantee that the current first visit has been controlled yet.
3. The lightweight-demo resource regression check now asserts the actual invariant—no frame-processing or export chunk is fetched before the sample is ready—without relying on browser-cache-dependent dynamic-import timing.
4. The release identity is `v1.0.16`; the package, manifest start URL, service-worker cache namespace, app footer, and static 404 footer were updated together.

The product remains a static offline PWA. The researched brief, local video workflow, free/Studio behavior, privacy model, sample isolation, PDF/ZIP exports, and existing accessibility behavior are unchanged.

## Verification

- Clean install: `npm ci` — 141 packages installed; 0 audit vulnerabilities.
- Static checks: `npm run typecheck`, `npm run lint`, `npm run test:unit` — passed; unit suite 3/3.
- Browser suite: `npm test -- --reporter=list` — **59/59 passed**.
- Claims: all 19 exact commands from `.factory/claims.json` were run separately and passed. The PWA claim also passed 10 fresh-context repeats; the update claim is covered by the passing final claims run.
- Cold demo regression: five fresh `390×844`, DPR `1.75`, 4× CPU-throttled local loads measured `[50, 64, 75, 83, 69]` ms longest tasks: **69 ms median, 83 ms maximum**, below the 150 ms median and 200 ms hard gates. Evidence: [`startup-longtasks.json`](evidence-repair-15-local/startup-longtasks.json).
- Production build: `npm run build` passed and wrote `dist/`. Initial entry JavaScript is 1.60 KB gzip; direct demo shell is 2.13 KB gzip; CSS is 4.63 KB gzip.
- Local browser route verifier: `/`, `/?demo=1`, `/privacy`, and `/terms` passed with no console errors, route title, `lang=en`, exactly one H1, a main landmark, and no missing image alternatives. Evidence: [`evidence-repair-15-local`](evidence-repair-15-local/).
- Accessibility: Playwright Axe scans found zero serious/critical issues on `/`, demo, privacy, terms, and the designed 404 at both 1440×900 and 390×844. Evidence: [`axe.json`](evidence-repair-15-local/axe.json). The standalone `@axe-core/cli` was attempted but its Selenium runner could not locate a system Chrome binary; the project’s supported Playwright Axe integration completed successfully.
- Mobile Lighthouse on the local production demo: **99 performance, 100 accessibility, 100 best practices, 100 SEO**; FCP 982 ms, LCP 1505 ms, TBT 0 ms, CLS 0.062. Evidence: [`lighthouse-demo.json`](evidence-repair-15-local/lighthouse-demo.json).
- The full browser suite covers keyboard skip/link/range/export use, 44 px mobile controls, 200% text, reduced motion, privacy/no-upload storage behavior, offline reload, PWA update activation, response-policy configuration, and the static 404.

## Run locally

```bash
npm ci
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/?demo=1` for the isolated sample demo.

## Deployment

Static `dist/` is ready for deployment using:

```bash
/opt/fleet/lib/deploy-static.sh flipbook-trace dist
```

Post-deployment identity, header, route, PWA/offline, and live browser evidence will be appended after publication.

## Known gaps

None in the product. The pre-existing modified `graphify-out/` files were preserved and are deliberately excluded from repair commits.
