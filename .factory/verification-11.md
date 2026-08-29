# Independent verification 11 — FAIL

- **Candidate:** `4892cd72cd3482637ea6bf606d1d78b5154dccf5`
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Work order:** `flipbook-trace-verify-11`
- **Verified:** 2026-08-29 UTC
- **Decision:** **FAIL — do not release this candidate.**

## Release blocker

The required complete Playwright suite fails the repository's own throttled-mobile demo-startup gate:

```text
npm test
57 tests; 56 passed; 1 failed
tests/site.spec.ts:323
demo startup chunks the initial layout and canvas preparation below the mobile interaction threshold
Expected: < 200 ms
Received: 304 ms
```

This is repeatable and deployed. Three additional focused local runs failed at **366, 461, and 363 ms**. Five fresh live 390×844, device-scale-factor 1.75, 4×-CPU starts measured longest tasks of **276, 242, 271, 181, and 207 ms**; four of five exceed the `<200 ms` contract. Live Lighthouse independently scored **87 performance** with **530 ms total blocking time**, below the required 90 performance score. The live files are not stale: all 22 publicly served build artifacts match the candidate's fresh `dist/` files byte-for-byte.

Evidence: [full suite log](verification-artifacts-11/full-playwright.log), [live startup measurements](verification-artifacts-11/live-startup.json), [Lighthouse JSON](verification-artifacts-11/lighthouse-live.json), and [deployment hashes](verification-artifacts-11/deployment-match.json).

## Mandatory claims and first read

`.factory/claims.json` exists with 19 entries. Before other product inspection, every declared command was invoked. The untouched clone had no installed packages, so the first command could not resolve `@playwright/test`; after the required `npm ci`, every exact claim command was rerun separately against the production-build demo and passed.

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
| `studio-license-cache` | PASS |
| `browser-data-deletion` | PASS |
| `app-update-check` | PASS |

Evidence: [individual claim log](verification-artifacts-11/claim-tests-after-install.log) and [summary](verification-artifacts-11/claim-summary.json).

The live cold first screen passes the plain-words gate on desktop and 390 px. It says **“Turn your video into tracing frames,”** names **short-form creators making a hand-drawn flipbook without uploading their video**, and presents **“Try it with sample data”** as the primary action. Adjacent text explains that one click opens a ready 12-frame paper-bird sample. The three visible facts cover local handling, offline use, and free PNG/PDF export. One click enters `/?demo=1`, shows **“Demo — sample data, nothing is saved,”** and renders 12 usable frames. No unlisted product claim was found in the landing copy or README.

Evidence: [desktop first read](verification-artifacts-11/first-read-desktop.png) and [mobile first read](verification-artifacts-11/first-read-mobile.png).

## Clean-checkout and build gates

- `git rev-parse HEAD`: exact candidate `4892cd72cd3482637ea6bf606d1d78b5154dccf5`.
- `npm ci`: 141 packages installed from the lockfile; 0 audit vulnerabilities.
- `npm run test:unit`: **3/3 passed**.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm test`: **FAIL, 56/57 passed**, due to the startup-performance test above.
- Focused startup reproduction: **failed 3/3** additional runs.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.

The candidate source and product files were not modified during verification. Pre-existing generated `graphify-out` working-tree changes were left untouched.

## End-to-end behavior and recovery

- Live demo opened with 12 frames, regenerated a five-second section at 12 fps to **60 frames**, and reset to 12.
- PNG export downloaded `flipbook-trace-frames.zip`, 199,926 bytes, with ZIP signature `504b0304`.
- PDF export downloaded `flipbook-trace-sheet.pdf`, 688,243 bytes, with `%PDF-1.4` signature.
- A generated six-second local WebM produced **2 frames** at the 1-second boundary and **10 frames** at the 5-second boundary using 2 fps.
- Durations of 0.5 and 5.1 seconds produced the actionable **“must be 1–5 seconds”** recovery message.
- Selecting `package.json` as a video produced **“That file is not a video. Choose a video this browser can play.”** Selecting the sample then recovered to 12 ready frames.
- Settings portability, trace styles, overlay, 960 px free export, 1920/original-width Studio output, six-column Studio PDF, invalid/revoked license recovery, and data deletion all passed their observable claim tests.

Evidence: [live demo flow](verification-artifacts-11/live-demo-flow.json) and [live local-video boundaries](verification-artifacts-11/live-local-video.json).

## Privacy, requests, and headers

The live cold-load request log contained only same-origin shell assets. After the shell and worker settled, regenerating 60 demo frames, exporting ZIP and PDF, and resetting made **zero requests**. The full live local-video import, filtering, boundary, invalid-file, and recovery flow made only one `blob:` read and **no HTTP(S) request**. There were no application console or page errors. Source inspection found no analytics, beacons, third-party scripts/fonts, raw Azure endpoints, or runtime AI calls. The only optional external runtime call is the explicit Sociobot license verification covered by its passing claim.

Browser-observed home headers include:

- CSP restricted to self, blob/data images/media as needed, and `https://api.sociobot.in`; `frame-ancestors 'none'` is delivered as a response header.
- `Strict-Transport-Security: max-age=10886400; includeSubDomains; preload`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

Evidence: [demo requests](verification-artifacts-11/live-demo-flow.json), [local-video requests](verification-artifacts-11/live-local-video.json), and [browser response headers](verification-artifacts-11/browser-response-headers.json).

## PWA, accessibility, responsive behavior, and links

- Live `/demo` acquired the active `/sw.js` controller and cache `flipbook-trace-v1.0.12-257be505d9e8-shell`. Forced-offline reload returned 200 and rendered all 12 frames. The separate update claim passed changed-worker activation, cache replacement, and update-ready notice.
- The manifest has standalone display, a versioned start URL, 192/512 icons, a 512 maskable icon, and product colors.
- The supplied `verify-url.sh` passed live home and demo with no console errors, one title, `lang=en`, one `h1`, one `main`, and no missing image alt text.
- Live axe scans at desktop and 390 px on `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page` found **zero serious or critical findings**. There was no horizontal overflow. The missing route correctly returned HTTP 404; its browser resource message is the expected 404 itself.
- Keyboard-only use starts on **Skip to main content**. ArrowRight changed Line detail from 142 to 143. Enter exported the PNG pack. Focus used a visible 3 px red outline, and tested targets were at least 44 px.
- At 200% text size, the 390 px page had no horizontal overflow. Reduced-motion styles collapse transitions and animation to 0.01 ms.
- All discovered internal links returned 200 except the intentional missing-page 404. The Param Factory link returned 200. The checkout link returned the expected 303 to Dodo; its price/content claim passed.

Evidence: [PWA/offline audit](verification-artifacts-11/live-pwa.json), [route and axe audit](verification-artifacts-11/live-routes-axe.json), [keyboard/motion audit](verification-artifacts-11/live-keyboard-motion.json), [link crawl](verification-artifacts-11/live-links.json), [home URL smoke](verification-artifacts-11/verify-url-home/verify.json), and [demo URL smoke](verification-artifacts-11/verify-url-demo/verify.json).

## Performance, caching, and deployment identity

- Live Lighthouse demo: **87 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP 1.1 s, LCP 1.2 s, TBT 530 ms, CLS 0.031.
- Production JS: 22,758 B entry + 7,381 B core on demo; 30,139 B raw / 11,186 B gzip combined, below 200 KB.
- CSS: 16,122 B raw / 4,434 B gzip, below 50 KB.
- No font payload. Mobile hero: 44,796 B, below 300 KB.
- Lighthouse first-load transfer: 64,121 B total, with no third-party requests.
- Hashed JS/CSS uses `public, max-age=31536000, immutable`; `sw.js` is `no-cache, no-store, must-revalidate`; manifest revalidates after one hour; HTML revalidates after 30 seconds.
- All **22/22** public `dist/` artifacts match live by SHA-256. The page and worker identify v1.0.12.

The size, LCP, CLS, caching, and accessibility budgets pass. The Lighthouse performance score, TBT, and startup long-task contract fail.

## Billing endpoint and sign-in applicability

The optional Studio verification endpoint enforced **30 successful requests per client rolling window** across the verifier's bursts. Further requests returned **HTTP 429** with `Retry-After` present (observed values 0–4 seconds, including 2 seconds while continuously limited). The checkout claim verified Flipbook Trace Studio, USD 9.00 total, and one-time purchase copy on the hosted flow. This product has no sign-in, so Microsoft Entra tenant validation is not applicable.

Evidence: [rate-limit sequence](verification-artifacts-11/billing-rate-limit-fresh-window.json) together with the preceding [burst](verification-artifacts-11/billing-rate-limit.json) and [follow-up](verification-artifacts-11/billing-rate-limit-final.json).

## Defects by severity

### High — one-click demo startup still violates the mobile responsiveness and Lighthouse budgets

The complete release suite fails, three focused local reruns fail, four of five fresh live runs exceed 200 ms, and live Lighthouse scores 87 with 530 ms TBT. This is the same user-facing first-use path that the preceding repair claimed to fix.

**Required repair:** split, defer, or incrementally schedule more of the demo's initial canvas/layout work so five independent cold 390×844, 4×-CPU starts remain below 200 ms reliably and Lighthouse mobile remains at least 90. Then rerun all 19 claim commands, the full suite, and the same five-load live check after deployment.

No other release-blocking defect was found. AI assistance would conflict with the brief's local preparation job and explicit non-goal of style-transfer AI, so there is no missed-leverage finding.

## Reproduction

```sh
npm ci
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm test
npm test -- --grep 'demo startup chunks'
```
