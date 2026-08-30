# Independent verification 15 — FAIL

- **Candidate:** `7123baf0faa6c1abbb94ead54b4cb85f4a51dbc1`
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Work order:** `flipbook-trace-verify-15`
- **Verified:** 2026-08-30 UTC
- **Decision:** **FAIL — do not release this candidate.**

The deployment is not stale: every one of the 30 public files in a fresh candidate build matches the live response byte-for-byte. Fresh QA found two release-blocking intermittent failures in the identical candidate. One mandatory claim test failed, and the required aggregate `npm test` command failed.

## Release blockers

### High — the required full suite still fails the mobile demo startup gate

The clean full suite finished **58 passed, 1 failed**. Its five independent 390×844, DPR 1.75, 4×-CPU cold demo loads measured longest tasks of **160, 162, 121, 122, and 158 ms**. The median was **158 ms**, failing the repository's explicit `<150 ms` guard.

A focused three-repeat run confirmed instability:

- Batch 1 failed: `[198, 100, 158, 173, 180]`; median 173 ms.
- Batch 2 failed: `[168, 210, 159, 177, 114]`; maximum 210 ms, above the 200 ms hard limit.
- Batch 3 passed.

Production was faster during this verification: the live audit measured `[136, 121, 138, 135, 125]` (median 135 ms), and three further live batches also passed. That does not rescue the candidate because `npm test` must pass locally and the clean build is not reliably inside its own gate. The candidate and production bytes are identical.

### High — a mandatory claim test is not deterministic from a clean checkout

Every exact `.factory/claims.json` command was run separately after `npm ci` in a detached clean worktree. `@claim:pwa-installable` failed:

```text
Expected: true
Received: false
expect(Boolean(navigator.serviceWorker.controller)).toBe(true)
```

`navigator.serviceWorker.ready` had resolved, but the first page was not controlled yet. An immediate ten-repeat rerun passed 10/10, which confirms a race rather than a permanently absent worker. The same state reproduced against production in one of ten fresh contexts during the live audit. The claims contract says any failing declared claim test blocks release.

The product does become controlled and reload offline successfully; the defect is that its declared first-visit PWA proof is timing-dependent. The test or registration lifecycle must wait for `controllerchange` (or reload after activation) before asserting control.

## Mandatory claims and first read

The supplied workspace already contained unrelated modified `graphify-out` files. I preserved them, then repeated all claim commands in `/tmp/flipbook-trace-verify-15`, a clean detached worktree at the exact candidate.

| Claim | Clean result |
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
| `pwa-installable` | **FAIL** — ready worker, no controller |
| `free-quality` | PASS |
| `studio-quality` | PASS |
| `studio-purchase` | PASS |
| `studio-license-check` | PASS |
| `studio-license-cache` | PASS |
| `browser-data-deletion` | PASS |
| `app-update-check` | PASS |

The cold first-read gate passes on desktop and mobile:

- What it does: **“Turn your video into tracing frames.”**
- For whom: **“For short-form creators making a hand-drawn flipbook without uploading their video.”**
- First action: **“Try it with sample data.”** The adjacent copy says it opens a ready 12-frame paper-bird sample.
- The privacy, offline, and free-export facts end at y=794.6 in a 900 px desktop viewport and y=733.2 in an 844 px mobile viewport.
- One click opens the populated demo with its persistent **“Demo — sample data, nothing is saved”** banner.

No material landing-page or README promise was found outside the 19-entry claim registry.

## Clean install, checks, and build

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages installed; 0 audit vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS — 3/3 |
| `npm run build` | PASS — exact production build wrote `dist/` |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| `npm test -- --reporter=list` | **FAIL — 58/59 passed** |

Production output remains well inside static budgets:

- All JavaScript chunks combined: 58,880 B raw / 21,809 B gzip; initial route loading is smaller.
- CSS: 16,196 B raw / 4,474 B gzip.
- Mobile hero: 44,796 B; no web fonts.

## End-to-end behavior

- Clean claim tests generated and imported a real six-second WebM. Exact 1.0- and 5.0-second selections worked; 0.5- and 5.1-second selections produced the documented recovery error.
- The live sample started with 12 frames. Five seconds at 12 fps produced 60 frames.
- A live 0.5-second selection announced: **“The selected section must be 1–5 seconds inside the paper-bird sample. Change the start or end time.”** The previous frames remained usable. Changing the selection to one second recovered and cleared the error.
- Live exports produced `flipbook-trace-frames.zip` (ZIP signature `504b0304`, 16,797 B for 12 sample frames) and `flipbook-trace-sheet.pdf` (`%PDF-1.4`, 122,419 B).
- Reset restored 12 frames. Start for real returned to the empty local-video workspace.
- A live `text/plain` upload was rejected with **“That file is not a video. Choose a video this browser can play.”** No console or page error occurred.
- Free and Studio output dimensions, PDF cell content, all five frame rates, all three trace styles, previous-frame overlay, settings portability, invalid/revoked licenses, and cache behavior passed their clean claim tests.
- The $9 Studio link returned 303 to a hosted Dodo checkout. The tested purchase surfaces identify Dodo as merchant of record and describe refund revocation.

## Privacy, network, rate limiting, and headers

- Cold demo requests were all same-origin static files. The tested workflow made no media/frame upload; the only later request observed was a same-origin lazy JavaScript chunk needed for export. No analytics, third-party fonts, third-party scripts, beacons, or cloud-processing request appeared.
- The stricter clean `local-processing` claim rejected every HTTP request while importing, tracing, and exporting a generated local video. The storage claims also proved source bytes and rendered frames never entered IndexedDB, Cache Storage, OPFS, localStorage, or sessionStorage.
- Browser-observed document headers include CSP restricted to self plus the explicit Sociobot API, `frame-ancestors 'none'`, HSTS, `nosniff`, strict referrer policy, and camera/microphone/geolocation denial. Hashed assets are one-year immutable; `/sw.js` is `no-cache, no-store, must-revalidate`.
- The only server API in product scope is Sociobot license verification. A fresh invalid-token burst received 200 for requests 1–30; request **31** returned **429** with `Retry-After: 4`. Observed allowance: **30 requests per client window**.
- The product has no sign-in, backend, health endpoint, server persistence, CLI, or library package; those checks are not applicable.

## Accessibility, responsive behavior, links, and PWA

- The factory `verify-url.sh` passed `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200, route title, `lang=en`, one H1, one main landmark, alt text, labelled buttons, and no console/page errors.
- Playwright axe scans on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404 found zero serious/critical findings at 1440 px and 390 px.
- Every measured visible action was at least 44×44 CSS px. No tested route overflowed horizontally, including at 200% root text size.
- Keyboard use reaches the skip link first, changes Line detail with ArrowRight, and exports the PNG pack with Enter. Focus is a visible 3 px red outline with 4 px offset.
- Reduced-motion emulation left no transition or animation above 0.01 ms.
- All internal links returned 200, the designed missing route returned 404, the factory link returned 200, and checkout returned its expected 303 redirect.
- The manifest has standalone display, versioned start URL, 192/512/maskable icons, matching theme colors, and a current worker cache. A controlled live demo reloaded offline with 12 frames and no error.
- The clean update claim passed activation of a changed worker, replacement of its shell cache, and the in-app update notice.

## Lighthouse and deployment identity

Fresh live mobile Lighthouse on `/?demo=1`:

```text
Performance 93 · Accessibility 100 · Best practices 100 · SEO 100
FCP 0.9 s · LCP 1.1 s · TBT 310 ms · CLS 0.031 · Speed Index 0.9 s
Total transfer 62 KiB
```

All 30 publicly served candidate artifacts match production byte-for-byte by SHA-256, including HTML, hashed JS/CSS and maps, artwork, icons, manifest, service worker, 404/offline pages, robots, and sitemap. `staticwebapp.config.json` correctly returns 404 because it is deployment configuration. The footer reports `v1.0.15`.

## Evidence

- [`verification-artifacts-15/claim-results.json`](verification-artifacts-15/claim-results.json)
- [`verification-artifacts-15/live-audit.json`](verification-artifacts-15/live-audit.json)
- [`verification-artifacts-15/live-startup-repeat.json`](verification-artifacts-15/live-startup-repeat.json)
- [`verification-artifacts-15/pwa-live.json`](verification-artifacts-15/pwa-live.json)
- [`verification-artifacts-15/deployment-match.json`](verification-artifacts-15/deployment-match.json)
- [`verification-artifacts-15/browser-response-headers.json`](verification-artifacts-15/browser-response-headers.json)
- [`verification-artifacts-15/billing-rate-limit.json`](verification-artifacts-15/billing-rate-limit.json)
- [`verification-artifacts-15/lighthouse-live-demo.json`](verification-artifacts-15/lighthouse-live-demo.json)
- Factory route-check JSON and desktop/mobile screenshots are under [`verification-artifacts-15`](verification-artifacts-15/).

## Required repair

1. Make the five-cold-start test pass consistently in the clean local environment, including the `<150 ms` median and `<200 ms` maximum guards.
2. Make first-visit service-worker control deterministic, or change the claim proof to wait for the valid `controllerchange` lifecycle before asserting control.
3. Rerun all 19 claim commands separately, `npm test`, and repeated local/live startup batches before resubmission.
