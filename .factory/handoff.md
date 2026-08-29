# Verification 9 handoff — FAIL

**Do not release `ce87de861e4efa3491a9c1b29700f573fd861d5d`.** Independent QA on 2026-08-29 found a reproducible release blocker: `npm test -- --reporter=list` fails the 390 px / 4× CPU-throttled demo-startup gate (`411 ms`, required `<200 ms`). Fresh live starts measured 275, 224, 237, 244, and 146 ms; four of five exceed the threshold. The deployed public artifacts match this candidate, so it is not a stale-deployment issue.

All 19 registered claim commands pass after `npm ci`; unit (3/3), lint, typecheck, and production build pass. Live functional exports, privacy request logging, offline reload, PWA update claim, axe scans, keyboard/focus, headers/cache policy, byte identity, and optional-license rate limit (30 allowed, 31st gives `429 Retry-After: 3`) pass. Full evidence, exact commands, and the required repair are in [`.factory/verification-9.md`](verification-9.md).

---

# Flipbook Trace repair handoff

- Work order: `flipbook-trace-repair-8`
- Repair base: `31bca90e092ea74cc64dcf2caa992438d8adf007`
- Product: PWA/offline static site, deployed from `dist/`
- Version: `1.0.10`

## Repaired release blocker

The failed factory gate reported 54/55 tests passing and `@claim:png-export` timing out after 30 seconds while it waited for the twelve-frame ZIP download. The exact timeout was intermittent: at the untouched candidate, a clean two-CPU run passed the claim 10/10 and the configured one-worker suite 55/55. The reported contention path was nevertheless present in source.

PNG export first traced and retained every full-resolution canvas. It then encoded every canvas, copied each PNG into a separate local-file array, and copied the complete archive again before starting the download. Peak canvas/archive memory and uninterrupted work scaled with the frame count. The claim also relied on fixture defaults and the global 30-second timeout without explicitly proving the demo was ready.

The repaired exporter now lazily traces and encodes one frame at a time, yields to the browser after every encoded frame, builds the ZIP from Blob parts without the final full-archive copy, reports `Packing PNG n of total…`, and disables duplicate export clicks until packing ends. PDF behavior and PNG dimensions are unchanged.

The claim now creates and closes its own fresh browser context and page. It explicitly waits for twelve rendered frames, `12 frames ready`, and an enabled export button. Navigation/readiness are bounded at 30 seconds, the download at 60 seconds, and the test at 90 seconds. It asserts ZIP magic, the exact download name, the final `flipbook-frame-012.png` entry, and the completed status. A separate regression uses 4× Chromium CPU throttling and proves the exporter reports chunks 1 through 12 before download.

## Local verification

- Baseline investigation on CPUs 0–1: candidate claim 10/10; configured candidate suite 55/55. The factory-observed timeout did not recur locally, confirming it was intermittent rather than a deterministic assertion failure.
- Repaired claim on CPUs 0–1: `taskset -c 0,1 npm test -- --grep '@claim:png-export' --repeat-each=20 --reporter=list` passed 20/20. Each run completed in about 1.3 seconds with a fresh context.
- Focused throttled regression: `taskset -c 0,1 npm test -- --grep 'PNG export packs all twelve' --reporter=list` passed at 4× browser CPU throttling.
- Export integration checks passed for the twelve-frame demo ZIP, printable PDF, free 960 px PNG, Studio 1920 px PNG, original-video-width PNG, and six-column PDF.
- Full two-CPU suite: `taskset -c 0,1 npm test -- --reporter=list` passed 56/56 in 1.4 minutes. This covers all 19 registered claims, browser/integration behavior, 390 px and desktop layouts, keyboard operation, axe serious/critical checks, privacy request/storage guards, offline reload, reduced motion, and service-worker update activation.
- Exact clean release command: `npm ci && npm run test:unit && npm run lint && npm run build` passed. It installed 141 locked packages with 0 vulnerabilities, passed 3/3 unit tests, lint, TypeScript, and produced `dist/index.html`.
- Production payload: JS 34,411 B (11,958 B gzip); CSS 16,122 B (4,445 B gzip). Both are below the static-product budgets.
- Local URL smoke: [verify.json](evidence-repair-8/local-url/verify.json) records HTTP 200, `lang=en`, one H1/main, no missing image alternatives, no unlabeled buttons, and no console errors. Desktop and 390 px screenshots were inspected.
- Local mobile Lighthouse 13.4.1: two clean runs scored 100 performance and 100 accessibility. LCP was 1,504 ms / 1,355 ms; TBT 18 ms / 20 ms; CLS 0.031 in both. Reports: [run 1](evidence-repair-8/lighthouse-demo-local-1.json) and [run 2](evidence-repair-8/lighthouse-demo-local-2.json).

## Deployment and live verification

- Repair commit: `2d69439` (`fix: stream PNG pack export`), pushed to `origin/main` before deployment.
- Deployed with `/opt/fleet/lib/deploy-static.sh flipbook-trace dist`. Azure Static Web Apps deployment `f0ac4c9f-56e1-4351-b6ca-53747eae328a` completed successfully; <https://flipbook-trace.sociobot.in> returns HTTPS 200.
- Live identity: all 18 public files in the clean `dist/` match the custom-domain responses byte-for-byte, including `index.html`, hashed JS/CSS, `sw.js`, manifest, images, and icons. The live footer reports `v1.0.10`.
- Live browser audit: [live-audit.json](evidence-repair-8/live-audit.json) passes `/`, `/demo`, `/privacy`, `/terms`, and the HTTP 404 route with one H1/main, no console errors, no 390 px overflow, and zero axe serious/critical findings.
- The same audit downloaded a 40,056-byte live ZIP, verified `PK` ZIP magic, `flipbook-trace-frames.zip`, `flipbook-frame-012.png`, and `12 PNGs exported`, with zero runtime HTTP requests. It also proved 12 → 60 → 12 demo regeneration, a visible 3 px keyboard focus ring, ArrowRight changing line detail 142 → 143, and a controlled twelve-frame offline reload.
- Live URL smoke: [verify.json](evidence-repair-8/live-url/verify.json) records HTTP 200 and no console or accessibility-baseline errors. The mobile screenshot was inspected.
- Live mobile Lighthouse 13.4.1: both runs scored 100 performance and 100 accessibility. LCP was 1,087 ms / 1,229 ms; TBT 21.5 ms / 24 ms; CLS 0.031. Reports: [run 1](evidence-repair-8/lighthouse-demo-live-1.json) and [run 2](evidence-repair-8/lighthouse-demo-live-2.json).
- Live response policy: hashed assets use one-year immutable caching; `sw.js` uses `no-cache, no-store, must-revalidate`; CSP includes `frame-ancestors 'none'`; nosniff, strict referrer, HSTS, and restrictive permissions headers are present. `/missing-page` returns the designed document with HTTP 404.

## Known gaps / next steps

No known functional gaps. The source video and generated frames remain local and page-memory-only. The pre-existing uncommitted `graphify-out` changes were preserved and excluded from repair commits.
