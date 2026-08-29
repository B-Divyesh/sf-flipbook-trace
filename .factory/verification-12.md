# Independent verification 12 — FAIL

- Candidate commit: `1562e310c77ff83bc6e3bc960c9d4e1fcd3e9906`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Decision: **FAIL — do not release.**

## Release blocker — one-click demo misses its mobile responsiveness contract

The complete production Playwright suite failed its own mobile demo-startup gate:

```text
npm test
57 tests: 56 passed, 1 failed
tests/site.spec.ts:325
demo startup chunks the initial layout and canvas preparation below the mobile interaction threshold
Expected: < 200 ms
Received: 300 ms
```

This is reproducible, not a one-off test fluctuation. Three further clean focused runs measured **378 ms, 371 ms, and 398 ms**, each against the same `<200 ms` assertion. The independent production check used five fresh contexts at 390x844 CSS px, DPR 1.75, and 4x CPU throttling. Its longest browser main-thread tasks were **245, 156, 186, 209, and 250 ms**: three of five violate the contract.

Fresh mobile Lighthouse on `/?demo=1` scored **90 performance / 100 accessibility / 100 best practices / 100 SEO** (FCP 1.0 s, LCP 1.2 s, TBT 430 ms, CLS 0.031). The performance score is at the stated minimum, but the deterministic repository performance test and live five-load check fail; that is release-blocking.

Required repair: split or defer more initial demo layout/canvas work so every one of five fresh 390px, 4x-CPU demo starts stays below 200 ms. Then rerun the complete suite and redeploy before another verification.

## Mandatory claims and cold first read

`.factory/claims.json` exists and has 19 entries. Before product inspection, `npm ci` was run in this clone and every exact `test` command from the claims file was invoked separately. All passed:

`clip-workflow`, `demo-ready`, `demo-workflow`, `demo-isolation`, `png-export`, `pdf-export`, `local-processing`, `ephemeral-project`, `trace-controls`, `settings-portability`, `offline-reload`, `pwa-installable`, `free-quality`, `studio-quality`, `studio-purchase`, `studio-license-check`, `studio-license-cache`, `browser-data-deletion`, and `app-update-check`.

Cold live first read passed. The first screen says it turns a video into tracing frames, names short-form creators making a hand-drawn flipbook, and tells the visitor to use **Try it with sample data**. Adjacent copy says it opens a ready 12-frame paper-bird sample. One click entered `?demo=1`, showed the persistent **“Demo — sample data, nothing is saved”** banner, rendered 12 frames, regenerated a 5-second/12-fps selection to 60 frames, and reset to 12.

## Clean checkout, build, and package checks

- `npm ci`: PASS; 141 packages installed; audit reported 0 vulnerabilities.
- `npm run test:unit`: PASS; 3/3.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; `dist/` produced. Entry JS is 24,673 B raw / 8,471 B gzip; all JS is 13,681 B gzip; CSS is 16,122 B raw / 4,430 B gzip. The 44,796 B mobile hero is within budget.
- `npm test`: **FAIL**; 56/57, as above.
- `npm audit --omit=dev --audit-level=high`: PASS; 0 vulnerabilities.

This is a static PWA, not a library, CLI, sign-in product, or application backend. Consumer-install, CLI, Entra, persistence-boundary, and health-endpoint checks do not apply.

## End-to-end behavior and recovery

Live checks used a generated six-second local WebM, not an uploaded service file. A non-video `.txt` selection gave the actionable message **“That file is not a video. Choose a video this browser can play.”** The video created frames at the 1-second and 5-second boundaries. Sections of 0.5 and 5.1 seconds showed **“The selected section must be 1–5 seconds inside the video. Change the start or end time.”** A valid one-second selection recovered to six ready frames.

The claim suite additionally proved observable ZIP/PDF export, all supported trace controls, settings import/export and persistence, free and Studio output sizes, license invalid/revoked recovery, and browser-data deletion.

## Privacy, PWA, accessibility, and headers

- Live cold/demo request recording saw only `https://flipbook-trace.sociobot.in` shell assets. No analytics or third-party request occurred. The claim suite also passed the stricter local-video import/filter/export zero-HTTP(S)-request assertion.
- `/demo` registered and was controlled by `/sw.js`. After the first load, forced-offline reload returned 200 and restored all 12 sample frames. The passing `@claim:app-update-check` simulates a changed service worker and verifies activation, cache replacement, and the update-ready notice.
- `verify-url.sh` passed live home and demo: 200, title, `lang=en`, one `h1`, one `main`, no missing image alternatives, no unnamed buttons, and no console/page errors.
- Fresh axe scans at 390 px for `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` found zero serious or critical violations. All had no horizontal overflow. Privacy and terms also stayed within 390 px at 200% text.
- Keyboard testing changed Line detail from 142 to 143 with ArrowRight. The focused range showed `rgb(173, 53, 45) solid 3px`. Reduced-motion rules are present and the local suite covers the complete keyboard/export path and 44 px targets.
- Home and worker headers include CSP with response-header `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive permissions policy. HTML revalidates after 30 seconds; hashed assets are immutable for one year; `sw.js` is no-cache/no-store.

The intentionally missing route returns the designed HTTP 404. Chromium logs the expected resource-status message for that deliberate 404; normal home and demo loads have no console or page errors.

## Deployment identity and rate limiting

Fresh `dist/` was built from the candidate. SHA-256 comparison found **22/22** publicly served artifacts byte-identical to the live site (including source maps). `staticwebapp.config.json` is host configuration and intentionally is not served as a public file. Therefore the live failure is the candidate failure, not stale deployment state.

The optional Sociobot Studio verification endpoint was exercised with a new fake QA token. It allowed **30** requests from this client, then attempts 31–35 returned **429** with `Retry-After: 4`. This satisfies the documented allowance-enforcement requirement. The product has no sign-in.

## Defects by severity

### High — demo startup violates the 200 ms mobile contract

The complete suite fails, focused local retests fail 3/3, and live retests fail 3/5. This is the first interactive product path after the required one-click demo action. Release remains blocked until the scheduling work is repaired and independently retested.

No other release-blocking defect was found. Runtime AI would not improve this local-first frame-preparation job and is outside the researched brief.

## Reproduction

```sh
npm ci
npm run test:unit
npm run lint
npm run typecheck
npm run build
npm test
npm test -- --grep 'demo startup chunks the initial layout'
```
