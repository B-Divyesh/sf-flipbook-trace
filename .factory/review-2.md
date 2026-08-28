# Adversarial first-read review 2 — FAIL

Reviewed on 2026-08-28 against repository commit `c0f95d0dd669f3413f1bd8e7d047ead974639f27` and <https://flipbook-trace.sociobot.in> in fresh Chromium contexts at 390×844 and 1440×900. The deployed JS and CSS asset names match the clean build from that commit.

## Verdict

**FAIL.** Four blocking findings remain: the demo presents inert core controls as usable, and three earlier claim tests still prove internal markers or an incomplete set of storage surfaces instead of the full promised outcome. There are nine additional structure and copy findings. PASS requires zero findings and no partly tested claim.

## Findings

### Blocking

#### F-2-1 — The demo says a sample video is ready, but its trim and frame-rate workflow does nothing

- Exact location and quote: demo workspace, **“The sample video is ready. Change a control or export it.”** The controls include **Start time**, **End time**, **Frames each second**, and **Make tracing frames**.
- Evidence: on the live demo, changing frame rate from 6 to 12, changing end time from 2 to 5, and pressing **Make tracing frames** left the output and status unchanged at 12 frames. In code, `loadDemoFrames()` creates twelve canvases but no `loadedVideo`; `makeFramesFromVideo()` immediately returns when `loadedVideo` is absent.
- Why this fails: this is a weak demo under the demo-sandbox contract. It visually resembles the real workflow but does not let a first-time visitor try its central trim/frame-rate behavior, despite explicitly saying that a sample video is ready.
- Concrete fix: ship a small bundled sample video or a deterministic in-memory equivalent that responds to start, end, and frame-rate settings. Make **Make tracing frames** regenerate the expected count, and add a demo claim test that changes 2 seconds at 6 fps to 5 seconds at 12 fps and observes 12 then 60 generated frames. If only style controls are intended to work, remove the inert controls and rewrite the claim honestly.

#### F-1-7 — Reopened: the page-memory claim still omits persistent storage surfaces

- Exact claim: **“The source video and generated frames stay in page memory and disappear on reload.”**
- Exact test gap: `@claim:ephemeral-project` enumerates IndexedDB, Cache Storage, and OPFS, but does not inspect `localStorage` or `sessionStorage` for a filename, encoded bytes, blobs, or other video/frame data.
- Why this remains blocking: the earlier finding required all persistent browser stores to be inspected. The repaired test can still pass if video/frame data is written to `localStorage` or survives reload in `sessionStorage`. A green command therefore does not prove “page memory.”
- Concrete fix: snapshot and inspect IndexedDB, Cache Storage, OPFS, `localStorage`, and `sessionStorage` after import/export and again after reload. Assert that only documented preferences, license data, and shell assets exist and that none contains source/frame bytes or identifiers.

#### F-1-8 — Reopened: the PDF claim trusts self-declared metadata instead of the rendered trace sheet

- Exact claim: **“Exports a printable PDF trace sheet.”**
- Exact test gap: `@claim:pdf-export` checks the PDF header, page-tree text, custom `/FlipbookTrace*` fields, an image-object declaration, and byte length. Those fields are written by the same function under test. The test never decodes or rasterizes the embedded page image and never confirms that twelve visible numbered, non-blank frame cells exist.
- Why this remains blocking: a blank or wrongly laid-out PDF with the same custom markers still passes. The earlier required observable output was not implemented; it was replaced with internal assertions.
- Concrete fix: open or rasterize the downloaded PDF with an independent parser, then assert one readable page, twelve numbered cells, four columns, and non-blank frame content.

#### F-1-9 — Reopened: the six-column Studio sheet is still proved only by a custom marker

- Exact claim: **“Studio adds 1920 px, original-video-width exports, and six-column PDF trace sheets.”**
- Exact test gap: the 1920 px and original-width PNG assertions are now substantive, but the PDF assertion only searches for `/FlipbookTraceColumns 6`. It does not inspect the rendered page layout.
- Why this remains blocking: a four-column image carrying a six-column marker would pass. The earlier finding explicitly required parsing or rasterizing the PDF to confirm six columns.
- Concrete fix: independently render the Studio PDF and assert six distinct frame cells across the first row, plus the expected numbering and non-blank image content.

### Major

#### F-2-2 — The third required first-screen fact is below the 390 px fold

- Exact location: landing page at 390×844. **“Free: PNG pack and PDF trace sheet.”** begins at `y=830.39` and ends at `y=879.98`, below the 844 px viewport.
- Why this fails: the mandatory first-screen shape requires all three privacy/offline/price facts. A phone visitor sees only the first two without scrolling.
- Concrete fix: reduce mobile hero spacing/type height or place the three facts in a more compact block. Add a 390×844 assertion that the bottom of `.fact-list` is at or above the viewport bottom.

#### F-2-3 — The free 960 px export is an unlisted quantitative claim

- Exact quotes: README, **“The free version includes 960 px PNG and PDF trace sheet exports.”** Landing control, **“960 px — free.”**
- Why this fails: no `claims.json` entry promises or tests a 960 px free export. `png-export` uses the 640 px built-in demo canvases and checks only the ZIP signature/final filename; it does not establish a 960 px result.
- Concrete fix: add a `free-quality` claim that imports a known local video without a license, downloads a PNG, and asserts a 960 px width. Rewrite the README to **“The free version exports 960 px PNGs and a PDF trace sheet.”** so the pixel measure cannot appear to describe the PDF.

#### F-2-4 — The real 404 route lacks required route metadata

- Exact location: live `/missing-page` and `public/404.html`.
- Evidence: HTTP status is correctly 404, but there is no canonical link or Apple touch icon. `og:url` is hard-coded to `/404.html`, not the requested missing URL.
- Why this fails: the site-structure contract requires canonical, Open Graph, favicon, and Apple-touch metadata per route.
- Concrete fix: add the Apple icon and an appropriate canonical strategy for the static 404. Set Open Graph URL consistently with that canonical, and add live assertions for these fields.

#### F-2-5 — The 404 does not use the site's consistent header and footer

- Exact location: live `/missing-page`.
- Evidence: its header has only the wordmark; it omits **Demo**, **How it works**, and **Privacy**. Its footer omits the build/version line present on every SPA route.
- Why this fails: a visitor at the error route loses the standard navigation and build context required on every route.
- Concrete fix: give `404.html` the same header navigation and footer content as the other routes, including Privacy, Terms, Param Factory attribution, and version/build id.

### Minor

#### F-2-6 — The hero art promises “pages,” an unlisted and inconsistent output

- Exact quote: hero caption, **“Six moments become six pages to trace.”**
- Why this fails: the named outputs elsewhere are tracing frames, a PNG pack, and one PDF trace sheet. The app does not promise one page per moment, and no claim test covers that result.
- Concrete rewrite: **“Six moments become six frames to trace.”**

#### F-2-7 — One README sentence exceeds the 22-word hard cap

- Exact quote: **“Keep the host rules that send valid app routes to index.html, return the designed 404 for unknown routes, and set the listed security headers.”** — 24 words.
- Why this fails: it combines routing, errors, and headers in one sentence.
- Concrete rewrite: **“Keep the host rules that send valid routes to index.html and return the designed 404 for unknown routes. Keep the listed security headers too.”**

#### F-2-8 — One trace style has two names

- Exact quotes: README **“Pencil edge”**; live control **“Pencil edges.”**
- Why this fails: the same selectable style should have one exact name.
- Concrete rewrite: use **“Pencil edges”** in the README.

#### F-2-9 — The intended result is called three kinds of “study”

- Exact quotes: hero **“hand-drawn study”**; sample action **“12-frame motion study”**; README **“hand-drawn flipbook study.”**
- Why this fails: a new visitor must infer whether these are different outputs or the same intended flipbook.
- Concrete rewrite: use **“hand-drawn flipbook”** for the user's goal and **“paper-bird sample”** for the demo. For example: **“For short-form creators making a hand-drawn flipbook without uploading their video.”**

#### F-2-10 — “Move saved settings” does not name the available result

- Exact location: landing workspace disclosure label, **“Move saved settings.”**
- Why this fails: the heading is vague out of context and hides two concrete actions.
- Concrete rewrite: **“Import or export settings.”**

## Cold first screen

The blocking cold-read question itself passes at both widths.

- What it does, in my words: turns a local video section into printable frames for tracing.
- For whom: short-form video creators making a hand-drawn flipbook.
- What to click first: **Try it with sample data**; the adjacent text says it opens a ready 12-frame sample.
- Exact text that answers this: **“Turn your video into tracing frames”**; **“For short-form creators who want a hand-drawn study without uploading their video.”**; **“Try it with sample data”**; **“It opens a ready 12-frame motion study.”**

There is no horizontal overflow or load console error on `/` at either width. F-2-2 records the separate failure of the mandatory three-fact block on mobile.

## Landing-page sentence audit

Counts split on whitespace and treat hyphenated terms and ranges as one word. No landing sentence exceeds 22 words or uses a banned marketing adjective.

| # | Sentence | Words | Result |
| ---: | --- | ---: | --- |
| 1 | For short-form creators who want a hand-drawn study without uploading their video. | 12 | F-2-9 |
| 2 | It opens a ready 12-frame motion study. | 7 | F-2-9; `demo-ready` |
| 3 | Video stays in this browser. | 5 | `local-processing` |
| 4 | Works offline after the first visit. | 6 | `offline-reload` |
| 5 | Free: PNG pack and PDF trace sheet. | 7 | `png-export`, `pdf-export` |
| 6 | Six moments become six pages to trace. | 7 | F-2-6 |
| 7 | Choose a video you own. | 5 | Pass |
| 8 | The video and frames disappear on reload. | 7 | F-1-7 |
| 9 | Choose a video this browser can play. | 7 | Plain compatibility instruction |
| 10 | Move right to keep more dark areas. | 7 | `trace-controls` |
| 11 | Studio controls need a license. | 5 | Pass |
| 12 | Choose a video, then set a 1–5 second section. | 9 | `clip-workflow` |
| 13 | Pick a 1–5 second section from a video you own. | 10 | `clip-workflow` |
| 14 | Choose the frame rate and adjust the trace preview. | 9 | `trace-controls` |
| 15 | Export numbered PNGs or one PDF trace sheet. | 8 | `png-export`, `pdf-export` |
| 16 | Flipbook Trace does not publish, host, or generate video. | 9 | Scope statement |
| 17 | It does not retain your video. | 6 | F-1-7 |
| 18 | Use a video you own or have permission to trace. | 10 | Scope instruction |
| 19 | Large or long videos may use more memory. | 8 | Limitation |
| 20 | Trim the video before loading it if your device slows down. | 11 | Recovery guidance |
| 21 | $9 once. | 2 | `studio-purchase` |
| 22 | Keep the free PNG and PDF trace sheet exports. | 9 | `png-export`, `pdf-export` |
| 23 | Studio adds 1920 px, exports at your video's original width, and a six-column PDF trace sheet. | 16 | F-1-9; `studio-quality` |
| 24 | Dodo opens checkout for Sociobot. | 5 | `studio-purchase` |
| 25 | Turn your video into printable tracing frames. | 7 | Pass |

## README sentence and fragment audit

Bullets and link labels are included because visitors read them as product copy.

| # | Sentence or fragment | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Turn your video into printable tracing frames. | 7 | Pass |
| 2 | Flipbook Trace is a local browser tool for short-form video creators. | 11 | Pass |
| 3 | Choose a 1–5 second section, set the frame rate and trace style, then export numbered PNGs or a PDF trace sheet. | 21 | Registered workflow/export claims |
| 4 | The app decodes and processes video in the browser. | 9 | `local-processing` |
| 5 | The video and frames disappear on reload. | 7 | F-1-7 |
| 6 | After the first visit, the app and its built-in demo work offline. | 12 | `offline-reload` |
| 7 | Live site: https://flipbook-trace.sociobot.in | 3 | Link verified |
| 8 | Demo: https://flipbook-trace.sociobot.in/?demo=1 | 2 | Link verified |
| 9 | Choose a video this browser can play | 7 | Pass |
| 10 | 2, 4, 6, 8, or 12 frames each second | 9 | `trace-controls` |
| 11 | Pencil edge, high contrast, and grayscale trace styles | 8 | F-2-8 |
| 12 | Optionally show the previous frame in red | 7 | `trace-controls` |
| 13 | Numbered PNG pack and printable PDF trace sheet | 8 | `png-export`, `pdf-export` |
| 14 | A twelve-frame paper bird demo that does not read or change real saved data | 14 | `demo-isolation` |
| 15 | Install the app and reopen the demo offline | 8 | `pwa-installable`, `offline-reload` |
| 16 | Settings export and import | 4 | `settings-portability` |
| 17 | The free version includes 960 px PNG and PDF trace sheet exports. | 12 | F-2-3 |
| 18 | Studio costs $9 once and adds 1920 px, exports at your video's original width, and six-column PDF trace sheets. | 19 | `studio-purchase`, `studio-quality` |
| 19 | Dodo opens checkout for Sociobot. | 5 | `studio-purchase` |
| 20 | This tool is for creators preparing a hand-drawn flipbook study from a video they own. | 15 | F-2-9 |
| 21 | It replaces manual frame extraction. | 5 | `clip-workflow` |
| 22 | It is not a video editor, publishing service, or style-transfer tool. | 11 | Scope statement |
| 23 | Requirements: Node.js 20 or newer and npm. | 7 | Developer requirement |
| 24 | Open the local URL printed by Vite. | 7 | Developer instruction |
| 25 | Use /?demo=1 to open the bundled sample. | 7 | `demo-ready` |
| 26 | npm test builds and serves the production bundle, then runs the claim, offline, mobile, console, and accessibility checks in Chromium. | 20 | Verified in clean clone |
| 27 | The build command writes the static deployment to dist/, with dist/index.html at its root. | 14 | Verified in clean clone |
| 28 | Each published product claim and its exact test command is recorded in .factory/claims.json. | 13 | False while F-2-3/F-2-6 remain |
| 29 | The demo contract is in .factory/demo.md. | 6 | Verified |
| 30 | Video frames live only in page memory and disappear when the page reloads or closes. | 15 | F-1-7 |
| 31 | This site's browser data stores your control settings, Studio license, and latest license check. | 14 | Registered storage claims |
| 32 | Demo mode does not read or change those real-data stores. | 10 | `demo-isolation` |
| 33 | Technically, settings use IndexedDB and a license uses localStorage. | 9 | Verified in code/tests |
| 34 | /privacy and /terms contain the user-facing policies. | 7 | Routes verified |
| 35 | Deploy the contents of dist/ as a static site. | 9 | Developer instruction |
| 36 | Keep the host rules that send valid app routes to index.html, return the designed 404 for unknown routes, and set the listed security headers. | 24 | F-2-7 |
| 37 | The factory handles infrastructure, DNS, and billing registration. | 8 | Process statement |
| 38 | Set VITE_BILLING_BASE only when the factory needs a non-production billing endpoint. | 11 | Developer instruction |
| 39 | It defaults to https://api.sociobot.in. | 4 | Verified in source |
| 40 | MIT. | 1 | License verified |
| 41 | See LICENSE. | 2 | Link verified |

README headings are all within four words and make sense in context: **Flipbook Trace** (2), **What it includes** (3), **Who it is for** (4), **Run locally** (2), **Test and build** (3), **Privacy and file handling** (4), **Deploy** (1), and **License** (1).

## Landing headings, actions, and terminology

| Type | Copy (word count) | Result |
| --- | --- | --- |
| H1 | Turn your video into tracing frames (7) | Clear job headline |
| H2/H3 | Make the tracing frames (4); Your frames will appear here (5); How to make a trace sheet (6); Choose and trim (3); Set the lines (3); Print or draw (3); A preparation tool, not a video editor (7); Print larger with Studio (4) | Clear within the heading outline |
| Primary/action controls | Try it with sample data (6); Choose a video (3); Make tracing frames (3); Export PNG pack (3); Export PDF trace sheet (4); Buy Studio for $9 (4); Verify license (2) | Result-naming verbs |
| Demo actions | Reset demo (2); Start for real (3) | Required demo actions |
| Settings disclosure | Move saved settings (3) | F-2-10 |

Terminology is consistent for **video**, **selected section**, **frame**, **PNG pack**, **PDF trace sheet**, **Studio**, and **demo**. F-2-6, F-2-8, and F-2-9 record the remaining exceptions. No banned marketing adjective appears in the landing page or README.

## Demo and sandbox exercise

- One click from `/` reaches `/?demo=1`, displays the persistent **“Demo — sample data, nothing is saved”** banner, and shows twelve non-blank bird frames in both the compact strip and workspace.
- The first sample frame ends at `y=520.44` on 390×844 and `y=636.66` on 1440×900, inside each first viewport.
- **Reset demo** restores 6 fps, end time 2, line detail 142, and twelve frames.
- Pre-seeded real IndexedDB settings and real license keys were unchanged after demo edits and reset. **Start for real** exits the banner; the registered isolation test waits for and confirms the real values return.
- After service-worker control, network-offline reload returns the demo with twelve frames and the banner.
- Live request capture during the demo exercise found no off-origin request. The `local-processing` test additionally rejects request bodies and non-GET/HEAD requests during a real local-video import/export.
- F-2-1 records the inert trim/frame-rate workflow. F-1-7 records the persistent-store test gap.

## Claim commands from a clean clone

Clean clone: `/tmp/flipbook-review2-clean.yRp8L6/repo` at `c0f95d0dd669f3413f1bd8e7d047ead974639f27`, installed with `npm ci` (140 packages, zero reported vulnerabilities). Every exact command selected one tagged test and exited 0.

| Claim | Exact command | Command | Scope verdict |
| --- | --- | --- | --- |
| `clip-workflow` | `npm test -- --grep @claim:clip-workflow` | PASS | Proves 1.0/5.0 seconds and rejects 0.5/5.1 |
| `demo-ready` | `npm test -- --grep @claim:demo-ready` | PASS | One-click route/banner/count/first-viewport output; F-2-1 is a separate weak-demo defect |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS | Pre-seeds, instruments reads/opens, resets, and restores real mode |
| `png-export` | `npm test -- --grep @claim:png-export` | PASS | ZIP signature and numbered final filename |
| `pdf-export` | `npm test -- --grep @claim:pdf-export` | PASS | **BLOCKING scope gap F-1-8** |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS | No body, non-GET/HEAD, or off-origin request |
| `ephemeral-project` | `npm test -- --grep @claim:ephemeral-project` | PASS | **BLOCKING scope gap F-1-7** |
| `trace-controls` | `npm test -- --grep @claim:trace-controls` | PASS | Five rates present; three styles and overlay change pixels |
| `settings-portability` | `npm test -- --grep @claim:settings-portability` | PASS | Export/import/reload verified |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS | Controlled service worker and offline demo reload |
| `pwa-installable` | `npm test -- --grep @claim:pwa-installable` | PASS | Standalone manifest, icons, start URL, controlling worker |
| `studio-quality` | `npm test -- --grep @claim:studio-quality` | PASS | PNG widths pass; **six-column scope gap F-1-9** |
| `studio-purchase` | `npm test -- --grep @claim:studio-purchase` | PASS | Live Dodo page shows product, USD 9.00, one-time |
| `studio-license-check` | `npm test -- --grep @claim:studio-license-check` | PASS | One expected Sociobot verification request |
| `browser-data-deletion` | `npm test -- --grep @claim:browser-data-deletion` | PASS | Clear-origin restores defaults/removes license |
| `app-update-check` | `npm test -- --grep @claim:app-update-check` | PASS | Changed worker replaces cache and announces update |

F-2-3 and F-2-6 are unlisted live/README claims. No other claim-like sentence on the landing page, demo, privacy, terms, or README lacked a matching registered test or a clear limitation/scope classification.

## Earlier-finding verification

Every earlier review, polish record, and handoff was read. Each finding was checked against live behavior and current source/tests.

| Earlier ID | Review-2 result |
| --- | --- |
| F-1-1 | Fixed: twelve visible bird frames are inside both first demo viewports. |
| F-1-2 | Fixed: live unknown URL returns HTTP 404 with designed content. |
| F-1-3 | Fixed: tagged test starts at `/` and clicks once. |
| F-1-4 | Fixed: test pre-seeds real settings/license and instruments demo reads/IDB opens. |
| F-1-5 | Fixed: 1.0, 5.0, 0.5, and 5.1 seconds are covered. |
| F-1-6 | Fixed: request bodies, non-GET/HEAD, and off-origin requests are checked. |
| F-1-7 | **Half-fixed and reopened as BLOCKING:** local/session storage remain uninspected. |
| F-1-8 | **Half-fixed and reopened as BLOCKING:** self-declared metadata replaces rendered-content verification. |
| F-1-9 | **Half-fixed and reopened as BLOCKING:** PNG dimensions are proved; six-column rendering is not. |
| F-1-10 | Fixed: current Dodo session product, price, currency, and one-time text are asserted. |
| F-1-11 | Fixed: named format claims were removed. |
| F-1-12 | Fixed: update claim and tagged worker replacement test exist. |
| F-1-13 | Fixed: browser-data deletion claim and clear-origin test exist. |
| F-1-14 | Fixed: unprovable merchant/refund copy was removed; remaining checkout/license statements are registered. |
| F-1-15 | Fixed on SPA routes: title, description, canonical, OG, and Twitter fields change. F-2-4 is a new static-404 gap. |
| F-1-16 | Fixed: input uses **video** and duration uses **selected section**. |
| F-1-17 | Fixed: printable download uses **PDF trace sheet**. |
| F-1-18 | Fixed: original video width is explained plainly. |
| F-1-19 | Fixed: merchant-of-record jargon was removed. |
| F-1-20 | Fixed: kicker says **Local video → printable trace sheet**. |
| F-1-21 | Fixed: **Line detail** includes direction help. |
| F-1-22 | Fixed except the singular/plural mismatch in new F-2-8: animation jargon is gone. |
| F-1-23 | Fixed: README names install/offline results. |
| F-1-24 | Fixed: user-facing stored data is explained before implementation names. |
| F-1-25 | Fixed semantically: deploy text explains routes, 404, and headers. F-2-7 records its new length failure. |

## Structure, links, accessibility, and visual identity

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200. `/missing-page` returns 404. Deep links reload correctly.
- SPA routes have the required title pattern, unique description/canonical/OG/Twitter fields, one H1, one main, favicon, Apple icon, consistent header/footer, and route-change focus. Forward navigation focuses **Privacy without an upload**; browser back focuses **Turn your video into tracing frames** and restores the top position.
- `robots.txt` and `sitemap.xml` expose all valid routes. The link crawl found no dead product link: checkout resolves to a Dodo session; Sociobot and all internal routes return 200; mail links are explicit. The intentionally missing URL returns 404.
- Live axe scans found zero violations on all six checked URLs at 390×844. `/opt/fleet/lib/verify-url.sh` passed the home page in 589 ms with no console/page errors, one H1, one main, `lang=en`, and no missing image alt or unlabeled button.
- The risograph print-table art, warm paper, off-register spot inks, hard shadows, registration marks, and paper-bird motion study match `.factory/design.md` and are visually distinct from a generic SaaS template.
- F-2-4 and F-2-5 cover the static 404 exceptions. F-2-2 covers the mobile first-screen layout.

## Full clean-clone quality gates

- `npm run test:unit`: PASS, 3/3.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 36/36 Chromium tests.
- `npm run build`: PASS; `dist/` produced.
- Built JS: 30.90 KB (11.01 KB gzip). Built CSS: 15.43 KB (4.27 KB gzip).

## Missed leverage

No AI feature is warranted. Deterministic local frame extraction is the product's job; remote inference would weaken its privacy/offline value. The brief's obvious portability needs are already represented by local video input, PNG/PDF export, and settings JSON import/export. Sync is not implied and would add accounts and remote storage. No missed-leverage finding is recorded.

## What would make this perfect

Make the sample's trim and frame-rate controls perform the real workflow; strengthen the three reopened claim tests with every storage surface and independent PDF rendering checks; keep all three facts inside the 390×844 first screen; register and test the free 960 px result; complete the 404 metadata and shared shell; and apply the five exact copy rewrites above. Then rerun every claim command, the full clean suite, live storage/network/offline exercises, mobile/desktop cold reads, metadata/link crawl, and axe checks. Only a zero-finding rerun should pass.
