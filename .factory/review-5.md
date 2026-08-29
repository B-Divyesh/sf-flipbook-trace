# Adversarial first-read review 5 — FAIL

Reviewed on 2026-08-29 against repository commit `f129a709ffbb4e0b4bdb38892a70d3941c37a3d8` and <https://flipbook-trace.sociobot.in> in fresh Chromium contexts at 390×844 and 1440×900. The live JS and CSS asset names match the clean build from that commit.

## Verdict

**FAIL.** The cold landing screen, one-click demo, exports, offline behavior, routing, accessibility, and all 18 exact claim commands work. Zero findings is the acceptance standard, however, and three privacy promises are not fully proved by their tagged tests. The designed 404 also uses metaphor copy prohibited by the plain-words contract. Two earlier findings are therefore reopened as blocking, one new blocking finding is recorded, and one minor copy finding remains.

## Findings

### Blocking

#### F-1-6 — Reopened: `local-processing` still permits an unlisted same-origin data request

- Exact registry claim: **“Video and frame processing stay in the browser.”** Related copy is landing **“Video stays in this browser.”** and README **“The app decodes and processes video in the browser.”**
- Exact test location: `tests/claims.spec.ts`, `@claim:local-processing`.
- Evidence: the test rejects non-GET/HEAD methods, request bodies, and off-origin requests. It does not reject an unexpected same-origin GET. A request such as `/collect?video=<encoded-data>` would satisfy all three assertions and the claim command would remain green.
- Why this is blocking: the earlier F-1-6 fix explicitly required every unexpected request to fail and only documented shell/update GETs to be allowed. A visitor relies on this sentence to decide whether a private video leaves the page. The passing test still does not prove that promise.
- Concrete fix: begin recording after the shell settles, assert that the workflow produces no requests, or use an exact allowlist for documented service-worker/update GETs. Reject every other URL, including same-origin GET query strings. Add a regression fixture that deliberately requests `/collect?video=sentinel` and prove the assertion fails.

#### F-1-7 — Reopened: `ephemeral-project` still does not inspect stored content on every persistent surface

- Exact registry claim: **“The source video and generated frames stay in page memory and disappear on reload.”** README says **“Video frames live only in page memory and disappear when the page reloads or closes.”**
- Exact test location: `tests/claims.spec.ts`, `@claim:ephemeral-project`.
- Evidence: the test checks Cache Storage request URLs but never reads cached response bodies. It allows any new generically named cache entry because it only searches URLs for `private-clip`. Its IndexedDB check detects top-level `Blob` or `ArrayBuffer` records, but not nested binary values or encoded frame data stored under a generic record. It also compares no storage inventory or content hash with the pre-import baseline.
- Why this is blocking: the original F-1-7 required stored binary content to be inspected. A clip cached as the body of `/cached-output`, or encoded inside a generic IndexedDB object, would pass. The green claim command does not establish “page memory only.”
- Concrete fix: snapshot every store before import; recursively inspect every IndexedDB value; read and hash every Cache Storage response body; recursively enumerate OPFS; and compare local/session storage before, after generation, and after reload. Assert that only documented preferences and unchanged app-shell responses remain. Include a known byte/pixel sentinel from the generated source in the negative checks.

#### F-5-1 — The Studio-license privacy test ignores possible copies of the token

- Exact registry claim: **“A pasted Studio license is sent to Sociobot only to verify that license.”** `/privacy` says **“If you verify Studio, your browser sends the license token to Sociobot for that check.”**
- Exact test location: `tests/claims.spec.ts`, `@claim:studio-license-check`.
- Evidence: the request listener records only URLs already containing `verify?license=`. A second request to another origin, a same-origin collection URL, or a request body containing `pasted-test` is invisible to the assertion. The test proves one expected request and an active result, but not the word **“only.”**
- Why this is blocking: this is a privacy claim about where a credential goes. A first-time buyer cannot verify it from the UI, so the automated request log must cover the whole action.
- Concrete fix: start a complete request log immediately before **Verify license**. Assert exactly one action-triggered request, with the expected Sociobot origin, method, path, encoded token, and no request body. Also assert that the token does not occur in any other URL, header, or body. Add a negative regression fixture for a second token-bearing request.

### Minor

#### F-5-2 — The 404 uses metaphor copy instead of naming the error and destination

- Exact locations: static and SPA 404 copy: **“Frame missing,” “This page fell out of the stack,” “Return to the worktable,”** and meta description **“Return to the Flipbook Trace worktable.”**
- Why this fails: “stack” and “worktable” are product lore. The heading does not name the error out of context, and the action does not name the page it opens. This conflicts with the attached plain-words rule for errors, headings, metadata, and actions.
- Concrete rewrite: delete **“Frame missing”**; use H1 **“Page not found”**; keep **“The address does not match a page in Flipbook Trace.”**; change the action to **“Open Flipbook Trace”**; and change the meta description to **“This page does not exist. Open Flipbook Trace.”** Apply the same copy to `public/404.html` and the SPA fallback.

## Cold first screen

The cold-read gate passes before scrolling in both fresh contexts.

- What it does, in my words: turns a video into printable frames for tracing.
- For whom: short-form creators making a hand-drawn flipbook without uploading their video.
- What to click first: **Try it with sample data**. The adjacent sentence says it opens a ready 12-frame paper-bird sample.
- Exact answering copy: **“Turn your video into tracing frames”**; **“For short-form creators making a hand-drawn flipbook without uploading their video.”**; **“Try it with sample data”**; **“It opens a ready 12-frame paper-bird sample.”**
- All three facts are visible without scrolling. The facts end at 733.16 px on 390×844 and 794.56 px on 1440×900.
- Both pages start at scroll position 0, have no horizontal overflow, and log no console or page error.

## Copy audit — landing-page sentences

Counts split on whitespace and treat hyphenated words and ranges as one word. Every landing sentence is at or below 22 words. No landing sentence contains a banned marketing adjective, jargon, or inconsistent product term.

| # | Sentence | Words | Result |
| ---: | --- | ---: | --- |
| 1 | For short-form creators making a hand-drawn flipbook without uploading their video. | 11 | Pass |
| 2 | It opens a ready 12-frame paper-bird sample. | 7 | Pass; `demo-ready` |
| 3 | Video stays in this browser. | 5 | F-1-6; `local-processing` proof is incomplete |
| 4 | Works offline after the first visit. | 6 | Pass; `offline-reload` |
| 5 | Free: PNG pack and PDF trace sheet. | 7 | Pass; `png-export`, `pdf-export` |
| 6 | Six moments become six frames to trace. | 7 | Pass |
| 7 | Choose a video you own. | 5 | Pass |
| 8 | The video and frames disappear on reload. | 7 | F-1-7; `ephemeral-project` proof is incomplete |
| 9 | Choose a video this browser can play. | 7 | Pass |
| 10 | Move right to keep more dark areas. | 7 | Pass; `trace-controls` |
| 11 | Studio controls need a license. | 5 | Pass |
| 12 | Choose a video, then set a 1–5 second section. | 9 | Pass; `clip-workflow` |
| 13 | Pick a 1–5 second section from a video you own. | 10 | Pass; `clip-workflow` |
| 14 | Choose the frame rate and adjust the trace preview. | 9 | Pass; `trace-controls` |
| 15 | Export numbered PNGs or one PDF trace sheet. | 8 | Pass; `png-export`, `pdf-export` |
| 16 | Flipbook Trace does not publish, host, or generate video. | 9 | Pass; scope statement |
| 17 | It does not retain your video. | 6 | F-1-7; `ephemeral-project` proof is incomplete |
| 18 | Use a video you own or have permission to trace. | 10 | Pass; responsibility statement |
| 19 | Large or long videos may use more memory. | 8 | Pass; limitation |
| 20 | Trim the video before loading it if your device slows down. | 11 | Pass; recovery guidance |
| 21 | $9 once. | 2 | Pass; `studio-purchase` |
| 22 | Keep the free PNG and PDF trace sheet exports. | 9 | Pass; `png-export`, `pdf-export` |
| 23 | Studio adds 1920 px, exports at your video's original width, and a six-column PDF trace sheet. | 16 | Pass; `studio-quality` |
| 24 | Dodo opens checkout for Sociobot. | 5 | Pass; `studio-purchase` |
| 25 | Turn your video into printable tracing frames. | 7 | Pass |

### Landing headings, actions, labels, and fragments

| Type | Copy with word count | Result |
| --- | --- | --- |
| H1 | Turn your video into tracing frames (6) | Clear job headline |
| H2/H3 | Make the tracing frames (4); Your frames will appear here (5); How to make a trace sheet (6); Choose and trim (3); Set the lines (3); Print or draw (3); A preparation tool, not a video editor (7); Print larger with Studio (4) | Clear in the heading outline |
| Primary/workspace actions | Try it with sample data (5); Or choose your own video (5); Choose a video (3); Make tracing frames (3); Export PNG pack (3); Export PDF trace sheet (4) | Result-naming verbs |
| Settings/purchase actions | Import or export settings (4); Export settings (2); Import settings (2); Buy Studio for $9 (4); Verify license (2) | Result-naming verbs |
| Navigation/demo actions | Demo (1); How it works (3); Privacy (1); Reset demo (2); Start for real (3) | Clear navigation or required demo actions |
| Field labels | Your video (2); Start time (2); End time (2); Frames each second (3); Trace style (2); Line detail (2); Export width (2); PDF trace sheet columns (4); Paste your license (3) | Plain and consistent |
| Options | 2 — loose study (3); 4 (1); 6 — balanced (2); 8 (1); 12 — detailed (2); Pencil edges (2); High contrast (2); Grayscale (1); 960 px — free (3); 1920 px — Studio (3); Original video width — Studio (5); 4 columns — free (3); 6 columns — Studio (3) | Plain and distinct |
| Other fragments | Local video → printable trace sheet (5); 01 / Prepare (2); Waiting for a video (4); 00 (1); 02 / Method (2); No cloud (2); 03 / Boundaries (2); Studio (1); Pass (1); 04 / Optional (2); Have a license? (3); Privacy · Terms (2); v1.0.4 · Original generated artwork (4) | No landing finding |

Terminology is consistent: **video** is the input, **selected section** is the 1–5 second range, **tracing frames** are processed images, **PNG pack** and **PDF trace sheet** are exports, **Studio** is the paid tier, and **paper-bird sample** is the demo.

## Copy audit — README sentences and readable fragments

Commands in fenced blocks are commands rather than sentences. Every prose sentence, bullet, link label, and heading is included. No item exceeds 22 words or contains a banned marketing adjective.

| # | Sentence or fragment | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Turn your video into printable tracing frames. | 7 | Pass |
| 2 | Flipbook Trace is a local browser tool for short-form video creators. | 11 | Pass |
| 3 | Choose a 1–5 second section, set the frame rate and trace style, then export numbered PNGs or a PDF trace sheet. | 21 | Pass; registered workflow/export claims |
| 4 | The app decodes and processes video in the browser. | 9 | F-1-6; `local-processing` proof is incomplete |
| 5 | The video and frames disappear on reload. | 7 | F-1-7; `ephemeral-project` proof is incomplete |
| 6 | After the first visit, the app and its built-in demo work offline. | 12 | Pass; `offline-reload` |
| 7 | Live site: https://flipbook-trace.sociobot.in | 3 | Link returns 200 |
| 8 | Demo: https://flipbook-trace.sociobot.in/?demo=1 | 2 | Link returns 200 |
| 9 | Choose a video this browser can play | 7 | Pass |
| 10 | 2, 4, 6, 8, or 12 frames each second | 9 | Pass; `trace-controls` |
| 11 | Pencil edges, high contrast, and grayscale trace styles | 8 | Pass; `trace-controls` |
| 12 | Optionally show the previous frame in red | 7 | Pass; `trace-controls` |
| 13 | Numbered PNG pack and printable PDF trace sheet | 8 | Pass; `png-export`, `pdf-export` |
| 14 | A twelve-frame paper bird demo that does not read or change real saved data | 14 | Pass; `demo-isolation` |
| 15 | Install the app and reopen the demo offline | 8 | Pass; `pwa-installable`, `offline-reload` |
| 16 | Settings export and import | 4 | Pass; `settings-portability` |
| 17 | The free version exports 960 px PNGs and a PDF trace sheet. | 12 | Pass; `free-quality`, `pdf-export` |
| 18 | Studio costs $9 once and adds 1920 px, exports at your video's original width, and six-column PDF trace sheets. | 19 | Pass; `studio-purchase`, `studio-quality` |
| 19 | Dodo opens checkout for Sociobot. | 5 | Pass; `studio-purchase` |
| 20 | This tool is for creators preparing a hand-drawn flipbook from a video they own. | 14 | Pass |
| 21 | It replaces manual frame extraction. | 5 | Pass; `clip-workflow` |
| 22 | It is not a video editor, publishing service, or style-transfer tool. | 11 | Pass; scope statement |
| 23 | Requirements: Node.js 20 or newer and npm. | 7 | Pass; developer requirement |
| 24 | Open the local URL printed by Vite. | 7 | Pass; developer instruction |
| 25 | Use /?demo=1 to open the bundled sample. | 7 | Pass; `demo-ready` |
| 26 | npm test builds and serves the production bundle, then runs the claim, offline, mobile, console, and accessibility checks in Chromium. | 20 | Verified in the clean clone |
| 27 | The build command writes the static deployment to dist/, with dist/index.html at its root. | 14 | Verified in the clean clone |
| 28 | Each published product claim and its exact test command is recorded in .factory/claims.json. | 13 | Registry exists; three tests have scope gaps |
| 29 | The demo contract is in .factory/demo.md. | 6 | Verified |
| 30 | Video frames live only in page memory and disappear when the page reloads or closes. | 15 | F-1-7; proof is incomplete |
| 31 | This site's browser data stores your control settings, Studio license, and latest license check. | 14 | Pass; storage tests |
| 32 | Demo mode does not read or change those real-data stores. | 10 | Pass; `demo-isolation` |
| 33 | Technically, settings use IndexedDB and a license uses localStorage. | 9 | Verified in source and tests |
| 34 | /privacy and /terms contain the user-facing policies. | 7 | Both routes return 200 |
| 35 | Deploy the contents of dist/ as a static site. | 9 | Pass; developer instruction |
| 36 | Keep the host rules that send valid routes to index.html and return the designed 404 for unknown routes. | 18 | Verified live |
| 37 | Keep the listed security headers too. | 6 | Verified live |
| 38 | The factory handles infrastructure, DNS, and billing registration. | 8 | Pass; process statement |
| 39 | Set VITE_BILLING_BASE only when the factory needs a non-production billing endpoint. | 11 | Pass; developer instruction |
| 40 | It defaults to https://api.sociobot.in. | 4 | Verified in source |
| 41 | MIT. | 1 | `LICENSE` present |
| 42 | See LICENSE. | 2 | Link resolves |

README headings are clear out of context: **Flipbook Trace** (2), **What it includes** (3), **Who it is for** (4), **Run locally** (2), **Test and build** (3), **Privacy and file handling** (4), **Deploy** (1), and **License** (1).

## Demo and sandbox verification

- One click from `/` opens `/?demo=1` and immediately shows **“Demo — sample data, nothing is saved,”** **Reset demo**, **Start for real**, twelve compact paper-bird frames, twelve workspace frames, and **12 frames ready**.
- The first sample frame ends at 520.44 px in the 390×844 viewport and 636.66 px in the 1440×900 viewport.
- Changing the section to five seconds and the rate to 12 makes 60 frames. **Reset demo** restores end time 2, rate 6, line detail 142, and twelve frames.
- Real IndexedDB settings and both real license values were seeded before demo entry. Instrumentation recorded no localStorage read and no IndexedDB open during entry. Regeneration and reset left the values unchanged. **Start for real** removed the banner and restored rate 8, grayscale, previous-frame overlay, and line detail 199.
- The live demo exercise made four same-origin GET requests and no off-origin, body-bearing, or non-GET/HEAD request.
- After service-worker control, an offline reload restored the demo banner and all twelve frames.
- No runtime AI call, Azure endpoint, embedded key, analytics request, third-party font, or third-party script exists. The Sociobot endpoints are limited to explicit checkout/license actions.

The observed product does not leak or retain demo data. F-1-6, F-1-7, and F-5-1 concern tests that would remain green if such a regression were introduced.

## Registered claims

Clean clone: `/tmp/flipbook-review5-clean.i4g2Nq/repo` at `f129a709ffbb4e0b4bdb38892a70d3941c37a3d8`. `npm ci` installed 141 packages with zero reported vulnerabilities. Every exact command from `.factory/claims.json` ran independently and selected one tagged test.

| Claim | Exact command | Command result | Scope result |
| --- | --- | --- | --- |
| `clip-workflow` | `npm test -- --grep @claim:clip-workflow` | PASS | 1.0/5.0 seconds accepted; 0.5/5.1 rejected |
| `demo-ready` | `npm test -- --grep @claim:demo-ready` | PASS | Landing click, URL, banner, count, visible sample frame |
| `demo-workflow` | `npm test -- --grep @claim:demo-workflow` | PASS | 12→60 regeneration and reset |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS | Real IndexedDB/local license reads and changes covered |
| `png-export` | `npm test -- --grep @claim:png-export` | PASS | ZIP and numbered final PNG |
| `pdf-export` | `npm test -- --grep @claim:pdf-export` | PASS | Independently decoded 12-cell, four-column sheet |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS | **BLOCKING scope gap F-1-6** |
| `ephemeral-project` | `npm test -- --grep @claim:ephemeral-project` | PASS | **BLOCKING scope gap F-1-7** |
| `trace-controls` | `npm test -- --grep @claim:trace-controls` | PASS | Five rates; distinct styles and overlay pixels |
| `settings-portability` | `npm test -- --grep @claim:settings-portability` | PASS | Export, import, and reload persistence |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS | Controlled worker and offline demo reload |
| `pwa-installable` | `npm test -- --grep @claim:pwa-installable` | PASS | Standalone manifest, icons, start URL, worker |
| `free-quality` | `npm test -- --grep @claim:free-quality` | PASS | Downloaded PNG measures 960×600 |
| `studio-quality` | `npm test -- --grep @claim:studio-quality` | PASS | 1920 px, 320 px original width, decoded six-column sheet |
| `studio-purchase` | `npm test -- --grep @claim:studio-purchase` | PASS | Live Dodo product, USD 9.00, one-time text |
| `studio-license-check` | `npm test -- --grep @claim:studio-license-check` | PASS | **BLOCKING scope gap F-5-1** |
| `browser-data-deletion` | `npm test -- --grep @claim:browser-data-deletion` | PASS | Clear-origin restores defaults and removes license |
| `app-update-check` | `npm test -- --grep @claim:app-update-check` | PASS | Changed worker replaces cache and announces update |

The live landing, demo, privacy, terms, and README contain no additional unlisted claim-like sentence. The three listed privacy claims above remain partly untested, so the review cannot pass.

## Earlier-finding verification

Every earlier review, polish record, and handoff was read. Each earlier finding was checked against the live site and current source/tests.

| Earlier ID | Review-5 result |
| --- | --- |
| F-1-1 | Fixed: sample frames are inside both first demo viewports. |
| F-1-2 | Fixed: an unknown live URL returns the designed HTTP 404. |
| F-1-3 | Fixed: `demo-ready` starts at `/` and clicks the action once. |
| F-1-4 | Fixed: real settings/license are pre-seeded and reads/opens are instrumented. |
| F-1-5 | Fixed: 1.0/5.0 and 0.5/5.1 second boundaries are exercised. |
| F-1-6 | **Half-fixed and reopened as BLOCKING:** arbitrary same-origin GETs remain allowed by the test. |
| F-1-7 | **Half-fixed and reopened as BLOCKING:** cached bodies and recursively encoded stored content remain uninspected. |
| F-1-8 | Fixed: the PDF raster is independently decoded and twelve numbered, non-blank cells are checked. |
| F-1-9 | Fixed: PNG sizes and six visible first-row PDF cells are independently checked. |
| F-1-10 | Fixed: checkout product, USD total, and one-time billing are checked live. |
| F-1-11 | Fixed: named video-format promises remain removed. |
| F-1-12 | Fixed: update behavior has one registered changed-worker test. |
| F-1-13 | Fixed: browser-data deletion has one clear-origin test. |
| F-1-14 | Fixed: unprovable refund/merchant statements remain removed; retained statements are registered. |
| F-1-15 | Fixed: route title, description, canonical, Open Graph, and Twitter metadata change together. |
| F-1-16 | Fixed: input is consistently **video** and its range is **selected section**. |
| F-1-17 | Fixed: printable output is consistently **PDF trace sheet**. |
| F-1-18 | Fixed: copy says **your video's original width**. |
| F-1-19 | Fixed: merchant-of-record jargon remains removed. |
| F-1-20 | Fixed: the kicker says **Local video → printable trace sheet**. |
| F-1-21 | Fixed: **Line detail** includes a directional explanation. |
| F-1-22 | Fixed: README says **show the previous frame in red** and **Pencil edges**. |
| F-1-23 | Fixed: install/offline copy states the user result without PWA jargon. |
| F-1-24 | Fixed: retained data is explained before IndexedDB/localStorage are named. |
| F-1-25 | Fixed: deployment routing, 404 behavior, and headers use plain sentences. |
| F-2-1 | Fixed: section/rate controls regenerate 60 demo frames and reset to twelve. |
| F-2-2 | Fixed: all three facts end above the 390×844 fold. |
| F-2-3 | Fixed: the 960 px free export has a registered dimension test. |
| F-2-4 | Fixed: static 404 has canonical, OG URL, favicon, and Apple icon. |
| F-2-5 | Fixed: static 404 has shared navigation, policies, attribution, and build id. |
| F-2-6 | Fixed: the caption says **six frames**, not pages. |
| F-2-7 | Fixed: the README deployment sentences stay below 22 words. |
| F-2-8 | Fixed: the trace style is consistently **Pencil edges**. |
| F-2-9 | Fixed: the goal is **hand-drawn flipbook** and the demo is **paper-bird sample**. |
| F-2-10 | Fixed: the disclosure says **Import or export settings**. |
| F-3-1 | Fixed: every visible mobile action on all checked routes measures at least 44×44 CSS px. |

F-5-1 is a new claim-scope finding. F-5-2 is a new plain-words finding on copy that earlier reviews accepted.

## Structure, accessibility, privacy, and identity

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200. `/missing-page` returns 404. Robots, sitemap, manifest, favicon, Apple icon, and the 1200×630 social image return 200.
- Every checked route has `lang=en`, one H1, one main, a coherent heading outline, route-specific title/description/canonical/OG/Twitter metadata, and the shared header/footer.
- Titles follow the pattern: **Flipbook Trace — Turn video into tracing frames**, **Demo — Flipbook Trace**, **Privacy — Flipbook Trace**, **Terms — Flipbook Trace**, and **Page not found — Flipbook Trace**.
- Deep links reload correctly. SPA navigation, browser back, and browser forward restore the route and focus its H1.
- The link crawl found no dead product link. Internal pages and Sociobot return 200; checkout returns the intended 303; mail links are explicit.
- Live axe scans found zero serious/critical violations on all six routes. The factory URL verifier reports no landing error, one H1, one main, `lang=en`, complete image alternatives, and labeled buttons.
- Every visible 390 px action is at least 44×44 CSS px. No checked route overflows horizontally. Reduced-motion mode reduces all measured durations to 0.01 ms or less.
- The clean full suite passes: unit 3/3, lint, typecheck, Playwright 44/44, and production build. `dist/` contains 19 files. JS is 31.29 KB raw / 10.94 KB gzip; CSS is 15.84 KB raw / 4.36 KB gzip.
- The warm paper, cyan/vermilion spot inks, registration marks, hard shadows, numbered frames, original generated worktable art, and print-style 404 match `.factory/design.md`. The site is visually distinct from a generic SaaS template.
- F-5-2 is the only structure/copy exception. F-1-6, F-1-7, and F-5-1 are claim-proof exceptions; no observed live privacy leak was found.

## Missed leverage

No missed-leverage finding is present. The brief asks for deterministic local frame extraction, trace controls, PNG/PDF export, and offline use; each exists. Settings JSON provides portability. Sync would conflict with the local-first premise and is not implied. A remote AI step would add network and cost without improving deterministic extraction. No decorative AI feature or embedded provider key exists.

## What would make this perfect

Close the four findings and nothing else: make the local-processing test reject every unexpected request; inspect actual content on every persistent storage surface; make the license test observe every request and prove the token has one destination; and replace the 404 metaphors with the exact plain copy above. Then rerun all 18 claim commands independently, the full clean suite, live demo storage/network/offline checks, cold mobile/desktop reads, route crawl, and axe scan. A subsequent review can pass only if it records zero findings.
