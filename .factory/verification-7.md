# Flipbook Trace independent verification 7

- Work order: `flipbook-trace-verify-7`
- Candidate commit: `b9e6120d51e8e158e7cf4a395c5dfbf3924b8488`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Artifact: local-first offline PWA with optional Sociobot Studio licensing
- Result: **FAIL — the required full test suite fails reproducibly, and the live demo misses the mobile performance score budget.**

## Release-blocking finding

### High — demo startup performance fails the repository gate and the live Lighthouse budget

The exact required `npm test` command completed **52/53 tests**. The failing test was:

```text
tests/site.spec.ts:246
demo startup keeps canvas preparation below the mobile interaction threshold
Expected: < 200 ms
Received: 331 ms
```

An isolated five-run repeat was then executed:

```sh
npx playwright test tests/site.spec.ts --grep "demo startup keeps canvas preparation" --repeat-each=5
```

All five repeats failed. Their longest startup tasks were **382, 417, 378, 377, and 442 ms**. This is reproducible, not a single noisy run. Because the product contract requires `npm test` to pass, this alone blocks release.

Fresh Lighthouse 12.8.2 mobile runs against the matching live demo also missed the required score of at least 90:

| Route | Run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/?demo=1` | 1 | **80** | 100 | 100 | 100 | 1,209 ms | **881 ms** | 0.030 | 66,219 B |
| `/?demo=1` | 2 | **85** | 100 | 100 | 100 | 1,173 ms | **590 ms** | 0 | 64,298 B |

The prior landing-page LCP defect is repaired. Two fresh Lighthouse 13 mobile runs on `/` scored 100 and 99 with LCP of 1,255 and 1,230 ms, respectively. Lighthouse 13 crashed while gathering the demo route twice; the demo was therefore repeated with Lighthouse 12.8.2, the version used by the previous repair evidence.

Evidence: `.factory/qa-artifacts/lighthouse-home-1.json`, `lighthouse-home-2.json`, `lighthouse-demo-12.json`, and `lighthouse-demo-12b.json`. Playwright retained failure screenshots and traces under the ignored `test-results/` directory.

## Required opening gate — PASS

A cold live visit in fresh desktop and 390 × 844 browser contexts answers the three required questions before interaction:

- What it does: **“Turn your video into tracing frames.”**
- Who it is for: **“For short-form creators making a hand-drawn flipbook without uploading their video.”**
- What to click first: **Try it with sample data**, followed by “It opens a ready 12-frame paper-bird sample.”

One click enters `?demo=1`, shows 12 sample frames, and keeps the **Demo — sample data, nothing is saved** banner with **Reset demo** and **Start for real**. Evidence: `.factory/qa-artifacts/first-read-desktop.png`, `first-read-mobile.png`, and `live-qa.json`.

## Claims gate — PASS

`.factory/claims.json` exists and contains 19 entries. A separate pristine clone was created at the exact candidate commit; `git status --porcelain` returned zero entries before setup. After `npm ci`, every exact listed command was run separately through the production-build Playwright entry point. All **19/19 passed**:

`clip-workflow`, `demo-ready`, `demo-workflow`, `demo-isolation`, `png-export`, `pdf-export`, `local-processing`, `ephemeral-project`, `trace-controls`, `settings-portability`, `offline-reload`, `pwa-installable`, `free-quality`, `studio-quality`, `studio-purchase`, `studio-license-check`, `studio-license-cache`, `browser-data-deletion`, and `app-update-check`.

The live landing page, policies, terms, and README were cross-checked against the registry. No unlisted customer-reliance claim was found.

## Clean-checkout repository gates

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages installed; audit reported 0 vulnerabilities |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS — 3/3 Vitest tests |
| `npm run build` | PASS — produced `dist/index.html` |
| `npm test` | **FAIL — 52/53 passed; mobile demo startup measured 331 ms against `<200 ms`** |

The production build contains 33.73 KB raw / 11.85 KB gzip JavaScript and 15.88 KB raw / 4.36 KB gzip CSS. It loads no font files. The selected mobile hero is 44,796 bytes. These static budgets pass.

## Independent live workflow — PASS

The live app was exercised with both the built-in sample and a newly recorded six-second local WebM:

- Demo: 12 ready frames; five seconds at 12 fps produced 60; 0.5 seconds showed the specific 1–5 second recovery message; correcting to two seconds at 6 fps restored 12.
- Real video: one second at 2 fps produced 2 frames; five seconds at 12 fps produced 60; 5.1 seconds showed the specific 1–5 second recovery message; correcting the input restored 12.
- Both paths downloaded `flipbook-trace-frames.zip` and `flipbook-trace-sheet.pdf`.
- Reloading after the real workflow left zero frames and an empty file input.
- Empty license verification, selecting a paid width without a license, and malformed settings JSON each produced a specific recovery message.
- The live checkout endpoint returned HTTP 303 to a Dodo session whose page contained `Flipbook Trace Studio`, `$9.00`, and `One-time`.

Evidence: `.factory/qa-artifacts/live-qa.json` and `live-demo-desktop.png`.

## Privacy, network, and rate limiting — PASS

- Cold `/`, demo, privacy, and terms loads made same-origin requests only. There are no analytics, external fonts, or third-party runtime scripts.
- After the shell settled, the whole real-video import, filtering, and export workflow made only one `blob:` media request and **no HTTP(S) request**. The demo workflow made no request after entry.
- The source video and frames disappeared on reload. Claim coverage also inventories IndexedDB, Cache Storage, OPFS, and web storage.
- A single-client burst against the Sociobot license verification endpoint returned 200 for requests 1–30, then **429 on request 31 with `Retry-After: 2`**. The observed allowance is 30 requests per client window.
- The product has no sign-in, so Microsoft Entra authority validation is not applicable.

## Accessibility and responsive behavior

- Live axe scans on `/`, `/?demo=1`, `/privacy`, `/terms`, and the designed 404 found **zero serious or critical violations**.
- Valid routes have `lang=en`, one H1, one main landmark, correct route titles, zero 390 px horizontal overflow, and no console or page errors.
- The designed 404 correctly returns HTTP 404; Chromium logs the expected failed-main-resource console message for that 404 response, with no application exception.
- Keyboard-only use starts on the Skip link. Both the Skip link and range control show a 3 px solid `rgb(173, 53, 45)` focus outline. ArrowRight changed Line detail from 142 to 143, and Enter downloaded the PNG pack.
- The full suite passed all 390 px 44 × 44 target checks and the live reduced-motion context had zero running animations.
- With a forced 200% root text size, home and demo had no horizontal overflow. Privacy and terms had 13 px of horizontal pan from the unbroken email address, but no text was lost.
- `/opt/fleet/lib/verify-url.sh` passed the live root: title, language, one H1/main, image alternatives, labeled buttons, and zero console/page errors. Evidence: `.factory/qa-artifacts/verify-url-live/verify.json`.

## PWA, headers, caching, and deployment identity — PASS

- A live controlling service worker was present. The manifest declares standalone display, versioned start URL, 192/512 icons, and a maskable icon.
- After first visit, `/?demo=1` reloaded offline with its banner and all 12 frames.
- The exact `@claim:app-update-check` test passed: a changed service worker activated, replaced its cache, and showed the update-ready notice.
- Live headers include HSTS, CSP with `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive permissions policy.
- HTML uses `max-age=30, must-revalidate`; hashed JS/CSS use one-year immutable caching; `sw.js` is `no-cache, no-store, must-revalidate`; the manifest revalidates after one hour.
- All 17 public build artifacts checked match the candidate `dist/` byte-for-byte by SHA-256: HTML, JS, CSS, service worker, manifest, offline/404 pages, robots, sitemap, favicon, icons, hero variants, and social card.
- The internal/external link crawl found no unexpected dead link. The designed missing-page route returned 404 as intended.

## Defects by severity

- **High:** Demo startup violates its own `<200 ms` long-task test in 6/6 fresh observations (331–442 ms), causing the required `npm test` gate to fail. The matching live demo scores only 80/85 in mobile Lighthouse, below the required 90.
- **Medium:** None found.
- **Low:** At forced 200% root text size on a 390 px viewport, `/privacy` and `/terms` gain 13 px horizontal overflow from the unbroken contact email address. Content remains present.

## Decision

**FAIL. Do not release candidate `b9e6120d51e8e158e7cf4a395c5dfbf3924b8488`.** The old landing LCP defect is fixed and every claim passes, but the required full suite does not pass and live demo performance remains below contract.
