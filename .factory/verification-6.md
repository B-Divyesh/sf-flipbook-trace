# Flipbook Trace independent verification 6

- Work order: `flipbook-trace-verify-6`
- Candidate commit: `9b813bbfef34ce3f35359a5db1b5e0efafb6ffd0`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Product: local-first offline PWA with optional Sociobot Studio licensing
- Result: **FAIL — the live landing page misses the required mobile LCP budget.**

## Release-blocking finding

### High — live landing-page LCP is consistently about 3.03 seconds, above the 2.5-second budget

The performance contract requires mobile LCP below 2.5 seconds and Lighthouse performance at least 90. Fresh, cold Lighthouse 12.8.2 mobile runs against the deployed landing route, using the installed Playwright Chromium and Lighthouse's performance preset, produced the following two matching measurements:

| Route | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` run 1 | 93 | 100 | 100 | 100 | **3,029 ms** | 0 ms | 0 | 195,931 B |
| `/` run 2 | 93 | 100 | 100 | 100 | **3,028 ms** | 0 ms | 0 | 195,874 B |

The LCP element is the first-screen hero image, `section.hero > figure.hero-art > picture > img`. Lighthouse attributes 1,291 ms to load delay and 1,504 ms to image load time. This is a real live route and a repeatable result, not a build-only result.

The one-click demo route also missed the Lighthouse score budget in two fresh runs (81 and 84 performance; 646 ms and 589 ms TBT respectively), though all direct core-interaction measurements remained below 200 ms. The production payload limits themselves pass: 33.48 KB JavaScript raw / 11.82 KB gzip, 15.88 KB CSS raw / 4.36 KB gzip, no font payload, and a 44.8 KB mobile hero variant.

Required repair: make the hero discoverable and renderable soon enough to meet the <2.5 s cold mobile LCP budget, then rerun a clean mobile Lighthouse measurement of `/` and `/?demo=1`.

## Required opening gate — PASS

Cold live desktop and 390 px mobile reads clearly answer all three questions before scrolling:

- **What it does:** “Turn your video into tracing frames.”
- **Who it is for:** “For short-form creators making a hand-drawn flipbook without uploading their video.”
- **What to click:** the visible **Try it with sample data** link, immediately explained as opening “a ready 12-frame paper-bird sample.”

One click enters `?demo=1`, displays the persistent **Demo — sample data, nothing is saved** banner, and supplies **Reset demo** and **Start for real**. With an explicit ready-state wait, the live demo showed 12 frames; changing to five seconds at 12 fps produced 60; a 0.5-second input displayed the specific recovery message; correcting to two seconds at 6 fps restored 12. PNG and PDF export downloaded `flipbook-trace-frames.zip` and `flipbook-trace-sheet.pdf`.

## Claims gate — PASS

`.factory/claims.json` exists with 20 entries. After `npm ci`, every exact test command listed there was executed sequentially from this candidate checkout through the production-build Playwright demo entry point; all passed.

| Claim IDs passed |
| --- |
| `clip-workflow`, `demo-ready`, `demo-workflow`, `demo-isolation`, `png-export`, `pdf-export`, `local-processing`, `ephemeral-project`, `trace-controls`, `settings-portability` |
| `offline-reload`, `pwa-installable`, `free-quality`, `studio-quality`, `studio-purchase`, `studio-license-check`, `studio-license-cache`, `browser-data-deletion`, `app-update-check` |

The landing page, README, privacy policy, and terms were cross-checked against the registry. The previous unproved merchant/refund statements are absent. Checkout is covered by `studio-purchase`; the live checkout endpoint returned HTTP 303 to a Dodo hosted session.

## Clean-checkout repository gates — PASS

The worktree contained pre-existing modified generated `graphify-out/` files; they were not altered and do not participate in the build. `HEAD` was the specified candidate before and after testing.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages installed; 0 reported vulnerabilities |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS — 3/3 Vitest tests |
| `npm run build` | PASS — produced `dist/` |
| `npm test` | PASS — 51/51 Chromium tests |

## Independent live product, privacy, and billing checks — PASS

- A generated local six-second WebM exercised the real workspace: 1 second at 2 fps produced 2 frames; 5 seconds at 12 fps produced 60; 5.1 seconds was rejected with the documented 1–5 second recovery message. No console or page errors occurred.
- After the application shell settled, recording every request across local video import, tracing, and PNG export captured exactly one `blob:` GET and **no HTTP(S) request**. Cold `/`, demo, privacy, and terms loads made same-origin requests only. There are no analytics, external fonts, or third-party runtime scripts.
- Empty license verification reports “Paste a license token first”; free users selecting 1920 px are returned to 960 px with a clear Studio explanation. Invalid settings JSON reports a concrete recovery message.
- The only server endpoint in scope is Sociobot billing. A fresh single-client verification burst returned 200 for requests 1–30 and **429 on request 31 with `Retry-After: 4`**. The observed allowance is therefore 30 requests per client window. No sign-in exists, so Entra authority validation is not applicable.

## Accessibility, mobile, PWA, security, and deployment identity — PASS

- Live axe scans of `/`, `/?demo=1`, `/privacy`, `/terms`, and the designed 404 reported **zero serious or critical findings**. All valid routes have `lang=en`, one H1, and one main landmark; no horizontal overflow occurred at 390 px.
- The factory `verify-url.sh` passed against the live landing page: HTTP 200, title, language, H1/main, all image alternatives, labeled buttons, and no console/page errors.
- Keyboard testing starts on the Skip link with a visible `rgb(173, 53, 45)` solid 3 px focus ring. ArrowRight changes Line detail from 142 to 143; Enter on Export PNG pack downloads the ZIP. At 390 px, reduced-motion reports no active animations. Direct Event Timing for five live Line-detail key presses was at most 48 ms, within the 200 ms interaction budget.
- The live manifest declares standalone display, a versioned start URL, 192/512/maskable icons, and a controlling worker. After first visit, the demo reloaded offline with its banner and 12 frames. The full suite independently proves the changed-worker update path.
- Live headers include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive Permissions Policy, and a self/Sociobot CSP. Hashed JS/CSS have one-year immutable cache headers; `sw.js` is `no-cache, no-store, must-revalidate`.
- Freshly built candidate files matched the live deployment byte-for-byte for every public artifact: HTML, JS, CSS, service worker, manifest, PWA icons, artwork, offline/404 pages, robots, sitemap, and favicon. `staticwebapp.config.json` is deployment configuration and intentionally returns the designed 404 rather than being publicly served.

## Defects by severity

- **High:** cold mobile landing LCP is ~3.03 s, above the required <2.5 s budget; demo Lighthouse performance is 81/84, below the ≥90 target.
- **Medium:** none found.
- **Low:** none found.

## Decision

**FAIL. Do not release candidate `9b813bbfef34ce3f35359a5db1b5e0efafb6ffd0` until the live mobile LCP budget is met and reverified.** All other tested acceptance areas passed, including the earlier refund-claim repair, deployment identity, claims, privacy, PWA/offline behavior, accessibility, rate limiting, and real local-video workflow.
