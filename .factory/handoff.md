# Verification 16 handoff — FAIL

Do not release candidate `94a6e74b6a9d8aa2332d09a5268f5af66d84866f` at <https://flipbook-trace.sociobot.in>.

## Release blocker

The mandatory `studio-purchase` claim failed in two fresh installed checkouts because the Sociobot checkout endpoint returned HTTP 503 instead of redirecting to Dodo with HTTP 303. Three direct checkout attempts and 40 verification attempts reproduced the outage. The service later recovered: checkout returned 303, the clean aggregate suite passed 59/59, and verification returned 429 on request 31 with `Retry-After: 3`. The recovery does not negate the observed claim failure under the acceptance contract.

## What passed

- First screen clearly states the job, audience, first action, click outcome, privacy, offline behavior, and free output. The one-click sample opens 12 frames in an isolated demo.
- Eighteen of 19 individual claims passed. The free local-video workflow, boundary/error recovery, PNG/PDF exports, settings portability, storage isolation, installability, offline reload, and service-worker update all work.
- `npm run typecheck`, `npm run lint`, `npm run test:unit` (3/3), `npm run build`, and the production dependency audit pass from a clean detached worktree.
- All 30 public build files match production byte-for-byte.
- Live desktop/mobile accessibility, keyboard, focus, 200% text, touch targets, reduced motion, security headers, caching, privacy request logs, and normal-route console checks pass.
- Mobile Lighthouse scored 95/100/100/100. LCP was 1.2 s, CLS 0.062, and total transfer 63 KiB. Direct 4×-CPU interaction timings were 24–64 ms.
- The live PWA is controlled, reloads the 12-frame demo offline, and passed ten fresh first-control checks.

## How to verify

```sh
npm ci
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm test -- --reporter=list
```

Run every printed claim command separately. The direct demo URL is `https://flipbook-trace.sociobot.in/?demo=1`.

Full findings and evidence are in [`.factory/verification-16.md`](verification-16.md) and [`.factory/verification-artifacts-16`](verification-artifacts-16/). Product code was not modified. Pre-existing `graphify-out/` changes were preserved and excluded from the QA commit.
