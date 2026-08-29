# Polish round 5 — zero-finding closure

Base review: `2b1664fbdb98d3b5b5c0d4cfd0d527c725ced1cb`  
Repair commit: `7dbede304e244d91908f568c14f8bbae434e555c`  
Deployed URL: <https://flipbook-trace.sociobot.in>  
Static deployment: `b07f3ac6-3364-4561-8469-364647d244be`

This round reread review and polish records 1–5. Every listed finding is mapped below. Earlier changes were retained and exercised by the current full suite; the three reopened privacy tests and the 404 copy were strengthened in this repair.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the twelve-frame paper-bird strip before demo controls. | `@claim:demo-ready`; `test-results/polish-5-demo-first-390.png`; live `/?demo=1` cold check. |
| F-1-2 | Retained `404.html` and the SWA 404 response override. | Static-404 test; live `/missing-page` returned HTTP 404. |
| F-1-3 | Retained the landing click → demo URL/banner/frame assertion. | `@claim:demo-ready`; live one-click check. |
| F-1-4 | Retained pre-seeded real storage and demo read/open isolation instrumentation. | `@claim:demo-isolation`. |
| F-1-5 | Retained 1.0/5.0 success and 0.5/5.1 recovery boundaries. | `@claim:clip-workflow`. |
| F-1-6 | Replaced partial request filtering with a settled-shell guard that rejects every HTTP request, including same-origin GET queries; added the `/collect?video=sentinel` negative fixture. | `@claim:local-processing`; `the local-processing request guard rejects a same-origin collection GET fixture`. |
| F-1-7 | Replaced key/top-level checks with recursive snapshots of all IndexedDB values, Cache Storage response bodies, OPFS files, and local/session storage; compares each phase to the settled app-shell baseline and checks a generated source-byte sentinel. | `@claim:ephemeral-project`. |
| F-1-8 | Retained independent JPEG-page decoding for twelve numbered, non-blank PDF cells. | `@claim:pdf-export`. |
| F-1-9 | Retained measured Studio PNGs and independent six-column PDF rendering checks. | `@claim:studio-quality`. |
| F-1-10 | Retained live checkout product, USD 9.00, and one-time checks. | `@claim:studio-purchase`. |
| F-1-11 | Retained browser-playable-video wording without named untested formats. | `.factory/copy-audit.md`; landing check. |
| F-1-12 | Retained one registered worker-update claim. | `@claim:app-update-check`. |
| F-1-13 | Retained clear-origin settings/license regression. | `@claim:browser-data-deletion`. |
| F-1-14 | Retained only checkout/license privacy wording with executable proof. | `@claim:studio-purchase`, `@claim:studio-license-check`. |
| F-1-15 | Retained route-specific title, description, canonical, Open Graph, and Twitter metadata. | `updates Open Graph and Twitter route metadata`. |
| F-1-16 | Retained **video** and **selected section** terminology. | `.factory/copy-audit.md`. |
| F-1-17 | Retained **PDF trace sheet** terminology. | `@claim:pdf-export`; `.factory/copy-audit.md`. |
| F-1-18 | Retained **your video's original width** wording. | `@claim:studio-quality`. |
| F-1-19 | Retained plain Dodo checkout wording. | `@claim:studio-purchase`. |
| F-1-20 | Retained the output-naming hero kicker. | `test-results/polish-5-targets-home.png`. |
| F-1-21 | Retained **Line detail** and its directional help. | `@claim:trace-controls`. |
| F-1-22 | Retained **Pencil edges** and plain previous-frame wording. | `@claim:trace-controls`; README audit. |
| F-1-23 | Retained user-result offline/install wording. | `@claim:offline-reload`, `@claim:pwa-installable`. |
| F-1-24 | Retained user-facing stored-data explanation before implementation names. | `@claim:browser-data-deletion`, `@claim:studio-license-check`. |
| F-1-25 | Retained plain deployment instructions, headers, routing, and real 404 behavior. | Static-404 tests; live `/missing-page`. |
| F-2-1 | Retained the working in-memory demo generator and reset defaults. | `@claim:demo-workflow`; live 12→60→12. |
| F-2-2 | Retained compact mobile hero rhythm and fold assertion. | `the 390 px landing screen keeps all three facts above the fold`; live bottom 733.16 px. |
| F-2-3 | Retained the registered 960 px free export proof. | `@claim:free-quality`. |
| F-2-4 | Retained static-404 canonical, Open Graph URL, favicon, and Apple icon. | `the deployment configuration returns the designed 404 artifact for unknown URLs`. |
| F-2-5 | Retained shared static-404 navigation, legal links, attribution, and build id. | Static-404 test; live `/missing-page`. |
| F-2-6 | Retained **Six moments become six frames to trace.** | `.factory/copy-audit.md`; home screenshot. |
| F-2-7 | Retained short README deployment sentences. | `.factory/copy-audit.md`. |
| F-2-8 | Retained **Pencil edges** everywhere. | `@claim:trace-controls`; README audit. |
| F-2-9 | Retained **hand-drawn flipbook** and **paper-bird sample**. | `@claim:demo-ready`; `.factory/copy-audit.md`. |
| F-2-10 | Retained **Import or export settings**. | `@claim:settings-portability`. |
| F-3-1 | Retained universal 44×44 mobile target audit, including native control labels and static 404. | Five route target tests; `test-results/polish-5-targets-*.png`. |
| F-5-1 | Rewrote the license oracle to record every explicit-action request, require one exact GET to Sociobot with no body, and reject any second token carrier; added a duplicate-destination fixture. | `@claim:studio-license-check`; `the Studio-license request guard rejects a second token-bearing destination`; cold live request count `1`. |
| F-5-2 | Rewrote static and SPA 404s as **Page not found**, **The address does not match a page in Flipbook Trace**, and **Open Flipbook Trace**; rewrote all 404 descriptions. The offline fallback now also uses plain error copy. | `the SPA not-found route names the error and its destination in plain words`; static-404 tests; `/tmp/flipbook-polish5-live-404-390.png`. |

## Verification evidence

- Clean clone: `/tmp/flipbook-polish5-clean.OypP3x/repo` at `7dbede304e244d91908f568c14f8bbae434e555c`; `npm ci` completed with zero reported vulnerabilities.
- Each of the 18 exact commands in `.factory/claims.json` passed independently in that clone.
- Clean clone quality suite: unit 3/3, lint, typecheck, browser 47/47, and production build all passed.
- Current-worktree browser suite: 47/47 passed, producing `test-results/polish-5-demo-first-390.png`, `test-results/polish-5-demo-first-1440.png`, and `test-results/polish-5-targets-*.png`.
- Local `verify-url.sh`: `/tmp/flipbook-polish5-local-verify.pnQ7t3`; no console errors, one H1/main, `lang=en`, no missing image alternatives or unlabeled buttons.
- Local Lighthouse mobile: Performance 96, Accessibility 100, Best Practices 100, SEO 100; LCP 2.324 s, CLS 0, TBT 162 ms (`/tmp/flipbook-polish5-lighthouse.json`).
- Cold live checks: `/tmp/flipbook-polish5-live-verify.hVV0lW`; live JS, CSS, and service-worker SHA-256 values match `dist/`; live axe scans found zero serious/critical violations on `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page`.
