# Adversarial first-read review 3 — FAIL

Reviewed on 2026-08-28 against repository commit `b03f88d91e8a33347701f04833a34e51d57cddf5` and <https://flipbook-trace.sociobot.in> in fresh Chromium contexts at 390×844 and 1440×900.

## Verdict

**FAIL.** The product is clear on first read, the demo and all 18 registered claims work, and every earlier review finding remains fixed. One mobile accessibility finding remains: several live links have targets shorter than the required 44 px, while the regression test checks only selected links. PASS requires zero findings, including minor findings.

## Findings

### Major

#### F-3-1 — Several mobile links miss the 44×44 px target requirement

- Exact locations and live 390 px measurements:
  - Landing hero, **“Or choose your own video ↓”**: 249.6×36 px.
  - Landing Studio panel, **“Privacy”**: 67.2×18 px; **“Terms”**: 48.0×18 px.
  - `/privacy`, **“privacy@sociobot.in”**: 191.3×19 px.
  - `/terms`, **“support@sociobot.in”**: 191.3×19 px.
  - Static 404 skip link, **“Skip to main content”**: 224.7×43 px.
- Code evidence: the mobile rule in `src/style.css` reduces `.text-action` to `min-height: 36px`; the paid-panel and prose email links have no minimum target height. The mobile regression in `tests/site.spec.ts` checks only `.wordmark`, header navigation, demo controls, and footer links, so all affected links pass unnoticed.
- Why this matters: a phone visitor with limited dexterity has a smaller-than-required tap area for choosing a real video, opening policies, contacting support, or using the 404 skip link. This misses the attached accessibility baseline even though axe reports no automated violation.
- Concrete fix: keep every interactive target at least 44×44 CSS px at 390 px. Give `.text-action`, `.paid p a`, `.prose-page a`, and the static 404 skip link an inline-flex or inline-block hit area with sufficient block padding/min-height. Replace the selected-selector test with an assertion over every visible actionable element, using the associated label hit area for native radio and checkbox inputs.

No other blocking, major, or minor findings were found.

## Cold first screen

The cold-read gate passes before scrolling at both 390×844 and 1440×900.

- What it does, in my words: turns a short part of a video into frames that can be traced or printed.
- For whom: short-form creators making a hand-drawn flipbook without uploading their video.
- What to click first: **Try it with sample data**; the adjacent sentence says it opens a ready 12-frame paper-bird sample.
- Exact copy that answers the questions: **“Turn your video into tracing frames”**; **“For short-form creators making a hand-drawn flipbook without uploading their video.”**; **“Try it with sample data”**; **“It opens a ready 12-frame paper-bird sample.”**
- All three facts are visible without scrolling. Their live bottoms are 725.2 px on the 844 px phone viewport and 794.6 px on the 900 px desktop viewport.
- There is no horizontal overflow and no console or page error on either cold load.

## Copy audit — landing-page sentences

Counts split on whitespace and treat hyphenated words and ranges as one word. No sentence exceeds 22 words, uses a banned marketing adjective, or introduces an inconsistent product term.

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

### Landing headings, actions, labels, and fragments

| Type | Copy with word count | Result |
| --- | --- | --- |
| H1 | Turn your video into tracing frames (7) | Clear job headline |
| H2/H3 | Make the tracing frames (4); Your frames will appear here (5); How to make a trace sheet (6); Choose and trim (3); Set the lines (3); Print or draw (3); A preparation tool, not a video editor (7); Print larger with Studio (4) | Clear out of context and correctly nested |
| Primary and workspace actions | Try it with sample data (6); Or choose your own video (5); Choose a video (3); Make tracing frames (3); Export PNG pack (3); Export PDF trace sheet (4) | Result-naming verbs; F-3-1 applies to one target size |
| Settings and purchase actions | Import or export settings (4); Export settings (2); Import settings (2); Buy Studio for $9 (4); Verify license (2) | Result-naming verbs |
| Navigation/demo actions | Demo (1); How it works (3); Privacy (1); Reset demo (2); Start for real (3) | Navigation or required demo actions |
| Field labels | Your video (2); Start time (2); End time (2); Frames each second (3); Trace style (2); Line detail (2); Export width (2); PDF trace sheet columns (4); Paste your license (3) | Plain and consistent |
| Options | 2 — loose study (3); 4 (1); 6 — balanced (2); 8 (1); 12 — detailed (2); Pencil edges (2); High contrast (2); Grayscale (1); 960 px — free (3); 1920 px — Studio (3); Original video width — Studio (5); 4 columns — free (3); 6 columns — Studio (3) | Plain and distinct |
| Other visible fragments | Local video → printable trace sheet (5); 01 / Prepare (2); Waiting for a video (4); 00 (1); 02 / Method (2); No cloud (2); 03 / Boundaries (2); Studio (1); Pass (1); 04 / Optional (2); Have a license? (3); Privacy · Terms (2); v1.0.3 · Original generated artwork (4) | No jargon or inconsistent output names |

Terminology is consistent: **video** is the input, **selected section** is its 1–5 second range, **frame/tracing frames** are the processed images, **PNG pack** and **PDF trace sheet** are exports, **Studio** is the paid tier, and **paper-bird sample** is the demo.

## Copy audit — README sentences and readable fragments

Commands in fenced code blocks are commands rather than sentences. All prose, bullets, link labels, and headings are included below. No item exceeds 22 words or contains a banned marketing adjective.

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
| 41 | MIT. | 1 | LICENSE present |
| 42 | See LICENSE. | 2 | Link resolves |

README headings are also clear: **Flipbook Trace** (2), **What it includes** (3), **Who it is for** (4), **Run locally** (2), **Test and build** (3), **Privacy and file handling** (4), **Deploy** (1), and **License** (1).

## Demo and sandbox verification

- One click from the live landing action opens `/?demo=1` in both fresh viewports.
- The first demo screen contains the persistent demo notice, **Reset demo**, **Start for real**, twelve compact bird frames, twelve workspace frames, and **12 frames ready**. The first sample-frame bottom is 520.4 px at 390×844 and 636.7 px at 1440×900.
- Changing the selected section to five seconds and the rate to 12 produces 60 visible frames and **60 frames ready**.
- Reset restores end time 2, rate 6, line detail 142, twelve frames, and **12 frames ready**.
- Real IndexedDB settings and both real license keys were pre-seeded. Demo entry, edits, regeneration, and reset left them byte-for-byte unchanged. **Start for real** removed the banner and restored the real rate 8, grayscale mode, and line detail 199.
- The exercised demo made no off-origin request, no request with a body, and no non-GET/HEAD request.
- After service-worker control, a network-offline reload restored the demo notice and all twelve frames using same-origin cached requests only.
- A separate live local-video flow produced seven frames and a PNG download without any off-origin or write request. Reload removed all seven frames; localStorage and sessionStorage remained empty, with only documented preferences and shell cache present.

## Registered claims

Clean clone: `/tmp/flipbook-review3-clean.lt2KXm/repo` at `b03f88d91e8a33347701f04833a34e51d57cddf5`, installed with `npm ci` (141 packages, zero vulnerabilities). Every exact command in `.factory/claims.json` was run independently. Each ID occurs in exactly one test tag.

| Claim | Exact command | Result and observable scope |
| --- | --- | --- |
| `clip-workflow` | `npm test -- --grep @claim:clip-workflow` | PASS; 1.0/5.0 seconds accepted, 0.5/5.1 rejected |
| `demo-ready` | `npm test -- --grep @claim:demo-ready` | PASS; landing click, route, notice, 12 frames, first viewport |
| `demo-workflow` | `npm test -- --grep @claim:demo-workflow` | PASS; 12→60 regeneration and reset |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS; instrumented real storage reads/opens and unchanged values |
| `png-export` | `npm test -- --grep @claim:png-export` | PASS; ZIP and numbered final PNG |
| `pdf-export` | `npm test -- --grep @claim:pdf-export` | PASS; independently decoded non-blank 12-cell, four-column sheet |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS; no uploads, bodies, or off-origin requests |
| `ephemeral-project` | `npm test -- --grep @claim:ephemeral-project` | PASS; IndexedDB, Cache Storage, OPFS, local/session storage and reload checked |
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

The live landing, demo, privacy, terms, and README claims map to these entries or are explicit limitations, scope statements, responsibilities, or developer instructions. No unlisted product claim was found.

## Earlier-finding verification

Every earlier review, polish record, and handoff was read. Each prior finding was checked against the live site and current source/tests.

| Earlier ID | Review-3 result |
| --- | --- |
| F-1-1 | Fixed: sample frames are in both first demo viewports. |
| F-1-2 | Fixed: unknown live paths return the designed HTTP 404. |
| F-1-3 | Fixed: `demo-ready` starts at `/` and clicks the named action once. |
| F-1-4 | Fixed: real settings/license are pre-seeded and reads/opens are instrumented. |
| F-1-5 | Fixed: both accepted and rejected trim boundaries are exercised. |
| F-1-6 | Fixed: all off-origin, body-bearing, and non-GET/HEAD requests are rejected. |
| F-1-7 | Fixed: IndexedDB, Cache Storage, OPFS, localStorage, and sessionStorage are inspected. |
| F-1-8 | Fixed: the exported JPEG page is decoded and twelve numbered non-blank cells are checked. |
| F-1-9 | Fixed: both PNG sizes and six visible first-row PDF cells are independently checked. |
| F-1-10 | Fixed: checkout product, USD total, and one-time billing are checked. |
| F-1-11 | Fixed: named format promises were removed. |
| F-1-12 | Fixed: the update statement has a unique registered test. |
| F-1-13 | Fixed: browser-data deletion has a unique registered test. |
| F-1-14 | Fixed: unprovable refund/merchant statements remain removed; retained billing statements are tested. |
| F-1-15 | Fixed: SPA route title, description, canonical, OG, and Twitter metadata change together. |
| F-1-16 | Fixed: input is consistently **video** and its range is the **selected section**. |
| F-1-17 | Fixed: printable output is consistently **PDF trace sheet**. |
| F-1-18 | Fixed: copy says **your video's original width**. |
| F-1-19 | Fixed: merchant-of-record jargon remains removed. |
| F-1-20 | Fixed: the kicker says **Local video → printable trace sheet**. |
| F-1-21 | Fixed: **Line detail** includes a directional explanation. |
| F-1-22 | Fixed: README uses **show the previous frame in red** and **Pencil edges**. |
| F-1-23 | Fixed: README names installation/offline results without PWA jargon. |
| F-1-24 | Fixed: retained data is explained before IndexedDB/localStorage are named. |
| F-1-25 | Fixed: deployment routing, 404 behavior, and headers are split into plain sentences. |
| F-2-1 | Fixed: demo section/rate controls regenerate 60 frames and reset to twelve. |
| F-2-2 | Fixed: all three facts end above the 390×844 fold. |
| F-2-3 | Fixed: the 960 px free export has a registered dimension test. |
| F-2-4 | Fixed: static 404 has canonical, OG URL, favicon, and Apple icon. |
| F-2-5 | Fixed: static 404 has the shared navigation, policy links, attribution, and build id. |
| F-2-6 | Fixed: caption says **six frames**, not pages. |
| F-2-7 | Fixed: the README deploy sentence remains split below 22 words. |
| F-2-8 | Fixed: the trace style is consistently **Pencil edges**. |
| F-2-9 | Fixed: the goal is **hand-drawn flipbook** and the demo is the **paper-bird sample**. |
| F-2-10 | Fixed: disclosure says **Import or export settings**. |

No earlier review finding is reopened. F-3-1 is a newly measured gap outside the earlier selector-based target check.

## Structure, accessibility, privacy, and identity

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200; `/missing-page` returns 404. `robots.txt`, `sitemap.xml`, the manifest, favicon, Apple icon, and 1200×630 social image return 200.
- Every checked route has `lang=en`, one H1, one main landmark, a coherent heading outline, a route-specific title/description/canonical/OG/Twitter set, the shared header/footer, and the product favicon.
- SPA navigation and browser back focus the new H1 after the route settles. Deep links and reloads retain their route.
- Every unique link resolved to 200 or the intended Dodo checkout, except explicit `mailto:` links and the intentionally missing page's self-referential skip fragment, which remains on the designed 404.
- Live axe scans report zero violations on all six routes. The factory URL verifier passes with no page errors, one H1/main, correct language, image alternatives, and labeled buttons. F-3-1 records the manual target-size failure that axe does not report.
- Reduced-motion mode reduces animation and transition duration to 0.01 ms. The 390 px routes have no horizontal overflow.
- Runtime traffic is same-origin except the explicit Sociobot billing action. No analytics, third-party fonts, or third-party scripts are present.
- The warm paper surface, spot cyan/vermilion ink, off-register marks, hard shadows, paper frames, and original worktable art match `.factory/design.md`. This is recognizably a printmaker/animator worktable, not a generic centered SaaS template.
- Clean-clone quality gates pass: unit 3/3, lint, typecheck, Playwright 39/39, and production build. `dist/` contains 19 files; JavaScript is 10,944 bytes gzip and CSS is 4,334 bytes gzip.

## Missed leverage

No missed-leverage finding is recorded. The brief calls for deterministic local frame extraction, trace controls, and PNG/PDF output; all are present. Settings import/export covers portability. Remote AI would not improve the core extraction job and would weaken the product's offline/private premise. Sync is not implied and would require accounts plus remote storage. No decorative AI feature or embedded provider key is present.

## What would make this perfect

Raise every remaining mobile link hit area to at least 44×44 CSS px and make the mobile regression enumerate every visible actionable target rather than a selected list. Then rerun the full suite and the same 390 px measurement across landing, demo, privacy, terms, and 404. With that single finding closed and no regression, the next adversarial review can pass.
