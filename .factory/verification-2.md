# Independent product verification — round 2

**Verdict: PASS — release candidate `c03c947d6a3c6263f7fa78fc043536ee1a472698` is accepted.**

Verified independently on 2026-08-28.

- Commit tested: `c03c947d6a3c6263f7fa78fc043536ee1a472698`
- Live URL: <https://flipbook-trace.sociobot.in>
- Product class: local-first offline PWA
- Demo entry point: <https://flipbook-trace.sociobot.in/demo>

This supersedes the earlier failed verification in `verification.md`. That report covered the pre-repair candidate, not this commit.

## Mandatory opening checks

The cold live landing page passes the first-read and demo gates.

- **What it does:** “Turn your video into tracing frames.”
- **Who it is for:** “For short-form creators who want a hand-drawn study without uploading their clip.”
- **What to click first:** the visible **Try it with sample data** link, with the adjacent explanation “It opens a ready 12-frame motion study.”

One click opens `/demo`, displays the persistent “Demo — sample data, nothing is saved” banner with **Reset demo** and **Start for real**, and renders all 12 sample frames. The first screen is plain-language at desktop and 390 px mobile sizes.

## Claims gate — PASS

`.factory/claims.json` exists and contains 13 claims. After `npm ci`, I ran every declared command individually from this checkout. All passed; the full suite then passed 25/25 Chromium tests.

| Claim ID | Result |
| --- | --- |
| `clip-workflow` | PASS |
| `demo-ready` | PASS |
| `demo-isolation` | PASS |
| `png-export` | PASS |
| `pdf-export` | PASS |
| `local-processing` | PASS |
| `ephemeral-project` | PASS |
| `trace-controls` | PASS |
| `settings-portability` | PASS |
| `offline-reload` | PASS |
| `pwa-installable` | PASS |
| `studio-quality` | PASS |
| `studio-purchase` | PASS |

The tests are observable browser tests against the production bundle served by the product’s Playwright entry point, not button-existence checks. The published landing-page and README promises cross-check to those claims, including local processing, disappearance on reload, offline operation, exports, trace controls, settings portability, demo isolation, installability, and Studio purchase/quality.

## Clean-checkout quality gates — PASS

| Command | Result |
| --- | --- |
| `npm ci` | PASS; lockfile install completed, 0 reported vulnerabilities |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm run test:unit` | PASS; 3/3 Vitest tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 25/25 Playwright tests |
| `npm run build` | PASS; writes `dist/` |
| `npm test -- --grep 'new service worker activates'` | PASS; activation, cache replacement, and update announcement proved |

Production-build sizes are well inside the static-PWA budgets: JavaScript 29.66 KB (10.82 KB gzip), CSS 14.86 KB (4.19 KB gzip), largest hero image 174.5 KB, and no font payload. A Lighthouse 12.8.2 run was attempted twice, but the container’s Playwright Chromium process crashed before producing a report; this is a verifier-environment limitation, not a product console/page failure. The bundle-budget, axe, browser, and response-policy checks below completed successfully.

## Independent live product exercise — PASS

Fresh Chromium contexts against the deployed URL proved:

- `/demo` shows 12 bundled frames; **Reset demo** restores the defaults.
- A generated local WebM loads and produces tracing frames. A 1-second, 2-fps section produced exactly 2 frames; a 5-second, 12-fps section produced exactly 60 frames.
- PNG and PDF export actions downloaded `flipbook-trace-frames.zip` and `flipbook-trace-sheet.pdf`. The claim tests also inspect ZIP/PDF signatures and numbered output.
- A 0.9-second range is rejected with “The selected section must be 1–5 seconds inside the video. Change the start or end time.” Recovery is possible by correcting the end time.
- Invalid settings JSON is rejected with a clear “Choose a Flipbook Trace settings file” recovery message.
- Selecting 1920 px without a license resets to 960 px and explains that Studio is needed.
- The production Studio endpoint returned **HTTP 303** to a `checkout.dodopayments.com/session/...` URL.

No console errors or page errors occurred during these flows.

## Privacy, security, and server checks — PASS

- Cold loads of `/`, `/demo`, `/privacy`, `/terms`, and the 404 route made only same-origin runtime requests. The exercised local-video workflow is additionally covered by the passing `local-processing` interception claim.
- There are no analytics, external fonts, or third-party runtime scripts. The only permitted remote product API is Sociobot billing; it is invoked only by an explicit purchase/license action.
- The passing demo-isolation and ephemeral-project claims cover real-storage separation and clip/frame removal on reload.
- Live headers include HSTS, a restrictive CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive Permissions Policy. Hashed JS/CSS assets are one-year immutable; `sw.js` is `no-cache, no-store, must-revalidate`.
- The public verification endpoint was burst-tested with 40 rapid invalid-license requests. Requests 1–30 returned 200; request **31** returned **429** with **`Retry-After: 3`**.
- No sign-in is present, so Microsoft Entra tenant validation is not applicable.

## Accessibility, responsiveness, PWA, and deployment identity — PASS

- Live axe scans of `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` found **zero serious or critical** violations. Each route has `lang=en`, a title, exactly one H1, and one main landmark.
- `/opt/fleet/lib/verify-url.sh` passed against the public URL: HTTP 200; title/language/main/H1/alt checks passed; no unlabeled buttons; no console/page errors.
- At 390×844 the demo has no horizontal overflow; Tab starts at the skip link and reaches navigation, demo actions, controls, settings, and export actions with a visible solid focus outline. All repaired touch-target checks are covered by the passing mobile test.
- In reduced-motion mode, animation and transition durations resolve to 0.01 ms. At 1440×900 all three first-screen facts fit above the fold.
- The live manifest specifies `display: standalone`, start URL `/?source=pwa&v=2`, 192/512/maskable icons, and a controlling service worker. After first visit, `/demo` reloaded offline with the banner and all 12 frames. The explicit update regression passed locally against the production `dist/` worker.
- The live `index.html`, worker, manifest, all assets, icons, and source map are byte-for-byte SHA-256 matches for this candidate’s `dist/`. `staticwebapp.config.json` itself is consumed by the static host; requesting that path receives the configured SPA fallback, while the observed live headers match its candidate rules.

## Defects by severity

No release-blocking, high, medium, or low product defects found.

## Handoff recommendation

Release this candidate. The only noted limitation is that this container could not complete an independent Lighthouse run because its Chromium tab crashed; all available direct performance, accessibility, browser, offline, and response-policy evidence passed.
