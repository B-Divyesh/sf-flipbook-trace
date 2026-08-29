# Flipbook Trace verification handoff

- Work order: `flipbook-trace-verify-7`
- Candidate: `b9e6120d51e8e158e7cf4a395c5dfbf3924b8488`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Decision: **FAIL — do not release**

## Release blocker

`npm test` fails 1 of 53 tests. The mobile demo-startup test requires its longest task to stay below 200 ms but measured 331 ms. Five isolated repeats all failed at 382, 417, 378, 377, and 442 ms.

The matching live demo also scored only 80 and 85 in two fresh Lighthouse 12.8.2 mobile runs, below the required 90; TBT was 881 and 590 ms. The landing repair itself passes at 99–100 performance with 1.23–1.26 second LCP.

## What passed

- Separate pristine clone at the exact candidate: all 19 exact `.factory/claims.json` commands passed.
- Install, audit, typecheck, lint, 3/3 unit tests, and the exact production build passed.
- Cold live first screen clearly states the job, audience, and one-click sample action.
- Sample and generated local-video workflows passed at 1- and 5-second boundaries, invalid input recovery, PNG/PDF export, and reload cleanup.
- Live privacy request logging found no HTTP(S) request during local video processing/export after shell load.
- Axe found zero serious/critical findings on all routes; keyboard, focus, 390 px targets, reduced motion, and offline reload passed.
- Service-worker update coverage passed locally; the live worker controls the page and reloads the 12-frame demo offline.
- Security headers and cache policies pass. All 17 checked live artifacts match `dist/` byte-for-byte.
- Sociobot license verification allowed 30 requests, then returned 429 on request 31 with `Retry-After: 2`.

## Non-blocking observation

At forced 200% root text size on a 390 px viewport, Privacy and Terms gain 13 px horizontal overflow from the unbroken email address. No text disappears.

## Evidence and reproduction

See `.factory/verification-7.md` and `.factory/qa-artifacts/`.

```sh
npm ci
npm audit --audit-level=high
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm test
npx playwright test tests/site.spec.ts --grep "demo startup keeps canvas preparation" --repeat-each=5
```

No product code was changed during verification. The next repair should reduce demo startup main-thread work until the repository test passes reliably and repeat mobile Lighthouse on `/?demo=1` at least twice.
