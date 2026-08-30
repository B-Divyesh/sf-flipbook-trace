# Independent verification 16 — FAIL

- **Candidate:** `94a6e74b6a9d8aa2332d09a5268f5af66d84866f`
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Work order:** `flipbook-trace-verify-16`
- **Verified:** 2026-08-30 UTC
- **Decision:** **FAIL — do not release this candidate.**

The candidate's static product is deployed correctly and its free local-first workflow passes. Release is blocked because the mandatory `studio-purchase` claim failed from two fresh checkouts while the Sociobot billing API returned 503. The same endpoint recovered later without a repository change, proving an intermittent production dependency failure rather than a stale deployment.

## Release blocker

### High — the advertised Studio purchase path was intermittently unavailable

The exact required claim command failed after a lockfile install in both the supplied workspace and a detached clean worktree at the candidate SHA:

```text
npm test -- --grep @claim:studio-purchase
Expected: 303
Received: 503
```

Three additional direct checkout requests returned 503 with Azure's generic **Service Unavailable** page. During the same outage, 40 license-verification requests also returned 503 with no `Retry-After`; an explicit browser verification displayed the safe fallback **“The license could not be checked. The free exports still work.”** but logged the expected failed-fetch/CORS errors from the 503 response.

The API recovered later in this verification. Three new checkout requests then returned 303 to `checkout.dodopayments.com`, the clean aggregate suite passed 59/59, and the rate-limit test observed 30 successful invalid-license responses followed by 429 on request 31 with `Retry-After: 3`. This recovery does not satisfy the supplied acceptance rule that any failing declared claim is release-blocking. A buyer could not purchase Studio during the observed outage.

Evidence: [`claim-results.json`](verification-artifacts-16/claim-results.json), [`billing-observations.json`](verification-artifacts-16/billing-observations.json), [`checkout-503-headers.txt`](verification-artifacts-16/checkout-503-headers.txt), and the failing [`claim-15.log`](verification-artifacts-16/claims/claim-15.log).

## Mandatory first-read and demo gate

The cold first screen passes on desktop and 390 px mobile:

- What it does: **“Turn your video into tracing frames.”**
- For whom: **“For short-form creators making a hand-drawn flipbook without uploading their video.”**
- First click: **“Try it with sample data.”** Adjacent copy says it opens a ready 12-frame paper-bird sample.
- The privacy, offline, and free-export facts end at y=794.6 in a 1440×900 viewport and y=733.2 in a 390×844 viewport.
- One click opens `/?demo=1`, shows **“Demo — sample data, nothing is saved,”** and renders 12 sample frames. Reset returns to 12 frames; Start for real opens the empty local-video workspace.

Screenshots: [`first-read-desktop.png`](verification-artifacts-16/first-read-desktop.png) and [`first-read-mobile.png`](verification-artifacts-16/first-read-mobile.png).

## Claims

As instructed, all 19 commands in `.factory/claims.json` were invoked before other repository QA. Before installation, each command stopped because the untouched checkout had no local `@playwright/test`. After `npm ci`, every command was run separately. The run was then repeated from a detached, clean worktree at the exact candidate SHA.

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
| `studio-purchase` | **FAIL — checkout returned 503 instead of 303** |
| `studio-license-check` | PASS |
| `studio-license-cache` | PASS |
| `browser-data-deletion` | PASS |
| `app-update-check` | PASS |

No material visitor-facing claim in the landing page or README was found outside the 19-entry registry. Per-claim logs are under [`verification-artifacts-16/claims`](verification-artifacts-16/claims/).

## Clean checkout, tests, and build

A detached worktree was created at the exact candidate and began with an empty `git status`.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages installed; 0 audit vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS — 3/3 |
| `npm run build` | PASS — exact production build wrote `dist/` |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| Individual claim commands | **FAIL — 18/19 passed** |
| First aggregate `npm test -- --reporter=list` | **FAIL — 58/59 passed; billing 503** |
| Clean aggregate after API recovery | PASS — 59/59 |

The successful build emitted seven JavaScript chunks totaling 59,404 B raw / 21,997 B gzip, one 16,878 B CSS file / 4,631 B gzip, and a 44,796 B mobile hero. There are no web fonts. These are inside the static-product budgets.

## End-to-end product behavior

Fresh live browser runs covered the smallest useful product and recovery paths:

- A generated six-second 320×200 WebM loaded locally. A 1-second section at 2 fps made 2 frames; a 5-second section made 10.
- Values of 0.5 and 5.1 seconds produced the plain 1–5 second recovery message and retained the previous 10 frames. Correcting the value to 1 second cleared the error and exported `flipbook-trace-frames.zip`.
- Demo mode generated 60 frames for 5 seconds at 12 fps, retained them after invalid input, recovered, exported ZIP (`504b0304`) and PDF (`%PDF-1.4`), and reset to 12.
- Reload cleared the selected video and generated frames. A text file was rejected with **“That file is not a video. Choose a video this browser can play.”**
- Selecting a paid export width without a license reset to 960 px with an explanation. Invalid settings JSON produced a specific recovery message; a valid file restored FPS, style, threshold, and onion-skin settings and persisted after reload.
- Empty license verification asked for a token. During API failure, verification preserved the useful free tier and explained that the license could not be checked.

Evidence: [`local-video-flow.json`](verification-artifacts-16/local-video-flow.json), [`recovery-flows.json`](verification-artifacts-16/recovery-flows.json), and [`live-audit.json`](verification-artifacts-16/live-audit.json).

## Privacy, requests, headers, and rate limiting

- The cold demo made seven same-origin GETs for HTML, image, CSS, and product JavaScript. Regeneration and reset made no remote request; export loaded one same-origin code chunk. No analytics, beacons, CDN fonts/scripts, Azure model endpoint, or media upload appeared.
- After the shell settled, the generated local-video workflow made only a `blob:` read before reload. The stricter claim test rejects every HTTP(S) request during import, tracing, and export and passed.
- Storage claims passed recursive inspection of IndexedDB, Cache Storage, OPFS, localStorage, and sessionStorage. Video/frame bytes remain in memory and disappear on reload. Demo does not open or read real settings/license stores.
- Browser-observed headers include a restrictive CSP with `frame-ancestors 'none'` sent as a response header, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial.
- HTML revalidates after 30 seconds; hashed assets are cached for one year as immutable; `/sw.js` is `no-cache, no-store, must-revalidate`; the manifest revalidates after one hour.
- After recovery, the Sociobot verification endpoint enforced an observed allowance of **30 requests per client window**. Request 31 returned 429 with `Retry-After: 3`.
- The product has no sign-in. Entra tenant validation is not applicable.

## Accessibility, mobile, keyboard, and motion

- Live Playwright Axe scans on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404 at 1440×900 and 390×844 found zero serious or critical issues.
- The factory URL verifier passed every normal route: HTTP 200, correct title, `lang=en`, one H1, main landmark, image alternatives, labelled buttons, and zero console/page errors.
- Every measured visible action is at least 44×44 CSS px. No tested route has horizontal overflow at 390 px or after 200% root text scaling.
- Keyboard-only use reaches the skip link first, changes Line detail with ArrowRight, and starts PNG export with Enter. Focus is a visible 3 px solid red outline with 4 px offset.
- Reduced-motion emulation leaves no animation or transition longer than 0.01 ms.
- The intentional `/missing-page` response is HTTP 404 and Chromium reports that navigation as a failed resource; normal routes are error-free.

## PWA, performance, and deployment identity

- The live demo is controlled by `/sw.js`, uses cache `flipbook-trace-v1.0.16-4e5020ee4e67-shell`, and reloads offline with all 12 frames. Ten fresh contexts had a controller after `serviceWorker.ready`.
- The local update claim passed activation of a changed service worker, old-cache replacement, and the update-ready notice.
- Five live 390×844, DPR 1.75, 4×-CPU cold starts measured longest tasks of **77, 114, 72, 52, and 61 ms**: 72 ms median, 114 ms maximum.
- 4×-CPU live Event Timing measured 40 ms for a 12-frame threshold change, 64 ms for 60-frame regeneration, and 24 ms for a 60-frame threshold change, all below 200 ms.
- Fresh mobile Lighthouse: **95 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP 1.1 s, LCP 1.2 s, TBT 230 ms, CLS 0.062, total transfer 63 KiB. Lab INP was not available; direct interaction timings are above.
- All **30/30** public files from the candidate's fresh `dist/` match production byte-for-byte by SHA-256. The host-only `staticwebapp.config.json` is excluded. The footer and service-worker cache identify v1.0.16.

Evidence: [`interaction-timing.json`](verification-artifacts-16/interaction-timing.json), [`lighthouse-live-demo.json`](verification-artifacts-16/lighthouse-live-demo.json), [`deployment-match.json`](verification-artifacts-16/deployment-match.json), and [`root-headers.txt`](verification-artifacts-16/root-headers.txt).

## Required next step

Stabilize the production Sociobot billing/verification service, then rerun all 19 claim commands separately and the complete suite from a clean checkout. Acceptance requires every declared claim to pass without relying on a later retry.
