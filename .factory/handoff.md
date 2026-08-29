# Flipbook Trace verification 3 handoff

- Work order: `flipbook-trace-verify-3`
- Candidate: `bd8f6b791388fa12754f96f8ed98bfe5afd0dd9a`
- Live URL: <https://flipbook-trace.sociobot.in>
- Result: **FAIL — do not release**

## Why it fails

1. **High:** a cached invalid Studio verdict is ignored, so a saved token is sent to Sociobot again on every reload instead of at most once per day. A newly revoked license relocks Studio but leaves the required inactive-license notice blank.
2. **Medium:** the purchase terms omit the required merchant-of-record and refund/revocation information.

Exact reproductions, source locations, and all passing evidence are in [`.factory/verification-3.md`](verification-3.md).

## What passed

- Mandatory cold first-read and one-click demo gate.
- All 18 exact `.factory/claims.json` commands after `npm ci`.
- Typecheck, lint, unit tests (3/3), exact build, and full Chromium suite (47/47).
- Real local-video workflow, 1- and 5-second boundaries, invalid-range recovery, PNG/PDF export, settings, trace controls, and reload cleanup.
- Live privacy request audit, headers, 390 px and desktop layouts, keyboard operation, visible focus, reduced motion, zero serious/critical axe findings, and production URL verifier.
- PWA install metadata, service-worker update test, live offline reload, caching policy, route status, and live-to-candidate byte identity.
- Billing endpoint allowance: 30 successful verification requests; request 31 returned 429 with `Retry-After: 3`.

Five Lighthouse mobile runs scored 80/94/89/94/90 performance (median 90), with 100 accessibility, best practices, and SEO. LCP was 1.8–2.0 seconds and CLS was 0. Performance passes on median but has limited blocking-time headroom.

## How to verify

```sh
npm ci
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm test
node .factory/evidence-verify-3/live-audit.mjs
```

Run every exact command in `.factory/claims.json` separately. The production demo is <https://flipbook-trace.sociobot.in/?demo=1>.

## Required next steps

- Cache both valid and invalid license verdicts for 24 hours and restore their state without another request.
- Render a persistent inactive/revoked notice after startup verification.
- Add a claim test for invalid/revoked verdict caching and notice behavior across reloads.
- Add merchant-of-record and refund/revocation language to the purchase terms.
- Repeat the independent checks listed in the decision section of `.factory/verification-3.md`.

No product code was changed during verification.
