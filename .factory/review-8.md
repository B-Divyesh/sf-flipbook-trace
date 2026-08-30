# Adversarial first-read review 8 — FAIL

Reviewed 2026-08-30 against repository base `330edde6dae00dfe73308eb8ea8872ae2f5b8f7a` and <https://flipbook-trace.sociobot.in>. The live site was opened in fresh Chromium contexts at 390×844 and 1440×900 before scrolling. Product code was not changed.

## Verdict

**FAIL.** The first-read, copy, demo, privacy, routing, metadata, visual identity, build, and 18 locally-contained claim checks pass. One blocking keyboard regression makes the demo workspace unreachable with Tab. One registered checkout claim was not run because its test deliberately contacts non-`sf-flipbook-trace` hosts, which this work order forbids. Acceptance requires zero findings and no untested claim.

## Findings

### Blocking

#### F-8-1 — Tab skips the whole demo workspace, including both exports

- Exact location: `/?demo=1` at 390×844, after **“12 frames ready”** appears.
- Evidence: sequential Tab traversal visits the skip link, header links, **Reset demo**, **Start for real**, then footer links. It never reaches the frame controls, **“Export numbered PNG pack,”** or **“Export PDF trace sheet.”** Both exports are enabled and can be focused only by calling `.focus()` directly. The deployed source applies `content-visibility: auto` to `.demo-main .preview-zone` in [`src/style.css`](../src/style.css); that subtree contains both export buttons. The existing keyboard test directly calls `exportButton.focus()`, so it cannot detect sequential-focus failure.
- Why this fails: a keyboard-only visitor cannot change sample settings or export the sample. The one-click demo therefore does not work end to end for a required input method. This reopens the prior handoff defect `V18-1`.
- Concrete fix: do not apply `content-visibility: auto` to a subtree with focusable controls. Remove it from `.preview-zone`, or limit it to a non-interactive frames-only child while keeping the controls and export bar in the sequential focus tree. Add a test that starts at `/demo`, presses Tab normally until both enabled export buttons receive focus, and activates each with Enter.

### Major

#### F-8-2 — `studio-purchase` is untested in this clean-clone review

- Exact claim: **“Studio costs USD 9 once and opens Flipbook Trace Studio in Dodo's hosted checkout.”**
- Exact test: `npm test -- --grep @claim:studio-purchase`.
- Evidence: `tests/claims.spec.ts` uses `request.get()` on the external checkout endpoint and follows its external redirect. The work order explicitly prohibits connecting to any resource other than `sf-flipbook-trace`, so this command was not invoked. The other 18 claim tests ran successfully from the clean clone.
- Why this fails: the review rule requires every registered claim to be tested from the clean clone, and a PASS permits no untested claim. Earlier records are useful history, not current-run evidence.
- Concrete fix: make the registered checkout proof sandbox-safe with a versioned local contract fixture that asserts product name, USD 9.00, one-time billing, and the expected hosted-checkout destination shape; reserve a separately authorized live payment check for release verification. Then run the listed claim command from a clean clone without contacting external hosts.

## Cold first screen

The cold-read gate passes at both widths.

- What it does: turns a local video into tracing frames, then a numbered PNG pack or printable PDF trace sheet.
- For whom: short-form creators making a hand-drawn flipbook without uploading their video.
- What to click first: **Try it with sample data**. The adjacent text says, **“It opens a ready 12-frame paper-bird sample.”**

The exact answering copy is **“Turn your video into tracing frames”** and **“For short-form creators making a hand-drawn flipbook without uploading their video.”** The mobile first screen has no horizontal overflow or console error; desktop is also clean.

## Copy audit

Counts use whitespace-delimited words; a hyphenated term, path, numeric range, or code token is one word. All landing and README sentences are at most 22 words. No banned marketing adjective, unexplained jargon, metaphor heading, inconsistent term, or non-result-naming button remains.

### Landing-page sentences

| Location | Sentence | Words | Result |
| --- | --- | ---: | --- |
| Hero | For short-form creators making a hand-drawn flipbook without uploading their video. | 11 | Pass |
| Hero | It opens a ready 12-frame paper-bird sample. | 7 | `demo-ready` |
| Fact | Video stays in this browser. | 5 | `local-processing` |
| Fact | Works offline after the first visit. | 6 | `offline-reload` |
| Fact | Free: numbered PNG pack and PDF trace sheet. | 8 | `png-export`, `pdf-export` |
| Art caption | Six moments become six frames to trace. | 7 | Pass |
| Workspace | Choose a video you own. | 5 | Pass |
| Workspace | The video and frames disappear on reload. | 7 | `ephemeral-project` |
| File help | Choose a video this browser can play. | 7 | Pass |
| Control help | Move right to keep more dark areas. | 7 | `trace-controls` |
| Control help | Studio controls need a license. | 5 | Pass |
| Empty state | Choose a video, then set a 1–5 second section. | 9 | `clip-workflow` |
| Method | Pick a 1–5 second section from a video you own. | 10 | `clip-workflow` |
| Method | Choose how many frames to make each second, then adjust the trace preview. | 13 | `trace-controls` |
| Method | Export a numbered PNG pack or one PDF trace sheet. | 10 | `png-export`, `pdf-export` |
| Privacy | Flipbook Trace does not publish, host, or generate video. | 9 | Scope |
| Privacy | It does not retain your video. | 6 | `ephemeral-project` |
| Privacy | Use a video you own or have permission to trace. | 10 | Scope |
| Limitation | Large or long videos may use more memory. | 8 | Limitation |
| Recovery | Trim the video before loading it if your device slows down. | 11 | Recovery |
| Studio | $9 once. | 2 | `studio-purchase` (untested this round; F-8-2) |
| Studio | Keep the free numbered PNG pack and PDF trace sheet. | 10 | Export claims |
| Studio | Studio adds 1920 px, exports at your video's original width, and a six-column PDF trace sheet. | 16 | `studio-quality` |
| Studio | Dodo opens the checkout for Sociobot. | 6 | `studio-purchase` (untested this round; F-8-2) |
| Footer | Turn your video into printable tracing frames. | 7 | Pass |

Landing headings name their sections: **Make the tracing frames**, **How to make a trace sheet**, **A preparation tool, not a video editor**, and **Print larger with Studio**. Actions are result-naming verbs: **Try it with sample data**, **Make tracing frames**, **Export numbered PNG pack**, **Export PDF trace sheet**, **Import or export settings**, **Buy Studio for $9**, and **Verify a Studio license**. The terminology remains: video; selected section; frames each second; tracing frames; numbered PNG pack; PDF trace sheet; Studio; paper-bird sample.

### README sentences and list items

| Section | Sentence or item | Words | Result |
| --- | --- | ---: | --- |
| Intro | Turn your video into printable tracing frames. | 7 | Pass |
| Intro | Flipbook Trace is a local browser tool for short-form video creators. | 11 | Pass |
| Intro | Choose a 1–5 second section. | 5 | `clip-workflow` |
| Intro | Set how many frames to make each second and choose a trace style. | 12 | `trace-controls` |
| Intro | Export a numbered PNG pack or PDF trace sheet. | 9 | Export claims |
| Intro | The app decodes and processes video in the browser. | 9 | `local-processing` |
| Intro | The video and frames disappear on reload. | 7 | `ephemeral-project` |
| Intro | After the first visit, the app and its built-in demo work offline. | 12 | `offline-reload` |
| Links | Live site: https://flipbook-trace.sociobot.in | 3 | Valid link |
| Links | Demo: https://flipbook-trace.sociobot.in/?demo=1 | 2 | Valid link |
| Includes | Choose a video this browser can play | 7 | Pass |
| Includes | 2, 4, 6, 8, or 12 frames each second | 9 | `trace-controls` |
| Includes | Pencil edges, high contrast, and grayscale trace styles | 8 | `trace-controls` |
| Includes | Optionally show the previous frame in red | 7 | `trace-controls` |
| Includes | Numbered PNG pack and printable PDF trace sheet | 8 | Export claims |
| Includes | A twelve-frame paper bird demo that does not read or change real saved data | 14 | `demo-isolation` |
| Includes | Install the app and reopen the demo offline | 8 | PWA/offline claims |
| Includes | Settings export and import | 4 | `settings-portability` |
| Pricing | The free version exports a numbered PNG pack at 960 px and a PDF trace sheet. | 16 | `free-quality`, `pdf-export` |
| Pricing | Studio costs $9 once and adds 1920 px, exports at your video's original width, and six-column PDF trace sheets. | 19 | `studio-quality`; purchase portion F-8-2 |
| Pricing | Dodo opens the checkout for Sociobot. | 6 | F-8-2 |
| Audience | This tool is for creators preparing a hand-drawn flipbook from a video they own. | 14 | Pass |
| Audience | It replaces manual frame extraction. | 5 | `clip-workflow` |
| Audience | It is not a video editor, publishing service, or style-transfer tool. | 11 | Scope |
| Run locally | Requirements: Node.js 20 or newer and npm. | 7 | Instruction |
| Run locally | Open the local URL printed by Vite. | 7 | Instruction |
| Run locally | Use `/?demo=1` to open the bundled sample. | 8 | `demo-ready` |
| Test and build | `npm test` builds and serves the production bundle, then runs the claim, offline, mobile, console, and accessibility checks in Chromium. | 20 | Partly blocked by F-8-2 |
| Test and build | The build command writes the static deployment to `dist/`, with `dist/index.html` at its root. | 14 | Verified |
| Test and build | Each published product claim and its exact test command is recorded in `.factory/claims.json`. | 15 | Verified |
| Test and build | The demo contract is in `.factory/demo.md`. | 8 | Verified |
| Privacy | Video frames live only in page memory and disappear when the page reloads or closes. | 15 | `ephemeral-project` |
| Privacy | This site's browser data stores your control settings, Studio license, and latest license check. | 14 | Storage claims |
| Privacy | Demo mode does not read or change those real-data stores. | 10 | `demo-isolation` |
| Privacy | Technically, settings use IndexedDB and a license uses localStorage. | 9 | Implementation note |
| Privacy | `/privacy` and `/terms` contain the user-facing policies. | 7 | Verified |
| Deploy | Deploy the contents of `dist/` as a static site. | 9 | Instruction |
| Deploy | Keep the host rules that send valid routes to `index.html` and return the designed 404 for unknown routes. | 19 | Verified |
| Deploy | Keep the listed security headers too. | 6 | Verified |
| Deploy | The factory handles infrastructure, DNS, and billing registration. | 8 | Scope |
| Deploy | Set `VITE_BILLING_BASE` only when the factory needs a non-production billing endpoint. | 13 | Instruction |
| Deploy | It defaults to `https://api.sociobot.in`. | 7 | Implementation note |
| License | MIT. | 1 | Verified |
| License | See `LICENSE`. | 2 | Verified |

README headings are useful out of context: **What it includes**, **Who it is for**, **Run locally**, **Test and build**, **Privacy and file handling**, **Deploy**, and **License**.

## Demo, sandbox, and privacy

One click from `/` opens `/?demo=1`, immediately shows the paper-bird result, the persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**, and **Start for real**. The first visible sample canvas ends at y=520.44 px at 390×844 and y=636.66 px at 1440×900. The demo changes from 12 to 60 frames for five seconds at 12 frames each second, and a settled reset returns 12 frames with the default two-second/six-frames-each-second controls. **Start for real** removes the banner.

The live demo request log contained only same-origin GET requests for the product document and assets. The clean-clone claims cover isolation, local processing, ephemeral project data, and offline reload. No AI feature is implied by the brief; deterministic local extraction, export, and settings portability are already present, and remote AI or sync would weaken the local-first job.

## Claims and clean-clone checks

Clean clone: `/tmp/flipbook-review8.DwevQA/repo`, created from the reviewed commit. `npm ci` completed with zero reported vulnerabilities. One sandboxed Playwright invocation ran the 18 listed tags below; all passed. `studio-purchase` was deliberately not run for F-8-2.

| Claim | Result |
| --- | --- |
| clip-workflow | PASS |
| demo-ready | PASS |
| demo-workflow | PASS |
| demo-isolation | PASS |
| png-export | PASS |
| pdf-export | PASS |
| local-processing | PASS |
| ephemeral-project | PASS |
| trace-controls | PASS |
| settings-portability | PASS |
| offline-reload | PASS |
| pwa-installable | PASS |
| free-quality | PASS |
| studio-quality | PASS |
| studio-purchase | **UNTESTED — F-8-2** |
| studio-license-check | PASS (fixture-intercepted) |
| studio-license-cache | PASS (fixture-intercepted) |
| browser-data-deletion | PASS |
| app-update-check | PASS |

`npm run test:unit` (3/3), `npm run lint`, `npm run typecheck`, and `npm run build` all pass in that clone; `dist/` is produced. The initial JavaScript is far below the 150 KB gzip limit.

No live landing, demo, policy, terms, or README claim was unlisted. The checkout claim is registered but not currently testable within this work order, which is F-8-2.

## Earlier findings and handoff regression audit

Each earlier item was rechecked against the live site and current source/tests.

| Earlier finding | Status |
| --- | --- |
| F-1-1 | Fixed: first demo viewport contains sample frames. |
| F-1-2 | Fixed: unknown URL returns designed HTTP 404. |
| F-1-3 | Fixed: landing action opens demo in one click. |
| F-1-4 | Fixed: demo isolation claim pre-seeds and checks real stores. |
| F-1-5 | Fixed: trim boundaries are tested. |
| F-1-6 | Fixed: local-processing test rejects workflow requests. |
| F-1-7 | Fixed: persistent-store inventory checks content. |
| F-1-8 | Fixed: PDF sheet cells are independently decoded. |
| F-1-9 | Fixed: Studio image widths and six-column sheet are tested. |
| F-1-10 | Prior evidence remains; current test is untested only under F-8-2. |
| F-1-11 | Fixed: no named browser-format promise. |
| F-1-12 | Fixed: update claim is registered. |
| F-1-13 | Fixed: browser-data deletion is registered. |
| F-1-14 | Fixed: refund promises remain absent. |
| F-1-15 | Fixed: metadata changes per route. |
| F-1-16 | Fixed: input is consistently video. |
| F-1-17 | Fixed: printable export is PDF trace sheet. |
| F-1-18 | Fixed: original video width is plain language. |
| F-1-19 | Fixed: payment jargon remains absent. |
| F-1-20 | Fixed: kicker names the output. |
| F-1-21 | Fixed: Line detail includes usable help. |
| F-1-22 | Fixed: Pencil edges and previous-frame terms are plain. |
| F-1-23 | Fixed: install/offline wording names the result. |
| F-1-24 | Fixed: user data is explained before storage names. |
| F-1-25 | Fixed: deployment instructions are plain. |
| F-2-1 | Fixed: demo regenerates 12 → 60 → 12. |
| F-2-2 | Fixed: all three facts fit the mobile first screen. |
| F-2-3 | Fixed: free 960 px claim is registered and tested. |
| F-2-4 | Fixed: static 404 has route metadata and icons. |
| F-2-5 | Fixed: static 404 has shared navigation and footer. |
| F-2-6 | Fixed: art caption says frames, not pages. |
| F-2-7 | Fixed: README prose stays under 22 words. |
| F-2-8 | Fixed: Pencil edges is the one style term. |
| F-2-9 | Fixed: goal/sample terminology is distinct. |
| F-2-10 | Fixed: settings disclosure names import/export. |
| F-3-1 | Fixed: action targets meet 44×44 px. |
| F-5-1 | Fixed: license test observes all explicit-action requests. |
| F-5-2 | Fixed: both 404s name the error and destination plainly. |
| F-6-1 | Fixed: unproved refund/revocation copy remains absent. |
| F-6-2 | Fixed: plain checkout wording remains. |
| F-7-1 | Fixed: numbered PNG pack is used consistently. |
| F-7-2 | Fixed: frames each second is used consistently. |
| F-7-3 | Fixed: method headings name their objects. |
| F-7-4 | Fixed: section labels and Studio label are product-specific. |
| F-7-5 | Fixed: license disclosure names its result. |
| V18-1 | **REGRESSED — F-8-1.** Normal Tab traversal skips the demo workspace. |

## Structure, accessibility, and identity

`/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200. `/missing-page` returns 404. Every route has `lang=en`, one `<main>`, one H1 after hydration, route title/description/canonical/Open Graph values, favicon, Apple icon, shared header/footer, and a 1200×630 product social image. Titles follow the required pattern. `robots.txt`, `sitemap.xml`, and the manifest return 200. The internal link crawl found no dead first-party link; mail links are explicit.

Fresh live Axe checks reported zero serious or critical violations on all six routes, and no console errors occurred. That does not catch F-8-1 because the controls are present and directly focusable; sequential keyboard navigation is separately required. Deep links and back/forward navigation work, moving focus to the destination H1. Reduced motion is respected. The risograph paper, spot-ink palette, registration marks, original worktable art, hard ink shadows, and print-style 404 implement the distinct visual thesis in `.factory/design.md`, not a generic SaaS template.

## What would make this perfect

Restore normal Tab access to every demo control and export, add a sequential-keyboard regression test, and make `studio-purchase` runnable in an isolated clean-clone sandbox. Then rerun this complete review with all 19 claim commands and no external-host exception.
