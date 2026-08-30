# Polish round 8 — zero-finding closure

Base review: `6e82b3eb4dcf039da3a71b476c3836ca8b6f52a5`  
Product repair: `4963ac1`  
Local evidence: `0dc6428`  
Deployment: `63de9570-2f5a-4fd9-a3bc-70befccfe754`  
Live URL: <https://flipbook-trace.sociobot.in>

Every finding in reviews 1–8 and every prior polish record was rechecked. Review
4 was a pass with no finding IDs. `audit.json` in both evidence directories is
the machine-readable route, link, Axe, keyboard, demo, privacy, purchase-link,
and offline record. Each row below names the repair or preserved closure and its
current evidence.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Preserved the ready twelve-frame paper-bird result above the demo controls. | `@claim:demo-ready`; `evidence-polish-8-live/demo-mobile.png`; live `/?demo=1`. |
| F-1-2 | Preserved the designed static 404 and SWA response override. | `the deployment configuration returns the designed 404 artifact for unknown URLs`; `evidence-polish-8-live/route-missing-page.png`; live `/missing-page` returned 404. |
| F-1-3 | Preserved the one-click landing action into isolated sample data. | `@claim:demo-ready`; `evidence-polish-8-live/home-mobile.png`; live `/` to `/?demo=1`. |
| F-1-4 | Preserved separate in-memory demo state that does not read settings or licenses. | `@claim:demo-isolation`; `evidence-polish-8-live/audit.json`; live demo reset and Start for real. |
| F-1-5 | Preserved exact 1–5 second acceptance and boundary recovery. | `@claim:clip-workflow`; clean-clone claim log `claim-clip-workflow.log`. |
| F-1-6 | Preserved the request oracle that rejects every workflow HTTP request. | `@claim:local-processing`; `the local-processing request guard rejects a same-origin collection GET fixture`; live audit has no off-origin demo request. |
| F-1-7 | Preserved recursive checks of IndexedDB, Cache Storage, OPFS, and web storage. | `@claim:ephemeral-project`; clean-clone claim log `claim-ephemeral-project.log`; live `/privacy`. |
| F-1-8 | Preserved independent decoding of twelve numbered, non-blank PDF cells. | `@claim:pdf-export`; clean-clone claim log `claim-pdf-export.log`; live demo PDF download. |
| F-1-9 | Preserved measured Studio PNG widths and six-column PDF output. | `@claim:studio-quality`; clean-clone claim log `claim-studio-quality.log`; live `/`. |
| F-1-10 | Replaced the external checkout probe with the versioned local contract fixture for Studio, USD 9.00, and one-time billing. | `@claim:studio-purchase`; `tests/fixtures/studio-checkout-contract.v1.json`; live buy-link check in `evidence-polish-8-live/audit.json`. |
| F-1-11 | Preserved browser-playable-video wording without a format promise. | `published copy names the ZIP download a numbered PNG pack everywhere`; live `/`. |
| F-1-12 | Preserved the registered worker update behavior claim. | `@claim:app-update-check`; clean-clone claim log `claim-app-update-check.log`. |
| F-1-13 | Preserved the browser-data deletion claim for settings and the saved license. | `@claim:browser-data-deletion`; clean-clone claim log `claim-browser-data-deletion.log`; live `/privacy`. |
| F-1-14 | Kept refund and automatic-revocation promises out of purchase copy. | `@claim:studio-purchase`; live `/`, `/terms`, and README assertions. |
| F-1-15 | Preserved route-specific titles, descriptions, canonicals, Open Graph, and Twitter metadata. | `updates Open Graph and Twitter route metadata`; all routes in `evidence-polish-8-live/audit.json`. |
| F-1-16 | Preserved **video** and **selected section** as the input terms. | `.factory/copy-audit.md`; live `/` and `/?demo=1`. |
| F-1-17 | Preserved **PDF trace sheet** as the printable output term. | `@claim:pdf-export`; live `/` and `/?demo=1`. |
| F-1-18 | Preserved **your video's original width** in Studio copy. | `@claim:studio-quality`; live `/`. |
| F-1-19 | Kept plain Dodo checkout wording and no payment jargon. | `@claim:studio-purchase`; live `/` and `/terms`. |
| F-1-20 | Preserved the local-video to printable-sheet hero label. | `.factory/copy-audit.md`; `evidence-polish-8-live/home-mobile.png`. |
| F-1-21 | Preserved **Line detail** with directional help. | `@claim:trace-controls`; live `/?demo=1`. |
| F-1-22 | Preserved **Pencil edges** and the plain previous-frame label. | `@claim:trace-controls`; live `/?demo=1`. |
| F-1-23 | Preserved user-result offline and install wording. | `@claim:offline-reload`; `@claim:pwa-installable`; live offline result in `evidence-polish-8-live/audit.json`. |
| F-1-24 | Preserved the user-facing stored-data explanation before implementation names. | `@claim:browser-data-deletion`; `@claim:studio-license-check`; live `/privacy`. |
| F-1-25 | Preserved plain deploy, routing, 404, and header documentation. | static-404 tests; live `/missing-page` route and link crawl in `evidence-polish-8-live/audit.json`. |
| F-2-1 | Preserved functional sample regeneration and reset in memory. | `@claim:demo-workflow`; live audit records 12 to 60 to 12. |
| F-2-2 | Preserved all three landing facts inside the 390×844 first screen. | `the 390 px landing screen keeps all three facts above the fold`; `evidence-polish-8-live/home-mobile.png`. |
| F-2-3 | Preserved and tested the free 960 px export. | `@claim:free-quality`; clean-clone claim log `claim-free-quality.log`. |
| F-2-4 | Preserved static-404 metadata and icons. | static-404 artifact test; `evidence-polish-8-live/route-missing-page.png`. |
| F-2-5 | Preserved shared navigation, legal links, attribution, and build ID on the static 404. | static-404 target test; live route audit asserts legal links and `v1.0.19`. |
| F-2-6 | Preserved the caption **Six moments become six frames to trace.** | `.factory/copy-audit.md`; live `/`. |
| F-2-7 | Preserved README prose below the 22-word cap. | `.factory/copy-audit.md`; README copy audit. |
| F-2-8 | Preserved **Pencil edges** as the single name for that trace style. | `@claim:trace-controls`; live demo. |
| F-2-9 | Preserved **hand-drawn flipbook** for the goal and **paper-bird sample** for the demo. | `@claim:demo-ready`; live `/` and `/?demo=1`. |
| F-2-10 | Preserved **Import or export settings** as the disclosed result. | `@claim:settings-portability`; live `/?demo=1`. |
| F-3-1 | Preserved exhaustive 44×44 px checks on every mobile action, including static 404. | five route target tests plus static-404 target test; live route screenshots in `evidence-polish-8-live/`. |
| F-5-1 | Preserved the all-request license-token oracle and duplicate-destination negative fixture. | `@claim:studio-license-check`; `the Studio-license request guard rejects a second token-bearing destination`; live `/privacy`. |
| F-5-2 | Preserved direct error and destination wording in both 404 implementations. | `the SPA not-found route names the error and its destination in plain words`; live `/missing-page`. |
| F-6-1 | Kept unproved refund and automatic-revocation copy removed. | `@claim:studio-purchase`; live `/`, `/terms`, and README assertions. |
| F-6-2 | Preserved **Dodo opens the checkout for Sociobot.** | `@claim:studio-purchase`; live `/` and `/terms`. |
| F-7-1 | Preserved **numbered PNG pack** across UI, metadata, README, catalog, claims, and statuses. | `published copy names the ZIP download a numbered PNG pack everywhere`; live `/`. |
| F-7-2 | Preserved **frames each second** for the frequency control. | `published copy uses frames each second for the frequency setting`; live `/` and demo. |
| F-7-3 | Preserved method headings that name the video, tracing lines, and export. | `method headings name the video, tracing lines, and export`; live `/`. |
| F-7-4 | Preserved trace-specific section labels and the **STUDIO** paid label. | `section labels describe Flipbook Trace tasks and the paid tier is Studio`; live `/`. |
| F-7-5 | Preserved **Verify a Studio license** as the disclosure label. | `Studio license disclosure names the verification form`; live `/`. |
| F-8-1 | Moved `content-visibility: auto` from the interactive `.preview-zone` to the non-interactive `.frame-strip`. Added a real sequential-Tab test that operates the threshold and activates both exports with Enter. | `sequential keyboard navigation reaches and activates both demo exports`; `evidence-polish-8-live/demo-keyboard-mobile.png`; live audit visited every control and downloaded PNG and PDF. |
| F-8-2 | Replaced both external checkout requests with a versioned local contract fixture. The claim now checks the published endpoint, Dodo session shape, product, USD $9.00, and one-time terms without leaving the sandbox. | `@claim:studio-purchase`; clean-clone `claim-studio-purchase.log`; live buy-link assertion in `evidence-polish-8-live/audit.json`. |
| V18-1 | Closed the reopened keyboard defect with sequential Tab and Enter coverage at 390×844. | Same evidence as F-8-1; live `/?demo=1`. |

## Verification

- Clean clone: `/tmp/flipbook-polish8-clean.OvCN7i/repo` at `4963ac1`.
- `npm ci` reported zero vulnerabilities. All 19 exact commands from
  `.factory/claims.json` passed independently.
- The clean clone passed `npm run test:unit` (3/3), `npm run lint`, `npm run
  typecheck`, `npm test` (64/64), and `npm run build`.
- Local and cold-live `verify-url.sh` checks passed home and demo. The enhanced
  browser audit passed all six routes, internal-link crawl, legal links, build
  ID, first-screen checks, sequential keyboard exports, demo reset, privacy
  request log, and offline reload.
- Axe found zero serious or critical issues on every route. Browser console
  errors were zero.
- Cold live Lighthouse: home 100/100/100/100 and demo 99/100/100/100 for
  Performance/Accessibility/Best Practices/SEO. Home LCP was 1,201 ms; demo
  LCP was 1,061 ms. CLS was 0 and 0.062 respectively.

No finding remains open.
