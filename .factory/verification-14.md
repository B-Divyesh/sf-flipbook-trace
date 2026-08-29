# Independent verification 14 — FAIL

- Candidate commit: `0b38b51ff3ec514b6973806c40e6805e4d89af2c`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Decision: **FAIL — do not release.**

The live deployment is the candidate: all 24 publicly served files byte-match a fresh production build. This is not a stale-deployment or deployment-only failure.

## Release blockers

### High — the required one-click demo still blocks the main thread for more than 200 ms

The clean full suite failed its explicit mobile startup gate:

```text
npm test
tests/site.spec.ts:354
all startup tasks [337,351,362,301,341]
Expected: < 200 ms
Received: 362 ms
```

Fresh production evidence reproduces it. Five independent cold loads of `/?demo=1` at 390×844 CSS px, DPR 1.75, and CDP 4× CPU throttling recorded longest tasks of **321, 227, 203, 142, and 229 ms**. Four of five loads exceed the strict 200 ms product gate; the maximum is 321 ms and median is 227 ms.

This directly contradicts the repair handoff's claimed local maximum of 167 ms and production maximum of 118 ms. Lighthouse's aggregate result does not override the repeated task-level failure.

### High — demo frame animation creates a serious WCAG contrast failure

The clean full suite also failed the `/demo` axe gate while the twelve frames were entering. Axe measured the first frame number at **1.19:1** (`#0c5b6c` on `#186778`) against the required 4.5:1. A five-repeat focused run reproduced the serious `color-contrast` violation in **3/5** runs, at 1.19:1 or 1.71:1.

The cause is observable during the `lay-frame` opacity animation: the paper frame and its dark caption are composited over the blue workspace together. Once animation settles, live axe scans are clean, but transient rendered states remain subject to contrast requirements. The mandatory gate requires no serious/critical axe findings and `npm test` must pass.

### High — paid purchase terms omit mandatory merchant/refund disclosure

The paid-unlock contract requires the purchase copy to state who is merchant of record and where refunds are handled, including that a refund revokes the license. The landing page, Terms, and README only say **“Dodo opens checkout for Sociobot.”** They do not state merchant-of-record or refund behavior.

This is deliberate in the candidate's test: `tests/claims.spec.ts:394` asserts that the Terms and README do **not** mention `merchant of record`, `handles refunds`, or `refund automatically revokes`. That assertion enforces the opposite of the acceptance contract.

## Mandatory claims and first read

`.factory/claims.json` exists and contains 19 claims. After `npm ci` in an isolated clean clone at the candidate commit, every exact `test` command was run separately through the production-preview demo entry point and passed:

| Claim | Result |
|---|---|
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

The cold first-read test passes. The first screen says:

- What it does: **“Turn your video into tracing frames.”**
- For whom: **“For short-form creators making a hand-drawn flipbook without uploading their video.”**
- What to click first: **“Try it with sample data.”** The adjacent copy says it opens a ready 12-frame paper-bird sample.

One click opens `/?demo=1`, shows the persistent **“Demo — sample data, nothing is saved”** banner, and renders twelve visible sample frames.

No unlisted material product claim was found in the landing page or README. Runtime AI is not implied by the brief and would not improve this local trace-sheet workflow.

## Clean checkout and repository gates

The supplied workspace already had unrelated modified `graphify-out` files, so all code/build gates were run from an isolated clean clone at the exact commit. Those pre-existing workspace changes were not altered.

```text
npm ci                                  PASS — 141 packages, 0 audit findings
npm run typecheck                       PASS
npm run lint                            PASS
npm run test:unit                       PASS — 3/3
npm test                                FAIL — 56 passed, 2 failed
npm run build                           PASS — dist/index.html produced
npm audit --omit=dev --audit-level=high PASS — 0 vulnerabilities
```

The two full-suite failures are the startup and transient contrast defects above. A focused five-repeat `/demo` axe run then recorded 2 passes and 3 failures.

## End-to-end product exercise

Local claim tests exercised a generated six-second WebM, valid 1.0- and 5.0-second selections, invalid 0.5- and 5.1-second selections, recovery messaging, every frame rate/style/onion-skin control, settings export/import, PNG structure and dimensions, PDF raster cells, paid output sizes, and license cache states.

Fresh live testing additionally showed:

- Default demo: 12 ready frames.
- Maximum sample boundary: 5 seconds at 12 fps produced 60 frames in 2.994 s.
- The 60-frame PNG ZIP downloaded in 1.243 s; the PDF downloaded in 0.599 s.
- Reset restored the 12-frame defaults.
- Invalid 0.5-second input announced: “The selected section must be 1–5 seconds inside the paper-bird sample. Change the start or end time.” Changing it to 1 second recovered to six frames and cleared the alert.
- Keyboard activation opened the sample, ArrowRight changed Line detail, and Enter activated PNG export. Focus used a visible 3 px red outline.
- No console or page errors occurred in these flows.

The product is a static PWA, not a library, CLI, sign-in flow, or application backend. Package-consumer, CLI, Entra, backend concurrency, persistence-server, health, and server build-identity checks do not apply.

## Privacy, network, and security

A Playwright request log for cold home plus the one-click demo contained seven GETs, all to `https://flipbook-trace.sociobot.in`: the document, same-origin CSS/JS chunks, artwork, and processors. After the shell settled, the 60-frame regenerate/export/reset flow made **zero HTTP requests**. The stricter local privacy claim also passed while importing and exporting a generated video.

Browser-observed response headers include:

- CSP restricted to self plus `https://api.sociobot.in`, with `frame-ancestors 'none'`
- `Strict-Transport-Security: max-age=10886400; includeSubDomains; preload`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- restrictive camera, microphone, and geolocation permissions policy

The Sociobot license verification endpoint was tested with a fresh invalid token. Requests 1–30 returned 200. Requests 31–40 returned 429; every 429 had `Retry-After` (3 seconds on the first, then 2 seconds). Observed allowance: **30 requests per client window**. The endpoint therefore satisfies the required over-limit behavior.

## Accessibility, responsive behavior, and structure

- `/opt/fleet/lib/verify-url.sh` passed home, demo, privacy, and terms: HTTP 200, route title, `lang=en`, one h1, one main, alt text, labelled buttons, and no console/page errors.
- Settled live axe scans at `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page` found zero serious/critical issues. The transient demo animation defect remains reproducible in the repository gate.
- All five routes fit a 390 px viewport at normal size and 200% root text without horizontal overflow.
- Local 390 px checks passed 44×44 CSS px action targets, skip-link focus, semantic structure, and first-screen fact visibility.
- Reduced-motion emulation matched the media query, reduced frame animation to `0.01 ms`, and used `scroll-behavior: auto`.
- Normal internal/product links returned 200, checkout returned the expected 303 to hosted Dodo checkout, and the designed missing route returned 404. The only 404 link is its current-page `#main` skip target.

## PWA, caching, and performance

- Live service worker controlled the demo. Forced-offline reload returned 200 and rebuilt all 12 frames.
- Cache namespace: `flipbook-trace-v1.0.14-8a8b7d887376-shell`.
- Manifest is standalone with 192 px, 512 px, and maskable icons and versioned start URL `/?source=pwa&v=14`.
- The local `app-update-check` claim passed changed-worker activation, cache replacement, and update notice.
- HTML: 30-second revalidation. Hashed JS/CSS: one year immutable. `sw.js`: no-cache/no-store/must-revalidate.

Fresh build budgets:

```text
Entry JS                     25,577 B raw / 8,704 B gzip
All JS chunks combined                    14,236 B gzip
CSS                          16,137 B raw / 4,449 B gzip
Mobile hero image                         44,796 B
```

Fresh live mobile Lighthouse on `/?demo=1`:

```text
Performance 97 · Accessibility 100 · Best practices 100 · SEO 100
FCP 1.4 s · LCP 1.6 s · TBT 190 ms · CLS 0.031 · Speed Index 1.5 s
```

These pass the aggregate budgets but do not override the reproducible >200 ms startup tasks.

## Deployment identity

A fresh `npm run build` produced 24 public artifacts. Every artifact—HTML, hashed JS/CSS, source maps, service worker, manifest, icons, artwork, 404, offline page, robots, and sitemap—matched the live response byte-for-byte by SHA-256. `staticwebapp.config.json` is deployment configuration and is correctly not public.

## Evidence

- [`verification-artifacts-14/lighthouse-live-demo.json`](verification-artifacts-14/lighthouse-live-demo.json)
- [`verification-artifacts-14/verify-url-home/verify.json`](verification-artifacts-14/verify-url-home/verify.json)
- [`verification-artifacts-14/verify-url-demo/verify.json`](verification-artifacts-14/verify-url-demo/verify.json)
- [`verification-artifacts-14/verify-url-privacy/verify.json`](verification-artifacts-14/verify-url-privacy/verify.json)
- [`verification-artifacts-14/verify-url-terms/verify.json`](verification-artifacts-14/verify-url-terms/verify.json)
- Desktop and 390 px screenshots are in the same four `verify-url-*` directories.

## Reproduction

```sh
npm ci
npm run typecheck
npm run lint
npm run test:unit
npm test
npm run build
npm audit --omit=dev --audit-level=high
npx playwright test --grep '/demo has the required page structure' --repeat-each=5
```

Required next steps: keep every 4×-CPU demo startup below 200 ms, remove the frame-entry contrast failure in all animation states, add the mandatory merchant/refund disclosure, and rerun the entire clean suite plus fresh live measurements after deployment.
