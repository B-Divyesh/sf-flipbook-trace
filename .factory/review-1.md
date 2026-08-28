# Adversarial first-read review 1 — FAIL

Reviewed on 2026-08-28 against repository base `458c85c1964716c594bee225c720902160260d9d` and <https://flipbook-trace.sociobot.in> in fresh Chromium contexts at 390×844 and 1440×900.

## Verdict

**FAIL.** The landing screen is clear and the core workflow works, but the demo does not show a sample frame in its first viewport, the 404 is a soft 200, and several registered claims are not proved to their stated scope. There are also unlisted claims, stale route social metadata, and copy consistency/jargon findings. A PASS requires zero findings and no untested claim.

## Findings

### Blocking

#### F-1-1 — The first demo screen does not show the sample output

- Exact location: `/demo`, immediately after clicking **Try it with sample data**.
- Evidence: at 390×844, the first sample frame begins at approximately `y=2026`; at 1440×900 it begins at approximately `y=920`. No bird frame is visible in either first viewport. The mobile viewport ends on **12 frames ready**; the desktop viewport ends immediately before the controls and frame strip.
- Why this fails: the demo contract requires the first screen after one click to show the product already being used with realistic sample data. A status count is not the sample result.
- Concrete fix: place a compact strip of the twelve bird frames directly below the demo banner or beside the demo headline, before the long intro and controls. Add a 390×844 and 1440×900 assertion that the first frame's bottom edge is inside the viewport after the landing-page click.

#### F-1-2 — Unknown URLs return HTTP 200 instead of a real 404

- Exact location: `https://flipbook-trace.sociobot.in/missing-page` and `public/staticwebapp.config.json`.
- Evidence: the styled “This page fell out of the stack” screen is present, but `/missing-page` and `/404.html` both return HTTP 200. The host configuration has only `navigationFallback`; it has no `responseOverrides.404` and there is no real `404.html` artifact.
- Why this fails: crawlers, link checkers, and visitors cannot distinguish a missing resource from a valid page. This is broken routing under the site-structure contract.
- Concrete fix: ship a styled `404.html`, add `"responseOverrides": {"404": {"rewrite": "/404.html"}}`, and test both the designed content and the HTTP 404 status.

#### F-1-3 — `demo-ready` does not test “with one click”

- Exact quote: claims entry “Try a ready twelve-frame motion study with one click.”
- Exact test: `tests/claims.spec.ts`, `@claim:demo-ready`, opens `/demo` directly.
- Why this fails: the tagged test never loads `/` or clicks **Try it with sample data**. A missing or broken landing action would still pass.
- Concrete fix: start at `/`, click the named action once, assert `/demo`, then assert the banner, first-viewport frame visibility, twelve frames, and ready status.

#### F-1-4 — `demo-isolation` does not test whether real settings are read

- Exact quote: “Demo sample data is not saved and demo mode does not read or change real settings or licenses.”
- Exact test gap: the tagged test preloads license keys before navigation, but creates the IndexedDB preference marker only after `/demo` has loaded. It therefore cannot detect a real-settings read during demo initialization.
- Why this fails: the test's own registered sandbox says to preload a real license and preferences. A demo that read real preferences on startup and later left them unchanged could pass.
- Concrete fix: seed real IndexedDB preferences before opening `/demo`; instrument or assert no read; confirm initial demo controls remain defaults; snapshot all relevant storage before and after Reset and Start for real.

#### F-1-5 — `clip-workflow` proves only one trim boundary

- Exact quote: “Turns a 1–5 second section of a local video into tracing frames.”
- Exact test gap: `@claim:clip-workflow` accepts a roughly two-second WebM and rejects `0.5` seconds, but never rejects a section longer than five seconds or proves the five-second boundary.
- Why this fails: half of the advertised range can regress while the claim remains green.
- Concrete fix: use a source longer than five seconds; assert 1.0 and 5.0 seconds succeed and values below 1.0 and above 5.0 fail with the recovery message.

#### F-1-6 — `local-processing` allows same-origin uploads

- Exact quote: “Video and frame processing stay in the browser.”
- Exact test gap: `@claim:local-processing` records only requests whose origin differs from `http://127.0.0.1:4173`. A same-origin `POST /upload` containing the clip or frames would pass.
- Why this fails: “stays in the browser” means no upload, not merely no cross-origin upload.
- Concrete fix: begin interception after the shell is loaded and reject every unexpected request, including same-origin POST/PUT/PATCH requests and request bodies. Allow only documented shell/update GETs.

#### F-1-7 — `ephemeral-project` does not prove “page memory only”

- Exact quote: “The source clip and generated frames stay in page memory and disappear on reload.”
- Exact test gap: `@claim:ephemeral-project` checks the cleared UI and searches one IndexedDB settings object for the filename. It does not inspect localStorage, every IndexedDB store/value, Cache Storage, OPFS, or stored binary content.
- Why this fails: data could be retained without its filename and the test would still pass.
- Concrete fix: snapshot all persistent browser stores before import, inspect all values/blobs after frame generation, reload, and assert only the documented control settings and app-shell cache exist.

#### F-1-8 — `pdf-export` does not prove a contact sheet

- Exact quote: “Exports a printable PDF contact sheet.”
- Exact test gap: `@claim:pdf-export` asserts `%PDF-1.4` and a file size over 20,000 bytes only.
- Why this fails: a corrupt, blank, or unrelated large PDF would pass; the promised frame layout is untested.
- Concrete fix: parse or rasterize the PDF and assert a valid page tree, expected page size, twelve numbered frame cells, and non-blank frame image content.

#### F-1-9 — `studio-quality` tests control selection, not Studio output

- Exact quote: “Studio adds 1920 px, source-width exports, and six-column sheets.”
- Exact test gap: `@claim:studio-quality` selects `1920` and six columns and checks the select values. It never selects source width, loads a video, downloads a PNG, measures image dimensions, exports a PDF, or checks six-column layout.
- Why this fails: this is precisely a control-existence test, which the claims contract excludes.
- Concrete fix: load a known-size video with a valid fixture license; inspect a 1920 px PNG, inspect a source-width PNG, and rasterize/parse the PDF to confirm six columns.

#### F-1-10 — `studio-purchase` does not prove “$9 once”

- Exact quote: “Studio costs $9 once and opens the registered Sociobot hosted checkout.”
- Exact test gap: `@claim:studio-purchase` checks that the product link's accessible name contains `$9` and that the endpoint redirects to a Dodo URL. It does not inspect the checkout amount or recurrence.
- Evidence outside the test: the live Dodo page currently shows **$9**, **One-time**, and **Flipbook Trace Studio**. The product works today, but the registered automated proof would still pass if the checkout product changed price or became recurring.
- Concrete fix: follow the redirect in the tagged test and assert product identity, USD 9 total, and one-time billing from a stable checkout/API contract fixture.

### Major

#### F-1-11 — Browser-format support is an unlisted claim

- Exact quotes: landing helper “MP4, WebM, or another format your browser can play.” README “Video formats supported by the current browser.”
- Why this fails: no `claims.json` entry covers format support. `clip-workflow` exercises WebM only and does not prove MP4.
- Concrete fix: either add fixtures and a claim test for each named format in the supported browser matrix, or rewrite both places to “Choose a video this browser can play” without naming an untested format.

#### F-1-12 — Update behavior is an unlisted live privacy claim

- Exact quote: `/privacy`, “The installed app checks its own site for updates.”
- Why this fails: an untagged site test covers one service-worker update path, but there is no corresponding claim registry entry or declared sandbox.
- Concrete fix: add an `app-update-check` claim linked to the existing update regression and list `/privacy` in `where`.

#### F-1-13 — Browser-data deletion is an unlisted claim

- Exact quote: `/privacy`, “Clear this site's browser data to remove settings and a saved license.”
- Why this fails: no registered test clears origin data and proves both stores are removed.
- Concrete fix: add a deletion claim test that seeds preferences and a license, clears site data through the browser protocol, reloads, and confirms defaults and no active license.

#### F-1-14 — Billing disclosure and refund behavior are unlisted claims

- Exact quotes: landing “Sociobot/Dodo is the merchant of record. Refunds are handled there.” `/privacy` says the billing service receives the token and normal request details. `/terms` says “A refund revokes the related license.”
- Why this fails: `studio-purchase` proves only a redirect and a mocked successful verify response. It does not prove data sent during verification, merchant identity, refund handling, or license revocation.
- Concrete fix: split these into testable billing/privacy claims with recorded gateway fixtures and a refund-revocation integration fixture, or remove statements the sandbox cannot prove.

### Minor

#### F-1-15 — Route-specific social metadata stays on the home-page values

- Exact location: `/demo`, `/privacy`, `/terms`, and the 404 view.
- Evidence: `document.title`, description, and canonical change, but `og:title`, `og:description`, `og:url`, and the Twitter title/description remain the landing values; `og:url` is always `/`.
- Why this fails: shared previews identify a privacy, terms, demo, or missing URL as the landing page.
- Concrete fix: update all Open Graph and Twitter route fields in `updateMeta`, or serve route-specific HTML metadata. Add route assertions.

#### F-1-16 — The same input is called four different things

- Exact quotes: “your video,” “their clip,” “Trim the source,” and “Use footage you own.”
- Why this fails: the repository terminology table says the input term is **video**, but the live page alternates video, clip, source, and footage.
- Concrete rewrite: use **video** for the input everywhere and **selected section** only for the trimmed 1–5 second range. For example: “The video and frames disappear on reload” and “Trim the video before loading it.”

#### F-1-17 — The same PDF output has three names

- Exact quotes: “PDF sheet,” “PDF contact sheet,” and heading “trace sheet.”
- Why this fails: a first-time visitor must infer that these are the same download.
- Concrete rewrite: use **PDF trace sheet** everywhere, including the export button, README, claims entry, and How it works section.

#### F-1-18 — “Source-width” is unexplained jargon

- Exact quotes: landing and README, “source-width exports.”
- Why this fails: a phone visitor should not need to infer that “source” means the original video's pixel width.
- Concrete rewrite: “exports at your video's original width.”

#### F-1-19 — “Merchant of record” is legal/payment jargon

- Exact quote: landing, “Sociobot/Dodo is the merchant of record.”
- Why this fails: the slash also makes it unclear which company charges the buyer.
- Concrete rewrite: “Dodo processes the payment for Sociobot and handles refunds.” Use the legally correct single entity name.

#### F-1-20 — “Paper study” is less clear than the product's job

- Exact quote: hero kicker “Local video → paper study.”
- Why this fails: “paper study” is not used consistently and does not name the output as clearly as the headline.
- Concrete rewrite: “LOCAL VIDEO → PRINTABLE TRACE SHEET.”

#### F-1-21 — “Line threshold” is unexplained image-processing jargon

- Exact location: landing workspace control label “Line threshold.”
- Why this fails: the visitor cannot predict what moving the slider will change.
- Concrete rewrite: “Line detail,” plus “Move right to keep more dark areas.”

#### F-1-22 — README uses “onion skin” where the UI already has plain words

- Exact quote: README, “Optional previous-frame onion skin.”
- Why this fails: the README uses animation jargon while the control says what it does.
- Concrete rewrite: “Optionally show the previous frame in red.”

#### F-1-23 — README uses “PWA shell” instead of the user result

- Exact quote: README, “Installable PWA shell and offline reload.”
- Why this fails: “PWA shell” describes an implementation, not the result.
- Concrete rewrite: “Install the app and reopen the demo offline.”

#### F-1-24 — README exposes storage implementation names without first explaining them

- Exact quotes: “IndexedDB stores control settings.” and “Local storage holds a Studio license...”
- Why this fails: the privacy section should first state what is retained in user terms.
- Concrete rewrite: “This site's browser data stores your control settings, Studio license, and latest license check.” A following technical note may name IndexedDB and localStorage.

#### F-1-25 — README's deploy instruction uses unexplained “SPA navigation fallback”

- Exact quote: “Keep the SPA navigation fallback and response headers from `public/staticwebapp.config.json`.”
- Why this fails: it names the mechanism without the required behavior and currently masks the soft-404 defect.
- Concrete rewrite: “Keep the host rules that send valid app routes to `index.html`, return the designed 404 for unknown routes, and set the listed security headers.”

## Cold first screen

The cold-read gate itself passes on both tested viewports.

- What it does, in my words: extracts moments from a local video and turns them into frames to trace or print.
- For whom: short-form creators making a hand-drawn motion study without uploading their video.
- What to click first: **Try it with sample data**. The adjacent sentence says it opens a ready twelve-frame study.
- Exact first-screen copy that answered this: “Turn your video into tracing frames”; “For short-form creators who want a hand-drawn study without uploading their clip”; “Try it with sample data”; “It opens a ready 12-frame motion study.”

All three short facts fit above the fold at 390×844 and 1440×900. No horizontal overflow or console error occurred.

## Demo and sandbox exercise

One click from `/` opens `/demo`, renders twelve Canvas bird frames, shows the persistent banner, and exposes **Reset demo** and **Start for real**. Reset restored threshold `142`, 6 frames per second, and twelve frames. A preloaded real preference record (`threshold: 199`, `fps: 8`) and real license remained unchanged; demo Studio controls stayed locked. After **Start for real**, the banner disappeared and the real settings/license returned. The first viewport failure is F-1-1.

With the live context offline after service-worker control, `/demo` reloaded with twelve frames and the banner. The exercised demo made no cross-origin request.

A separate live real-workflow run generated and loaded a local WebM, produced 13 frames, downloaded a 29,961-byte ZIP with the correct final numbered filename, downloaded a 63,524-byte `%PDF-1.4` file, made no cross-origin request, and showed no clip or frames after reload.

## Claim commands from a clean clone

Clean clone: repository HEAD at the reviewed base, followed by `npm ci` (140 packages, zero vulnerabilities). Every exact command in `.factory/claims.json` exited 0 and selected exactly one tagged test.

| Claim | Exact command | Command result | Scope result |
| --- | --- | --- | --- |
| `clip-workflow` | `npm test -- --grep @claim:clip-workflow` | PASS | BLOCKING gap F-1-5 |
| `demo-ready` | `npm test -- --grep @claim:demo-ready` | PASS | BLOCKING gap F-1-3 |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS | BLOCKING gap F-1-4 |
| `png-export` | `npm test -- --grep @claim:png-export` | PASS | Proves ZIP signature and numbered twelfth PNG |
| `pdf-export` | `npm test -- --grep @claim:pdf-export` | PASS | BLOCKING gap F-1-8 |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS | BLOCKING gap F-1-6 |
| `ephemeral-project` | `npm test -- --grep @claim:ephemeral-project` | PASS | BLOCKING gap F-1-7 |
| `trace-controls` | `npm test -- --grep @claim:trace-controls` | PASS | Scope verified |
| `settings-portability` | `npm test -- --grep @claim:settings-portability` | PASS | Scope verified |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS | Scope verified |
| `pwa-installable` | `npm test -- --grep @claim:pwa-installable` | PASS | Scope verified |
| `studio-quality` | `npm test -- --grep @claim:studio-quality` | PASS | BLOCKING gap F-1-9 |
| `studio-purchase` | `npm test -- --grep @claim:studio-purchase` | PASS | BLOCKING gap F-1-10 |

The full clean-clone suite also passed: 3/3 unit tests, lint, 25/25 Playwright tests, typecheck, and production build. Build output was 29.66 KB JavaScript (10.82 KB gzip), 14.86 KB CSS (4.19 KB gzip), and `dist/` was produced.

## Landing-page copy audit

Counts treat a hyphenated term or numeric range as one word. Sentences are split at sentence boundaries; headings, controls, and fragments are audited separately below. No landing sentence exceeds 22 words and no banned marketing adjective appears.

| Location | Sentence | Words | Result |
| --- | --- | ---: | --- |
| Hero | For short-form creators who want a hand-drawn study without uploading their clip. | 12 | F-1-16 |
| Hero | It opens a ready 12-frame motion study. | 7 | Pass |
| Hero fact | Video stays in this browser. | 5 | Pass; `local-processing` |
| Hero fact | Works offline after the first visit. | 6 | Pass; `offline-reload` |
| Hero fact | Free: PNG pack and PDF sheet. | 6 | F-1-17 |
| Hero art | Six moments become six pages to trace. | 7 | Pass |
| Workspace | Choose a video you own. | 5 | Pass |
| Workspace | The clip and frames disappear on reload. | 7 | F-1-16 |
| File help | MP4, WebM, or another format your browser can play. | 9 | F-1-11 |
| Studio help | Studio controls need a license. | 5 | Pass |
| Empty state | Choose a video, then set a 1–5 second section. | 9 | Pass |
| Step 1 | Pick a 1–5 second section from a video you own. | 10 | Pass |
| Step 2 | Choose the frame rate and adjust the trace preview. | 9 | Pass |
| Step 3 | Export numbered PNGs or one PDF contact sheet. | 8 | F-1-17 |
| Boundaries | Flipbook Trace does not publish, host, or generate video. | 9 | Pass |
| Boundaries | It does not retain your clip. | 6 | F-1-16 |
| Boundaries | Use footage you own or have permission to trace. | 9 | F-1-16 |
| Boundaries | Large or long videos may use more memory. | 8 | Pass; limitation |
| Boundaries | Trim the source before loading it if your device slows down. | 10 | F-1-16 |
| Studio | $9 once. | 2 | F-1-10 |
| Studio | Keep the free PNG and PDF exports. | 7 | Pass |
| Studio | Studio adds 1920 px, source-width exports, and a six-column sheet. | 10 | F-1-9, F-1-18 |
| Studio | Sociobot/Dodo is the merchant of record. | 6 | F-1-14, F-1-19 |
| Studio | Refunds are handled there. | 4 | F-1-14 |
| Footer | Turn your video into printable tracing frames. | 7 | Pass |

All other visible landing copy, including headings and actions:

| Section | Copy with word count |
| --- | --- |
| Skip/header | Skip to main content (4); FT (1); Flipbook Trace (2); Demo (1); How it works (3); Privacy (1) |
| Hero | Local video → paper study (4, F-1-20); Turn your video into tracing frames (6); Try it with sample data (5); Or choose your own video (5) |
| Workspace headings/status | 01 / Prepare (3); Make the tracing frames (4); Waiting for a video (4); Your frames will appear here (5); 00 (1) |
| Workspace fields | Your video (2); Start time (2); End time (2); Frames each second (3); Trace style (2); Pencil edges (2); High contrast (2); Grayscale (1); Line threshold (2, F-1-21); Show the previous frame in red (6); Export width (2); PDF sheet columns (3) |
| Workspace options | 2 — loose study (4); 4 (1); 6 — balanced (3); 8 (1); 12 — detailed (3); 960 px — free (4); 1920 px — Studio (4); Source width — Studio (4); 4 columns — free (4); 6 columns — Studio (4) |
| Workspace actions | Make tracing frames (3); Move saved settings (3); Export settings (2); Import settings (2); Choose a video (3) |
| Method | 02 / Method (3); How to make a trace sheet (6, F-1-17); Choose and trim (3); Set the lines (3); Print or draw (3) |
| Boundaries | NO CLOUD (2); 03 / Boundaries (3); A preparation tool, not a video editor (7) |
| Studio | STUDIO PASS (2); 04 / Optional (3); Print larger with Studio (4); Buy Studio for $9 (4); Have a license? (3); Paste your license (3); Verify license (2); Privacy (1); Terms (1) |
| Footer | Privacy (1); Terms (1); Built by Param Factory (4); v1.0.2 · Original generated artwork (4) |

Every actual `<button>` label names a result or operation. Headings form a clear outline and make sense out of context. The terminology and jargon flags are listed as findings above.

## README copy audit

Code fences and bare shell commands are not sentences. No README unit exceeds 22 words; one is exactly 22. There are no banned marketing adjectives.

| # | Sentence, heading, or list item | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Flipbook Trace | 2 | Heading |
| 2 | Turn your video into printable tracing frames. | 7 | Pass |
| 3 | Flipbook Trace is a local browser tool for short-form video creators. | 11 | Pass |
| 4 | Choose a 1–5 second section, set the frame rate and trace style, then export numbered PNGs or a PDF contact sheet. | 22 | F-1-17 |
| 5 | The app decodes and processes video in the browser. | 9 | `local-processing` |
| 6 | The clip and frames disappear on reload. | 7 | F-1-16 |
| 7 | After the first visit, the app and its built-in demo work offline. | 12 | `offline-reload` |
| 8 | Live site: https://flipbook-trace.sociobot.in | 3 | Verified |
| 9 | Demo: https://flipbook-trace.sociobot.in/demo | 2 | Verified |
| 10 | What it includes | 3 | Heading |
| 11 | Video formats supported by the current browser | 7 | F-1-11 |
| 12 | 2, 4, 6, 8, or 12 frames each second | 9 | `trace-controls` |
| 13 | Pencil edge, high contrast, and grayscale trace styles | 8 | `trace-controls` |
| 14 | Optional previous-frame onion skin | 4 | F-1-22 |
| 15 | Numbered PNG pack and printable PDF contact sheet | 8 | F-1-17 |
| 16 | A twelve-frame paper bird demo that does not read or change real saved data | 14 | F-1-4 |
| 17 | Installable PWA shell and offline reload | 6 | F-1-23 |
| 18 | Settings export and import | 4 | `settings-portability` |
| 19 | The free version includes 960 px PNG and PDF exports. | 10 | Registered export claims |
| 20 | Studio costs $9 once and adds 1920 px, source-width exports, and six-column sheets. | 13 | F-1-9, F-1-10, F-1-18 |
| 21 | Purchases and license checks use the Sociobot billing API. | 9 | F-1-14 |
| 22 | Who it is for | 4 | Heading |
| 23 | This tool is for creators preparing a hand-drawn flipbook study from footage they own. | 14 | Pass |
| 24 | It replaces manual frame extraction. | 5 | `clip-workflow` |
| 25 | It is not a video editor, publishing service, or style-transfer tool. | 11 | Scope statement |
| 26 | Run locally | 2 | Heading |
| 27 | Requirements: Node.js 20 or newer and npm. | 7 | Developer instruction |
| 28 | Open the local URL printed by Vite. | 7 | Developer instruction |
| 29 | Use /demo to open the bundled sample. | 7 | `demo-ready` |
| 30 | Test and build | 3 | Heading |
| 31 | npm test builds and serves the production bundle, then runs the claim, offline, mobile, console, and accessibility checks in Chromium. | 20 | Verified in clean clone |
| 32 | The build command writes the static deployment to dist/, with dist/index.html at its root. | 14 | Verified in clean clone |
| 33 | Each published product claim and its exact test command is recorded in .factory/claims.json. | 13 | False by F-1-11–F-1-14 |
| 34 | The demo contract is in .factory/demo.md. | 6 | Verified |
| 35 | Privacy and file handling | 4 | Heading |
| 36 | Video frames live only in page memory and disappear when the page reloads or closes. | 15 | F-1-7 |
| 37 | IndexedDB stores control settings. | 4 | F-1-24 |
| 38 | Local storage holds a Studio license and its latest verification result when a buyer adds one. | 16 | F-1-24 |
| 39 | Demo mode does not read or change either real-data store. | 10 | F-1-4 |
| 40 | /privacy and /terms contain the user-facing policies. | 7 | Verified |
| 41 | Deploy | 1 | Heading |
| 42 | Deploy the contents of dist/ as a static site. | 9 | Developer instruction |
| 43 | Keep the SPA navigation fallback and response headers from public/staticwebapp.config.json. | 10 | F-1-25 |
| 44 | The factory handles infrastructure, DNS, and billing registration. | 8 | Process statement |
| 45 | Set VITE_BILLING_BASE only when the factory needs a non-production billing endpoint. | 11 | Developer instruction |
| 46 | It defaults to https://api.sociobot.in. | 4 | Verified in source |
| 47 | License | 1 | Heading |
| 48 | MIT. | 1 | Verified |
| 49 | See LICENSE. | 2 | Verified |

## Structure, links, accessibility, and visual identity

- Titles, descriptions, canonical URLs, `lang=en`, one H1, one main landmark, favicon, Apple icon, manifest, OG image, robots, sitemap, consistent header/footer, deep links, History API navigation, back-button restoration, route focus, and reduced motion are present. F-1-15 covers stale route social fields.
- The crawl checked every link on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page`. All HTTP links reached 200 after redirects; the two `mailto:` links are explicit. Checkout reached a live Dodo session. There are no dead links.
- Live axe scans on all five routes found zero violations at 390×844. `verify-url.sh` passed with no console/page errors, one H1, title, language, main, alt text, and labelled buttons. Touch targets and horizontal overflow pass the existing mobile regression.
- The risograph worktable, paper texture, registration marks, hard ink shadows, type pairing, and generated bird artwork are distinct and match `.factory/design.md`. This is not a generic SaaS template.
- Live HTML, hashed JS/CSS, service worker, manifest, robots, and sitemap hashes match the clean production build. Hashed assets return one-year immutable caching and the worker returns `no-cache, no-store, must-revalidate`.

## History verification

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. The earlier failed verification and later PASS handoff were read. Each earlier defect was checked in live behavior and source:

| Earlier defect | Current check |
| --- | --- |
| Checkout product returned 404 | Fixed: endpoint returns 303; Dodo page returns 200 and shows $9 one-time. Automated scope remains incomplete as F-1-10. |
| `npm run test:unit` failed | Fixed: 3/3 pass from clean clone. |
| Demo read a real saved license | Fixed: live demo kept Studio locked and source gates license initialization to `/`; real storage stayed unchanged. |
| Claim registry was incomplete/under-proved | **Half-fixed and blocking again:** 13 commands pass, but F-1-3–F-1-14 remain. |
| Mobile targets were below 44 px | Fixed: regression passes; live 390 px view has no overflow. |
| Three hero facts were below the desktop fold | Fixed: all are within both desktop and mobile first screens. |
| Assets lacked immutable versioning | Fixed: hashed JS/CSS and live cache headers verified. |

The latest handoff's PASS conclusion relied on green claim commands and did not catch the assertion-scope defects above. No previously identified non-claim defect regressed.

## Missed leverage

No AI feature is warranted. Remote inference would not improve deterministic frame extraction and would weaken the local-first privacy promise. The brief's obvious import/export need is covered by local video input, PNG/PDF output, and settings JSON portability. Sync is not implied by the brief and would add privacy and account complexity. No missed-leverage finding is recorded.

## What would make this perfect

Resolve every finding above: show real sample frames in the first demo viewport, return a genuine designed 404, make every tagged claim test prove the full user-visible outcome, register or remove all remaining claim-like statements, update route social metadata, and use one plain term for each input and output. Re-run the cold mobile/desktop audit, every exact claim command, storage/network interception, link crawl, axe, and full build from a clean clone. Only a zero-finding rerun should pass.
