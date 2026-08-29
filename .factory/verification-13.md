# Independent verification 13 — FAIL

- Candidate commit: `05b66078cc04e57d0f7a9a336c73ea4fb871b06f`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Decision: **FAIL — do not release.**

## Release blocker — the one-click mobile demo still violates its 200 ms startup contract

The full clean production Playwright run failed exactly one of 58 tests:

```text
npm test
tests/site.spec.ts:354
demo startup chunks the initial layout and canvas preparation below the mobile interaction threshold
Expected: < 200 ms
Received: 319 ms
```

A fresh focused reproduction failed again at **319 ms**. This is not solely a local-preview finding: five independent fresh production loads of `https://flipbook-trace.sociobot.in/?demo=1`, at 390x844 CSS px, DPR 1.75, and CDP 4x CPU throttling, recorded longest main-thread tasks of **279, 173, 195, 202, and 131 ms**. Two of five loads breach the `<200 ms` contract; the worst is 279 ms.

The product’s required first interaction is opening this demo. This regression remains release-blocking even though the cold path is otherwise functional. Split/defer the remaining startup layout/canvas work, rerun the complete suite, redeploy, and verify five fresh production starts all remain below 200 ms.

## Mandatory claims and cold first read

`.factory/claims.json` exists and contains 19 claims. From this clean checkout, after `npm ci`, every exact command declared in that file was invoked separately through the product’s production-preview demo entry point:

`clip-workflow`, `demo-ready`, `demo-workflow`, `demo-isolation`, `png-export`, `pdf-export`, `local-processing`, `ephemeral-project`, `trace-controls`, `settings-portability`, `offline-reload`, `pwa-installable`, `free-quality`, `studio-quality`, `studio-purchase`, `studio-license-check`, `studio-license-cache`, `browser-data-deletion`, and `app-update-check`.

All claim tests passed. The subsequent 58-test consolidated run recorded only the non-claim mobile-startup failure above.

Cold mobile live read passed the plain-words and demo-sandbox gate. The first screen says **“Turn your video into tracing frames”**, identifies **“short-form creators making a hand-drawn flipbook without uploading their video”**, and gives a prominent one-click **“Try it with sample data”** action with the immediate result: **“It opens a ready 12-frame paper-bird sample.”**

Live end-to-end demo evidence: one click opened `?demo=1`, displayed the persistent **“Demo — sample data, nothing is saved”** banner and 12 frames, exported `flipbook-trace-frames.zip`, regenerated a 5-second/12-fps selection to 60 frames, and reset to 12. Its requests were all same-origin and it produced no console/page errors. The claim suite additionally exercised a generated six-second local WebM: valid 1.0- and 5.0-second sections rendered frames; invalid 0.5- and 5.1-second sections displayed the actionable 1–5-second recovery message; a valid selection recovered successfully. It also independently inspected the PNG ZIP, PDF cells, trace controls, settings portability, local-only processing, ephemeral storage, free/Studio output dimensions, invalid/revoked license recovery, and browser-data deletion.

## Clean checkout and build checks

- `npm ci`: PASS; 141 packages installed, 0 audit vulnerabilities.
- `npm run test:unit`: PASS; 3/3 tests.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; creates `dist/`.
- `npm audit --omit=dev --audit-level=high`: PASS; 0 vulnerabilities.
- `npm test`: **FAIL; 57 passed / 1 failed**, the startup task described above.

The fresh build is within static-product bundle budgets: entry JS 25,037 B raw / 8,613 B gzip; all JS 14,145 B gzip; CSS 16,122 B raw / 4,445 B gzip; mobile hero 44,796 B. Fresh live mobile Lighthouse at `/?demo=1` measured **98 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP 0.9 s, LCP 1.1 s, TBT 180 ms, CLS 0.031. This does not override the deterministic interaction gate failure.

## Privacy, accessibility, PWA, headers, and deployment identity

- Live request recording across cold home and the complete sample workflow saw only `https://flipbook-trace.sociobot.in` assets. The stricter `@claim:local-processing` test passed while importing, processing, and exporting a generated local video, rejecting every workflow HTTP request including same-origin collection-like requests.
- `verify-url.sh` passed live home, demo, privacy, and terms: 200 status, route title, `lang=en`, one `h1`, one `main`, no missing image alternatives/unlabelled buttons, and no console/page errors.
- Fresh mobile axe scans at `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page` found zero serious/critical violations. Normal routes had no errors and no horizontal overflow; the designed missing route correctly reports HTTP 404 and the expected browser resource-status message.
- Keyboard smoke passed: `ArrowRight` changed Line detail 142 to 143, and the next focused control had a visible `3px solid rgb(173, 53, 45)` outline. Reduced motion matched `prefers-reduced-motion: reduce`, set the frame animation to `0.01 ms`, and set smooth scrolling to `auto`.
- After waiting for the live service worker controller, forced-offline reload of `/?demo=1` returned 200 and restored all 12 frames. The locally passing `@claim:app-update-check` exercises changed-worker activation, shell-cache replacement, and its update-ready notice.
- Home response headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, restrictive Permissions Policy, and a response-header CSP with `frame-ancestors 'none'`. HTML uses 30-second revalidation; hashed assets are immutable for one year; `sw.js` is no-cache/no-store/must-revalidate. The manifest is standalone with the required icons and versioned start URL.
- Fresh `dist/` output from this commit byte-matches **24/24** served public artifacts, including HTML, JS/CSS chunks, worker, manifest, static/legal pages, maps, icons, and artwork. `staticwebapp.config.json` is in `dist/` but correctly not publicly served (404). The live regression is therefore the candidate’s regression, not a stale deployment.
- All rendered links were checked: normal product and Sociobot links return 200, checkout returns its expected 303, and the only product 404 link is the current-page `#main` anchor on the designed missing-page view.

This is a static PWA, not a library, CLI, sign-in flow, or application backend; consumer-package, Entra, persistence-server, and health-endpoint checks do not apply. No runtime AI feature is implied by the local video-to-trace-sheet brief.

## Request allowance

The optional Studio license verification endpoint was tested with a fresh fake token. `https://api.sociobot.in/api/v1/products/flipbook-trace/verify` returned 200 for requests 1–30, then 429 for requests 31–35, each with `Retry-After: 4`. Observed allowance: **30 requests per client window**. This satisfies the documented rate-limit enforcement requirement.

## Defects by severity

### High — demo startup task exceeds the 200 ms mobile budget

Evidence: clean complete-suite failure at 319 ms; focused reproduction at 319 ms; live five-load result 279/173/195/202/131 ms. The required one-click demo is not consistently responsive under the product’s own mobile contract. Release remains blocked.

No other release-blocking defect was found.

## Reproduction

```sh
npm ci
npm test
npm test -- --grep 'demo startup chunks the initial layout'
npm run test:unit
npm run lint
npm run typecheck
npm run build
```
