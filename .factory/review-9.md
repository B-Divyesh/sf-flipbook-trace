# Adversarial first-read review 9 — PASS

Reviewed 2026-09-01 against base `a04e89fe55194d94b8a4fa64153cd97eef73fff0` and <https://flipbook-trace.sociobot.in>. Product code was not changed.

## Verdict

**PASS.** There are no blocking, major, or minor findings, and no untested registered claim. The cold mobile visit is clear, the sample is immediately useful and isolated, and the local browser suite passes.

## Cold first screen

Fresh unscrolled Chromium contexts at 390×844 and 1440×900 answer all three first-read questions.

- **What it does:** turns a video into printable tracing frames.
- **For whom:** short-form creators making a hand-drawn flipbook without uploading their video.
- **What to click first:** **Try it with sample data**; **“It opens a ready 12-frame paper-bird sample.”** states the immediate result.

The exact answering copy is **“Turn your video into tracing frames”**, **“For short-form creators making a hand-drawn flipbook without uploading their video.”**, **“Try it with sample data”**, and **“It opens a ready 12-frame paper-bird sample.”** At 390 px all three plain facts remain before the fold. Neither cold context produced horizontal overflow, page errors, or console errors.

## Copy audit

Counts use whitespace-delimited words; a hyphenated term, numeric range, URL, or code token is one word. All sentences are no more than 22 words. No banned marketing adjective, unexplained product jargon, inconsistent term, mood heading, or non-result-naming product action remains.

### Landing page sentences

| # | Sentence | Words | Check |
| ---: | --- | ---: | --- |
| 1 | For short-form creators making a hand-drawn flipbook without uploading their video. | 11 | Audience |
| 2 | It opens a ready 12-frame paper-bird sample. | 7 | `demo-ready` |
| 3 | Video stays in this browser. | 5 | `local-processing` |
| 4 | Works offline after the first visit. | 6 | `offline-reload` |
| 5 | Free: numbered PNG pack and PDF trace sheet. | 8 | Export claims |
| 6 | Six moments become six frames to trace. | 7 | Useful art caption |
| 7 | Choose a video you own. | 5 | Instruction |
| 8 | The video and frames disappear on reload. | 7 | `ephemeral-project` |
| 9 | Choose a video this browser can play. | 7 | Limitation |
| 10 | Move right to keep more dark areas. | 7 | `trace-controls` |
| 11 | Studio controls need a license. | 5 | State |
| 12 | Choose a video, then set a 1–5 second section. | 9 | `clip-workflow` |
| 13 | Pick a 1–5 second section from a video you own. | 10 | `clip-workflow` |
| 14 | Choose how many frames to make each second, then adjust the trace preview. | 13 | `trace-controls` |
| 15 | Export a numbered PNG pack or one PDF trace sheet. | 10 | Export claims |
| 16 | Flipbook Trace does not publish, host, or generate video. | 9 | Boundary |
| 17 | It does not retain your video. | 6 | `ephemeral-project` |
| 18 | Use a video you own or have permission to trace. | 10 | Responsibility |
| 19 | Large or long videos may use more memory. | 8 | Limitation |
| 20 | Trim the video before loading it if your device slows down. | 11 | Recovery |
| 21 | $9 once. | 2 | `studio-purchase` |
| 22 | Keep the free numbered PNG pack and PDF trace sheet. | 10 | Export claims |
| 23 | Studio adds 1920 px, exports at your video's original width, and a six-column PDF trace sheet. | 16 | `studio-quality` |
| 24 | Dodo opens the checkout for Sociobot. | 6 | `studio-purchase` |
| 25 | Turn your video into printable tracing frames. | 7 | Footer one-liner |

The headings make sense out of context: **Make the tracing frames**, **Your frames will appear here**, **How to make a trace sheet**, **Choose and trim your video**, **Choose the tracing lines**, **Export frames to print or trace**, **A preparation tool, not a video editor**, and **Print larger with Studio**. Result-naming actions are **Try it with sample data**, **Make tracing frames**, **Export numbered PNG pack**, **Export PDF trace sheet**, **Import or export settings**, **Buy Studio for $9**, and **Verify a Studio license**. Navigation, **Reset demo**, and **Start for real** name their destinations or mode changes.

Terminology is consistent: **video**; **selected section**; **frames each second**; **tracing frames**; **numbered PNG pack**; **PDF trace sheet**; **Studio**; and **paper-bird sample**.

### README sentences and readable list items

| # | Sentence or item | Words | Check |
| ---: | --- | ---: | --- |
| 1 | Turn your video into printable tracing frames. | 7 | Summary |
| 2 | Flipbook Trace is a local browser tool for short-form video creators. | 11 | Audience |
| 3 | Choose a 1–5 second section. | 5 | `clip-workflow` |
| 4 | Set how many frames to make each second and choose a trace style. | 12 | `trace-controls` |
| 5 | Export a numbered PNG pack or PDF trace sheet. | 9 | Export claims |
| 6 | The app decodes and processes video in the browser. | 9 | `local-processing` |
| 7 | The video and frames disappear on reload. | 7 | `ephemeral-project` |
| 8 | After the first visit, the app and its built-in demo work offline. | 12 | `offline-reload` |
| 9 | Live site: https://flipbook-trace.sociobot.in | 3 | Same-origin link 200 |
| 10 | Demo: https://flipbook-trace.sociobot.in/?demo=1 | 2 | Same-origin link 200 |
| 11 | Choose a video this browser can play | 7 | Limitation |
| 12 | 2, 4, 6, 8, or 12 frames each second | 9 | `trace-controls` |
| 13 | Pencil edges, high contrast, and grayscale trace styles | 8 | `trace-controls` |
| 14 | Optionally show the previous frame in red | 7 | `trace-controls` |
| 15 | Numbered PNG pack and printable PDF trace sheet | 8 | Export claims |
| 16 | A twelve-frame paper bird demo that does not read or change real saved data | 14 | `demo-isolation` |
| 17 | Install the app and reopen the demo offline | 8 | PWA/offline claims |
| 18 | Settings export and import | 4 | `settings-portability` |
| 19 | The free version exports a numbered PNG pack at 960 px and a PDF trace sheet. | 16 | `free-quality`, `pdf-export` |
| 20 | Studio costs $9 once and adds 1920 px, exports at your video's original width, and six-column PDF trace sheets. | 19 | Studio claims |
| 21 | Dodo opens the checkout for Sociobot. | 6 | `studio-purchase` |
| 22 | This tool is for creators preparing a hand-drawn flipbook from a video they own. | 14 | Audience |
| 23 | It replaces manual frame extraction. | 5 | `clip-workflow` |
| 24 | It is not a video editor, publishing service, or style-transfer tool. | 11 | Boundary |
| 25 | Requirements: Node.js 20 or newer and npm. | 7 | Instruction |
| 26 | Open the local URL printed by Vite. | 7 | Instruction |
| 27 | Use `/?demo=1` to open the bundled sample. | 8 | `demo-ready` |
| 28 | `npm test` builds and serves the production bundle, then runs the claim, offline, mobile, console, and accessibility checks in Chromium. | 20 | Verified |
| 29 | The build command writes the static deployment to `dist/`, with `dist/index.html` at its root. | 14 | Verified |
| 30 | Each published product claim and its exact test command is recorded in `.factory/claims.json`. | 15 | Verified |
| 31 | The demo contract is in `.factory/demo.md`. | 8 | Verified |
| 32 | Video frames live only in page memory and disappear when the page reloads or closes. | 15 | `ephemeral-project` |
| 33 | This site's browser data stores your control settings, Studio license, and latest license check. | 14 | Storage documentation |
| 34 | Demo mode does not read or change those real-data stores. | 10 | `demo-isolation` |
| 35 | Technically, settings use IndexedDB and a license uses localStorage. | 9 | Implementation note |
| 36 | `/privacy` and `/terms` contain the user-facing policies. | 7 | Verified |
| 37 | Deploy the contents of `dist/` as a static site. | 9 | Instruction |
| 38 | Keep the host rules that send valid routes to `index.html` and return the designed 404 for unknown routes. | 19 | Verified |
| 39 | Keep the listed security headers too. | 6 | Instruction |
| 40 | The factory handles infrastructure, DNS, and billing registration. | 8 | Scope |
| 41 | Set `VITE_BILLING_BASE` only when the factory needs a non-production billing endpoint. | 13 | Instruction |
| 42 | It defaults to `https://api.sociobot.in`. | 7 | Implementation note |
| 43 | MIT. | 1 | License |
| 44 | See `LICENSE`. | 2 | Local link |

README headings are useful out of context: **What it includes**, **Who it is for**, **Run locally**, **Test and build**, **Privacy and file handling**, **Deploy**, and **License**.

## Demo, sandbox, and privacy

One click from a fresh 390 px landing page opened `/?demo=1`. After the app’s staged first paint, the first viewport showed the 12-frame paper-bird sequence, the persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**, and **Start for real**. The workspace had 12 frames and enabled PNG/PDF exports. Normal sequential Tab reached both export buttons. **Start for real** returned to `/` and removed the demo banner.

`demo-workflow` checks 12 → 60 → 12 generation and reset. `demo-isolation` pre-seeds real settings/licenses, confirms demo does not open or read them, then confirms reset and real-mode return leave them unchanged. Current source mounts separate demo defaults without real preference or license initialization. The live demo request log contained only same-origin GETs. After service-worker control, an offline reload restored the demo banner and all 12 overview frames.

## Claims and quality gates

After `npm ci`, `npm test -- --grep '@claim:'` selected and passed all 19 uniquely tagged tests in `.factory/claims.json`. This executes every listed claim test in one clean suite invocation; the checkout test uses its shipped local contract fixture.

| Claim | Result |
| --- | --- |
| `clip-workflow` | PASS — 1.0/5.0 accepted; 0.5/5.1 recovery checked |
| `demo-ready` | PASS — landing click, banner, 12 frames, first-viewport frame |
| `demo-workflow` | PASS — 12 → 60 → 12 |
| `demo-isolation` | PASS — real data remains separate |
| `png-export` | PASS — ZIP and numbered PNG checked |
| `pdf-export` | PASS — decoded 12-cell, four-column sheet |
| `local-processing` | PASS — workflow HTTP transfer is rejected |
| `ephemeral-project` | PASS — persistent-browser stores and reload checked |
| `trace-controls` | PASS — rates, styles, and overlay checked |
| `settings-portability` | PASS — JSON export/import and reload persistence |
| `offline-reload` | PASS — controlled worker serves demo offline |
| `pwa-installable` | PASS — manifest, icons, display, and worker |
| `free-quality` | PASS — 960 px free PNG |
| `studio-quality` | PASS — Studio widths and six-column sheet |
| `studio-purchase` | PASS — local contract verifies product, USD 9, one-time, and destination shape |
| `studio-license-check` | PASS — explicit license check destination verified |
| `studio-license-cache` | PASS — 24-hour valid/invalid/revoked behavior |
| `browser-data-deletion` | PASS — clearing browser data removes settings/license |
| `app-update-check` | PASS — changed worker update behavior |

`npm run test:unit` passed 3/3; `npm run lint`, full `npm test` (64/64), and `npm run build` also passed, with `dist/index.html` present. The live verifier found one title, `lang=en`, one H1, a main landmark, no missing image alternatives, no unlabeled buttons, and no console errors. Fresh Axe scans found no violations on `/`, `/?demo=1`, `/privacy`, `/terms`, or the not-found route.

Every claim-like public sentence maps to the registry. Remaining statements are clear limitations, scope/responsibility statements, developer instructions, or documented implementation details; no unlisted claim is present.

## Earlier-finding verification

Every earlier review, polish record, and handoff was read. Each prior ID was confirmed live and in source/tests.

| Earlier ID | Current confirmation |
| --- | --- |
| F-1-1 | Fixed — first demo viewport contains 12 sample frames. |
| F-1-2 | Fixed — unknown URL returns designed HTTP 404. |
| F-1-3 | Fixed — named landing action enters demo in one click. |
| F-1-4 | Fixed — real storage is instrumented and remains unchanged. |
| F-1-5 | Fixed — accepted and rejected section limits are checked. |
| F-1-6 | Fixed — workflow requests reject bodies, non-GET/HEAD, and off-origin traffic. |
| F-1-7 | Fixed — IndexedDB, Cache Storage, OPFS, and web storage are checked. |
| F-1-8 | Fixed — PDF is independently decoded into 12 non-blank cells. |
| F-1-9 | Fixed — Studio dimensions and six PDF columns are checked. |
| F-1-10 | Fixed — local checkout contract checks product, price, one-time term, and hosted shape. |
| F-1-11 | Fixed — no named browser-format promise. |
| F-1-12 | Fixed — update claim is registered and tested. |
| F-1-13 | Fixed — browser-data deletion is registered and tested. |
| F-1-14 | Fixed — refund/revocation statements remain absent. |
| F-1-15 | Fixed — per-route title, description, canonical, OG, and Twitter values. |
| F-1-16 | Fixed — video and selected section are consistent. |
| F-1-17 | Fixed — PDF trace sheet is consistent. |
| F-1-18 | Fixed — original video width is plain language. |
| F-1-19 | Fixed — checkout wording is plain. |
| F-1-20 | Fixed — hero label names the actual result. |
| F-1-21 | Fixed — Line detail has usable direction help. |
| F-1-22 | Fixed — Pencil edges and previous-frame wording are plain. |
| F-1-23 | Fixed — install/offline wording names user results. |
| F-1-24 | Fixed — stored data is explained before storage terms. |
| F-1-25 | Fixed — deploy, route, and 404 instructions are short and plain. |
| F-2-1 | Fixed — demo regenerates 12 → 60 → 12 in memory. |
| F-2-2 | Fixed — all three facts fit the 390×844 first screen. |
| F-2-3 | Fixed — free 960 px output is registered and tested. |
| F-2-4 | Fixed — static 404 has metadata and icons. |
| F-2-5 | Fixed — static 404 has shared navigation and footer. |
| F-2-6 | Fixed — caption says frames, not pages. |
| F-2-7 | Fixed — README remains below the 22-word cap. |
| F-2-8 | Fixed — Pencil edges is the sole style name. |
| F-2-9 | Fixed — hand-drawn flipbook and paper-bird sample are distinct terms. |
| F-2-10 | Fixed — Import or export settings names the result. |
| F-3-1 | Fixed — visible mobile actions meet target checks; normal Tab reaches exports. |
| F-5-1 | Fixed — license test records all explicit-action requests. |
| F-5-2 | Fixed — both 404 forms name the error and destination. |
| F-6-1 | Fixed — unproved refund/revocation claims remain absent. |
| F-6-2 | Fixed — checkout terminology is plain. |
| F-7-1 | Fixed — numbered PNG pack is consistent. |
| F-7-2 | Fixed — frames each second is consistent. |
| F-7-3 | Fixed — method headings name their object/result. |
| F-7-4 | Fixed — section and Studio labels are product-specific. |
| F-7-5 | Fixed — Verify a Studio license names the disclosure. |
| F-8-1 | Fixed — interactive preview no longer uses `content-visibility`; Tab reaches exports. |
| F-8-2 | Fixed — checkout test uses the local contract fixture. |
| V18-1 | Fixed — sequential keyboard use reaches both demo exports. |

## Structure, routing, accessibility, and identity

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200; the checked unknown URL returns 404. Same-origin landing links return 200.
- Each route has one H1 and main landmark, `lang="en"`, route-specific title/description/canonical/OG values, header, footer, favicon, and designed 404. Titles follow the required pattern.
- Deep links work. Current source moves focus to the destination H1 and announces client route changes. The shared header includes a skip link; footer links include Privacy and Terms. `robots.txt` and `sitemap.xml` list the public routes.
- The live response has the configured content type, referrer, CSP, and permissions headers. No external runtime fonts/scripts, analytics, or decorative AI were observed.
- The warm paper, spot cyan/vermilion inks, registration marks, hard ink shadows, frame strip, and original worktable art implement the recorded risograph thesis. The site is visually distinct from a generic SaaS template.

## Missed leverage

No finding. The brief’s useful extensions already exist: local video input, section and trace controls, PNG/PDF export, settings portability, offline use, and an isolated sample. AI or sync would not improve this deterministic local-first job enough to justify added transfer or setup.

## What would make this perfect

No further product change is indicated. Keep the current claim fixtures, sequential-keyboard regression, offline check, and copy audit in the release gate so this zero-finding state stays verified.
