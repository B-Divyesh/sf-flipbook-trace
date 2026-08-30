# Adversarial first-read review 6 — FAIL

Reviewed on 2026-08-30 against repository base `c48eee9ea190f09f6cc8f186c8dec7a19d29b9b5` and <https://flipbook-trace.sociobot.in> in fresh Chromium contexts at 390×844 and 1440×900.

## Verdict

**FAIL.** The first screen, demo, core workflow, privacy behavior, routing, accessibility, and build all pass. Two purchase-copy regressions remain. The site again uses payment jargon removed after review 1, and it publishes refund behavior that its registered test only repeats rather than proves. A PASS requires zero findings and no untested claim.

## Findings

### Blocking

#### F-6-1 — Refund behavior is published but not tested (reopens F-1-14)

- Exact quotes, live landing, `/terms`, and README: **“Dodo handles refunds.”** and **“A refund automatically revokes the Studio license.”**
- Registry location: `.factory/claims.json`, `studio-purchase`, says the product “explains Dodo's merchant and refund terms.”
- Test location: `tests/claims.spec.ts`, `@claim:studio-purchase`.
- Evidence: the test proves the checkout redirects to a Dodo session showing Flipbook Trace Studio, USD 9.00, and **One-time**. For the refund sentences, it only asserts that those same strings appear on the page and in README. It never issues or replays a refund, checks a Sociobot refund webhook/fixture, or verifies that the corresponding license changes from valid to revoked. `@claim:studio-license-cache` proves handling of a mocked `revoked` verdict, not that a refund produces that verdict.
- Why this fails: a buyer can rely on both refund statements. Repeating a statement in a test is not proof of its behavior. This regresses F-1-14, which was closed by removing unprovable refund wording.
- Concrete fix: remove both refund sentences and narrow `studio-purchase` to the checkout facts it proves. If the statements must remain, add a dedicated claim and sandbox test that starts with a valid fixture purchase, applies a recorded Dodo refund event through the Sociobot billing boundary, and confirms that verification returns revoked and Studio controls lock. The test must assert behavior, not copy presence.

#### F-6-2 — “Merchant of record” jargon has returned (reopens F-1-19)

- Exact quote, live landing, `/terms`, and README: **“Dodo is the merchant of record for Sociobot.”**
- Why this fails: “merchant of record” is payment-industry jargon. A first-time buyer needs to know who opens checkout, charges them, and handles purchase support. Review 1 raised this exact wording as F-1-19; polish 1 replaced it with plain checkout wording, but the phrase is live again.
- Concrete rewrite: **“Dodo opens the checkout for Sociobot.”** If a verified charge/refund responsibility statement is required, use **“Dodo charges you for this purchase.”** and register a test that proves it from the checkout contract.

## Cold first screen

The cold-read gate passes before scrolling in both fresh contexts.

- What it does, in my words: turns a video into printable frames for tracing.
- For whom: short-form creators making a hand-drawn flipbook without uploading their video.
- What to click first: **Try it with sample data**. The adjacent sentence says it opens a ready 12-frame paper-bird sample.
- Exact answering copy: **“Turn your video into tracing frames”**; **“For short-form creators making a hand-drawn flipbook without uploading their video.”**; **“Try it with sample data”**; **“It opens a ready 12-frame paper-bird sample.”**
- At 390×844, the three facts end at 733 px. At 1440×900, they end at 795 px. Both contexts start at scroll position 0, have no horizontal overflow, and log no console or page error.

## Copy audit — landing-page sentences

Counts split on whitespace and treat hyphenated words and ranges as one word. No sentence exceeds 22 words or uses a banned marketing adjective. The two flagged purchase sentences are findings above.

| # | Sentence | Words | Result |
| ---: | --- | ---: | --- |
| 1 | For short-form creators making a hand-drawn flipbook without uploading their video. | 11 | Pass |
| 2 | It opens a ready 12-frame paper-bird sample. | 7 | Pass; `demo-ready` |
| 3 | Video stays in this browser. | 5 | Pass; `local-processing` |
| 4 | Works offline after the first visit. | 6 | Pass; `offline-reload` |
| 5 | Free: PNG pack and PDF trace sheet. | 7 | Pass; `png-export`, `pdf-export` |
| 6 | Six moments become six frames to trace. | 7 | Pass |
| 7 | Choose a video you own. | 5 | Pass |
| 8 | The video and frames disappear on reload. | 7 | Pass; `ephemeral-project` |
| 9 | Choose a video this browser can play. | 7 | Pass |
| 10 | Move right to keep more dark areas. | 7 | Pass; `trace-controls` |
| 11 | Studio controls need a license. | 5 | Pass |
| 12 | Choose a video, then set a 1–5 second section. | 9 | Pass; `clip-workflow` |
| 13 | Pick a 1–5 second section from a video you own. | 10 | Pass; `clip-workflow` |
| 14 | Choose the frame rate and adjust the trace preview. | 9 | Pass; `trace-controls` |
| 15 | Export numbered PNGs or one PDF trace sheet. | 8 | Pass; `png-export`, `pdf-export` |
| 16 | Flipbook Trace does not publish, host, or generate video. | 9 | Pass; scope statement |
| 17 | It does not retain your video. | 6 | Pass; `ephemeral-project` |
| 18 | Use a video you own or have permission to trace. | 10 | Pass; responsibility statement |
| 19 | Large or long videos may use more memory. | 8 | Pass; limitation |
| 20 | Trim the video before loading it if your device slows down. | 11 | Pass; recovery guidance |
| 21 | $9 once. | 2 | Pass; `studio-purchase` |
| 22 | Keep the free PNG and PDF trace sheet exports. | 9 | Pass; export claims |
| 23 | Studio adds 1920 px, exports at your video's original width, and a six-column PDF trace sheet. | 16 | Pass; `studio-quality` |
| 24 | Dodo is the merchant of record for Sociobot. | 8 | **F-6-2: jargon** |
| 25 | Dodo handles refunds. | 3 | **F-6-1: behavior not proved** |
| 26 | A refund automatically revokes the Studio license. | 7 | **F-6-1: behavior not proved** |
| 27 | Turn your video into printable tracing frames. | 7 | Pass; footer one-liner |

The metadata description, **“Choose a local video, pick frames, and export numbered PNGs or a printable PDF trace sheet.”** (16), passes. The image alternative, **“Hands arrange six bird drawings into a hand-drawn flipbook.”** (9), describes the image's purpose.

### Landing headings, actions, labels, and fragments

| Type | Copy with word count | Result |
| --- | --- | --- |
| H1 | Turn your video into tracing frames (6) | Clear job headline |
| H2/H3 | Make the tracing frames (4); Your frames will appear here (5); How to make a trace sheet (6); Choose and trim (3); Set the lines (3); Print or draw (3); A preparation tool, not a video editor (7); Print larger with Studio (4) | Clear out of context; correct outline |
| Primary/workspace actions | Try it with sample data (5); Or choose your own video (5); Choose a video (3); Make tracing frames (3); Export PNG pack (3); Export PDF trace sheet (4) | Result-naming verbs |
| Settings/purchase actions | Import or export settings (4); Export settings (2); Import settings (2); Buy Studio for $9 (4); Verify license (2) | Result-naming verbs |
| Navigation/demo actions | Demo (1); How it works (3); Privacy (1); Reset demo (2); Start for real (3) | Clear navigation or required demo actions |
| Field labels | Your video (2); Start time (2); End time (2); Frames each second (3); Trace style (2); Line detail (2); Export width (2); PDF trace sheet columns (4); Paste your license (3) | Plain and consistent |
| Options | 2 — loose study (3); 4 (1); 6 — balanced (2); 8 (1); 12 — detailed (2); Pencil edges (2); High contrast (2); Grayscale (1); 960 px — free (3); 1920 px — Studio (3); Original video width — Studio (5); 4 columns — free (3); 6 columns — Studio (3) | Plain and distinct |
| Other fragments | Local video → printable trace sheet (5); 01 / Prepare (2); Waiting for a video (4); 00 (1); 02 / Method (2); No cloud (2); 03 / Boundaries (2); Studio Pass (2); 04 / Optional (2); Have a license? (3); Privacy · Terms (2); v1.0.16 · Original generated artwork (4) | Pass |

Terminology is otherwise consistent: **video** is the input, **selected section** is the 1–5 second range, **tracing frames** are processed images, **PNG pack** and **PDF trace sheet** are exports, **Studio** is the paid tier, and **paper-bird sample** is the named sample.

## Copy audit — README sentences and readable fragments

Commands in fenced blocks are commands rather than sentences. Every prose sentence, bullet, link label, and heading is included. No item exceeds 22 words or uses a banned marketing adjective.

| # | Sentence or fragment | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Turn your video into printable tracing frames. | 7 | Pass |
| 2 | Flipbook Trace is a local browser tool for short-form video creators. | 11 | Pass |
| 3 | Choose a 1–5 second section, set the frame rate and trace style, then export numbered PNGs or a PDF trace sheet. | 21 | Pass; workflow/export claims |
| 4 | The app decodes and processes video in the browser. | 9 | Pass; `local-processing` |
| 5 | The video and frames disappear on reload. | 7 | Pass; `ephemeral-project` |
| 6 | After the first visit, the app and its built-in demo work offline. | 12 | Pass; `offline-reload` |
| 7 | Live site: https://flipbook-trace.sociobot.in | 3 | Link returns 200 |
| 8 | Demo: https://flipbook-trace.sociobot.in/?demo=1 | 2 | Link returns 200 |
| 9 | Choose a video this browser can play | 7 | Pass |
| 10 | 2, 4, 6, 8, or 12 frames each second | 9 | Pass; `trace-controls` |
| 11 | Pencil edges, high contrast, and grayscale trace styles | 8 | Pass; `trace-controls` |
| 12 | Optionally show the previous frame in red | 7 | Pass; `trace-controls` |
| 13 | Numbered PNG pack and printable PDF trace sheet | 8 | Pass; export claims |
| 14 | A twelve-frame paper bird demo that does not read or change real saved data | 14 | Pass; `demo-isolation` |
| 15 | Install the app and reopen the demo offline | 8 | Pass; PWA/offline claims |
| 16 | Settings export and import | 4 | Pass; `settings-portability` |
| 17 | The free version exports 960 px PNGs and a PDF trace sheet. | 12 | Pass; `free-quality`, `pdf-export` |
| 18 | Studio costs $9 once and adds 1920 px, exports at your video's original width, and six-column PDF trace sheets. | 19 | Pass; purchase/quality claims |
| 19 | Dodo is the merchant of record for Sociobot. | 8 | **F-6-2: jargon** |
| 20 | Dodo handles refunds. | 3 | **F-6-1: behavior not proved** |
| 21 | A refund automatically revokes the Studio license. | 7 | **F-6-1: behavior not proved** |
| 22 | This tool is for creators preparing a hand-drawn flipbook from a video they own. | 14 | Pass |
| 23 | It replaces manual frame extraction. | 5 | Pass; core workflow |
| 24 | It is not a video editor, publishing service, or style-transfer tool. | 11 | Pass; scope statement |
| 25 | Requirements: Node.js 20 or newer and npm. | 7 | Pass |
| 26 | Open the local URL printed by Vite. | 7 | Pass |
| 27 | Use /?demo=1 to open the bundled sample. | 7 | Pass; `demo-ready` |
| 28 | npm test builds and serves the production bundle, then runs the claim, offline, mobile, console, and accessibility checks in Chromium. | 20 | Verified in the clean clone |
| 29 | The build command writes the static deployment to dist/, with dist/index.html at its root. | 14 | Verified in the clean clone |
| 30 | Each published product claim and its exact test command is recorded in .factory/claims.json. | 13 | Registry exists; F-6-1 is not behaviorally proved |
| 31 | The demo contract is in .factory/demo.md. | 6 | Verified |
| 32 | Video frames live only in page memory and disappear when the page reloads or closes. | 15 | Pass; `ephemeral-project` |
| 33 | This site's browser data stores your control settings, Studio license, and latest license check. | 14 | Pass; storage claims |
| 34 | Demo mode does not read or change those real-data stores. | 10 | Pass; `demo-isolation` |
| 35 | Technically, settings use IndexedDB and a license uses localStorage. | 9 | Verified in source and tests |
| 36 | /privacy and /terms contain the user-facing policies. | 7 | Both routes return 200 |
| 37 | Deploy the contents of dist/ as a static site. | 9 | Pass |
| 38 | Keep the host rules that send valid routes to index.html and return the designed 404 for unknown routes. | 18 | Verified live |
| 39 | Keep the listed security headers too. | 6 | Verified live |
| 40 | The factory handles infrastructure, DNS, and billing registration. | 8 | Process statement |
| 41 | Set VITE_BILLING_BASE only when the factory needs a non-production billing endpoint. | 11 | Pass |
| 42 | It defaults to https://api.sociobot.in. | 4 | Verified in source |
| 43 | MIT. | 1 | `LICENSE` exists |
| 44 | See LICENSE. | 2 | Link resolves |

README headings are clear out of context: **Flipbook Trace** (2), **What it includes** (3), **Who it is for** (4), **Run locally** (2), **Test and build** (3), **Privacy and file handling** (4), **Deploy** (1), and **License** (1).

## Demo and sandbox verification

- One click from `/` opens `/?demo=1` and shows **“Demo — sample data, nothing is saved,”** **Reset demo**, **Start for real**, and a realistic twelve-frame paper-bird sequence. The first sample frame ends at 520.44 px in the 390×844 viewport and is also visible in the 1440×900 first viewport.
- The first demo screen already shows the processed result. It does not require a file, account, or setup.
- Changing the selected section to five seconds and rate to 12 produces 60 frames. **Reset demo** restores end time 2, rate 6, line detail 142, and twelve frames.
- Real IndexedDB preferences and real license values were seeded before demo entry. Instrumentation recorded no real localStorage read and no IndexedDB open during demo entry. Demo use and reset left the values unchanged. **Start for real** removed the banner and restored line detail 199 and rate 8.
- The demo flow made no off-origin request. After service-worker control, an offline reload restored the banner and all twelve frames.
- No runtime AI request, Azure endpoint, embedded provider key, analytics request, third-party font, or third-party script exists.

## Registered claims

Clean clone: `/tmp/flipbook-review6-clean.ft9TbJ/repo` at `c48eee9ea190f09f6cc8f186c8dec7a19d29b9b5`. Every exact command from `.factory/claims.json` selected one tagged test and exited 0.

| Claim | Command | Result |
| --- | --- | --- |
| `clip-workflow` | `npm test -- --grep @claim:clip-workflow` | PASS |
| `demo-ready` | `npm test -- --grep @claim:demo-ready` | PASS |
| `demo-workflow` | `npm test -- --grep @claim:demo-workflow` | PASS |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS |
| `png-export` | `npm test -- --grep @claim:png-export` | PASS |
| `pdf-export` | `npm test -- --grep @claim:pdf-export` | PASS |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS |
| `ephemeral-project` | `npm test -- --grep @claim:ephemeral-project` | PASS |
| `trace-controls` | `npm test -- --grep @claim:trace-controls` | PASS |
| `settings-portability` | `npm test -- --grep @claim:settings-portability` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `pwa-installable` | `npm test -- --grep @claim:pwa-installable` | PASS |
| `free-quality` | `npm test -- --grep @claim:free-quality` | PASS |
| `studio-quality` | `npm test -- --grep @claim:studio-quality` | PASS |
| `studio-purchase` | `npm test -- --grep @claim:studio-purchase` | Command PASS; scope FAIL under F-6-1 |
| `studio-license-check` | `npm test -- --grep @claim:studio-license-check` | PASS |
| `studio-license-cache` | `npm test -- --grep @claim:studio-license-cache` | PASS |
| `browser-data-deletion` | `npm test -- --grep @claim:browser-data-deletion` | PASS |
| `app-update-check` | `npm test -- --grep @claim:app-update-check` | PASS |

The refund sentences are the only claim-like copy without observable proof. No other unlisted claim was found.

## Earlier-finding verification

Every earlier review and polish record plus the previous handoff was reread. Each finding was checked against both current code/tests and the live site.

| Earlier finding | Current verification |
| --- | --- |
| F-1-1 | Fixed: twelve sample frames remain in both first demo viewports. |
| F-1-2 | Fixed: `/missing-page` returns the designed HTTP 404. |
| F-1-3 | Fixed: `demo-ready` starts at `/` and clicks the named action once. |
| F-1-4 | Fixed: demo entry does not read/open real storage; seeded data survives reset and returns in real mode. |
| F-1-5 | Fixed: 1.0/5.0-second success and 0.5/5.1-second recovery are tested. |
| F-1-6 | Fixed: the settled workflow rejects every HTTP request, including same-origin collection GETs. |
| F-1-7 | Fixed: recursive snapshots cover IndexedDB, Cache Storage bodies, OPFS, and web storage. |
| F-1-8 | Fixed: the PDF image is decoded and twelve numbered non-blank cells are checked. |
| F-1-9 | Fixed: 1920 px/original-width PNGs and six visible PDF columns are checked. |
| F-1-10 | Fixed: the live Dodo checkout shows the product, USD 9.00, and one-time billing. |
| F-1-11 | Fixed: named format promises remain removed. |
| F-1-12 | Fixed: update behavior has a registered changed-worker test. |
| F-1-13 | Fixed: browser-data deletion has a registered clear-origin test. |
| F-1-14 | **Regressed; BLOCKING via F-6-1:** refund statements returned without behavioral proof. |
| F-1-15 | Fixed: title, description, canonical, Open Graph, and Twitter data change by route. |
| F-1-16 | Fixed: input is consistently **video** and duration is **selected section**. |
| F-1-17 | Fixed: printable output is consistently **PDF trace sheet**. |
| F-1-18 | Fixed: copy says **your video's original width**. |
| F-1-19 | **Regressed; BLOCKING via F-6-2:** **merchant of record** is live again. |
| F-1-20 | Fixed: kicker names the local-video to printable-sheet result. |
| F-1-21 | Fixed: **Line detail** includes directional help. |
| F-1-22 | Fixed: **Pencil edges** and previous-frame wording remain consistent. |
| F-1-23 | Fixed: install/offline copy names the user result. |
| F-1-24 | Fixed: retained data is explained before implementation storage names. |
| F-1-25 | Fixed: deployment instructions explain routing, 404, and headers plainly. |
| F-2-1 | Fixed: demo controls regenerate 60 frames and reset to twelve. |
| F-2-2 | Fixed: all three facts end above the 390×844 fold. |
| F-2-3 | Fixed: the free 960 px export has a dimension test. |
| F-2-4 | Fixed: static 404 has canonical, Open Graph URL, favicon, and Apple icon. |
| F-2-5 | Fixed: static 404 uses shared navigation, policy links, attribution, and build id. |
| F-2-6 | Fixed: caption says **six frames**, not pages. |
| F-2-7 | Fixed: README deployment sentences remain below 22 words. |
| F-2-8 | Fixed: the style is consistently **Pencil edges**. |
| F-2-9 | Fixed: the goal is **hand-drawn flipbook** and the sample is the paper bird. |
| F-2-10 | Fixed: disclosure says **Import or export settings**. |
| F-3-1 | Fixed: the full suite enumerates every visible mobile action; all meet 44×44 px. |
| F-5-1 | Fixed: the license test records every explicit-action request and rejects a second token destination. |
| F-5-2 | Fixed: both 404 implementations say **Page not found** and **Open Flipbook Trace**. |

## Structure, links, accessibility, and identity

- Titles pass: **Flipbook Trace — Turn video into tracing frames**, **Demo — Flipbook Trace**, **Privacy — Flipbook Trace**, **Terms — Flipbook Trace**, and **Page not found — Flipbook Trace**.
- Every checked route has `lang=en`, exactly one `<main>`, exactly one `<h1>`, a route description, canonical URL, route-specific Open Graph/Twitter values, favicon, Apple touch icon, and a 1200×630 social image.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns 404 with the designed page. `robots.txt`, `sitemap.xml`, the manifest, favicon, and Apple icon return 200.
- All discovered internal links, the Sociobot attribution link, and the checkout link resolve. The checkout reaches a live Dodo session. `mailto:` links are explicit. The 404 skip link correctly targets content on the 404 response.
- Internal navigation uses real URLs. Navigation, back, and forward move focus to the route `<h1>`; deep links reload correctly.
- The shared header/footer and policy links are present on every route, including 404. The live CSP, referrer policy, content-type protection, permissions policy, and frame-ancestor response header are present.
- The live accessibility helper found one title, `lang=en`, one H1, a main landmark, no missing image alternative, no unlabeled button, and no console errors. Playwright axe found zero serious/critical violations across all five routes. The full suite also passed keyboard, 200% text, mobile overflow, contrast, and 44 px target checks.
- The risograph worktable, warm paper, cyan/red spot inks, clipped paper shapes, and mono notes form a distinct product identity. It does not resemble a generic centered SaaS hero or three-card template. Asset provenance and motion/reduced-motion policy are recorded in `.factory/design.md`.
- Production JS is well below the 150 KB gzip limit. The clean build's largest chunk is 23.86 KB raw / 7.96 KB gzip.

## Quality gates

From the clean clone:

- `npm ci`: pass, 0 vulnerabilities reported.
- `npm run test:unit`: 3/3 pass.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: 59/59 pass.
- `npm run build`: pass; `dist/` produced.
- `/opt/fleet/lib/verify-url.sh`: pass on the live home page; no console errors.
- Live Playwright axe integration: zero serious/critical violations on `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page`.

## Missed leverage

No missed-leverage finding. The brief's obvious extensions are already present: local video import, configurable tracing, PNG/PDF export, settings import/export, offline use, and a sandboxed sample. Sync would weaken the local-only promise. An AI step would be decorative because deterministic frame extraction and filtering are the job; no provider key or AI endpoint is embedded.

## What would make this perfect

There are exactly two remaining changes:

1. Remove the unproved refund-behavior sentences, or add an end-to-end refund-to-license-revocation claim test through the Sociobot billing boundary.
2. Replace **“merchant of record”** with plain checkout wording.

After those changes, rerun all 19 exact claim commands and the full 59-test suite, then recheck the three purchase surfaces live. No other product, demo, copy, structure, accessibility, privacy, visual, or leverage gap was found.
