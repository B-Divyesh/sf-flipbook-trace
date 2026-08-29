# Repair 12 handoff — ready for deployment verification

This repair addresses the sole release blocker in independent verification 12 for candidate `1562e310c77ff83bc6e3bc960c9d4e1fcd3e9906`: the one-click demo could produce a main-thread task over the 200 ms 390 px mobile limit.

## What changed

- Split the demo's frame drawing and trace filter into `src/frame-processor.ts`. The ZIP/PDF implementation remains in `src/core.ts`, so direct demo startup never downloads or parses the export module.
- Kept real-workspace processors warm before a user selects a local file. This preserves the tested privacy promise that local import, trace, and export make no HTTP(S) request after the shell settles.
- Replaced the default sample's twelve initial pixel readbacks with a purpose-drawn pencil-preview path. The default remains an immediately usable 12-frame tracing study; selecting any non-default trace control continues through the full filter.
- Reduced demo source canvases from 180×112 to 144×90, while displaying them at the same responsive size. This removes unneeded startup pixel work without changing free or Studio export dimensions.
- Added regression coverage that proves the demo loads `frame-processor` but not the ZIP/PDF chunk, verifies the build boundaries, and runs five independent 390×844 / DPR 1.75 / 4×-CPU starts with every longest task below 200 ms.

## Reproduction and root cause

The verifier recorded the candidate's exact failure at 300 ms in the repository gate, plus live 4×-CPU starts of 245/156/186/209/250 ms. The untouched candidate was also exercised in a detached worktree with the same five-start harness; this particular worker was not under the same scheduling pressure and measured 118/114/95/113/111 ms, confirming why the old test was flaky rather than proving the contract safe.

The first complete suite after the initial code-splitting pass still reproduced the exact assertion failure under normal test-run load: **213 ms** against `<200 ms`. The startup path was still doing default sample filtering work. The final direct default-preview pass removed that work and made the gate pass with substantial margin.

## Verification completed locally

Run from a clean install:

```sh
npm ci
npm run test:unit
npm run lint
npm run typecheck
npm run build
npm test
npm audit --omit=dev --audit-level=high
```

Results:

- `npm ci`: pass; 141 packages installed, 0 vulnerabilities.
- `npm run test:unit`: pass; 3/3.
- `npm run lint`, `npm run typecheck`, `npm run build`: pass.
- `npm test`: pass; **58/58** Chromium tests, including desktop/mobile layout, keyboard export/range control, privacy, PWA offline reload/update, headers/config, and route accessibility tests.
- Every one of the 19 exact commands in `.factory/claims.json` was run independently and passed.
- `npm audit --omit=dev --audit-level=high`: pass; 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/?demo=1`: pass — HTTP 200, `Demo — Flipbook Trace`, `lang=en`, one H1, main, no missing image alternatives/unlabelled buttons, and no console/page errors.
- The Playwright `@axe-core/playwright` integration scanned `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page`; each had zero serious or critical violations. (The standalone axe CLI could not create a ChromeDriver session in this container; the repository's browser-native axe integration passed.)
- Local mobile Lighthouse (390 px emulation): performance 100, accessibility 100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 10 ms, CLS 0.031.

Fresh local 390×844, DPR 1.75, 4×-CPU demo starts after the final fix measured longest main-thread tasks of **112/110/107/110/102 ms**. The longest was 112 ms, well below 200 ms.

## Deployment follow-up

The static artifact remains `dist/` and will be deployed through the work order's static deployment configuration. Before final acceptance, repeat the same five fresh 390×844, DPR 1.75, 4×-CPU starts against `https://flipbook-trace.sociobot.in/?demo=1`, confirm every run remains below 200 ms, and verify live artifact identity, headers, offline reload, and update behavior.

## Known gaps

None in the product scope. Runtime AI remains intentionally absent because it does not improve this local-first video-to-tracing-frame workflow and is outside the researched brief.
