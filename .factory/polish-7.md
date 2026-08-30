# Polish round 7 — zero-finding closure

Base review: `6538086fd9bf752e72d4112a76697b062bf260d6`<br>
Source repair: `5ffd7e744351ff63db3caeb0c2ce7270aa9e76db`<br>
Verification repair: `8017ef5`<br>
Deployment: `90e40fb5-41fd-45bc-bbdc-d2c639ae3cb6`<br>
Live URL: <https://flipbook-trace.sociobot.in>

Every finding in reviews 1–7 and prior polish records was rechecked. The
evidence screenshots are in `test-results/polish-7-*.png` (local) and
`/tmp/flipbook-polish7-live.tSGh62/cold-*.png` (cold live). The live checks in
this table use the deployed URL above; `/missing-page` returned HTTP 404.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the twelve-frame paper-bird preview above demo controls. | `@claim:demo-ready`; `test-results/polish-7-demo-first-390.png`; live `/?demo=1` first frame bottom 520.44 px. |
| F-1-2 | Kept `404.html` and the SWA 404 rewrite. | `the deployment configuration returns the designed 404 artifact for unknown URLs`; `/tmp/flipbook-polish7-live.tSGh62/cold-missing-page.png`; live `/missing-page` 404. |
| F-1-3 | Kept one landing click into the isolated demo. | `@claim:demo-ready`; `test-results/polish-7-demo-first-390.png`; live `/` → `/?demo=1`. |
| F-1-4 | Kept demo separate from real settings and license storage. | `@claim:demo-isolation`; `/tmp/flipbook-polish7-live.tSGh62/cold-one-click-demo.png`; live demo reset and real-mode exit. |
| F-1-5 | Kept 1.0/5.0-second success and 0.5/5.1-second recovery checks. | `@claim:clip-workflow`; live `/` workspace. |
| F-1-6 | Kept the settled-shell guard that rejects every workflow HTTP request. | `@claim:local-processing`; `the local-processing request guard rejects a same-origin collection GET fixture`; live `/privacy`. |
| F-1-7 | Kept recursive IndexedDB, cache, OPFS, and web-storage content snapshots. | `@claim:ephemeral-project`; live `/privacy`. |
| F-1-8 | Kept independent decoding of twelve numbered non-blank PDF cells. | `@claim:pdf-export`; live `/?demo=1` export controls. |
| F-1-9 | Kept measured Studio PNG widths and decoded six-column PDF output. | `@claim:studio-quality`; live `/` Studio controls. |
| F-1-10 | Kept checkout product, USD 9.00, and one-time assertions. | `@claim:studio-purchase`; live `/` checkout link. |
| F-1-11 | Kept browser-playable-video wording without format promises. | `published copy names the ZIP download a numbered PNG pack everywhere`; live `/`. |
| F-1-12 | Kept the registered worker-update behavior test. | `@claim:app-update-check`; live `/privacy`. |
| F-1-13 | Kept the clear-origin settings and license deletion test. | `@claim:browser-data-deletion`; live `/privacy`. |
| F-1-14 | Kept refund and automatic-revocation promises out of all purchase copy. | `@claim:studio-purchase`; live `/`, `/terms`, and README audit. |
| F-1-15 | Kept route-specific title, description, canonical, Open Graph, and Twitter values. | `updates Open Graph and Twitter route metadata`; cold live `/`, `/?demo=1`, `/privacy`, `/terms`, `/missing-page`. |
| F-1-16 | Kept **video** and **selected section** as the input terms. | `.factory/copy-audit.md`; live `/` and `/?demo=1`. |
| F-1-17 | Kept **PDF trace sheet** as the printable output term. | `@claim:pdf-export`; live `/` and `/?demo=1`. |
| F-1-18 | Kept **your video's original width** in Studio copy. | `@claim:studio-quality`; live `/`. |
| F-1-19 | Kept plain Dodo checkout wording and removed payment jargon. | `@claim:studio-purchase`; live `/` and `/terms`. |
| F-1-20 | Kept the local-video to printable-sheet hero kicker. | `.factory/copy-audit.md`; `/tmp/flipbook-polish7-live.tSGh62/cold-home.png`; live `/`. |
| F-1-21 | Kept **Line detail** with directional help. | `@claim:trace-controls`; live `/?demo=1`. |
| F-1-22 | Kept **Pencil edges** and the plain previous-frame label. | `@claim:trace-controls`; live `/?demo=1`. |
| F-1-23 | Kept user-result offline and install wording. | `@claim:offline-reload`, `@claim:pwa-installable`; live offline `/?demo=1` restored 12 frames. |
| F-1-24 | Kept the user-facing stored-data explanation before storage names. | `@claim:browser-data-deletion`, `@claim:studio-license-check`; live `/privacy`. |
| F-1-25 | Kept plain deploy/routing/404/header documentation. | static-404 tests; live `/missing-page` headers and 404. |
| F-2-1 | Kept functional in-memory demo regeneration and reset. | `@claim:demo-workflow`; live `/?demo=1` supports 12 → 60 → 12. |
| F-2-2 | Kept all three landing facts in the mobile first viewport. | `the 390 px landing screen keeps all three facts above the fold`; live `/` facts bottom 733.16 px. |
| F-2-3 | Kept the registered 960 px free-output claim. | `@claim:free-quality`; live `/`. |
| F-2-4 | Kept static-404 metadata and icons. | `the deployment configuration returns the designed 404 artifact for unknown URLs`; live `/missing-page`. |
| F-2-5 | Kept shared navigation, policy links, attribution, and build id on static 404. | static-404 mobile-target test; live `/missing-page`. |
| F-2-6 | Kept the caption **Six moments become six frames to trace.** | `.factory/copy-audit.md`; live `/`. |
| F-2-7 | Kept README prose below the 22-word cap. | `.factory/copy-audit.md`; README audit. |
| F-2-8 | Kept **Pencil edges** as the only trace-style name. | `@claim:trace-controls`; live `/?demo=1`. |
| F-2-9 | Kept **hand-drawn flipbook** for the goal and **paper-bird sample** for the demo. | `@claim:demo-ready`; live `/` and `/?demo=1`. |
| F-2-10 | Kept **Import or export settings** as the disclosed result. | `@claim:settings-portability`; live `/?demo=1`. |
| F-3-1 | Kept exhaustive 44×44 px mobile action checks, including static 404. | five mobile-target tests and static-404 target test; `test-results/polish-7-targets-*.png`; cold live route screenshots. |
| F-5-1 | Kept the all-request license-token oracle and duplicate-destination negative fixture. | `@claim:studio-license-check`; `the Studio-license request guard rejects a second token-bearing destination`; live `/privacy`. |
| F-5-2 | Kept direct error and destination wording for both 404 implementations. | `the SPA not-found route names the error and its destination in plain words`; live `/missing-page`. |
| F-6-1 | Kept unproved refund and automatic-revocation copy removed. | `@claim:studio-purchase`; live `/`, `/terms`, README audit. |
| F-6-2 | Kept **Dodo opens the checkout for Sociobot.** | `@claim:studio-purchase`; live `/` and `/terms`. |
| F-7-1 | Standardized the ZIP result as **numbered PNG pack** in UI, metadata, README, catalog, claims, and status messages. | `published copy names the ZIP download a numbered PNG pack everywhere`; cold live `/`. |
| F-7-2 | Standardized the frequency control as **frames each second**. | `published copy uses frames each second for the frequency setting`; cold live `/` and `/?demo=1`. |
| F-7-3 | Rewrote each method heading to name its object or result. | `method headings name the video, tracing lines, and export`; cold live `/`. |
| F-7-4 | Replaced generic kickers with trace-specific labels and renamed the stamp **STUDIO**. | `section labels describe Flipbook Trace tasks and the paid tier is Studio`; cold live `/`. |
| F-7-5 | Renamed the disclosure **Verify a Studio license**. | `Studio license disclosure names the verification form`; cold live `/`. |

## Verification

- Fresh clone: `/tmp/flipbook-polish7-clean.rDynEx/repo` at `8017ef5`.
- `npm ci` completed with no vulnerabilities reported. Every one of the 19 exact
  commands in `.factory/claims.json` passed independently.
- The same clone passed `npm run test:unit` (3/3), `npm run lint`, `npm run
  typecheck`, `npm test` (64/64), and `npm run build`.
- Local screenshots: `test-results/polish-7-demo-first-390.png`,
  `test-results/polish-7-demo-first-1440.png`, and
  `test-results/polish-7-targets-*.png`.
- Post-deploy `verify-url.sh` evidence: `/tmp/flipbook-polish7-live.tSGh62`.
  Home and demo have one H1/main, `lang=en`, zero missing image alternatives,
  zero unlabeled buttons, and no console errors.
- Fresh live Playwright axe checks found zero serious/critical violations on
  `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and `/missing-page`.
- Live offline demo reload restored twelve frames; the real-mode return removed
  the demo banner; client navigation focused the destination H1.
- Live Lighthouse report: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1,209 ms, CLS 0, TBT 27.5 ms.

No finding remains open.
