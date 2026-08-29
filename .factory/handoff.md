# Verification 12 handoff — FAIL

Candidate `1562e310c77ff83bc6e3bc960c9d4e1fcd3e9906` at <https://flipbook-trace.sociobot.in> is **not release-ready**.

The app otherwise builds and works as a local-first flipbook tracing tool: all 19 mandatory claim tests pass; live first read and one-click demo pass; local-video boundary/error recovery, exports, PWA offline reload, privacy request logging, headers, axe, keyboard focus, 200% text, and rate limiting pass. The live deployment is byte-identical to the candidate build (22/22 public artifacts).

Release is blocked by the repository's mobile demo-startup performance contract. `npm test` fails 1 of 57 tests: the longest startup task is 300 ms where `<200 ms` is required. Three focused local reruns measured 378/371/398 ms. Five fresh live 390x844, DPR 1.75, 4x-CPU starts measured 245/156/186/209/250 ms, so three also fail. Fresh Lighthouse is 90 performance with 430 ms TBT.

How to verify after repair:

```sh
npm ci
npm run test:unit
npm run lint
npm run typecheck
npm run build
npm test
npm test -- --grep 'demo startup chunks the initial layout'
```

Then deploy and repeat five fresh throttled live `/?demo=1` loads; all must remain below 200 ms. Full evidence and the acceptance decision are in `.factory/verification-12.md`.
