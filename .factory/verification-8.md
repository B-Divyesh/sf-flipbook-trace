# Independent verification 8 — FAIL

- **Candidate:** `2670be1951a3da156f6b45ed1219f71472123e92` (`fix: keep demo startup within mobile budget`)
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Decision:** **FAIL — do not release this candidate.**

## Release blocker

The full repository Playwright suite failed. Its deterministic mobile startup gate requires the longest task while opening `/?demo=1` on a 390 px viewport with 4x CPU throttling to be below 200 ms. A focused fresh run measured 514 ms. Five more fresh repetitions all failed: **460, 421, 492, 428, and 382 ms**. This is a real regression against the candidate's stated purpose, not a deployment-only failure.

Two fresh Lighthouse 12.8.2 mobile runs of the live demo corroborate the problem: performance was **81** and **84** (required >=90), with total blocking time **799 ms** and **646.5 ms**. Accessibility was 100 in both; LCP was 1.214 s / 1.213 s and CLS 0.031. The Lighthouse Chromium tab crashed while gathering the final screenshot after results were written, but both JSON reports contain the stated scores and metrics.

## Mandatory claims and first read

All 19 commands declared in `.factory/claims.json` were run from a clean, detached worktree at the candidate through the product's Playwright demo entry point. Every claim passed:

| Claim IDs | Result |
| --- | --- |
| `clip-workflow`, `demo-ready`, `demo-workflow`, `demo-isolation` | PASS |
| `png-export`, `pdf-export`, `local-processing`, `ephemeral-project` | PASS |
| `trace-controls`, `settings-portability`, `offline-reload`, `pwa-installable` | PASS |
| `free-quality`, `studio-quality`, `studio-purchase` | PASS |
| `studio-license-check`, `studio-license-cache`, `browser-data-deletion`, `app-update-check` | PASS |

Cold first read of the live home page passed. It says “Turn your video into tracing frames,” names “short-form creators,” and the first primary action is “Try it with sample data,” immediately explained as opening a ready 12-frame paper-bird sample. The one-click sample link worked.

## What passed

- Clean install: `npm ci`; high-severity dependency audit: 0 vulnerabilities.
- `npm run typecheck`, `npm run lint`, and `npm run test:unit`: PASS (3/3 unit tests). Exact `npm run build`: PASS and creates `dist/`.
- The first `npm test` invocation ran 55 tests and exited failing (one demo accessibility-route failure was not reproducible in its immediate focused rerun); the startup-budget failure reproduces consistently as above and is sufficient to fail the quality gate.
- Live demo end-to-end: initial 12 frames; 5 seconds at 12 fps gives 60; reset returns to 12; PNG ZIP and PDF downloads succeed. Local claim coverage also proves the 1.0/5.0 second boundaries, 0.5/5.1 second recovery message, source-video memory cleanup, settings import/export, and paid-quality paths.
- Privacy: fresh Playwright request logging after the live demo shell settled captured **zero** HTTP(S) requests while regenerating frames and downloading the PNG/PDF. Initial shell requests were only same-origin document, image, JavaScript, and CSS. No analytics/tracker request was observed.
- PWA: the live page had a controlling service worker; after disabling network, a reload of the demo showed its heading and all 12 frames. Local claim coverage passes service-worker update activation and cache replacement.
- Accessibility: axe-core found zero serious/critical violations on `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page`; normal routes had no page/console errors, each had one `h1` and one `main`, and 390 px pages had no horizontal overflow. Keyboard focus on Line detail was visible and ArrowRight changed 142 to 143. With reduced motion, effective animation and transition duration was `0.00001s`. The intentional 404 response itself emits the browser's expected failed-resource console message.
- Headers/caching: live responses include CSP with `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, strict referrer policy, HSTS, and a restrictive permissions policy. Hashed JS/CSS are immutable for one year; `sw.js` is no-cache/no-store. The initial bundle is 33,909 B JS (11,794 B gzip) and 16,031 B CSS (4,423 B gzip), within budget.
- Deployment identity: after a fresh candidate build, all **17** deployable live files checked matched `dist/` byte-for-byte. `staticwebapp.config.json` correctly is not publicly served (404).
- The only server-side endpoint in scope, Sociobot Studio license verification, allowed **30** consecutive requests from this client; request **31** returned **429** with `Retry-After: 3`.

## Defects by severity

### High — mobile demo blocks the main thread beyond the product gate

Opening the shipped one-click demo performs a 382–514 ms longest task under the repository's defined 4x-throttled 390 px test, exceeding the <200 ms limit every time. This fails `npm test`, the mobile interaction requirement, and the required Lighthouse >=90 performance target. Reduce or chunk the initial canvas/frame preparation, then rerun the focused gate at least five times, the complete suite, and two mobile Lighthouse runs before resubmission.

## Reproduction

```sh
git worktree add --detach /tmp/flipbook-trace-verify-8 2670be1951a3da156f6b45ed1219f71472123e92
cd /tmp/flipbook-trace-verify-8
npm ci
npm test -- --grep '@claim:'
npm run typecheck && npm run lint && npm run test:unit && npm run build
npm test
npx playwright test tests/site.spec.ts --grep 'demo startup keeps canvas preparation' --repeat-each=5 --reporter=list
```
