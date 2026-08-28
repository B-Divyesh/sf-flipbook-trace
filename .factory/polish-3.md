# Polish round 3 — cumulative finding closure

Base review commit: `caace7c8a75f040d5414b553f1ef897e73762a30`  
Repair commit: `dc93f6fe058b843d5c6511d2423888add15f18a6`  
Deployed URL: <https://flipbook-trace.sociobot.in>  
Deployment ID: `ec53f1c5-b006-45c4-84ee-8635d1b3be71`

Every review and polish record was reread. The 35 earlier findings remain closed. Round 3's mobile-target defect is fixed without changing the risograph worktable identity.

Screenshot evidence:

- Local mobile routes: `test-results/polish-3-targets-home.png`, `test-results/polish-3-targets-demo.png`, `test-results/polish-3-targets-privacy.png`, `test-results/polish-3-targets-terms.png`, `test-results/polish-3-targets-missing-page.png`, and `test-results/polish-3-targets-static-404.png`.
- Cold live routes: `/tmp/flipbook-polish3-live/live-home-390.png`, `/tmp/flipbook-polish3-live/live-demo-390.png`, `/tmp/flipbook-polish3-live/live-privacy-390.png`, `/tmp/flipbook-polish3-live/live-terms-390.png`, and `/tmp/flipbook-polish3-live/live-404-390.png`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept twelve compact paper-bird frames directly below the demo heading. | `@claim:demo-ready`; demo screenshots; live `/?demo=1` first frame bottom `520.44 px`. |
| F-1-2 | Kept the designed static 404 and SWA 404 response override. | `the designed static 404 artifact is served with HTTP 404`; static-404 screenshot; live `/missing-page` returned 404. |
| F-1-3 | Kept the landing-to-demo single-click assertion. | `@claim:demo-ready`; home and demo screenshots; live `/` → `/?demo=1`. |
| F-1-4 | Kept pre-seeded real storage, read/open instrumentation, reset, and real-mode restoration checks. | `@claim:demo-isolation`; demo screenshot; live demo left real settings and license unchanged, then restored threshold 199. |
| F-1-5 | Kept accepted 1.0/5.0-second and rejected 0.5/5.1-second boundaries. | `@claim:clip-workflow`; home screenshot; live `/` workspace checked. |
| F-1-6 | Kept rejection of every upload, body-bearing request, and off-origin processing request. | `@claim:local-processing`; home screenshot; deployed asset matched the tested build. |
| F-1-7 | Kept inspection of IndexedDB, Cache Storage, OPFS, localStorage, sessionStorage, and reload state. | `@claim:ephemeral-project`; home screenshot; live demo isolation and offline reload passed. |
| F-1-8 | Kept independent JPEG-page decoding with twelve numbered, non-blank, four-column cells. | `@claim:pdf-export`; demo screenshot; live `/?demo=1` export action present in the matching build. |
| F-1-9 | Kept measured 1920 px/original-width PNGs and decoded six-column PDF output. | `@claim:studio-quality`; home screenshot; live `/` Studio controls checked. |
| F-1-10 | Kept the live checkout contract assertion for product, USD 9.00, and one-time billing. | `@claim:studio-purchase`; home screenshot; live checkout returned 303 and its page showed all three values. |
| F-1-11 | Kept format copy limited to a video the current browser can play. | `.factory/copy-audit.md`; home screenshot; live `/` copy checked. |
| F-1-12 | Kept update behavior as a registered claim with a changed-worker test. | `@claim:app-update-check`; privacy screenshot; live `/privacy`. |
| F-1-13 | Kept browser-data deletion as a registered clear-origin test. | `@claim:browser-data-deletion`; privacy screenshot; live `/privacy`. |
| F-1-14 | Kept only testable checkout and license statements; unprovable refund wording remains removed. | `@claim:studio-purchase`, `@claim:studio-license-check`; home/privacy/terms screenshots; live checkout check. |
| F-1-15 | Kept route-specific title, description, canonical, Open Graph, and Twitter metadata. | `updates Open Graph and Twitter route metadata`; all route screenshots; live `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page`. |
| F-1-16 | Kept **video** and **selected section** as the input terms. | `.factory/copy-audit.md`; home/demo screenshots; live `/` and `/?demo=1`. |
| F-1-17 | Kept **PDF trace sheet** as the printable output term. | `@claim:pdf-export`; home/demo screenshots; live `/` and `/?demo=1`. |
| F-1-18 | Kept the plain phrase **your video's original width**. | `@claim:studio-quality`; home screenshot; live `/`. |
| F-1-19 | Kept plain checkout wording and removed merchant-of-record jargon. | `@claim:studio-purchase`; home screenshot; live `/`. |
| F-1-20 | Kept **Local video → printable trace sheet** above the headline. | `.factory/copy-audit.md`; home screenshot; live `/`. |
| F-1-21 | Kept **Line detail** with its directional explanation; its slider target is now also 44 px tall. | `@claim:trace-controls`; home/demo screenshots; live `/` and `/?demo=1`. |
| F-1-22 | Kept **show the previous frame in red** and **Pencil edges** in UI and README. | `@claim:trace-controls`; demo screenshot; live `/?demo=1`. |
| F-1-23 | Kept install/offline wording in user terms. | `@claim:pwa-installable`, `@claim:offline-reload`; demo screenshot; live offline `/?demo=1` restored twelve frames. |
| F-1-24 | Kept the user-facing stored-data explanation before technical storage names. | `@claim:browser-data-deletion`, `@claim:studio-license-check`; privacy screenshot; live `/privacy`. |
| F-1-25 | Kept plain deployment instructions and the real host-level 404. | deployment/404 tests; static-404 screenshot; live `/missing-page` returned 404 with security configuration active. |
| F-2-1 | Kept the working in-memory sample generator; section and rate changes produce 60 frames and reset produces twelve. | `@claim:demo-workflow`; demo screenshot; live `/?demo=1` observed 12 → 60 → 12. |
| F-2-2 | Kept all three facts within the 390×844 first screen after increasing the adjacent action target. | `the 390 px landing screen keeps all three facts above the fold`; home screenshot; live `/` fold check passed. |
| F-2-3 | Kept the registered 960 px free-output claim. | `@claim:free-quality`; home screenshot; live `/` shows the 960 px free option. |
| F-2-4 | Kept canonical, Open Graph URL, favicon, and Apple icon on the static 404. | `the deployment configuration returns the designed 404 artifact for unknown URLs`; static-404 screenshot; live `/missing-page`. |
| F-2-5 | Kept shared navigation, legal links, attribution, and build id on the static 404; build is now v1.0.4. | same 404 test; static-404 screenshot; live `/missing-page`. |
| F-2-6 | Kept the exact caption **Six moments become six frames to trace.** | `.factory/copy-audit.md`; home screenshot; live `/`. |
| F-2-7 | Kept README deployment instructions split below the 22-word cap. | `.factory/copy-audit.md`; home screenshot; live routing behavior checked. |
| F-2-8 | Kept **Pencil edges** as the single trace-style name. | `@claim:trace-controls`; demo screenshot; live `/?demo=1`. |
| F-2-9 | Kept **hand-drawn flipbook** for the goal and **paper-bird sample** for the demo. | `.factory/copy-audit.md`, `@claim:demo-ready`; home/demo screenshots; live `/` and `/?demo=1`. |
| F-2-10 | Kept **Import or export settings** and raised its file input to a 44 px target. | `@claim:settings-portability`; demo screenshot; live `/?demo=1`. |
| F-3-1 | Raised the real-video action, Studio legal links, policy email links, range, settings import, and static-404 skip link to at least 44×44. Replaced selected checks with all-action enumeration, mapping radio/checkbox inputs to their labels. | Five route tests plus `the static 404 keeps every visible action at least 44 by 44 px at 390 px`; all six target screenshots; live audit checked 90 targets. The six reported links now measure 44 px high. |

## Final verification

- Clean clone: `/tmp/flipbook-polish3-clean.7Iig3e/repo` at `dc93f6fe058b843d5c6511d2423888add15f18a6`.
- Each of the 18 exact claim commands passed independently. Logs: `/tmp/flipbook-polish3-clean.7Iig3e/claim-logs/`.
- The same clone passed unit 3/3, lint, typecheck, browser 44/44, and build.
- Live `verify-url.sh` passed with one H1/main, `lang=en`, no missing alt text, no unlabeled button, and no console error.
- Cold live route scan found zero serious/critical axe violations across all five routes.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.803 s, CLS 0, TBT 0 ms.
- No finding remains open.
