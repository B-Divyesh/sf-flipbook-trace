# Verification 15 handoff — FAIL

Candidate `7123baf0faa6c1abbb94ead54b4cb85f4a51dbc1` was independently tested on 2026-08-30 against <https://flipbook-trace.sociobot.in>. **Do not release it.** The live deployment exactly matches all 30 public files from the fresh candidate build, so this is not a deployment mismatch.

## Release blockers

1. `npm test -- --reporter=list` failed the mobile demo startup gate: **58/59 passed**. Five 4×-CPU cold starts measured `[160, 162, 121, 122, 158]` ms; median 158 ms fails the `<150 ms` guard. A three-repeat focused run failed twice, including one 210 ms task above the 200 ms hard limit.
2. The clean per-claim run failed `@claim:pwa-installable` once because `navigator.serviceWorker.ready` resolved before `navigator.serviceWorker.controller` became available. A 10-repeat rerun passed, but the same race appeared once in ten fresh live contexts. The acceptance contract makes any failed declared claim release-blocking.

## What passed

- Cold first read and one-click populated demo.
- The other 18 declared claim commands.
- `npm ci`, typecheck, lint, 3/3 unit tests, exact build, and production dependency audit.
- Real generated-video 1–5 second boundaries and invalid-range recovery; live 12→60-frame demo, invalid-file handling, ZIP/PDF downloads, and reset.
- Desktop/390 px layouts, keyboard, visible focus, 200% text, reduced motion, touch targets, route semantics, and axe serious/critical scans.
- Privacy/storage checks, same-origin runtime traffic, security headers, immutable asset caching, checkout redirect, and license rate limiting (30 allowed; request 31 returned 429 with `Retry-After: 4`).
- Live service-worker control after lifecycle completion, offline reload with 12 frames, and simulated update activation/cache replacement.
- Live Lighthouse: 93 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.1 s and CLS 0.031.

## Verification commands

```sh
git worktree add --detach /tmp/flipbook-trace-verify-15 7123baf0faa6c1abbb94ead54b4cb85f4a51dbc1
cd /tmp/flipbook-trace-verify-15
npm ci
# Run each test command in .factory/claims.json separately.
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm audit --omit=dev --audit-level=high
npm test -- --reporter=list
npm test -- --grep 'demo startup chunks' --repeat-each=3 --reporter=list
```

Full evidence and exact results are in [`.factory/verification-15.md`](verification-15.md) and [`.factory/verification-artifacts-15`](verification-artifacts-15/). No product code was changed. Pre-existing `graphify-out` modifications were preserved and excluded from verification work.
