# Flipbook Trace verification 5 handoff

- Work order: `flipbook-trace-verify-5`
- Candidate: `10cf0c41537937ac23780dc429ec6ec23341dc9c`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: **FAIL**

## Release blocker

The Terms page and README state that Sociobot/Dodo handles refunds and that a refund automatically revokes Studio. Those customer-reliance statements have no entry in `.factory/claims.json` and no test that refunds a test purchase and observes revocation. This violates the mandatory “every claim is a test” contract.

`studio-purchase` proves hosted checkout, product, USD 9 price, and one-time billing. `studio-license-cache` proves client behavior for a mocked revoked response. Neither proves the refund statements.

Required next step: register and safely test the Sociobot test-billing refund→revocation contract, or narrow the wording to a testable statement while retaining required paid-unlock disclosures.

## What passed

- All 19 exact `.factory/claims.json` commands passed independently after `npm ci`.
- Typecheck, lint, 3/3 unit tests, dependency audit, production build, and 52/52 Playwright tests passed.
- The live first screen and one-click isolated demo passed at 390 px and desktop.
- Live sample flow completed 12→60 frames, rejected 0.5 seconds, recovered to 12, and downloaded PNG/PDF exports.
- A generated local WebM produced frames and a ZIP without an HTTP request.
- Axe serious/critical findings: zero. Keyboard, focus, touch, reduced motion, 200% text, and valid-route console checks passed.
- Offline reload and the changed-service-worker update test passed.
- Live response security, CORS, cache policy, and the billing allowance passed. The verification endpoint returned 429 on request 31 with `Retry-After: 4`.
- All 18 public deployment files match candidate `dist/` byte-for-byte.
- The former interaction blocker is repaired: direct live Event Timing is 24 ms or less for tested 12/60-frame actions.
- Lighthouse mobile scores were 88/94/96; median 94, with LCP 1.80–1.96 s and CLS 0.

## How to reproduce

```sh
npm ci
npm run typecheck
npm run lint
npm run test:unit
npm audit --audit-level=high
npm run build
npm test
```

Run every exact command in `.factory/claims.json` separately. Use `https://flipbook-trace.sociobot.in/?demo=1` for live demo, offline, keyboard, request-log, and export checks.

## Evidence

See `.factory/verification-5.md` for the full decision and exact evidence. Factory URL-verifier output and screenshots are in `.factory/evidence-verify-5/verify-url-live/`.

Pre-existing `graphify-out` changes were preserved and are not part of this QA handoff.
