# Adversarial first-read review 4 — PASS

Reviewed on 2026-08-28 against repository commit `12192a425ce758b4309f38542791758c1dcbe78c` and <https://flipbook-trace.sociobot.in> in fresh Chromium contexts at 390×844 and 1440×900.

## Verdict

**PASS.** No blocking, major, or minor findings remain. The first screen is clear, the one-click demo is useful and isolated, all 18 registered claim commands pass from a clean clone, every public claim is listed, every earlier finding remains fixed, and the live structure and accessibility checks pass.

## Findings

None.

## Cold first screen

The first screen was recorded before scrolling in separate fresh contexts.

- What it does, in my words: turns a video into printable frames for tracing.
- For whom: short-form creators making a hand-drawn flipbook without uploading their video.
- What to click first: **Try it with sample data**. The adjacent text says it opens a ready 12-frame paper-bird sample.
- Exact copy that answers the questions: **“Turn your video into tracing frames”**; **“For short-form creators making a hand-drawn flipbook without uploading their video.”**; **“Try it with sample data”**; **“It opens a ready 12-frame paper-bird sample.”**
- All three required facts are visible without scrolling. Their bottom is 733.2 px at 390×844 and 794.6 px at 1440×900.
- Neither viewport has horizontal overflow, a console error, or a page error.

## Copy audit — landing-page sentences

Counts split on whitespace and treat hyphenated words and ranges as one word. Every sentence is at or below 22 words. No sentence contains a banned marketing adjective, unexplained jargon, or inconsistent product term.

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
| 22 | Keep the free PNG and PDF trace sheet exports. | 9 | Pass; `png-export`, `pdf-export` |
| 23 | Studio adds 1920 px, exports at your video's original width, and a six-column PDF trace sheet. | 16 | Pass; `studio-quality` |
| 24 | Dodo opens checkout for Sociobot. | 5 | Pass; `studio-purchase` |
| 25 | Turn your video into printable tracing frames. | 7 | Pass |

The landing metadata also uses plain copy: **“Choose a local video, pick frames, and export numbered PNGs or a printable PDF trace sheet.”** (16 words). The hero image alternative is **“Hands arrange six bird drawings into a hand-drawn flipbook.”** (9 words).

### Landing headings, actions, labels, and fragments

| Type | Copy with word count | Result |
| --- | --- | --- |
| H1 | Turn your video into tracing frames (7) | Clear job headline |
| H2/H3 | Make the tracing frames (4); Your frames will appear here (5); How to make a trace sheet (6); Choose and trim (3); Set the lines (3); Print or draw (3); A preparation tool, not a video editor (7); Print larger with Studio (4) | Clear out of context; correct outline |
| Primary/workspace actions | Try it with sample data (6); Or choose your own video (5); Choose a video (3); Make tracing frames (3); Export PNG pack (3); Export PDF trace sheet (4) | Result-naming verbs |
| Settings/purchase actions | Import or export settings (4); Export settings (2); Import settings (2); Buy Studio for $9 (4); Verify license (2) | Result-naming verbs |
| Navigation/demo actions | Demo (1); How it works (3); Privacy (1); Reset demo (2); Start for real (3) | Clear navigation or required demo actions |
| Field labels | Your video (2); Start time (2); End time (2); Frames each second (3); Trace style (2); Line detail (2); Export width (2); PDF trace sheet columns (4); Paste your license (3) | Plain and consistent |
| Options | 2 — loose study (3); 4 (1); 6 — balanced (2); 8 (1); 12 — detailed (2); Pencil edges (2); High contrast (2); Grayscale (1); 960 px — free (3); 1920 px — Studio (3); Original video width — Studio (5); 4 columns — free (3); 6 columns — Studio (3) | Plain and distinct |
| Other fragments | Local video → printable trace sheet (5); 01 / Prepare (2); Waiting for a video (4); 00 (1); 02 / Method (2); No cloud (2); 03 / Boundaries (2); Studio (1); Pass (1); 04 / Optional (2); Have a license? (3); Privacy · Terms (2); v1.0.4 · Original generated artwork (4) | Pass |

Terminology is consistent: **video** is the input, **selected section** is its 1–5 second range, **frame/tracing frames** are processed images, **PNG pack** and **PDF trace sheet** are exports, **Studio** is the paid tier, and **paper-bird sample** is the demo.

## Copy audit — README sentences and readable fragments

Commands in fenced blocks are commands rather than sentences. All prose, bullets, link labels, and headings are included. No item exceeds 22 words, contains a banned marketing adjective, or conflicts with the product terminology.

| # | Sentence or fragment | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Turn your video into printable tracing frames. | 7 | Pass |
| 2 | Flipbook Trace is a local browser tool for short-form video creators. | 11 | Pass |
| 3 | Choose a 1–5 second section, set the frame rate and trace style, then export numbered PNGs or a PDF trace sheet. | 21 | Pass; registered workflow/export claims |
| 4 | The app decodes and processes video in the browser. | 9 | Pass; `local-processing` |
| 5 | The video and frames disappear on reload. | 7 | Pass; `ephemeral-project` |
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
| 28 | Each published product claim and its exact test command is recorded in .factory/claims.json. | 13 | Verified; 18 entries and 18 unique tags |
| 29 | The demo contract is in .factory/demo.md. | 6 | Verified |
| 30 | Video frames live only in page memory and disappear when the page reloads or closes. | 15 | Pass; `ephemeral-project` |
| 31 | This site's browser data stores your control settings, Studio license, and latest license check. | 14 | Pass; storage claims |
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

- One click from `/` opens `/?demo=1` and immediately shows the persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**, **Start for real**, twelve compact paper-bird frames, twelve workspace frames, and **12 frames ready**.
- The first sample frame ends at 520.44 px in the 390×844 viewport. It is therefore visible on the first post-click screen.
- Changing the selected section to five seconds and the rate to 12 produces 60 frames and **60 frames ready**.
- **Reset demo** restores end time 2, rate 6, line detail 142, twelve frames, and **12 frames ready**.
- Real IndexedDB settings and both real license keys were seeded before direct demo entry. Demo entry, regeneration, and reset left them unchanged. **Start for real** removed the banner and restored rate 8, grayscale, line detail 199, and the seeded license.
- The demo flow made no off-origin request, body-bearing request, or non-GET/HEAD request.
- After service-worker control, an offline reload restored the banner and all twelve frames.

## Registered claims

Clean clone: `/tmp/flipbook-review4-clean.lkTBC4/repo` at `12192a425ce758b4309f38542791758c1dcbe78c`. Each exact command from `.factory/claims.json` ran independently. Every ID occurs in exactly one `@claim:<id>` test tag.

| Claim | Exact command | Result and observed scope |
| --- | --- | --- |
| `clip-workflow` | `npm test -- --grep @claim:clip-workflow` | PASS; 1.0/5.0 seconds accepted and 0.5/5.1 rejected |
| `demo-ready` | `npm test -- --grep @claim:demo-ready` | PASS; landing click, demo URL, banner, 12 frames, first-viewport frame |
| `demo-workflow` | `npm test -- --grep @claim:demo-workflow` | PASS; 12→60 regeneration and reset |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS; instrumented real storage reads/opens and unchanged values |
| `png-export` | `npm test -- --grep @claim:png-export` | PASS; ZIP signature and numbered twelfth PNG |
| `pdf-export` | `npm test -- --grep @claim:pdf-export` | PASS; independently decoded non-blank 12-cell, four-column sheet |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS; no upload, body, or off-origin request |
| `ephemeral-project` | `npm test -- --grep @claim:ephemeral-project` | PASS; IndexedDB, Cache Storage, OPFS, local/session storage, and reload checked |
| `trace-controls` | `npm test -- --grep @claim:trace-controls` | PASS; five rates and distinct style/overlay pixels |
| `settings-portability` | `npm test -- --grep @claim:settings-portability` | PASS; export, import, and reload persistence |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS; controlled worker and offline demo reload |
| `pwa-installable` | `npm test -- --grep @claim:pwa-installable` | PASS; standalone manifest, required icons, controlling worker |
| `free-quality` | `npm test -- --grep @claim:free-quality` | PASS; downloaded PNG measures 960×600 |
| `studio-quality` | `npm test -- --grep @claim:studio-quality` | PASS; 1920 px, 320 px original width, decoded six-column sheet |
| `studio-purchase` | `npm test -- --grep @claim:studio-purchase` | PASS; Dodo session, product name, USD $9.00, one-time text |
| `studio-license-check` | `npm test -- --grep @claim:studio-license-check` | PASS; exactly one expected Sociobot verification request |
| `browser-data-deletion` | `npm test -- --grep @claim:browser-data-deletion` | PASS; cleared settings and license return to defaults |
| `app-update-check` | `npm test -- --grep @claim:app-update-check` | PASS; changed worker replaces cache and announces update |

The live landing, demo, privacy, terms, metadata, and README were cross-checked against the registry. Every claim-like sentence maps to one of these entries or is an explicit limitation, responsibility, scope statement, legal term, or developer instruction. No unlisted claim remains.

## Earlier-finding verification

Every earlier review, polish record, verification record, and handoff was read. Each finding was rechecked against the live site and current code/tests.

| Earlier ID | Review-4 result |
| --- | --- |
| F-1-1 | Fixed: sample frames are visible in both first demo viewports. |
| F-1-2 | Fixed: an unknown live path returns the designed HTTP 404. |
| F-1-3 | Fixed: `demo-ready` starts at `/` and clicks the named action once. |
| F-1-4 | Fixed: real settings/license are pre-seeded and reads/opens are instrumented. |
| F-1-5 | Fixed: accepted 1.0/5.0 and rejected 0.5/5.1 boundaries are exercised. |
| F-1-6 | Fixed: uploads, request bodies, and off-origin processing traffic are rejected. |
| F-1-7 | Fixed: IndexedDB, Cache Storage, OPFS, localStorage, and sessionStorage are inspected. |
| F-1-8 | Fixed: the PDF page image is independently decoded and twelve numbered non-blank cells are checked. |
| F-1-9 | Fixed: PNG dimensions and six visible first-row PDF cells are independently checked. |
| F-1-10 | Fixed: checkout product, USD total, and one-time billing are checked live. |
| F-1-11 | Fixed: named video-format promises remain removed. |
| F-1-12 | Fixed: update behavior has one registered changed-worker test. |
| F-1-13 | Fixed: browser-data deletion has one registered clear-origin test. |
| F-1-14 | Fixed: unprovable refund wording remains removed; retained billing statements are tested. |
| F-1-15 | Fixed: title, description, canonical, Open Graph, and Twitter metadata change by route. |
| F-1-16 | Fixed: input is consistently **video** and its range is the **selected section**. |
| F-1-17 | Fixed: printable output is consistently **PDF trace sheet**. |
| F-1-18 | Fixed: copy says **your video's original width**. |
| F-1-19 | Fixed: merchant-of-record jargon remains removed. |
| F-1-20 | Fixed: the kicker says **Local video → printable trace sheet**. |
| F-1-21 | Fixed: **Line detail** includes a directional explanation. |
| F-1-22 | Fixed: README uses **show the previous frame in red** and **Pencil edges**. |
| F-1-23 | Fixed: install/offline copy states the user result without PWA jargon. |
| F-1-24 | Fixed: retained data is explained before IndexedDB/localStorage are named. |
| F-1-25 | Fixed: deployment routing, 404 behavior, and headers use plain sentences. |
| F-2-1 | Fixed: section/rate controls regenerate 60 demo frames and reset to twelve. |
| F-2-2 | Fixed: all three facts end above the 390×844 fold. |
| F-2-3 | Fixed: the free 960 px export has a registered dimension test. |
| F-2-4 | Fixed: static 404 has canonical, OG URL, favicon, and Apple icon. |
| F-2-5 | Fixed: static 404 has shared navigation, policies, attribution, and build id. |
| F-2-6 | Fixed: the caption says **six frames**, not pages. |
| F-2-7 | Fixed: the README deployment instruction stays below 22 words per sentence. |
| F-2-8 | Fixed: the trace style is consistently **Pencil edges**. |
| F-2-9 | Fixed: the goal is **hand-drawn flipbook** and the demo is the **paper-bird sample**. |
| F-2-10 | Fixed: the disclosure says **Import or export settings**. |
| F-3-1 | Fixed: all visible mobile targets across the five routes are at least 44×44 CSS px; the regression enumerates every visible action. |

No earlier finding is reopened.

## Structure, accessibility, privacy, and identity

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200. `/missing-page` returns the designed 404. `robots.txt`, `sitemap.xml`, the manifest, favicon, Apple icon, and social image return 200.
- Every route has `lang=en`, one H1, one main landmark, a coherent heading outline, a route-specific title/description/canonical/OG/Twitter set, and the shared header/footer.
- Titles follow the required pattern: **Flipbook Trace — Turn video into tracing frames**, **Demo — Flipbook Trace**, **Privacy — Flipbook Trace**, **Terms — Flipbook Trace**, and **Page not found — Flipbook Trace**.
- SPA links, deep-link reloads, browser back, and browser forward restore the correct route and focus its H1.
- The link crawl found no dead product link. First-party pages return 200, the checkout returns the intended 303, Sociobot returns 200, and `mailto:` links are explicit. The missing page's self-link correctly retains the 404 response.
- Live axe scans report zero serious/critical violations on all six checked URLs. The factory URL verifier passes with one H1/main, `lang=en`, alt text, labeled buttons, and no landing console error.
- Every visible 390 px action is at least 44×44 CSS px. No route overflows horizontally. Reduced-motion mode collapses animation durations to 0.01 ms.
- Runtime traffic is same-origin except the explicit Sociobot billing/license action. No analytics, external font, third-party runtime script, Azure key, or provider key is present.
- The paper surface, spot cyan/vermilion inks, registration marks, hard shadows, paper frames, generated worktable art, and print-style 404 match `.factory/design.md`. The result is distinct from a generic SaaS template.
- Clean-clone gates pass: unit 3/3, lint, typecheck, Playwright 44/44, and production build. `dist/` contains 19 files; JavaScript is 10,943 bytes gzip and CSS is 4,356 bytes gzip.

## Missed leverage

No missed-leverage finding is present. The brief calls for deterministic local frame extraction, trace controls, PNG/PDF export, and offline use; each is implemented. Settings import/export covers portability. Sync is not implied and would conflict with the local-first privacy model. A remote AI step would add network disclosure and cost without improving deterministic frame extraction. No decorative AI feature or embedded provider key exists.

## What would make this perfect

Nothing remains within the reviewed product contract. Preserve the current claim commands, clean-clone gates, demo-isolation checks, and full mobile-target enumeration in every release.
