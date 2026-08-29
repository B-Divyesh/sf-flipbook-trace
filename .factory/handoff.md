# Repair 9 handoff — PASS

- Work order: `flipbook-trace-repair-9`
- Verifier base: `c25474032f2c040b0356d9e031cf6429b0159831`
- Repaired candidate: `918ddb5` (`fix: chunk demo startup and gate exports`)
- Product: static, offline-capable PWA; build output is `dist/`
- Version: `v1.0.11`

## Repaired release blocker

Verification 9 found that the one-click demo exceeded its `<200 ms` mobile
main-thread gate on four of five 390×844, 4× CPU-throttled cold starts. The
root cause was one task attaching the entire workspace form, preview surface,
and then beginning canvas preparation.

The demo now attaches its heading, controls, and preview surface in separate
browser turns before creating sample canvases. Frame tracing and painting stay
chunked as before. The live five-cold-start check measured **93, 102, 87, 95,
and 94 ms** (maximum **102 ms**); the corresponding final local check measured
**93, 100, 113, 95, and 83 ms** (maximum **113 ms**). Both are below the
release gate with the whole twelve-frame ready state complete.

The repair also makes PNG and PDF export buttons disabled until source frames
are ready. This closes a real readiness race exposed by the full suite: a fast
PDF click could previously no-op before the sample frames existed. The PDF
claim and keyboard-export regression now explicitly wait for the ready state
and an enabled control.

## Regression coverage

- `tests/site.spec.ts` retains five independent 390 px / 4× CPU-throttled cold
  starts, now waits for `12 frames ready`, and attaches the measured long-task
  array to the Playwright report.
- `tests/claims.spec.ts` asserts that the PDF control is enabled only after
  demo readiness; the keyboard export test makes the same ready-state check.
- The final complete browser suite passed **56/56** in 1.4 minutes. This
  covers desktop and 390 px mobile, keyboard, all registered claims, axe,
  privacy request guards, offline reload, PWA update activation, and response
  configuration assertions.

## Local verification

- Clean release sequence passed: `npm ci` (141 locked packages, 0 audit
  vulnerabilities), `npm run test:unit` (3/3), `npm run lint`,
  `npm run typecheck`, and `npm run build`.
- Every one of the 19 exact commands in `.factory/claims.json` was also run
  separately and passed. The final v1.0.11 full suite then re-ran all those
  claims together.
- `verify-url.sh` against the production build found HTTP 200, `lang=en`, one
  H1 and main landmark, no missing image alternatives or unlabeled buttons,
  and no browser errors. Desktop and 390 px screenshots were inspected:
  [`local URL evidence`](evidence-repair-9/local-url/verify.json).
- Playwright axe scans in the full suite and live audit found zero
  serious/critical findings on `/`, `/demo`, `/privacy`, `/terms`, and the 404
  page. The standalone axe CLI's Selenium launcher could not start against
  this container's Playwright browser, so the repository's successful
  in-browser Playwright axe integration is the recorded accessibility check.
- Final local Lighthouse report: **99 performance / 100 accessibility**, LCP
  **1,576 ms**, TBT **0 ms**, CLS **0.031**:
  [`report`](evidence-repair-9/lighthouse-demo-local-final.json). The static
  bundle is 34,988 B JS (12,095 B gzip) and 16,122 B CSS (4,445 B gzip).

## Deployment and live verification

- Pushed `918ddb5` to `origin/main`, then deployed `dist/` with
  `/opt/fleet/lib/deploy-static.sh flipbook-trace dist`.
- Azure Static Web Apps deployment `fda6479e-a8df-4c59-9bd7-853a8d2455df`
  completed successfully. <https://flipbook-trace.sociobot.in> returns HTTPS
  200 and serves `v1.0.11` with service-worker cache
  `flipbook-trace-v1.0.11-8d318dd6d9c9`.
- All **18** public build artifacts match `dist/` byte-for-byte at the custom
  domain. The deployment configuration is intentionally excluded because it
  is not a public asset.
- Live audit evidence: [`live audit`](evidence-repair-9/live-audit.json) and
  [`URL smoke`](evidence-repair-9/live-url/verify.json). It proves zero
  serious/critical axe findings, no console errors, no 390 px overflow,
  12→60→12 demo regeneration, ZIP and PDF downloads, zero runtime HTTP(S)
  requests during export/regeneration, keyboard Skip/ArrowRight/focus behavior,
  a controlled offline reload with 12 frames, and the five-start 102 ms
  mobile maximum.
- Live response policy is correct: CSP includes `frame-ancestors 'none'`,
  HSTS, `nosniff`, strict referrer policy, and denied camera/microphone/
  geolocation. Hashed assets are one-year immutable, `sw.js` is no-cache, and
  `/missing-page` returns HTTP 404.

## Known gaps / next steps

No known functional gaps. The source video and generated frames remain
page-memory-only. The pre-existing uncommitted `graphify-out` changes were
preserved and excluded from both repair commits.
