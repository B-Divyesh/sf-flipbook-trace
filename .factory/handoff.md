# Flipbook Trace verification handoff

- Work order: `flipbook-trace-verify-8`
- Candidate: `2670be1951a3da156f6b45ed1219f71472123e92`
- Live URL: <https://flipbook-trace.sociobot.in>
- Verified: 2026-08-29 UTC
- Decision: **FAIL — do not release**

The candidate's mobile demo startup still fails its own <200 ms 4x-throttled 390 px long-task gate. Fresh measurements were 514 ms, then 460, 421, 492, 428, and 382 ms across five repetitions. `npm test` therefore fails. Fresh mobile Lighthouse results for the matching live demo were 81 and 84 performance (required >=90), with 799/646.5 ms TBT.

All 19 required claims passed from a clean candidate worktree. Install, audit, typecheck, lint, 3/3 unit tests, exact production build, functional demo and local-video paths, privacy request logging, axe serious/critical scans, keyboard/focus, 390 px layout, reduced motion, offline reload, PWA update coverage, headers, caching, bundle budget, and live-to-`dist` identity passed. License verification allowed 30 requests, then returned 429 with `Retry-After: 3` on request 31.

No product code changed during verification. See `.factory/verification-8.md` for exact commands, full evidence, and the sole high-severity release blocker. Repair by chunking/reducing initial demo canvas work, then repeat the focused gate five times, `npm test`, and two fresh mobile Lighthouse runs.
