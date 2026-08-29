# Independent verification 9 — FAIL

- **Candidate:** `ce87de861e4efa3491a9c1b29700f573fd861d5d` (`factory: repair flipbook-trace-repair-8`)
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Decision:** **FAIL — do not release this candidate.**

## Release blocker

The required full Playwright suite fails at the product's own mobile startup-performance gate:

```text
npm test -- --reporter=list
56 tests; 1 failed
tests/site.spec.ts:300
demo startup chunks the initial layout and canvas preparation below the mobile interaction threshold
Expected: < 200 ms
Received: 411 ms
```

The focused fresh reproduction also failed at **411 ms**. This is not deployment-only: five fresh live `/?demo=1` loads at 390×844 and 4× CPU throttling measured longest tasks of **275, 224, 237, 244, and 146 ms**. Four of five exceed the repository's `<200 ms` gate. The failure blocks the one-click demo's first interactive paint and fails the required `npm test` quality gate.

## Mandatory claims and first read

The clean checkout initially had no `node_modules`, so the first attempted claim command could not resolve `@playwright/test`. After the required clean-lockfile setup (`npm ci`, 141 packages, 0 audit vulnerabilities), every exact command declared in `.factory/claims.json` was run separately against the production-build Playwright demo entry point and passed:

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

Cold-reading the live landing page passes the plain-words and demo gates. It says it will **“Turn your video into tracing frames,”** names **short-form creators** making a hand-drawn flipbook without uploading video, and the first primary action is **“Try it with sample data.”** The adjacent copy says it opens a ready twelve-frame paper-bird sample; the link opens demo mode in one click.

## What passed

- Clean quality gates: `npm run test:unit` (3/3), `npm run lint`, `npm run typecheck`, and exact `npm run build` all passed. The production build writes `dist/`.
- End to end on the live demo: it starts with 12 frames; changing to five seconds at 12 fps produced 60 frames; both `flipbook-trace-frames.zip` and `flipbook-trace-sheet.pdf` downloaded without error. Claim coverage additionally proves the generated-local-video 1.0 and 5.0 second boundaries, 0.5/5.1 second recovery, ZIP/PDF contents, settings portability, free/Studio output widths, and memory-only source handling.
- Privacy: after the live shell settled, demo regeneration and PNG/PDF exports made **zero** HTTP(S) requests. Cold live demo loading requested only same-origin HTML, CSS, JS, and hero image; no analytics, third-party fonts, or third-party runtime script was observed. The `local-processing` claim independently rejects even same-origin collection requests during real local-video import/trace/export.
- PWA: a live controlling worker (`/sw.js`) created `flipbook-trace-v1.0.10-016a6c01b4d8-shell`; after the network was disabled, demo reload returned HTTP 200 from cache and rendered all 12 frames with no errors. The dedicated local `app-update-check` claim passed service-worker update activation, shell-cache replacement, and the update-ready notice.
- Accessibility and responsive behavior: live axe-core scans of `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page` found zero serious/critical findings. Normal routes had one `h1`, one `main`, `lang=en`, correct route title, and no console/page errors. Desktop 1440 px and mobile 390 px had no horizontal overflow and no visible link/button below 44 px. Keyboard focus is a visible 3 px red outline; the full repository suite exercises Tab, ArrowRight range changes, and Enter export. Reduced-motion live CSS resolves durations to 0.01 ms. The browser logs the expected failed-resource message only when deliberately opening the HTTP 404 route.
- Security and caching: live responses have CSP with `frame-ancestors 'none'`, `nosniff`, strict referrer policy, HSTS, and camera/microphone/geolocation denied. Hashed JS/CSS are `max-age=31536000, immutable`; `sw.js` is `no-cache, no-store, must-revalidate`. Fresh build output is 34,411 B JS (12,068 B gzip) and 16,122 B CSS (4,434 B gzip), inside the stated static budgets.
- Deployment identity: all **18** publicly served build files matched the fresh candidate `dist/` byte-for-byte (HTML, hashed JS/CSS/map, images, icons, manifest, service worker, sitemap, robots, and 404/offline documents). `staticwebapp.config.json` correctly returns 404 because it is deployment configuration, not a public artifact. The live page reports `v1.0.10`.
- Rate limit: the only runtime server call is optional Sociobot Studio license verification. With a deliberately invalid token, requests 1–30 returned the normal invalid-license response; request **31** returned **HTTP 429** with `Retry-After: 3` (also `x-ratelimit-after: 3`). No sign-in is present, so Entra tenant validation is not applicable.

## Defects by severity

### High — demo startup exceeds the required mobile main-thread budget

The shipped sample demo performs a 224–275 ms longest task in four of five fresh live 4×-throttled phone loads; the clean local focused test measured 411 ms. The product contract and repository test require `<200 ms`. This causes `npm test` to fail and makes the one-click try-out unreliable on constrained phones.

**Required repair:** further split/defer initial demo canvas/layout work so the five-cold-start gate is consistently below 200 ms, then rerun every claims command, the full `npm test` suite, and the live throttled mobile check before release.

## Reproduction

```sh
npm ci
npm run test:unit
npm run lint
npm run typecheck
npm run build
npm test -- --reporter=list
npm test -- --grep 'demo startup chunks' --reporter=list
```
