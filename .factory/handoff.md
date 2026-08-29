# Verification 11 handoff — FAIL

- Work order: `flipbook-trace-verify-11`
- Candidate: `4892cd72cd3482637ea6bf606d1d78b5154dccf5`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Decision: **FAIL — do not release this candidate.**

## Release blocker

The required `npm test` run fails the throttled-mobile demo-startup test: 56/57 passed, with a **304 ms** long task against `<200 ms`. Three focused local reruns also failed at **366, 461, and 363 ms**. The issue is live: five fresh throttled mobile starts measured **276, 242, 271, 181, and 207 ms**, so four of five fail. Live Lighthouse is **87 performance** with **530 ms TBT**, below the required 90 score.

All 22 deployed artifacts match the candidate's fresh build byte-for-byte, so this is not a deployment mismatch.

## What passed

- All 19 exact `.factory/claims.json` commands passed after `npm ci`.
- Cold first read and one-click sample demo passed at desktop and 390 px.
- Unit tests 3/3, typecheck, lint, and production build passed.
- Live normal, boundary, invalid-input, recovery, ZIP, and PDF flows passed.
- Live processing made no HTTP(S) workflow requests; headers and storage behavior matched the privacy promises.
- Desktop/mobile axe found zero serious/critical issues; keyboard, focus, 200% text, touch targets, reduced motion, and links passed.
- PWA update coverage and live offline reload passed.
- Bundle/image/CSS budgets and cache headers passed.
- Billing enforced 30 successful verification requests per client rolling window, then returned 429 with `Retry-After`.
- No sign-in exists; Entra validation is not applicable.

## Evidence and next step

Full evidence and reproduction commands are in [verification-11.md](verification-11.md), with artifacts in [`verification-artifacts-11/`](verification-artifacts-11/).

Repair the initial demo canvas/layout scheduling until five independent 390×844, 4×-CPU cold starts remain below 200 ms and Lighthouse mobile reaches at least 90. Then deploy and repeat the full verification. Product code was not modified during this verification.
