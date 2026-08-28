# Polish round 2 — cumulative review closure

Repair commit: `64088d32b77a9b9b0261e4b6b889944d2bbe8c55` (built as v1.0.3). This round read `.factory/review-1.md`, `.factory/review-2.md`, `.factory/polish-1.md`, the earlier verification records, and the previous handoff. It closes every listed finding, including the earlier findings that review 2 reopened.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the compact twelve-frame strip immediately below the demo heading. | `@claim:demo-ready`; `test-results/polish-2-demo-390.png`, `test-results/polish-2-demo-1440.png`; live `/?demo=1`. |
| F-1-2 | Retained the static `404.html` response override and tested the real artifact. | `the designed static 404 artifact is served with HTTP 404`; live `/missing-page`. |
| F-1-3 | Kept the landing-click assertion for the named demo action. | `@claim:demo-ready`. |
| F-1-4 | Kept pre-seeded storage and IndexedDB read/open instrumentation. | `@claim:demo-isolation`. |
| F-1-5 | Kept both accepted 1.0/5.0 and rejected 0.5/5.1 video boundaries. | `@claim:clip-workflow`. |
| F-1-6 | Kept request interception that rejects uploads, bodies, and off-origin traffic. | `@claim:local-processing`. |
| F-1-7 | Added localStorage and sessionStorage snapshots before import, after generation, and after reload. | `@claim:ephemeral-project`. |
| F-1-8 | Replaced self-declared PDF markers with independent JPEG extraction/decoding and checks for twelve numbered non-blank cells. | `@claim:pdf-export`. |
| F-1-9 | Independently decodes the Studio PDF and verifies six visible numbered cells across its first row. | `@claim:studio-quality`. |
| F-1-10 | Retained live checkout product, USD 9.00, and one-time assertions. | `@claim:studio-purchase`. |
| F-1-11 | Retained plain browser-playable-video wording instead of named format promises. | Copy audit and live landing. |
| F-1-12 | Retained the registered update claim and changed-worker regression. | `@claim:app-update-check`. |
| F-1-13 | Retained the clear-origin deletion regression. | `@claim:browser-data-deletion`. |
| F-1-14 | Retained only checkout/license statements that have executable proof. | `@claim:studio-purchase`, `@claim:studio-license-check`. |
| F-1-15 | Retained SPA route-specific title, description, canonical, Open Graph, and Twitter updates. | `updates Open Graph and Twitter route metadata`; live `/`, `/?demo=1`, `/privacy`, `/terms`. |
| F-1-16 | Retained **video** and **selected section** as the only input/range terms. | `.factory/copy-audit.md`; live landing and demo. |
| F-1-17 | Retained **PDF trace sheet** for the printable output throughout. | `@claim:pdf-export`; copy audit. |
| F-1-18 | Retained the plain phrase **your video's original width**. | `@claim:studio-quality`; README. |
| F-1-19 | Retained the plain checkout wording. | `@claim:studio-purchase`; landing and terms. |
| F-1-20 | Retained the plain hero kicker naming the printable trace sheet. | Copy audit; live landing. |
| F-1-21 | Retained **Line detail** and the direction hint. | `@claim:trace-controls`; live demo. |
| F-1-22 | Changed README to **Pencil edges**. | README copy audit. |
| F-1-23 | Retained user-result wording for installing and offline reopening. | `@claim:offline-reload`, `@claim:pwa-installable`. |
| F-1-24 | Retained storage explanation before technical storage names. | `@claim:browser-data-deletion`, `@claim:studio-license-check`. |
| F-1-25 | Split the deploy instruction into readable routing and security sentences. | README copy audit. |
| F-2-1 | The in-memory paper-bird demo now regenerates source/output frames from the selected section and rate; reset restores twelve defaults. | `@claim:demo-workflow`; demo screenshots; live `/?demo=1`. |
| F-2-2 | Reduced the 390px hero rhythm and added the mobile fact-block fold assertion. | `the 390 px landing screen keeps all three facts above the fold`; live `/`. |
| F-2-3 | Added the `free-quality` claim and an unlicensed 960px PNG-header assertion; clarified README wording. | `@claim:free-quality`; `.factory/claims.json`. |
| F-2-4 | Added static-404 canonical and Apple touch icon; Open Graph URL matches the static 404 canonical. | `the deployment configuration returns the designed 404 artifact for unknown URLs`; live `/missing-page`. |
| F-2-5 | Added the shared Demo/How it works/Privacy navigation and the v1.0.3 footer line to static 404. | Same static-404 test; live `/missing-page`. |
| F-2-6 | Changed the caption to **Six moments become six frames to trace.** | Copy audit; live landing. |
| F-2-7 | Split the overlong deploy sentence. | README copy audit. |
| F-2-8 | Standardized the style name to **Pencil edges**. | README and `@claim:trace-controls`. |
| F-2-9 | Standardized the goal to **hand-drawn flipbook** and the demo to **paper-bird sample**. | Copy audit; live landing/demo. |
| F-2-10 | Renamed the disclosure **Import or export settings**. | `@claim:settings-portability`; live workspace. |

## Verification evidence

- Clean clone: `/tmp/flipbook-polish2-clean` at `64088d32b77a9b9b0261e4b6b889944d2bbe8c55`; `npm ci` passed with zero reported vulnerabilities.
- Every exact command in `.factory/claims.json` passed independently from that clone. The complete terminal record is `/tmp/flipbook-polish2-claims.log`.
- Local quality suite: `npm run test:unit`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` all passed. The full browser suite reports 39 passing tests, including axe, keyboard, mobile, privacy, offline, PWA, update, route, and console checks.
- Screenshots: `test-results/polish-2-demo-390.png`, `test-results/polish-2-demo-1440.png`, and `test-results/polish-2-404.png`.
- Live cold-route and accessibility evidence is recorded in `.factory/handoff.md` after deployment.
