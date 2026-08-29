# Flipbook Trace verification 4 handoff

- Work order: `flipbook-trace-verify-4`
- Candidate: `30c6c2bca48ffa46ed6de765ef75c61ec17200eb`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: **FAIL — do not release**

## Release blocker

The deployed app exceeds the supplied 200 ms interaction budget on its core trace-preview control. Chromium Event Timing on `/demo` measured five separate default 12-frame **Line detail** interactions at 376, 376, 384, 472, and 520 ms (384 ms median). The supported 60-frame case measured 2,024 ms, including about 1,790 ms of keydown processing. Resetting or regenerating 12 frames measured about 392–432 ms.

This is reproducible on the live candidate without CPU throttling and is not represented by Lighthouse's initial-load score. Filtering and repainting every full-size frame synchronously on each range-input event is the likely cause. Move that work off the interaction path, then require the default and 60-frame cases to remain below 200 ms.

## What passed

- Mandatory cold first-read gate and one-click sample demo.
- All 19 exact `.factory/claims.json` commands.
- `npm ci`, TypeScript, ESLint, 3/3 unit tests, exact production build, npm audit, and 49/49 Playwright tests.
- Representative demo and generated local-video workflows at the 1-second/2-fps and 5-second/12-fps boundaries, invalid duration/file/settings input, recovery, ZIP/PDF exports, and reload cleanup.
- Demo isolation, no-upload request logs, settings portability, free/Studio output checks, and browser-data deletion tests.
- Previously failing invalid/revoked license caching and persistent notices: one request total across reload.
- Live checkout redirect and USD 9 one-time checkout claim.
- Billing allowance: requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 3`.
- Standard axe: zero serious/critical findings on all five routes; keyboard, focus, 390 px, 200% text, and reduced-motion checks.
- Live offline reload with 12 frames; changed-worker update test; valid standalone manifest and controlling worker.
- Exact candidate/live artifact parity, security headers, cache policy, links, routes, and designed 404.
- Lighthouse mobile: performance 95, accessibility 100, best practices 100, SEO 100; LCP 1.9 s, TBT 240 ms, CLS 0, transfer 189 KiB.
- Bundles: JS 11.53 KB gzip, CSS 4.36 KB gzip, mobile hero 44.80 KB, no font download.

## Other finding

Low advisory: Lighthouse's experimental label-in-name audit flags the visible `FT` monogram because the link is named “Flipbook Trace home.” Standard axe is clean and Lighthouse accessibility remains 100.

## Verification commands

```sh
npm ci
jq -r '.[].test' .factory/claims.json
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm audit --audit-level=high
npm test
```

The detailed report is `.factory/verification-4.md`. Fresh evidence is in `.factory/evidence-verify-4/`.

## Repository state note

The checkout already had unrelated generated `graphify-out` modifications before QA began. They were not used by the build and were left untouched. Verification changed only factory QA documentation and evidence; no product code was modified.

## Required next step

Repair trace-preview responsiveness, deploy the repaired candidate, and repeat all claim, build, functional, privacy, accessibility, billing, PWA, parity, Lighthouse, and Event Timing checks. The current candidate remains **FAIL** until the core interactions stay below 200 ms.
