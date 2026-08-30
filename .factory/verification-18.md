# Independent verification 18 — FAIL

- **Candidate:** `ed08fdd86c3fdc11b7cf8ba78dbfc7d037816899`
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Work order:** `flipbook-trace-verify-18`
- **Verified:** 2026-08-30 UTC
- **Decision:** **FAIL — do not release this candidate.**

The candidate and deployment pass the claim suite, first-read gate, core
workflow, privacy, build, PWA, performance, and automated accessibility checks.
They fail the non-negotiable keyboard baseline: sequential Tab navigation skips
both export buttons in the demo, preventing a keyboard-only visitor from
completing the sample workflow.

## Release-blocking defect

### High — V18-1: Demo export buttons are absent from sequential Tab navigation

At 390×844 in a fresh Chromium context:

1. Open `https://flipbook-trace.sociobot.in/?demo=1`.
2. Wait until `#controls` is visible and the status says **12 frames ready**.
3. Press Tab repeatedly from the address-bar entry point.

Observed focus order: skip link → header links → Reset demo → Start for real →
Start time → End time → Frames each second → selected trace style → Line detail
→ previous-frame checkbox → Export width → PDF columns → Make tracing frames →
Import or export settings → footer links → document body → skip link. Neither
**Export numbered PNG pack** nor **Export PDF trace sheet** receives focus.

Both enabled buttons have the normal implicit tab index, but they are inside the
off-screen `.demo-main .preview-zone` subtree, which uses
`content-visibility: auto` in `src/style.css`. Chromium omits that subtree from
sequential focus navigation while it is skipped for rendering. The existing
test at `tests/site.spec.ts:250` does not catch this because it calls
`exportButton.focus()` directly instead of reaching the control with Tab.

This blocks the demo's primary export job for keyboard-only users and violates
the acceptance contract that every interactive element be reachable with Tab.

Required repair: keep the preview performance optimization without hiding its
interactive descendants from sequential focus, and add a browser test that
Tabs from the preceding control into both export buttons without calling
`.focus()`.

No medium or low defects were found.

## Mandatory first-read and one-click demo gate

The cold first screen passes at 1440×900 and 390×844.

- What it does: **“Turn your video into tracing frames.”**
- Who it is for: **“For short-form creators making a hand-drawn flipbook
  without uploading their video.”**
- What to click first: **“Try it with sample data.”** The adjacent explanation
  says it opens a ready 12-frame paper-bird sample.
- The first screen also states that video stays in the browser, the app works
  offline after the first visit, and the numbered PNG pack and PDF are free.
- One click opened `/?demo=1`, displayed the persistent demo banner, and reached
  **12 frames ready**. The sample itself was visible in the first mobile
  viewport.

## Required claim tests

`.factory/claims.json` exists and contains 19 entries. After `npm ci`, every
listed command was run separately against its configured production-build demo
entry point. All passed:

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

The landing copy, policies, README, demo contract, and claim registry were
cross-checked. No material unlisted product claim was found.

## Clean install, tests, and production build

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages; 0 audit vulnerabilities |
| `npm run test:unit` | PASS — 3/3 |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 64/64 Playwright tests in 2.8 minutes |
| `npm run build` | PASS — `dist/` produced |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |

The production build contains 59,560 B raw / 22,170 B gzip of JavaScript and
16,878 B raw / 4,641 B gzip of CSS. It has no font files. The mobile hero is
44,796 B. These are below the supplied budgets.

## End-to-end behavior and recovery

Independent live checks, in addition to the claim suite, found:

- The demo generated 60 frames for 5 seconds at 12 frames each second.
- A 5.1-second value produced the specific 1–5 second error and retained all 60
  prior frames. Correcting it to 1 second at 2 frames each second produced two
  frames.
- Selecting a Studio-only export size without a license returned the control to
  960 px and explained how to buy or restore Studio.
- Wrong-schema settings JSON produced the stated import recovery message.
- The demo download had ZIP signature `504b0304`; the PDF began `%PDF-1.4`.
- Reset demo restored 12 frames. Start for real removed the demo banner and
  opened the empty local-video workspace.
- A generated 320×200 WebM produced two frames for the 1-second/2-fps case and
  exported a valid ZIP. A text file produced the expected “not a video” error,
  after which the valid video succeeded.
- No console or page errors occurred during these flows.

## Privacy, requests, billing, and rate limiting

- The complete live demo flow made only same-origin GET requests. It made no
  analytics, beacon, third-party font/script, media-upload, or model request.
- After the shell settled, live local-video import, processing, and export made
  zero HTTP(S) requests; the only additional request was a local `blob:` video
  read.
- The browser-observed document response includes HSTS,
  `X-Content-Type-Options: nosniff`, strict-origin referrer policy,
  camera/microphone/geolocation denial, and the declared CSP. `frame-ancestors
  'none'` is delivered as a response header.
- The Studio checkout endpoint returned HTTP 303 to a Dodo hosted checkout. The
  `studio-purchase` claim independently verified Flipbook Trace Studio, USD 9,
  and one-time purchase copy.
- Observed license verification allowance: requests 1–30 returned HTTP 200;
  request 31 returned HTTP 429 with `Retry-After: 4`. A normal verification
  response used `Cache-Control: no-store` and allowed the product origin by
  CORS.
- The product has no sign-in and no product backend, so persistence/concurrency,
  health identity, and Entra authority checks are not applicable.

## Accessibility, responsive behavior, and motion

- Live Axe scans on `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and the
  designed 404 at 1440×900 and 390×844 found zero serious or critical issues.
- All tested routes have `lang=en`, one H1, one main landmark, route-specific
  titles, no unexpected console/page errors, and no horizontal overflow.
- The unknown route returns HTTP 404 with the designed page.
- At 390 px, all measured visible targets were at least 44×44 CSS px.
- At 200% root text size, home, demo, privacy, and terms remained within the
  390 px viewport.
- The first Tab focuses **Skip to main content** with a visible 3 px red outline
  and 4 px offset. The line-detail range changes with ArrowRight.
- With reduced motion enabled, the largest computed animation and transition
  durations were 0.01 ms.
- The sequential export-focus failure described as V18-1 remains blocking even
  though Axe reports no serious/critical findings.

## PWA, caching, identity, and performance

- A fresh live demo registered `/sw.js` with scope `/`. The cache names contain
  `flipbook-trace-v1.0.18-67a8d8b8a0fd`.
- `registration.update()` completed with the worker active. The dedicated claim
  also proved changed-worker activation, old-cache replacement, and its update
  notice.
- After going offline, a reload restored the demo banner and all 12 frames with
  no console errors.
- The manifest uses standalone display, a versioned start URL, matching colors,
  192/512 icons, and a maskable icon.
- HTML revalidates after 30 seconds; hashed JS/CSS are immutable for one year;
  the service worker is `no-cache, no-store`; the manifest revalidates hourly.
- All 30 publicly served candidate files matched live production byte-for-byte
  by SHA-256. Host-only `staticwebapp.config.json` was excluded. This proves the
  live deployment matches the candidate.
- All discovered first-party links returned HTTP 200; the intentional unknown
  route returned HTTP 404.
- Mobile Lighthouse 12.8.2 on the live demo: Performance **98**,
  Accessibility **100**, Best Practices **100**, SEO **100**; FCP 912 ms, LCP
  1,058 ms, TBT 136.5 ms, CLS 0.0615, total transfer 64,068 B, unused JS 0 B.

## Scope and repository state

No product code was modified. Pre-existing `graphify-out/` changes were left
untouched and are not part of this verification commit.
