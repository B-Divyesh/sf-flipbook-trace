# Repair 13 handoff — ready to deploy

## Scope and root cause

This repair addresses the sole release blocker in independent verification 13
for candidate `05b66078cc04e57d0f7a9a336c73ea4fb871b06f`: the one-click
paper-bird demo did not consistently keep its 390×844, DPR 1.75, 4×-CPU
startup task below the claimed 200 ms.

The exact focused reproduction was run first from a clean install:

```text
npm test -- --grep 'demo startup chunks the initial layout'
Expected: < 200 ms
Received: 201 ms
```

Tracing showed the first page-wide style/layout pass was doing the complete
demo chrome at once. The repaired route paints the useful demo explanation
first, then mounts the frame overview, workspace, and footer in later browser
turns. The demo heading also opts out of balanced text wrapping, which was
unnecessary for its fixed, narrow title and inflated the first mobile layout
task under CPU throttling. The persistent banner, header, skip link, sample,
controls, exports, demo isolation, and every pre-existing workflow remain.

The release/build identity is now `v1.0.14`; the package, manifest start URL,
service-worker cache namespace, static 404, and rendered footer agree.

## Regression coverage

`tests/site.spec.ts` now collects five independent fresh demo starts at 390×844
CSS px, DPR 1.75, and CDP 4× CPU throttling. It preserves the real product
contract by asserting the **maximum of all five** is strictly below 200 ms. It
also records the five values and enforces a median below 150 ms so an average
regression cannot hide behind one favorable scheduling run.

Final local production-preview measurement:

```json
{
  "longestTasks": [167, 88, 118, 115, 88],
  "medianTask": 115,
  "maximumTask": 167,
  "contractMs": 200,
  "medianGuardMs": 150
}
```

## Verification on the final code

All commands were run after a fresh `npm ci` (141 packages; 0 install audit
vulnerabilities):

```text
npm run test:unit                         PASS — 3/3
npm run lint                              PASS
npm run typecheck                         PASS
npm run build                             PASS — dist/index.html produced
npm audit --omit=dev --audit-level=high   PASS — 0 vulnerabilities
npm test                                  PASS — 58/58 Chromium tests
```

The 58-test production-browser run covers all 19 tagged claims, desktop and
390 px mobile layouts, visible keyboard focus and Arrow range operation,
downloads, local-video boundaries, demo isolation, privacy request blocking,
offline reload, service-worker update activation, response/cache configuration,
and serious/critical axe violations on `/`, `/demo`, `/privacy`, `/terms`, and
the missing route. The 19 exact claim commands were also run individually
before the build-identity-only v1.0.14 bump; the final 58-test run repeated all
claim behavior after that bump.

`/opt/fleet/lib/verify-url.sh` passed on local home, `?demo=1`, privacy, and
terms: HTTP 200, route title, `lang=en`, one h1, one main, no missing image
alternatives or unlabeled buttons, and no console/page errors. Visual browser
review passed at desktop and 390 px mobile; the sample and all controls remain
usable without horizontal overflow.

Local mobile Lighthouse against `?demo=1`, using Chromium 1208 and with the
full-page screenshot disabled only to avoid a container Chrome crash, measured
**100 performance / 100 accessibility / 100 best practices / 100 SEO**:
FCP 1.0 s, LCP 1.4 s, TBT 20 ms, CLS 0.031. The production entry is 25,580 B
raw / 8,670 B gzip; CSS is 16,140 B raw / 4,440 B gzip.

## Deployment and follow-up

Deploy `dist/` as the existing static PWA at
`https://flipbook-trace.sociobot.in`. After deployment, repeat the five-load
production timing check and live identity/header checks, then replace this
section with the commit and live evidence.

## Known gaps

None in scope. Runtime AI remains intentionally absent because it does not
improve this local-first video-to-tracing-frame job and is outside the
researched brief.
