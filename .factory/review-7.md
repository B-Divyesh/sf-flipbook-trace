# Adversarial first-read review 7 — FAIL

Reviewed on 2026-08-30 against repository base `6a56c433cba96a6b91911f555ab233c809aa9381` and <https://flipbook-trace.sociobot.in> in fresh Chromium contexts at 390×844 and 1440×900.

## Verdict

**FAIL.** The first screen, one-click demo, sandbox, registered claims, routes, accessibility checks, and build all pass. Five copy findings remain. None is blocking, but this review may pass only with zero findings and no untested claim.

## Findings

### Minor

#### F-7-1 — The PNG download has two names

- Exact locations: landing metadata and step 3 say **“numbered PNGs”**; the hero fact and export button say **“PNG pack”**; README uses both **“numbered PNGs”**, **“960 px PNGs”**, and **“Numbered PNG pack.”**
- Why this fails: the actual result is one ZIP containing numbered PNG files. Switching between individual files and a pack makes the download shape less certain and breaks the one-term-per-concept rule.
- Concrete fix: use **numbered PNG pack** everywhere. Rewrite step 3 as **“Export a numbered PNG pack or one PDF trace sheet.”** Rewrite the README price sentence as **“The free version exports a numbered PNG pack at 960 px and a PDF trace sheet.”**

#### F-7-2 — The frame-frequency control has three names

- Exact locations: the control label is **“Frames each second”**; landing step 2 and the README say **“frame rate”**; demo copy says **“choose a rate.”**
- Why this fails: a first-time visitor must infer that all three phrases refer to the same setting.
- Concrete fix: use **frames each second** throughout. Rewrite step 2 as **“Choose how many frames to make each second, then adjust the trace preview.”** Rewrite demo copy as **“Set a 1–5 second section, choose how many frames to make each second, then make frames.”**

#### F-7-3 — The three method headings do not name their objects

- Exact location: landing **How to make a trace sheet** steps: **“Choose and trim,” “Set the lines,”** and **“Print or draw.”**
- Why this fails: read as a heading list, the first does not say what is chosen, the second does not identify tracing, and the third does not name the exported result.
- Concrete fix: use **“Choose and trim your video,” “Choose the tracing lines,”** and **“Export frames to print or trace.”**

#### F-7-4 — Generic labels and “STUDIO PASS” add no usable information

- Exact locations: landing labels **“01 / PREPARE,” “02 / METHOD,” “03 / BOUNDARIES,” “04 / OPTIONAL,”** and the visible paid-tier stamp **“STUDIO PASS.”**
- Why this fails: the numbered labels could appear on an unrelated product, and **PASS** introduces another paid-tier word even though the product consistently calls the tier **Studio**.
- Concrete fix: remove the generic kickers and **PASS**, or replace them with product-specific labels: **“1 / Choose a video,” “2 / Make a trace sheet,” “3 / Video privacy,”** and **“4 / Studio export sizes.”** Keep **Studio** as the only paid-tier term.

#### F-7-5 — “Have a license?” does not name the disclosure result

- Exact location: landing Studio disclosure, **“Have a license?”**
- Why this fails: it is an interactive control, but the question does not say that opening it reveals a license-verification form.
- Concrete fix: rename it **“Verify a Studio license.”**

## Cold first screen

The first-read gate passes at both sizes.

- What it does: turns a local video into tracing frames and printable outputs.
- For whom: short-form creators making a hand-drawn flipbook.
- What to click first: **Try it with sample data**; the adjacent sentence says it opens a ready 12-frame paper-bird sample.

The exact copy that answered these questions was **“Turn your video into tracing frames,” “For short-form creators making a hand-drawn flipbook without uploading their video,”** and **“Try it with sample data.”** All three privacy/offline/price facts ended above the fold: at 733.16 px on the 390×844 viewport and 794.56 px on the 1440×900 viewport. No console error or horizontal overflow occurred on either cold load.

## Copy audit

Counts treat a hyphenated term, contraction, path, or numeric range as one word. No sentence exceeds 22 words. No banned marketing adjective appears.

### Landing-page sentences

| Location | Sentence | Words | Result |
| --- | --- | ---: | --- |
| Hero audience | For short-form creators making a hand-drawn flipbook without uploading their video. | 11 | Pass |
| Hero demo note | It opens a ready 12-frame paper-bird sample. | 7 | `demo-ready` |
| Hero fact | Video stays in this browser. | 5 | `local-processing` |
| Hero fact | Works offline after the first visit. | 6 | `offline-reload` |
| Hero fact | Free: PNG pack and PDF trace sheet. | 7 | `png-export`, `pdf-export` |
| Hero art caption | Six moments become six frames to trace. | 7 | Pass |
| Workspace | Choose a video you own. | 5 | Pass |
| Workspace | The video and frames disappear on reload. | 7 | `ephemeral-project` |
| File help | Choose a video this browser can play. | 7 | Pass |
| Line-detail help | Move right to keep more dark areas. | 7 | `trace-controls` |
| Studio control help | Studio controls need a license. | 5 | Pass |
| Empty state | Choose a video, then set a 1–5 second section. | 9 | `clip-workflow` |
| Step 1 | Pick a 1–5 second section from a video you own. | 10 | `clip-workflow` |
| Step 2 | Choose the frame rate and adjust the trace preview. | 9 | F-7-2 |
| Step 3 | Export numbered PNGs or one PDF trace sheet. | 8 | F-7-1 |
| Boundaries | Flipbook Trace does not publish, host, or generate video. | 9 | Scope statement |
| Boundaries | It does not retain your video. | 6 | `ephemeral-project` |
| Boundaries | Use a video you own or have permission to trace. | 10 | Scope statement |
| Limitation | Large or long videos may use more memory. | 8 | Honest limitation |
| Limitation | Trim the video before loading it if your device slows down. | 11 | Recovery advice |
| Studio | $9 once. | 2 | `studio-purchase` |
| Studio | Keep the free PNG and PDF trace sheet exports. | 9 | F-7-1 |
| Studio | Studio adds 1920 px, exports at your video's original width, and a six-column PDF trace sheet. | 16 | `studio-quality` |
| Studio | Dodo opens the checkout for Sociobot. | 6 | `studio-purchase` |
| Footer | Turn your video into printable tracing frames. | 7 | Pass |

### README sentences

| Section | Sentence | Words | Result |
| --- | --- | ---: | --- |
| Intro | Turn your video into printable tracing frames. | 7 | Pass |
| Intro | Flipbook Trace is a local browser tool for short-form video creators. | 11 | Pass |
| Intro | Choose a 1–5 second section, set the frame rate and trace style, then export numbered PNGs or a PDF trace sheet. | 21 | F-7-1, F-7-2 |
| Intro | The app decodes and processes video in the browser. | 9 | `local-processing` |
| Intro | The video and frames disappear on reload. | 7 | `ephemeral-project` |
| Intro | After the first visit, the app and its built-in demo work offline. | 12 | `offline-reload` |
| Pricing | The free version exports 960 px PNGs and a PDF trace sheet. | 12 | `free-quality`; F-7-1 |
| Pricing | Studio costs $9 once and adds 1920 px, exports at your video's original width, and six-column PDF trace sheets. | 19 | `studio-purchase`, `studio-quality` |
| Pricing | Dodo opens the checkout for Sociobot. | 6 | `studio-purchase` |
| Audience | This tool is for creators preparing a hand-drawn flipbook from a video they own. | 14 | Pass |
| Audience | It replaces manual frame extraction. | 5 | `clip-workflow` |
| Audience | It is not a video editor, publishing service, or style-transfer tool. | 11 | Scope statement |
| Run locally | Requirements: Node.js 20 or newer and npm. | 8 | Developer requirement |
| Run locally | Open the local URL printed by Vite. | 7 | Instruction |
| Run locally | Use `/?demo=1` to open the bundled sample. | 8 | `demo-ready` |
| Test and build | `npm test` builds and serves the production bundle, then runs the claim, offline, mobile, console, and accessibility checks in Chromium. | 20 | Confirmed by clean-clone run |
| Test and build | The build command writes the static deployment to `dist/`, with `dist/index.html` at its root. | 16 | Confirmed by clean-clone build |
| Test and build | Each published product claim and its exact test command is recorded in `.factory/claims.json`. | 15 | Confirmed |
| Test and build | The demo contract is in `.factory/demo.md`. | 8 | Confirmed |
| Privacy | Video frames live only in page memory and disappear when the page reloads or closes. | 15 | `ephemeral-project` |
| Privacy | This site's browser data stores your control settings, Studio license, and latest license check. | 14 | `settings-portability`, `studio-license-cache` |
| Privacy | Demo mode does not read or change those real-data stores. | 10 | `demo-isolation` |
| Privacy | Technically, settings use IndexedDB and a license uses localStorage. | 9 | Confirmed in code and storage inventory |
| Privacy | `/privacy` and `/terms` contain the user-facing policies. | 7 | Live routes confirmed |
| Deploy | Deploy the contents of `dist/` as a static site. | 9 | Instruction |
| Deploy | Keep the host rules that send valid routes to `index.html` and return the designed 404 for unknown routes. | 19 | Live 404 confirmed |
| Deploy | Keep the listed security headers too. | 6 | Live headers confirmed |
| Deploy | The factory handles infrastructure, DNS, and billing registration. | 8 | Scope statement |
| Deploy | Set `VITE_BILLING_BASE` only when the factory needs a non-production billing endpoint. | 13 | Developer instruction |
| Deploy | It defaults to `https://api.sociobot.in`. | 7 | Confirmed in code |
| License | MIT. | 1 | Confirmed by `LICENSE` |
| License | See `LICENSE`. | 2 | Instruction |

### Headings, actions, list items, and fragments

Every non-sentence landing heading was also checked. The H1 is **Turn your video into tracing frames** (7). H2 headings are **Make the tracing frames** (4), **How to make a trace sheet** (6), **A preparation tool, not a video editor** (7), and **Print larger with Studio** (4). The empty-state H3 is **Your frames will appear here** (5). The three method H3s are flagged in F-7-3.

Visible landing action labels are **Try it with sample data** (6), **Or choose your own video** (5), **Make tracing frames** (3), **Import or export settings** (4), **Choose a video** (3), **Buy Studio for $9** (4), and **Have a license?** (3). The first six name an action or result; the last is F-7-5. Navigation and footer links are destination names rather than command buttons.

The other visible landing fragments are **Local video → printable trace sheet** (5); **Waiting for a video** (4); **Your video** (2); **Start time** (2); **End time** (2); **Frames each second** (3); **2 — loose study** (3); **4** (1); **6 — balanced** (2); **8** (1); **12 — detailed** (2); **Trace style** (2); **Pencil edges** (2); **High contrast** (2); **Grayscale** (1); **Line detail** (2); **Show the previous frame in red** (7); **Export width** (2); **960 px — free** (3); **1920 px — Studio** (3); **Original video width — Studio** (4); **PDF trace sheet columns** (4); **4 columns — free** (3); **6 columns — Studio** (3); **00** (1); **NO CLOUD** (2); and **v1.0.17 · Original generated artwork** (4). The numbered section labels and **STUDIO PASS** are F-7-4.

README headings are **Flipbook Trace** (2), **What it includes** (3), **Who it is for** (4), **Run locally** (2), **Test and build** (3), **Privacy and file handling** (4), **Deploy** (1), and **License** (1). All name their sections.

README list fragments are **Choose a video this browser can play** (7); **2, 4, 6, 8, or 12 frames each second** (9); **Pencil edges, high contrast, and grayscale trace styles** (8); **Optionally show the previous frame in red** (7); **Numbered PNG pack and printable PDF trace sheet** (8); **A twelve-frame paper bird demo that does not read or change real saved data** (13); **Install the app and reopen the demo offline** (8); and **Settings export and import** (4). None exceeds 22 words or uses banned marketing language.

## Demo and sandbox

The demo passes its blocking gate.

- One click on **Try it with sample data** reached `/?demo=1`.
- The first 390×844 screen showed the paper-bird tracing result; the finished state contains twelve frames.
- The banner read **Demo — sample data, nothing is saved** and retained **Reset demo** and **Start for real**.
- Changing the section to five seconds and 12 frames each second produced 60 frames. **Reset demo** restored start `0`, end `2`, six frames each second, and 12 frames.
- A real IndexedDB settings sentinel and two localStorage sentinels were identical before demo entry, during the demo, after reset, and after **Start for real**.
- Every observed request was same-origin. The clean claim suite separately rejects all HTTP requests during local-video import, tracing, and export.

## Claims

The clean clone was `/tmp/flipbook-review7-clean.B7icdv/repo` at the reviewed commit. Every exact command in `.factory/claims.json` ran independently and exited 0. Logs are in `/tmp/flipbook-review7-clean.B7icdv/claim-logs/`.

| Claim | Result | Observable scope confirmed |
| --- | --- | --- |
| `clip-workflow` | PASS | 1.0/5.0-second success and 0.5/5.1-second recovery |
| `demo-ready` | PASS | Landing click, demo URL, banner, twelve frames, first-viewport sample |
| `demo-workflow` | PASS | 12 → 60 → 12 frame workflow |
| `demo-isolation` | PASS | No real setting/license read or change |
| `png-export` | PASS | ZIP signature and numbered final PNG |
| `pdf-export` | PASS | Independently decoded twelve numbered, non-blank cells |
| `local-processing` | PASS | No HTTP request during import, trace, and export |
| `ephemeral-project` | PASS | IndexedDB, Cache Storage, OPFS, and web-storage inventory |
| `trace-controls` | PASS | Five rates, three styles, and previous-frame overlay |
| `settings-portability` | PASS | JSON export/import and reload persistence |
| `offline-reload` | PASS | Controlled offline demo reload with sample frames |
| `pwa-installable` | PASS | Standalone manifest, icons, start URL, service worker |
| `free-quality` | PASS | 960 px PNG output without a license |
| `studio-quality` | PASS | 1920 px, original width, and decoded six-column PDF |
| `studio-purchase` | PASS | Dodo checkout, product, USD 9.00, one-time billing |
| `studio-license-check` | PASS | One explicit Sociobot GET and no second token carrier |
| `studio-license-cache` | PASS | Valid, invalid, and revoked 24-hour behavior |
| `browser-data-deletion` | PASS | Settings and saved license removed by site-data clear |
| `app-update-check` | PASS | Changed service worker, new shell cache, update notice |

No live landing or README product claim is unlisted. The five findings concern copy consistency or action naming, not missing claim coverage.

## Earlier finding regression audit

Every earlier review, polish record, and handoff was read. Each earlier finding was checked against the live site and current code/tests.

| Earlier finding | Current verification | Status |
| --- | --- | --- |
| F-1-1 | Sample canvases are in the first demo viewport; `demo-ready` passes. | Fixed |
| F-1-2 | `/missing-page` returns HTTP 404 with the designed page and response override. | Fixed |
| F-1-3 | `demo-ready` starts at `/` and clicks the named action. | Fixed |
| F-1-4 | `demo-isolation` pre-seeds and instruments real storage; live sentinels remained unchanged. | Fixed |
| F-1-5 | `clip-workflow` covers both valid and invalid trim boundaries. | Fixed |
| F-1-6 | `local-processing` rejects every workflow HTTP request, including the same-origin negative fixture. | Fixed after review-5 reopen |
| F-1-7 | `ephemeral-project` inventories every named persistent surface and content hash. | Fixed after review-2/review-5 reopens |
| F-1-8 | `pdf-export` independently decodes and checks the rendered sheet. | Fixed after review-2 reopen |
| F-1-9 | `studio-quality` measures PNGs and independently checks the PDF grid. | Fixed after review-2 reopen |
| F-1-10 | `studio-purchase` follows checkout and asserts product, price, currency, and recurrence. | Fixed |
| F-1-11 | Live helper says only **Choose a video this browser can play**; no format list remains. | Fixed |
| F-1-12 | Update behavior is registered as `app-update-check`. | Fixed |
| F-1-13 | Data deletion is registered as `browser-data-deletion`. | Fixed |
| F-1-14 | Refund promises remain removed; retained checkout/license statements have claim tests. | Fixed |
| F-1-15 | Every route updates title, description, canonical, Open Graph, and Twitter fields. | Fixed |
| F-1-16 | Input copy consistently uses **video** and **selected section**. | Fixed |
| F-1-17 | Printable output consistently uses **PDF trace sheet**. | Fixed |
| F-1-18 | Live and README copy use **your video's original width**. | Fixed |
| F-1-19 | **Merchant of record** remains absent. | Fixed |
| F-1-20 | Hero kicker is **Local video → printable trace sheet**. | Fixed |
| F-1-21 | Control is **Line detail** with directional help. | Fixed |
| F-1-22 | UI and README use **Pencil edges** and plain previous-frame wording. | Fixed |
| F-1-23 | README describes install/offline behavior in user terms. | Fixed |
| F-1-24 | README explains stored user data before IndexedDB/localStorage names. | Fixed |
| F-1-25 | README describes observable routing, 404, and headers. | Fixed |
| F-2-1 | Live demo regenerated 12 → 60 frames and reset to 12. | Fixed |
| F-2-2 | All three facts fit both required first screens. | Fixed |
| F-2-3 | 960 px free output is registered as `free-quality`. | Fixed |
| F-2-4 | Static 404 has canonical, OG URL, SVG favicon, and 180 px Apple icon. | Fixed |
| F-2-5 | Static 404 has the shared navigation, legal links, attribution, and build id. | Fixed |
| F-2-6 | Caption is **Six moments become six frames to trace.** | Fixed |
| F-2-7 | No README sentence exceeds 22 words. | Fixed |
| F-2-8 | **Pencil edges** is the only name for that trace style. | Fixed |
| F-2-9 | Goal uses **hand-drawn flipbook**; demo uses **paper-bird sample**. | Fixed |
| F-2-10 | Disclosure is **Import or export settings**. | Fixed |
| F-3-1 | All five live routes and static 404 pass the exhaustive 44×44 mobile-target tests. | Fixed |
| F-5-1 | License test captures every request and rejects duplicate token destinations. | Fixed |
| F-5-2 | SPA/static 404s use **Page not found** and **Open Flipbook Trace**. | Fixed |
| F-6-1 | Refund and automatic-revocation promises remain absent from landing, terms, and README. | Fixed |
| F-6-2 | Purchase surfaces say **Dodo opens the checkout for Sociobot.** | Fixed |

No earlier finding is reopened.

## Structure, accessibility, and visual identity

| Route | HTTP | Title | H1 |
| --- | ---: | --- | --- |
| `/` | 200 | Flipbook Trace — Turn video into tracing frames | Turn your video into tracing frames |
| `/?demo=1` and `/demo` | 200 | Demo — Flipbook Trace | Trace a paper bird in twelve frames |
| `/privacy` | 200 | Privacy — Flipbook Trace | Privacy without an upload |
| `/terms` | 200 | Terms — Flipbook Trace | Terms for making trace sheets |
| `/missing-page` | 404 | Page not found — Flipbook Trace | Page not found |

Each route has `lang=en`, one `main`, one H1, an ordered heading outline, description, canonical, route-specific Open Graph/Twitter values, SVG favicon, 180×180 Apple icon, and the 1200×630 product social image. `robots.txt` and `sitemap.xml` return 200 and list the valid routes. Live response headers include CSP, `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.

The live link crawl found no dead valid link: home, demo, hash targets, Privacy, Terms, Sociobot, and the Dodo checkout resolved; `mailto:` links were allowed. The missing page's own links remain usable while its document correctly returns 404. Internal navigation, back, and forward restore the route, scroll top, H1 focus, and live-region announcement.

Fresh live axe scans found zero serious or critical violations on all six checked URLs. The clean suite also covers keyboard export, range operation, 200% text, visible skip links, reduced motion, and all mobile action targets.

The risograph worktable identity is distinct rather than a generic SaaS template: warm paper, hard ink shadows, registration marks, off-register bird art, numbered frames, and restrained cyan/vermilion spot colors match `.factory/design.md`. The artwork provenance is recorded, and no third-party font or script is loaded.

## Missed leverage

No missed-leverage finding. The brief asks for local video selection, a 1–5 second trim, frame-rate and trace controls, numbered PNG/PDF export, and offline use; all are present. Settings already import/export. Cloud sync would conflict with the local-first promise, and an AI step would not improve the core tracing-frame job enough to justify sending data or adding a key flow.

## Quality gates

From the clean clone:

- `npm run test:unit`: 3/3 passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: 59/59 passed.
- `npm run build`: passed and produced `dist/`.
- Initial home JavaScript remains well below the product limit; the largest app chunk is 7.96 KB gzip.

## What would make this perfect

Resolve F-7-1 through F-7-5: standardize **numbered PNG pack** and **frames each second**, rewrite the three method headings with explicit objects, replace or remove generic section labels and **PASS**, and rename the license disclosure **Verify a Studio license**. Then rerun this complete review; the behavioral, claim, privacy, structure, accessibility, and build gates already pass.
