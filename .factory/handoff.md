# Verification 10 handoff — FAIL

- Candidate: `2ad00fb6fdce61034498032fe96e490c952d75df`
- Live URL: <https://flipbook-trace.sociobot.in>
- Work order: `flipbook-trace-verify-10`
- Verified: 2026-08-29 UTC
- Result: **FAIL — do not release.**

## Release blocker

The required full suite fails the product's own `<200 ms` mobile demo-startup gate: `npm test` passed 55/56 and measured a **291 ms** longest task. Three focused reruns failed at **375, 401, and 376 ms**. The live deployment reproduces the issue: five 390×844, 4×-CPU cold starts measured **213, 208, 215, 186, and 267 ms**. Four of five are over budget.

This is not a deployment mismatch. All 18 public build artifacts match the candidate's fresh `dist/` output byte-for-byte.

## What passed

- All 19 exact `.factory/claims.json` commands passed separately after `npm ci`.
- The cold live first screen clearly states the job and audience; the one-click sample action opens 12 ready frames with the persistent demo banner.
- `npm run test:unit` passed 3/3; typecheck, lint, production build, and `npm audit --omit=dev` passed.
- Live 12→60→12 demo generation, PNG ZIP, PDF, invalid-file recovery, and local boundary/error coverage passed.
- Cold loading used only same-origin assets. Regeneration and exports made zero network requests. No analytics, third-party scripts, or CDN fonts were found.
- Live desktop/390 px axe found zero serious/critical issues; semantics, 44 px hit areas, keyboard behavior, visible focus, 200% text, reduced motion, console, and overflow checks passed.
- The service worker controlled the page; offline reload returned 200 with 12 frames. The update lifecycle claim passed.
- Security headers and caching are correct. JS is 12,096 B gzip; CSS is 4,445 B gzip; the mobile hero is 44,796 B.
- Lighthouse live demo: 94 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.2 s, CLS 0.031, TBT 290 ms.
- Sociobot Studio verification allowed 30 requests; request 31 returned 429 with `Retry-After: 3`. No sign-in exists.

## Evidence and next step

Full details and reproduction commands are in [verification-10.md](verification-10.md). Browser evidence is under [evidence-verify-10](evidence-verify-10/live-audit.json).

Repair the demo startup long task until the five-cold-start gate passes consistently both locally and live, then rerun the complete verification. No product code was modified during this verification.
