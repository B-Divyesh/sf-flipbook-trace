# Flipbook Trace independent verification 3

- Work order: `flipbook-trace-verify-3`
- Tested commit: `bd8f6b791388fa12754f96f8ed98bfe5afd0dd9a`
- Tested URL: <https://flipbook-trace.sociobot.in>
- Date: 2026-08-29 UTC
- Product class: local-first offline PWA with Sociobot paid-license verification
- Result: **FAIL — paid-license lifecycle requirements are not met**

## Release-blocking findings

### High — invalid and revoked license verdicts bypass the one-day cache and lose their notice

The paid-unlock contract requires verification at most once per day, including a cached invalid verdict, and requires a quiet notice when a license is no longer active.

Fresh live-browser reproduction:

1. Opened `/` in a new context and explicitly verified `qa-invalid-cache-check`.
2. The app stored a fresh `{"valid":false,"checked":…}` verdict and made one GET to the Sociobot verification endpoint.
3. Reloaded immediately. The app made the same verification GET again, despite the fresh cached verdict.
4. In a separate context, seeded an older valid verdict and returned `{valid:false, reason:"revoked"}` from the next verification. Studio correctly relocked, but `#license-status` was empty. The required inactive-license notice appeared only after attempting a paid export choice.

The cause is visible at `src/main.ts:573-590`: the cache short-circuit applies only when `record.valid` is true. Verification also runs before the home markup is mounted, so an invalid/revoked status written during startup has no status element to update.

Impact: a saved invalid or revoked token is sent again on every reload, consumes the 30-request API allowance unnecessarily, and does not tell the user why Studio was relocked. This contradicts the paid-unlock contract even though the free workflow remains usable.

Required repair: honor every fresh cached verdict for 24 hours, render the inactive state after the page exists, and add a claim test covering invalid/revoked cache behavior across reloads.

### Medium — purchase terms omit required merchant and refund information

`/terms` states the $9 one-time price, larger export choices, and “Dodo opens checkout for Sociobot.” It does not state that Sociobot/Dodo is the merchant of record, where refunds are handled, or that a refund revokes the license. Those disclosures are required by the paid-unlock contract.

Required repair: add the merchant-of-record and refund/revocation language to the paid section or terms, keeping the existing privacy and terms links.

## Mandatory first-read and demo gate — PASS

Cold at 390×844, the first screen answers all three questions in plain words:

- What it does: **“Turn your video into tracing frames.”**
- Who it is for: **“For short-form creators making a hand-drawn flipbook without uploading their video.”**
- What to click first: **“Try it with sample data.”** The adjacent sentence says it opens a ready 12-frame paper-bird sample.

One click opened `/?demo=1`, showed the persistent **“Demo — sample data, nothing is saved”** banner, and rendered 12 visible sample frames. **Reset demo** and **Start for real** were present.

## Claims gate — PASS after clean install

`.factory/claims.json` exists. After `npm ci`, every exact declared command ran independently against the built production bundle and its demo entry point, and passed:

| Claim | Result |
| --- | --- |
| `clip-workflow` | PASS |
| `demo-ready` | PASS |
| `demo-workflow` | PASS |
| `demo-isolation` | PASS |
| `png-export` | PASS |
| `pdf-export` | PASS |
| `local-processing` | PASS |
| `ephemeral-project` | PASS |
| `trace-controls` | PASS |
| `settings-portability` | PASS |
| `offline-reload` | PASS |
| `pwa-installable` | PASS |
| `free-quality` | PASS |
| `studio-quality` | PASS |
| `studio-purchase` | PASS |
| `studio-license-check` | PASS |
| `browser-data-deletion` | PASS |
| `app-update-check` | PASS |

The landing, privacy, terms, README, demo contract, and copy audit were cross-checked. Product promises map to these tests or are scope/limitation statements. The missing paid-license lifecycle behavior above is an acceptance-contract gap not represented in `claims.json`.

## Clean-checkout repository gates — PASS

- `npm ci`: 141 packages installed; 0 vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run test:unit`: PASS, 3/3.
- `npm run build`: PASS; `dist/` produced.
- `npm test`: PASS, 47/47 Chromium tests in 1.8 minutes.

Production output:

- JavaScript: 31.24 KB raw / 11.02 KB gzip.
- CSS: 15.84 KB raw / 4.35 KB gzip.
- Largest hero image: 174.51 KB; mobile variant: 44.80 KB.
- Fonts: no downloaded font payload.

These are within the static-PWA bundle budgets.

## End-to-end workflow — PASS

The independent live demo flow produced this evidence:

- 12 ready frames on entry.
- 5 seconds at 12 fps produced 60 frames.
- A 0.5-second selection was rejected with: “The selected section must be 1–5 seconds inside the paper-bird sample. Change the start or end time.”
- Correcting the selection to 1 second recovered to 12 frames.
- PNG export downloaded `flipbook-trace-frames.zip`, 160,148 bytes, with ZIP magic `504b0304`.
- PDF export downloaded `flipbook-trace-sheet.pdf`, 202,367 bytes, beginning `%PDF-1.4`.

A generated six-second local WebM exercised the real live workspace:

- 1 second at 2 fps produced 2 frames.
- 5 seconds at 12 fps produced 60 frames.
- 5.1 seconds produced the documented recovery message.
- PNG and PDF downloads completed.
- Reload removed the selected file and all frames.

The claim suite additionally inspects numbered ZIP members, PNG dimensions, non-blank numbered PDF cells, trace-style pixel differences, overlay behavior, free/Studio dimensions, settings persistence, and demo storage isolation.

## Privacy, network, and billing — PASS except finding above

- Cold `/`, `/demo`, `/privacy`, `/terms`, and 404 loads made no cross-origin request.
- The complete sample flow made no runtime request after the shell settled.
- The real local-video flow made only a local `blob:` read before its deliberate reload; no video or frame data left the browser.
- No analytics, remote fonts, or third-party runtime scripts were observed.
- An explicit invalid-license action made exactly one GET to `api.sociobot.in`, with production CORS restricted to `https://flipbook-trace.sociobot.in`; empty input made no request.
- The checkout endpoint returned HTTP 303 to `checkout.dodopayments.com`; the passing claim test confirmed Flipbook Trace Studio, USD $9.00, and one-time billing.
- Rate-limit test: requests 1–30 to the verification endpoint returned 200; request 31 returned **429** with **`Retry-After: 3`**. Observed allowance: 30 requests per client window.

Response headers on HTML routes include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive permissions policy, and a CSP limited to self plus the Sociobot billing API. HTML revalidates after 30 seconds; hashed assets are immutable for one year; `sw.js` is `no-cache, no-store, must-revalidate`.

## Accessibility, responsive behavior, and errors — PASS

- Live axe scans found zero serious/critical findings on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` at 390 px.
- Each route has `lang=en`, one `<h1>`, one `<main>`, and a route-specific title. Images have alternatives and controls have labels.
- All audited routes had zero horizontal overflow at 390×844. The full suite confirmed visible actions are at least 44×44 px.
- Keyboard-only use starts at the skip link, reached the threshold after 12 Tabs, changed it from 142 to 143 with ArrowRight, reached **Export PNG pack** after six more Tabs, and downloaded the ZIP with Enter.
- Focus used a visible solid 3 px red outline. At a 200% page scale, zoom remained enabled and the heading and actions remained present.
- With reduced motion enabled, the media query matched and no animation remained active.
- No console/page errors occurred on normal routes or workflows. Chrome logged the expected failed-resource message for the main document when deliberately visiting the real HTTP 404; there was no application exception.
- `/opt/fleet/lib/verify-url.sh` passed production: HTTP 200, load 684 ms, one H1/main, `lang=en`, no missing image alternative, no unlabeled button, and no console/page error.

Lighthouse mobile, five independent runs:

| Run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 80 | 100 | 100 | 100 | 1.9 s | 850 ms | 0 |
| 2 | 94 | 100 | 100 | 100 | 1.8 s | 260 ms | 0 |
| 3 | 89 | 100 | 100 | 100 | 1.8 s | 420 ms | 0 |
| 4 | 94 | 100 | 100 | 100 | 2.0 s | 270 ms | 0 |
| 5 | 90 | 100 | 100 | 100 | 1.8 s | 390 ms | 0 |

Median performance is 90, meeting the threshold; LCP and CLS remain within budget. The blocking-time variance is a non-blocking performance risk. Lighthouse also reports an experimental label/name mismatch for the decorative `FT` monogram, while the standard axe scans and keyboard checks pass.

## PWA, routing, and deployment identity — PASS

- Manifest is standalone with 192, 512, and maskable icons and versioned start URL `/?source=pwa&v=5`.
- After first load, the live `/demo` reloaded offline with the banner and all 12 sample frames.
- The `app-update-check` claim served a changed worker, activated it, replaced the shell cache, and displayed the update-ready notice.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; `/missing-page` returns the designed HTTP 404. Sitemap and robots files are present. All discovered navigation targets resolved; checkout redirects intentionally.
- The live `index.html`, manifest, worker, 404, offline page, favicon, icons, JS, CSS, artwork, and social card are byte-for-byte identical to the candidate `dist/` output. Representative SHA-256 values: index `bfc2a117…f834b`, JS `72a3497a…6514`, CSS `f053d277…3fcc5`, worker `f2408eed…319e`.
- The live footer and package identify version 1.0.5. Candidate and deployed code therefore match commit `bd8f6b791388fa12754f96f8ed98bfe5afd0dd9a`.

This is a static PWA, not a library, CLI, authenticated product, or product backend. Consumer-package, sign-in authority, health/build endpoint, concurrency, and server persistence checks are not applicable. The only server endpoint in scope is Sociobot billing, whose rate limit was verified above. No AI feature is implied by the deterministic local workflow; adding one would work against the privacy premise.

## Evidence

- Browser audit script and screenshots: `.factory/evidence-verify-3/`
- URL verifier result: `.factory/evidence-verify-3/verify-url-live/verify.json`
- Lighthouse JSON reports: `/tmp/flipbook-trace-lighthouse.json` and `/tmp/flipbook-trace-lighthouse-2.json` through `-5.json`

## Decision

**FAIL.** Do not release this candidate until the invalid/revoked license cache and notice behavior is repaired and the required merchant/refund terms are present. Re-run the 18 claim commands, full suite, live invalid/revoked reload scenario, checkout/rate-limit checks, offline reload, axe, and Lighthouse after repair.
