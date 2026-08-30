# Polish round 6 — zero-finding closure

Base candidate: `c48eee9ea190f09f6cc8f186c8dec7a19d29b9b5`

Repair commit: `eff8868e45fad0974d4c196ed9dfccbaf398d656`
Deployed URL: <https://flipbook-trace.sociobot.in>

The prior reviews and polish records were reread. Every finding is mapped to a retained or added repair, automated proof, screenshot, and live recheck.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the twelve-frame paper-bird strip before demo controls. | `@claim:demo-ready`; `test-results/polish-6-demo-390.png`; live `/?demo=1` cold audit. |
| F-1-2 | Kept static `404.html` and the SWA 404 response override. | Static-404 tests; `test-results/polish-6-missing-390.png`; live `/missing-page` HTTP 404. |
| F-1-3 | Kept landing action → demo URL/banner/frame coverage. | `@claim:demo-ready`; `test-results/polish-6-demo-390.png`; live one-click path. |
| F-1-4 | Kept pre-seeded real-store instrumentation and isolated demo state. | `@claim:demo-isolation`; demo screenshot; live banner/reset/start-for-real audit. |
| F-1-5 | Kept 1.0/5.0 success and 0.5/5.1 recovery coverage. | `@claim:clip-workflow`; home screenshot; live workspace route. |
| F-1-6 | Kept the settled-shell guard that rejects every unexpected request, including same-origin collection GETs. | `@claim:local-processing`; privacy suite; live demo traffic check. |
| F-1-7 | Kept recursive IndexedDB, cache-body, OPFS, and web-storage snapshots with source sentinel. | `@claim:ephemeral-project`; privacy suite; live reset/start audit. |
| F-1-8 | Kept independent decoding of twelve numbered non-blank PDF cells. | `@claim:pdf-export`; demo screenshot; live export controls. |
| F-1-9 | Kept measured 1920px/original-width PNG and six-column PDF coverage. | `@claim:studio-quality`; `test-results/polish-6-home-1440.png`; live Studio panel. |
| F-1-10 | Kept checkout product, price, and one-time assertions. | `@claim:studio-purchase`; `/tmp/flipbook-polish6-live-home-390.png`; live Dodo checkout. |
| F-1-11 | Kept browser-playable-video wording without untested format names. | Copy audit; home screenshot; live `/`. |
| F-1-12 | Kept registered changed-worker update proof. | `@claim:app-update-check`; PWA suite; live `/privacy`. |
| F-1-13 | Kept clear-origin settings/license regression. | `@claim:browser-data-deletion`; `/tmp/flipbook-polish6-live-privacy.png`; live `/privacy`. |
| F-1-14 | Removed unprovable refund behavior and narrowed the checkout claim. | Updated `@claim:studio-purchase`; `/tmp/flipbook-polish6-live-terms-390.png`; live `/`, `/terms`, README. |
| F-1-15 | Kept route-specific title, description, canonical, Open Graph, and Twitter values. | Route-metadata tests; 404 screenshot; live route audit. |
| F-1-16 | Kept **video** and **selected section** terminology. | Copy audit; home/demo screenshots; live `/` and demo. |
| F-1-17 | Kept **PDF trace sheet** as the printable-output term. | `@claim:pdf-export`; demo screenshot; live workspace. |
| F-1-18 | Kept **your video's original width** wording. | `@claim:studio-quality`; home screenshot; live Studio panel. |
| F-1-19 | Replaced payment jargon with a plain observed checkout sentence. | Updated `@claim:studio-purchase`; live terms screenshot; live `/`, `/terms`, README. |
| F-1-20 | Kept the output-naming hero kicker. | Copy audit; home screenshot; live `/`. |
| F-1-21 | Kept **Line detail** and its directional help. | `@claim:trace-controls`; demo screenshot; live demo. |
| F-1-22 | Kept **Pencil edges** and plain previous-frame wording. | `@claim:trace-controls`; copy audit; live demo. |
| F-1-23 | Kept user-result install/offline wording. | `@claim:offline-reload`, `@claim:pwa-installable`; PWA suite; live `/privacy`. |
| F-1-24 | Kept storage explanation before implementation names. | `@claim:browser-data-deletion`, `@claim:studio-license-check`; privacy screenshot; live `/privacy`. |
| F-1-25 | Kept plain deployment, routing, 404, and header instructions. | Static-404 tests; 404 screenshot; live `/missing-page` headers. |
| F-2-1 | Kept interactive in-memory sample generation; section/rate changes regenerate 12→60 frames and reset defaults. | `@claim:demo-workflow`; `/tmp/flipbook-polish6-live-demo-390.png`; live reset. |
| F-2-2 | Kept compact mobile hero facts. | Landing-fold tests; live home screenshot; live 390px fold. |
| F-2-3 | Kept registered free 960px output proof. | `@claim:free-quality`; home screenshot; live free option. |
| F-2-4 | Kept static-404 canonical, OG URL, favicon, and Apple icon. | Static-404/metadata tests; 404 screenshot; live missing route. |
| F-2-5 | Kept shared navigation, policy links, attribution, and build id on static 404. | Static-404 target test; 404 screenshot; live missing route. |
| F-2-6 | Kept **Six moments become six frames to trace.** | Copy audit; home screenshot; live `/`. |
| F-2-7 | Kept short README deployment sentences. | Copy audit; README audit; live routing behavior. |
| F-2-8 | Kept **Pencil edges** as the one style name. | `@claim:trace-controls`; demo screenshot; live demo. |
| F-2-9 | Kept **hand-drawn flipbook** and **paper-bird sample**. | `@claim:demo-ready`; live demo screenshot; live `/` and demo. |
| F-2-10 | Kept **Import or export settings**. | `@claim:settings-portability`; demo screenshot; live demo. |
| F-3-1 | Kept exhaustive 44×44px mobile-action enumeration, including static 404. | Five mobile target tests; live home screenshot; live 390px enumeration. |
| F-5-1 | Kept all-request license-token oracle and duplicate-destination negative fixture. | `@claim:studio-license-check`; privacy suite; live explicit verification path. |
| F-5-2 | Kept plain error/destination wording on SPA, static 404, and fallback. | Static/SPA 404 tests; `/tmp/flipbook-polish6-live-missing.png`; live missing route. |
| F-6-1 | Removed the refund and automatic-revocation promises instead of repeating unproved behavior. | `@claim:studio-purchase` now asserts their absence; live terms screenshot and live purchase surfaces. |
| F-6-2 | Replaced “merchant of record” with “Dodo opens the checkout for Sociobot.” | Updated `@claim:studio-purchase`; live home screenshot; live checkout redirect. |

## Verification

- Fresh clone: `/tmp/flipbook-polish6-clean.a6HgPl/repo` at `eff8868e45fad0974d4c196ed9dfccbaf398d656`.
- All 19 commands in `.factory/claims.json` passed independently. Logs: `/tmp/flipbook-polish6-clean.a6HgPl/logs/claim-*.log`.
- Fresh clone gates passed: unit 3/3, lint, typecheck, browser 59/59, and production build. Initial browser JS is 7.96 KB gzip; CSS is 2.29 KB gzip.
- Local `verify-url.sh` passed at `/tmp/flipbook-polish6-local-verify.n9Iu7I`. Axe found zero serious/critical violations on `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page`.
- Deployed with `/opt/fleet/lib/deploy-static.sh flipbook-trace dist`. Cold live verifier evidence is `/tmp/flipbook-polish6-live-verify.cusxIx`; live axe, metadata, targets, first-fold, demo, reset, real-mode return, legal copy, 404, and checkout checks passed.

No review finding remains open.
