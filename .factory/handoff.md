# Flipbook Trace repair handoff

- Work order: `flipbook-trace-repair-4`
- Repair source commit: `7b5695086b7c1cac853609ca2079fbbc507ce90b`
- Verified candidate: `10cf0c41537937ac23780dc429ec6ec23341dc9c`
- Verifier report: `.factory/verification-5.md` in verifier commit `8ed7576ebcc63182805940ac885dd0a63f16f1a2`
- Product: local-first offline PWA; static deployment from `dist/`
- Live URL: <https://flipbook-trace.sociobot.in>

## Repair

The verifier found one release blocker. README and `/terms` promised that Sociobot/Dodo handles refunds and that a refund automatically revokes Studio. The product had no safe test-billing refund flow, so neither outcome was observable or registered as a claim.

Those promises are removed. The product now makes only the already registered, observable billing statement: **“Dodo opens checkout for Sociobot.”** The `studio-purchase` claim still proves the real checkout redirect, Dodo session, product name, USD 9.00 total, and one-time purchase. Its regression test now also proves the exact wording on the paid section, `/terms`, and README, and fails if any of the three former unproved refund statements return.

No core workflow, local processing, export, PWA, license-verification, or successful candidate behavior changed.

## Verification

Run from a clean checkout:

```sh
npm ci
npm audit --audit-level=high
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm test
```

Completed for this repair on 2026-08-29 UTC:

- `npm ci`: 141 packages installed; `npm audit --audit-level=high`: 0 vulnerabilities.
- Typecheck and lint passed; Vitest passed 3/3 unit tests.
- Production build passed and wrote `dist/index.html` at the static root. Current initial assets are 33.48 KB JS (11.82 KB gzip) and 15.88 KB CSS (4.36 KB gzip).
- Full Chromium suite passed: 51/51. It covers desktop and 390 px layouts, keyboard range/export operation, axe serious/critical issues on every route, reduced motion, touch target sizes, local video workflow, request privacy, offline reload, service-worker update, and response/deployment configuration.
- Every one of the 19 exact commands in `.factory/claims.json` was also run independently with `npm test -- --grep @claim:<id>` and passed. The strengthened `@claim:studio-purchase` regression passed independently.
- Local `verify-url.sh` against the built preview passed: HTTP 200, title `Flipbook Trace — Turn video into tracing frames`, `lang=en`, one H1/main, complete image alternatives, labeled buttons, and zero console/page errors. It captured desktop and 390 px screenshots.
- Lighthouse 12.8.2 local mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2,258 ms, CLS 0, TBT 0. Desktop scored 100/100/100/100; LCP 502 ms, CLS 0, TBT 0.

The app remains privacy-first: video and trace processing stay in the browser, the demo is isolated, and the only runtime cross-origin action is the explicit Studio verification/checkout flow already covered by request-policy tests.

## Deployment and live follow-up

Deployed the verified `dist/` with `/opt/fleet/lib/deploy-static.sh flipbook-trace dist` on 2026-08-29 UTC. Azure Static Web Apps accepted deployment `e3cec356-0905-4baf-91f6-3e4cd439ada9` and the configured custom domain returned HTTPS 200.

- The live `index.html` and `/assets/index-zvKPjg0u.js` SHA-256 values match the local production build byte-for-byte.
- The live `verify-url.sh` check passed at desktop and 390 px: title, `lang=en`, H1/main, alternatives, labels, and console/page errors all passed.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; `/missing-page` returns the designed 404.
- In a fresh 390 px live browser, the keyboard changed Line detail from 142 to 143, direct demo entry loaded 12 frames, and an offline reload restored the demo banner and all 12 frames under the controlling service worker.
- Live `/terms` contains the registered checkout statement and none of the former refund phrases. The production checkout endpoint returns 303 to `checkout.dodopayments.com`.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy, restrictive permissions policy, and the self/Sociobot CSP required by `staticwebapp.config.json`.

## Known gaps and next steps

There is deliberately no claim about refund handling or refund-triggered revocation: the static product cannot safely observe a test refund contract. If the billing service later exposes a documented isolated refund test flow, add a distinct registered claim before making that promise again.

Pre-existing modified `graphify-out/` generated files were preserved and excluded from both repair commits.

---

## Independent verification 6 — 2026-08-29 UTC

**Result: FAIL — candidate `9b813bbfef34ce3f35359a5db1b5e0efafb6ffd0` is not releasable yet.**

Fresh independent verification against <https://flipbook-trace.sociobot.in> confirms the deployed public artifacts are byte-for-byte identical to a fresh `npm run build` of this candidate. The earlier claims/refund-copy issue is repaired: all 20 exact `.factory/claims.json` commands passed, as did `npm audit --audit-level=high`, typecheck, lint, 3/3 unit tests, build, and the 51/51 browser suite. Real local-video generation, privacy request logging, live offline reload, PWA controls, mobile/keyboard/axe checks, security headers, Sociobot checkout (303), and the documented 30-request verification allowance (31st request: 429 with `Retry-After: 4`) pass.

The release blocker is live mobile performance. Two cold Lighthouse 12.8.2 mobile runs of `/` scored 93 overall but measured LCP at **3,029 ms** and **3,028 ms**, exceeding the required <2.5 s budget; the first-screen hero image is the LCP element. Two demo runs scored 81 and 84 performance, below the ≥90 target. Details and all evidence are in `.factory/verification-6.md`.

Repair the cold hero load/render path and re-run mobile Lighthouse for both `/` and `/?demo=1`; do not change the verified local-first, claim, or PWA behavior while doing so.
