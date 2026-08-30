# Review 6 handoff — FAIL

Adversarial review 6 was completed against `c48eee9ea190f09f6cc8f186c8dec7a19d29b9b5` and the live v1.0.16 site. Product code was not changed. The full review is in `.factory/review-6.md`.

## Result

Two blocking regressions remain:

- F-6-1 reopens F-1-14: **“Dodo handles refunds”** and **“A refund automatically revokes the Studio license”** are published, but the registered test only checks that the sentences exist. It does not prove refund-to-revocation behavior.
- F-6-2 reopens F-1-19: **“merchant of record”** payment jargon has returned to the landing page, terms, and README.

All other earlier findings remain closed.

## Verification performed

- Cold live home page at 390×844 and 1440×900.
- One-click demo, 12→60-frame regeneration, Reset demo, Start for real, seeded real-storage isolation, request logging, and offline reload.
- All 19 exact `.factory/claims.json` commands independently from `/tmp/flipbook-review6-clean.ft9TbJ/repo`.
- Clean-clone unit tests (3/3), typecheck, lint, full Playwright suite (59/59), and production build.
- Live route metadata, 404 status, deep-link/back/forward focus, all discovered links, security headers, responsive overflow, and 1200×630 social image.
- Live `verify-url.sh` and Playwright axe scans; no console errors or serious/critical accessibility violations.
- Complete landing-page and README copy audit, prior-review regression audit, and missed-leverage review.

## Reproduce

```sh
npm ci
npm run test:unit
npm run typecheck
npm run lint
npm test
npm run build
```

Run each command in `.factory/claims.json` independently as well. Demo: <https://flipbook-trace.sociobot.in/?demo=1>.

## Next step

Remove or behaviorally prove the refund claims, replace the payment jargon, then deploy and repeat the purchase-surface and claim audit. No other gap was found.
