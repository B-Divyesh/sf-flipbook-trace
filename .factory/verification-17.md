# Independent verification 17 — PASS

- **Candidate:** `94a6e74b6a9d8aa2332d09a5268f5af66d84866f`
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Work order:** `flipbook-trace-verify-17`
- **Verified:** 2026-08-30 UTC
- **Decision:** **PASS — release this candidate.**

This was a fresh verification from a detached, clean worktree at the exact candidate SHA. The previous verification's intermittent Sociobot billing outage did not recur: the declared purchase claim passed, a fresh checkout returned a working Dodo session, and the license API enforced its request limit correctly.

## Mandatory first-read and demo gate

The cold first screen passes at 1440×900, 1366×768, and 390×844:

- What it does: **“Turn your video into tracing frames.”**
- Who it is for: **“For short-form creators making a hand-drawn flipbook without uploading their video.”**
- First click: **“Try it with sample data.”** Adjacent text says it opens a ready 12-frame paper-bird sample.
- The three facts state that video stays in the browser, the app works offline after the first visit, and PNG/PDF export is free.
- The facts ended at y=794.6 in the 1440×900 viewport, y=762.3 at 1366×768, and y=733.2 at 390×844.
- One click opened `/?demo=1`, showed **“Demo — sample data, nothing is saved,”** and displayed all 12 sample frames. **Reset demo** restored 12 frames. **Start for real** returned to `/`, removed the banner, and showed the empty local-video workspace.

## Required claim tests

`.factory/claims.json` exists with 19 entries. After `npm ci`, every listed command was run separately against the candidate's built production demo entry point. All passed:

| Claim | Result |
| --- | --- |
| `clip-workflow` | PASS — 1 Playwright test, 14.0 s |
| `demo-ready` | PASS — 1 test, 2.0 s |
| `demo-workflow` | PASS — 1 test, 9.7 s |
| `demo-isolation` | PASS — 1 test, 4.7 s |
| `png-export` | PASS — 1 test, 3.2 s |
| `pdf-export` | PASS — 1 test, 4.7 s |
| `local-processing` | PASS — 1 test, 4.3 s |
| `ephemeral-project` | PASS — 1 test, 5.4 s |
| `trace-controls` | PASS — 1 test, 8.7 s |
| `settings-portability` | PASS — 1 test, 2.5 s |
| `offline-reload` | PASS — 1 test, 2.0 s |
| `pwa-installable` | PASS — 1 test, 1.8 s |
| `free-quality` | PASS — 1 test, 3.2 s |
| `studio-quality` | PASS — 1 test, 8.2 s |
| `studio-purchase` | PASS — 1 test, 2.9 s |
| `studio-license-check` | PASS — 1 test, 2.1 s |
| `studio-license-cache` | PASS — 1 test, 5.9 s |
| `browser-data-deletion` | PASS — 1 test, 2.1 s |
| `app-update-check` | PASS — 1 test, 4.2 s |

The landing page, policies, demo contract, and README were cross-checked against the registry. No material visitor-facing claim is left unlisted.

## Clean install, static checks, tests, and build

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages installed; 0 audit vulnerabilities |
| `npm run test:unit` | PASS — 3/3 Vitest tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 59/59 Playwright tests in 2.8 minutes |
| `npm run build` | PASS — TypeScript and Vite production build wrote `dist/` |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |

The build emitted 59,404 B raw / 22,154 B gzip of JavaScript in seven chunks and 16,878 B raw / 4,641 B gzip of CSS. It has no font files. The mobile hero is 44,796 B. All are well inside the supplied budgets.

## End-to-end behavior and recovery

Fresh live Chromium contexts exercised both the sample and a generated local WebM:

- The demo regenerated 60 frames for 5 seconds at 12 fps.
- A 5.1-second demo selection showed the specific 1–5 second correction message and retained all 60 prior frames. Correcting it to 1 second at 2 fps produced 2 frames.
- Demo ZIP export had signature `504b0304`; PDF export began `%PDF-1.4`. The independent claim tests also inspected numbered ZIP contents and decoded the 12-cell PDF image.
- A generated 6.1-second, 320×200 WebM produced 2 frames at the 1-second/2-fps lower boundary and 10 at the 5-second upper boundary.
- Values of 0.5 and 5.1 seconds both produced the stated recovery message and retained the previous 10 frames. Returning to 1 second recovered successfully.
- A text file produced **“That file is not a video. Choose a video this browser can play.”**
- Selecting 1920 px without a license reset the control to 960 px and explained how to buy or restore Studio.
- Invalid settings JSON produced **“Those settings could not be imported. Choose a Flipbook Trace settings file.”**
- Empty license verification produced **“Paste a license token first.”**
- No console or page errors occurred in these normal and recovery flows.

## Privacy, network, billing, and rate limit

- The complete live demo flow recorded only same-origin GETs for the document, image, CSS, and product JavaScript. It made no analytics, beacon, CDN-font, CDN-script, media-upload, Azure-model, or other third-party request.
- After the app shell settled, a live generated-video import, trace, and ZIP export recorded one `blob:` media read and **zero HTTP(S) requests**.
- The strict claim test independently rejected every HTTP request during local import, processing, and export and passed.
- Persistent-store inspection claims passed: media and generated frames remain in page memory, disappear on reload, and are absent from IndexedDB, Cache Storage, OPFS, localStorage, and sessionStorage. Demo mode does not open, read, or change real settings or license data.
- A fresh Studio checkout returned HTTP 303 to `checkout.dodopayments.com`; the resulting HTTP 200 page contained **Flipbook Trace Studio**, **$9.00**, and **One-time**.
- The license endpoint returned `Cache-Control: no-store` and allowed CORS specifically for `https://flipbook-trace.sociobot.in`.
- Observed license-API allowance: requests 1–30 returned HTTP 200 invalid-license verdicts. Request 31 returned HTTP 429 with `Retry-After: 4`.
- This product has no sign-in, so the Entra authority requirement is not applicable.

## Accessibility, responsive behavior, keyboard, and motion

- Live Playwright Axe scans on `/`, `/?demo=1`, `/privacy`, `/terms`, and the designed 404 at 1440×900 and 390×844 found zero serious or critical findings.
- `/opt/fleet/lib/verify-url.sh` passed `/`, `/?demo=1`, `/privacy`, and `/terms`: correct route titles, `lang=en`, one H1, one main landmark, image alternatives, labelled buttons, and zero console/page errors.
- Every measured visible action was at least 44×44 CSS px at 390 px. No tested route had horizontal overflow.
- At 200% root text size, `/`, demo, privacy, and terms had no horizontal overflow; text remained visible. The demo headings' glyph boxes extend a few pixels beyond their line boxes with CSS `overflow: visible`, so no text is clipped.
- The first Tab exposes the skip link. Its focused style is a visible 3 px red outline with a 4 px offset. Keyboard use changed the line-detail range and activated PNG export with Enter; the aggregate suite also traversed and operated this path.
- With `prefers-reduced-motion: reduce`, the largest computed transition/animation duration was 0.01 ms.
- The intentional `/missing-page` navigation returns HTTP 404, so Chromium logs its expected failed-document resource; all normal routes and workflows are error-free.

## PWA and offline behavior

- The live page is controlled by `https://flipbook-trace.sociobot.in/sw.js` with scope `/` and cache `flipbook-trace-v1.0.16-4e5020ee4e67-shell`.
- The manifest uses `display: standalone`, a versioned start URL, matching theme/background colors, 192 px and 512 px icons, and a maskable 512 px icon.
- After a fresh online demo visit, disabling the browser network and reloading restored the banner, **12 frames ready**, and all 12 frames with no browser errors.
- A live `registration.update()` completed with the worker active. The separate `app-update-check` claim served a changed worker and proved activation, old-cache replacement, and the visible update-ready notice.

## Headers, caching, deployment identity, and links

- Browser-observed responses carry HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, camera/microphone/geolocation denial, and a restrictive CSP. `frame-ancestors 'none'` is correctly delivered as a response header.
- HTML revalidates after 30 seconds. Hashed JavaScript and CSS use `public, max-age=31536000, immutable`. `/sw.js` uses `no-cache, no-store, must-revalidate`. The manifest revalidates after one hour.
- The designed unknown route returns HTTP 404. `robots.txt`, `sitemap.xml`, canonical metadata, Open Graph metadata, and the route-specific titles are present.
- All discovered first-party navigation targets returned their expected status; `https://sociobot.in/` returned 200 and the checkout endpoint returned 303 to a working session.
- All **30/30** publicly served files from a fresh candidate `dist/` matched production byte-for-byte by SHA-256. Host-only `staticwebapp.config.json` is excluded. The live footer reports v1.0.16.

## Performance

Fresh mobile Lighthouse 12.8.2 against the live demo:

- Performance **99**, accessibility **100**, best practices **100**, SEO **100**
- FCP 927 ms, LCP 1,057 ms, TBT 86 ms, CLS 0.0615, Speed Index 927 ms
- Total transfer 64,103 B; unused JavaScript estimate 0 B

On a live 390×844 page at 4× CPU throttle:

- Five cold demo loads had longest tasks `[93, 68, 111, 0, 55]` ms: median 68 ms, maximum 111 ms.
- Event Timing measured 48 ms for a 12-frame line-detail change, 56 ms for 60-frame regeneration, and 24 ms for a 60-frame line-detail change.
- Lighthouse does not expose lab INP; all measured live interactions were below the 200 ms interaction budget.

## Defects

No release-blocking, high, medium, or low product defect was found in this candidate. The earlier billing 503 was not reproducible in the required claim run or direct production checks.
