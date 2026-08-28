# Polish round 1 — review closure

Repairs the full set of findings in `.factory/review-1.md` from candidate `c03c947d6a3c6263f7fa78fc043536ee1a472698`. Earlier verification records were also read; their remaining scope and storage concerns are included below.

Live recheck: <https://flipbook-trace.sociobot.in>, <https://flipbook-trace.sociobot.in/?demo=1>, <https://flipbook-trace.sociobot.in/privacy>, <https://flipbook-trace.sociobot.in/terms>, and <https://flipbook-trace.sociobot.in/missing-page>. The first demo frames are captured in `test-results/polish-demo-390.png` and `test-results/polish-demo-1440.png`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added the compact twelve-frame `#demo-strip` immediately below the demo heading. | `@claim:demo-ready`; `the one-click demo shows a sample frame…`; screenshot paths above; live `/?demo=1` check passed. |
| F-1-2 | Added designed `public/404.html` and SWA `responseOverrides.404` rewrite. | `the deployment configuration…`; `the designed static 404 artifact is served with HTTP 404`; live `/missing-page` returned HTTP 404. |
| F-1-3 | The demo claim now starts on `/`, clicks once, and checks URL, banner, count, and viewport output. | `@claim:demo-ready`. |
| F-1-4 | Demo now skips all real storage/license initialization; the claim pre-seeds and instruments reads/opens, resets, and restores real mode. | `@claim:demo-isolation`. |
| F-1-5 | The clip claim uses a six-second WebM and proves 1.0/5.0 success plus 0.5/5.1 recovery. | `@claim:clip-workflow`. |
| F-1-6 | The privacy claim rejects every non-GET/HEAD request, request body, and off-origin request during import/export. | `@claim:local-processing`. |
| F-1-7 | The retention claim inspects all IndexedDB records, Cache Storage, OPFS, blobs, then reloads. | `@claim:ephemeral-project`. |
| F-1-8 | PDF output now declares frame/cell/layout metadata; the claim parses the page tree, 12 cells, 4 columns, page image, JPEG and size. | `@claim:pdf-export`. |
| F-1-9 | Studio claim loads a known 320×200 video, checks 1920 and original-width PNG headers, then six-column PDF metadata. | `@claim:studio-quality`. |
| F-1-10 | Checkout claim follows the production redirect and asserts the Dodo session’s product, USD 9.00, and one-time wording. | `@claim:studio-purchase`; live production checkout endpoint was rechecked during deploy verification. |
| F-1-11 | Removed unsupported format names; copy says “Choose a video this browser can play.” | copy audit; live landing/demo recheck passed. |
| F-1-12 | Registered the update statement with an isolated changed-worker claim test. | `@claim:app-update-check`. |
| F-1-13 | Registered browser-data deletion and clear-origin regression. | `@claim:browser-data-deletion`. |
| F-1-14 | Removed unprovable refund/merchant statements; retained checkout and license-transfer statements have recorded claim tests. | `@claim:studio-purchase`, `@claim:studio-license-check`; copy audit. |
| F-1-15 | Route metadata now updates title, description, canonical, Open Graph URL/title/description, and Twitter values. | `updates Open Graph and Twitter route metadata`; live route check passed on all five URLs above. |
| F-1-16 | Standardized the user input as “video” and duration as “selected section” across UI and README. | copy audit; `rg` terminology check; live landing/demo recheck passed. |
| F-1-17 | Standardized printable output as “PDF trace sheet” across UI, README, claims, and export. | `@claim:pdf-export`; copy audit. |
| F-1-18 | Replaced source-width jargon with “your video’s original width.” | copy audit; `@claim:studio-quality`. |
| F-1-19 | Replaced merchant-of-record jargon with “Dodo opens checkout for Sociobot.” | copy audit; `@claim:studio-purchase`. |
| F-1-20 | Rewrote hero kicker as “Local video → printable trace sheet.” | copy audit; screenshot evidence. |
| F-1-21 | Replaced “Line threshold” with “Line detail” and a direction hint. | `@claim:trace-controls`; accessibility route scan. |
| F-1-22 | Replaced README animation jargon with “show the previous frame in red.” | copy audit. |
| F-1-23 | Replaced implementation wording with “Install the app and reopen the demo offline.” | copy audit; `@claim:offline-reload`, `@claim:pwa-installable`. |
| F-1-24 | Explained retained browser data before naming IndexedDB/localStorage technical details. | copy audit; `@claim:browser-data-deletion`, `@claim:studio-license-check`. |
| F-1-25 | Rewrote deployment instructions around observable routing and 404 behavior. | `the deployment configuration…`; `the designed static 404 artifact is served with HTTP 404`. |

## Final verification set

- Every claim command in `.factory/claims.json` was run from a clean clone after the repair commit.
- `npm run test:unit`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass locally.
- The browser suite includes axe serious/critical checks, console checks, keyboard/mobile regressions, offline reload, and the service-worker update regression.
- The deployed cold-route check passed and is recorded in `.factory/handoff.md`.
