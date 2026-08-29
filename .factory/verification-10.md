# Independent verification 10 — FAIL

- **Candidate:** `2ad00fb6fdce61034498032fe96e490c952d75df`
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Work order:** `flipbook-trace-verify-10`
- **Verified:** 2026-08-29 UTC
- **Decision:** **FAIL — do not release this candidate.**

## Release blocker

The required complete Playwright suite fails the repository's own mobile startup-performance gate:

```text
npm test
56 tests; 55 passed; 1 failed
tests/site.spec.ts:303
demo startup chunks the initial layout and canvas preparation below the mobile interaction threshold
Expected: < 200 ms
Received: 291 ms
```

This was repeatable. Three additional focused local runs failed at **375 ms**, **401 ms**, and **376 ms**. A fresh live five-load check at 390×844, device scale 1.75, and 4× CPU throttling measured **213, 208, 215, 186, and 267 ms**. Four of five live loads exceed the `<200 ms` test contract. Lighthouse also reported **290 ms total blocking time**. This is not a stale or deployment-only result: all 18 publicly served build artifacts match the candidate's fresh `dist/` files byte-for-byte.

## Mandatory claims and first read

`.factory/claims.json` exists and contains 19 claims. Before other product inspection, every declared command was invoked. The untouched clone did not yet have `node_modules`, so those initial command launches could not resolve `@playwright/test`. After the required `npm ci` installation, every exact claim command was rerun separately against the production-build demo entry point and passed:

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

The live cold first screen passes the plain-words gate. It says **“Turn your video into tracing frames,”** names **short-form creators making a hand-drawn flipbook without uploading their video**, and makes **“Try it with sample data”** the primary action. Adjacent copy says the action opens a ready 12-frame paper-bird sample. One click opened `/?demo=1`, showed **“Demo — sample data, nothing is saved,”** and displayed 12 ready sample frames. The three first-screen facts state local handling, offline availability, and free PNG/PDF exports. No unregistered product claim was found in the landing copy or README.

## Clean checkout and build gates

- `git rev-parse HEAD`: exact candidate `2ad00fb6fdce61034498032fe96e490c952d75df`.
- `npm ci`: 141 packages installed from the lockfile; 0 audit vulnerabilities.
- `npm run test:unit`: **3/3 passed**.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm test`: **FAIL, 55/56 passed**, due to the startup-performance test above.
- Focused reproduction: failed **3/3** additional runs.

## End-to-end behavior and recovery

- The live demo opened with 12 frames, regenerated a five-second section at 12 fps to **60 frames**, then reset to 12.
- PNG export produced `flipbook-trace-frames.zip`, 40,056 bytes, with ZIP signature `504b0304`.
- PDF export produced `flipbook-trace-sheet.pdf`, 150,014 bytes, with `%PDF-1.4` signature.
- The claim tests independently inspect all 12 numbered ZIP entries, non-blank numbered PDF cells, free 960 px output, Studio 1920/original-width output, and six-column Studio PDF layout.
- A generated six-second local WebM passed the 1.0- and 5.0-second boundaries. Durations of 0.5 and 5.1 seconds produced the plain recovery message that the section must be 1–5 seconds.
- Supplying `package.json` as the live video input produced **“That file is not a video. Choose a video this browser can play.”** The state remained **“Waiting for a video.”** Selecting the sample action then recovered to 12 ready frames without a reload or network request.
- Invalid and revoked license states retain working free exports; their cached reload behavior is covered by the suite.

## Privacy and request evidence

The Playwright cold-load request log contained only four same-origin GETs: HTML, hashed JS, hashed CSS, and the hero image. After the shell settled, regenerating 60 demo frames, resetting, and exporting ZIP and PDF made **zero HTTP(S) requests** and produced no console/page errors. The `local-processing` claim separately rejects every HTTP request during generated local-video import, tracing, and export. The `ephemeral-project` claim hashes IndexedDB, Cache Storage, OPFS, and web storage before/after import and reload, proving source bytes and generated frames are not persisted.

The only optional external runtime request is an explicit Studio license GET to Sociobot. Its claim passed with exactly one token-bearing verification URL and no token in another URL, body, or header. Source inspection found no analytics, beacons, raw Azure endpoints, third-party scripts, or CDN fonts.

Browser-observed home response headers:

- `Content-Security-Policy` limits content to self, permits only the Sociobot API connection/form target, and sends `frame-ancestors 'none'` as a header.
- `Strict-Transport-Security: max-age=10886400; includeSubDomains; preload`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

## PWA, accessibility, responsive behavior, and links

- Live `/demo` acquired a controlling `/sw.js` worker and cache `flipbook-trace-v1.0.11-8d318dd6d9c9-shell`. With the browser forced offline, reload returned 200 and rendered all 12 frames. The separate `app-update-check` claim passed worker activation, old-cache replacement, and update-ready notification.
- The manifest uses `display: standalone`, a versioned start URL, 192/512 icons, a 512 maskable icon, and the product palette.
- Live axe scans at desktop and 390 px for `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` found **zero serious or critical findings**. Each route has `lang=en`, one `h1`, and one `main`. Normal routes had no console/page errors or horizontal overflow.
- All visible action hit areas are at least 44×44 CSS px, including radio/checkbox label hit areas. At 200% root text size, the 390 px home page had no horizontal overflow.
- Keyboard evidence: first Tab focuses **Skip to main content**; ArrowRight changed Line detail from 142 to 143; focus was a visible 3 px solid red outline. The full suite's keyboard export test passed.
- With reduced motion enabled, inspected animation and transition durations resolve to 0.01 ms.
- All discovered internal links returned 200 except the intentional missing-page route, which returned its designed HTTP 404. The external Param Factory link returned 200; `mailto:` links are explicit. The hosted checkout path is covered by the passed purchase claim.

Evidence: [live audit](evidence-verify-10/live-audit.json), [URL smoke](evidence-verify-10/verify-url-live/verify.json), and [Lighthouse](evidence-verify-10/lighthouse-live.json).

## Performance, caching, and deployment identity

- Lighthouse mobile live demo: **94 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP 1.0 s, LCP 1.2 s, TBT 290 ms, CLS 0.031.
- Initial JS: **34,988 B raw / 12,096 B gzip**, under 200 KB.
- CSS: **16,122 B raw / 4,445 B gzip**, under 50 KB.
- No font payload. Mobile hero: **44,796 B**, under 300 KB.
- Hashed JS/CSS: `public, max-age=31536000, immutable`.
- `sw.js`: `no-cache, no-store, must-revalidate`; manifest: one-hour revalidation; HTML: 30-second revalidation.
- All **18/18** public `dist/` artifacts match the live deployment by SHA-256. The page and worker identify v1.0.11. `staticwebapp.config.json` is deployment configuration and is correctly not a public asset.

## Billing endpoint and sign-in applicability

The optional Studio verification endpoint allows **30 requests per client window**. Fresh requests 1–30 returned the normal invalid-license response; request 31 returned **HTTP 429** with **`Retry-After: 3`** and `x-ratelimit-after: 3`. The checkout claim followed the hosted flow and verified Flipbook Trace Studio, USD 9.00, and one-time purchase copy. The product has no sign-in, so Microsoft Entra tenant validation is not applicable.

## Defects by severity

### High — one-click demo startup violates its tested mobile interaction budget

The full release suite fails, three focused local reruns fail, and four of five fresh live throttled-phone loads exceed 200 ms. This directly affects the mandatory first-use demo on constrained phones and violates both the repository test and performance contract.

**Required repair:** split or defer more of the initial demo layout/canvas work so five independent 390×844, 4×-CPU cold starts consistently remain below 200 ms. Then rerun all 19 claim commands, the complete suite, and the same live check after deployment.

No other release-blocking defect was found.

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
