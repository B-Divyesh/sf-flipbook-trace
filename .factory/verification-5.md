# Flipbook Trace independent verification 5

- Work order: `flipbook-trace-verify-5`
- Candidate commit: `10cf0c41537937ac23780dc429ec6ec23341dc9c`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Product class: local-first offline PWA with Sociobot paid-license verification
- Result: **FAIL — an unlisted payment/refund claim violates the mandatory claims contract**

## Decision

The deployed product matches the candidate and the earlier interaction-performance failure is fixed. The core workflow, privacy behavior, accessibility, PWA behavior, billing endpoint, build, and all 19 registered claim commands passed.

The candidate still fails the supplied acceptance contract because the Terms page and README make two customer-reliance statements that are absent from `.factory/claims.json` and are not proved by an observable test:

> Sociobot/Dodo is the merchant of record and handles refunds. A refund automatically revokes the Studio license.

The claims contract explicitly makes any unlisted claim release-blocking. `studio-purchase` proves the checkout product, USD 9 price, and one-time billing. `studio-license-cache` proves that the client reacts to a mocked `revoked` verdict. Neither test proves refund handling or that a real refund causes revocation.

## Release-blocking defect

### High — refund handling and automatic revocation are unlisted and unproved

- Locations: `README.md` under **What it includes** and the live `/terms` route under **Studio purchase**.
- Registry evidence: no entry in `.factory/claims.json` covers refund handling or refund-triggered revocation.
- Test evidence: the site test only asserts that the sentences are present. The purchase test follows checkout and checks product/price/one-time text. The license-cache test supplies a synthetic revoked response. No test refunds a test purchase and then observes that its license verifies as revoked.
- User impact: a buyer could rely on these statements when deciding who handles a refund and what happens to the license afterward.
- Required repair: register the claim and add a safe Sociobot test-billing contract test that refunds a test purchase and verifies the associated license becomes revoked. If that sandbox capability is unavailable, narrow the copy to a statement the product can prove while preserving the paid-unlock legal requirements.

No medium- or low-severity product defects were found.

## Mandatory first-read and demo gate — PASS

Cold loads at 390×844 and 1440×900 answered all three required questions before scrolling:

- What it does: **“Turn your video into tracing frames.”**
- Who it is for: **“For short-form creators making a hand-drawn flipbook without uploading their video.”**
- What to click: **“Try it with sample data.”** The adjacent sentence says it opens a ready 12-frame paper-bird sample.

The action and all three privacy/offline/free facts were above the fold in both viewports. One click opened `/?demo=1`, displayed 12 frames and the persistent **“Demo — sample data, nothing is saved”** banner, and exposed **Reset demo** and **Start for real**. This gate passes.

## Registered claims gate — commands PASS; cross-check FAIL

`.factory/claims.json` exists with 19 entries. After `npm ci`, every listed command was run independently from the candidate checkout and passed:

| Claim | Exact command | Result |
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
| `studio-purchase` | `npm test -- --grep @claim:studio-purchase` | PASS |
| `studio-license-check` | `npm test -- --grep @claim:studio-license-check` | PASS |
| `studio-license-cache` | `npm test -- --grep @claim:studio-license-cache` | PASS |
| `browser-data-deletion` | `npm test -- --grep @claim:browser-data-deletion` | PASS |
| `app-update-check` | `npm test -- --grep @claim:app-update-check` | PASS |

The command gate passes. The required landing/README claim cross-check fails on the refund statements described above, so the overall claims gate fails.

## Clean repository gates — PASS

| Check | Evidence |
| --- | --- |
| Candidate identity | HEAD was exactly `10cf0c41537937ac23780dc429ec6ec23341dc9c` before verification |
| `npm ci` | PASS; 141 packages installed, 142 audited, 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS; 3/3 tests |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm run build` | PASS; produced `dist/` |
| `npm test` | PASS; 52/52 Chromium tests in 1.8 minutes |

The worktree already contained modified/generated `graphify-out` files. They do not participate in the product build and were preserved and excluded from this verification commit.

## End-to-end behavior — PASS

Fresh production demo evidence:

- One click opened 12 ready paper-bird frames.
- Five seconds at 12 fps generated 60 frames.
- A 0.5-second selection showed: **“The selected section must be 1–5 seconds inside the paper-bird sample. Change the start or end time.”**
- Correcting the selection to two seconds at 6 fps restored 12 frames.
- PNG and PDF actions downloaded `flipbook-trace-frames.zip` and `flipbook-trace-sheet.pdf`.
- Offline reload restored the banner and all 12 sample frames.

Fresh production real-video evidence used a generated 320×200 WebM. One second at 2 fps produced two ready frames and a PNG pack. The complete action produced only a local `blob:` read and no HTTP request.

Invalid input and recovery checks passed:

- A text file produced **“That file is not a video. Choose a video this browser can play.”**
- Invalid settings JSON produced **“Those settings could not be imported. Choose a Flipbook Trace settings file.”**
- Valid JSON then restored fps 8, grayscale, line detail 177, and the previous-frame overlay.
- Empty license verification made no request and said **“Paste a license token first.”**

The deterministic local workflow already covers the brief; a runtime AI feature would add network use without improving the job.

## Privacy, billing, and request allowance — PASS apart from the unproved copy

- Cold `/`, `/demo`, `/privacy`, and `/terms` loads made no cross-origin request.
- Real local-video processing and export made no HTTP request after the shell settled; only the local `blob:` source was read.
- No analytics, remote font, third-party runtime script, Azure model endpoint, or embedded key was observed.
- The live invalid-license response was 200 JSON with `Cache-Control: no-store` and CORS restricted to `https://flipbook-trace.sociobot.in`.
- The checkout endpoint returned 303 to a hosted Dodo session. The registered claim independently confirmed Flipbook Trace Studio, USD 9.00, and one-time billing.
- The verify endpoint allowed 30 requests in the observed single-client burst. Request 31 returned 429 with `Retry-After: 4`; a request five seconds later returned 200.

HTML responses carry HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive Permissions Policy, and a self/Sociobot CSP. Hashed JS/CSS use one-year immutable caching; `sw.js` uses `no-cache, no-store, must-revalidate`.

## Accessibility, responsive behavior, and errors — PASS

- Fresh axe scans found zero serious/critical findings on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404 at 390 px.
- Valid routes have `lang=en`, one H1, one main landmark, route-specific titles, and zero horizontal overflow.
- The factory `verify-url.sh` passed the live landing page: HTTP 200, one H1/main, complete image alternatives, labeled buttons, and zero console/page errors.
- Keyboard traversal begins at **Skip to main content**, changes **Line detail** with ArrowRight, reaches **Export PNG pack**, and downloads it with Enter without a trap.
- Focus is a visible solid 3 px `rgb(173, 53, 45)` outline.
- At 200% text size, the H1 and sample action remain visible with zero horizontal overflow.
- Reduced-motion mode matches and has zero running animations.
- The intentional HTTP 404 produces Chromium's expected failed-main-resource diagnostic; no application console or page error appeared on valid routes or during workflows.

## Performance — PASS

Build payloads:

- JavaScript: 33.57 KB raw / 11.86 KB gzip.
- CSS: 15.88 KB raw / 4.37 KB gzip.
- Mobile hero: 44.80 KB.
- Fonts: none downloaded.
- Total first-load transfer measured by Lighthouse: about 194–196 KB.

Three Lighthouse 12.8.2 mobile runs scored 88, 94, and 96 performance; the median was 94. Accessibility, best practices, and SEO were 100 in every run. LCP was 1.80–1.96 seconds and CLS was 0. The first run's 461 ms TBT was an isolated synthetic outlier; repeat TBT values were 254 and 226 ms, while direct Event Timing below stayed far inside the 200 ms interaction requirement.

Fresh production Event Timing:

| Interaction | Slowest event |
| --- | ---: |
| Five 12-frame Line detail changes, 390 px | 16 ms; four were below the 16 ms reporting floor |
| 12-frame Line detail, 1440 px | 24 ms |
| Generate 60 frames, 390 px | 16 ms |
| 60-frame Line detail, 390 px | below 16 ms |
| Regenerate 12 frames, 390 px | 16 ms |
| Reset 12 frames, 390 px | 24 ms |

The previous 384–2,024 ms release blocker is fixed.

## PWA, routing, and deployment identity — PASS

- The manifest, standalone display, versioned start URL, 192/512/maskable icons, and controlling service worker passed.
- The live cache is `flipbook-trace-v1.0.7-6a01ffe8d613-shell`.
- The changed-worker claim activated an update, replaced its shell cache, and announced the update. A live registration update completed, and a subsequent offline reload restored 12 sample frames.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. Unknown routes return the designed 404. All discovered links resolve, redirect intentionally, or are explicit email links.
- All 18 publicly deployable files match the local candidate `dist/` byte-for-byte. Representative SHA-256 values: index `8ad3b256…1778`, JS `ecff5921…3451`, CSS `bea09084…d24f`, worker `6e5023cc…4c05`.

This is not a library, CLI, authenticated product, or product-owned backend. Consumer-package, CLI, Entra authority, health/build endpoint, server persistence, and concurrency checks do not apply. The Sociobot verification endpoint is the only runtime API dependency and its allowance was tested above.

## Evidence

- Factory URL-verifier JSON and screenshots: `.factory/evidence-verify-5/verify-url-live/`
- Candidate build: local `dist/` generated during this verification
- Lighthouse JSON and detailed transient browser audit output were collected under `/tmp` during the run

## Final result

**FAIL.** Do not release candidate `10cf0c41537937ac23780dc429ec6ec23341dc9c` until the refund/automatic-revocation statements are registered and proved by an executable claim test (or replaced by narrower, testable wording consistent with the paid-unlock contract). All other acceptance areas passed.
