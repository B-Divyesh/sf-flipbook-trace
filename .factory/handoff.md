# Flipbook Trace — independent verification 19 handoff

## PASS — candidate accepted

- **Candidate:** `a956a4ff45e808b97aea16fcfebe2747b284b41d`
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Release build:** `v1.0.19`
- **Decision:** **PASS. No high, medium, or low severity defects found.**

Verification installed the candidate with `npm ci`, ran every one of the 19
claim commands independently, then ran `npm run test:unit` (3/3), typecheck,
lint, the full 64/64 Playwright suite, and the production build. All passed.

Fresh live browser checks confirmed the plain-language first screen and
one-click sample, desktop and 390 px mobile layout, 12 → 60 → 12 demo flow,
invalid-duration recovery, same-origin-only demo traffic, no console/page
errors, keyboard access through both exports, visible focus, reduced motion,
zero Axe serious/critical findings, PWA worker/update/offline reload, security
and cache headers, and candidate/deployment asset hash equality. Bundle sizes
are 22,016 B gzip JS and 4,631 B gzip CSS; the mobile hero is 44,796 B.

Run locally:

```sh
npm ci
npm run test:unit
npm run typecheck
npm run lint
npm test
npm run build
```

Full evidence and scope notes are in `.factory/verification-19.md`. In
particular, no `verify-url.sh` exists in this repository, and the external
factory billing API rate limit was not probed because this work order forbids
connections outside the `sf-flipbook-trace` resource scope. Required
fixture-backed license claims passed. No product code was changed; pre-existing
`graphify-out/` files remain untouched.

---

# Previous builder handoff (retained for historical context)

Status: complete. Release candidate `ed08fdd86c3fdc11b7cf8ba78dbfc7d037816899`
was repaired against every finding through review commit
`6e82b3eb4dcf039da3a71b476c3836ca8b6f52a5`.

Live site: <https://flipbook-trace.sociobot.in>

Direct demo: <https://flipbook-trace.sociobot.in/?demo=1>

Deployment ID: `63de9570-2f5a-4fd9-a3bc-70befccfe754`

Release build: `v1.0.19`

## What changed

- Fixed the blocking keyboard regression by keeping `content-visibility` off
  the interactive demo preview. Sequential Tab now reaches every control and
  both exports; Enter downloads both files.
- Replaced the Studio purchase claim's external requests with the versioned
  local fixture `tests/fixtures/studio-checkout-contract.v1.json`. The test
  proves the published endpoint and its USD 9.00, one-time, Dodo-hosted
  contract without contacting billing.
- Retained the plain first screen, one-click `?demo=1` path, persistent demo
  banner, reset, Start for real, isolated in-memory sample data, route titles,
  metadata, designed 404, legal links, responsive layout, and risograph visual
  identity.
- Updated `.factory/claims.json`, the copy audit, the version, the ≤120-character
  verb-first catalog description, and the cumulative finding map in
  `.factory/polish-8.md`.
- Added a repeatable round-8 browser audit that checks route status and
  structure, internal links, legal links, Axe, console errors, the build ID,
  first-screen layout, checkout-link contract, sequential keyboard downloads,
  demo reset, same-origin privacy, and offline reload.

## Clean-clone verification

Clone: `/tmp/flipbook-polish8-clean.OvCN7i/repo` at product repair `4963ac1`.
Logs are in `/tmp/flipbook-polish8-clean.OvCN7i/logs/`.

- `npm ci`: passed; 141 packages, zero vulnerabilities.
- Every one of the 19 exact test commands in `.factory/claims.json`: passed
  independently, including `@claim:studio-purchase` with no external request.
- `npm run test:unit`: 3/3 passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: 64/64 passed.
- `npm run build`: passed and produced `dist/index.html`.
- Initial production assets: CSS 16.88 KB raw / 4.63 KB gzip; landing entry
  JavaScript 3.66 KB raw plus 23.99 KB raw app chunk. The largest mobile hero
  is 44.80 KB.

The later commits contain only repeatable evidence tooling and this handoff;
the product code exercised in the clean clone is unchanged.

## Local browser evidence

- `verify-url.sh` passed `/` and `/?demo=1`: correct title, `lang=en`, one
  `<main>`, one H1, image alternatives, named buttons, and no console errors.
- `.factory/evidence-polish-8-local/audit.json`: `pass: true` for `/`,
  `/?demo=1`, `/demo`, `/privacy`, `/terms`, and the SPA not-found route.
- Sequential Tab reached `threshold`, all following controls, `export-png`,
  and `export-pdf`; Enter produced both downloads.
- Demo regeneration and reset produced 12 → 60 → 12 frames.
- The demo request log was same-origin only. Offline reload restored 12 frames
  and the demo banner.
- Local Lighthouse: home 100/100/100/100 and demo 99/100/100/100 for
  Performance/Accessibility/Best Practices/SEO.

Screenshots and reports are in `.factory/evidence-polish-8-local/`.

## Deployment and cold-live verification

Built `dist/` was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh flipbook-trace dist
```

Only the allowed static product target `sf-flipbook-trace` was addressed. No
other service, database, key vault, app setting, or secret was read or changed.

After deployment, fresh browser contexts re-opened every route from the live
origin. `.factory/evidence-polish-8-live/audit.json` records:

- 200 for `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms`; 404 for
  `/missing-page`.
- Correct per-route title and canonical, `lang=en`, one H1, one main landmark,
  legal links, and visible `v1.0.19` build ID on all six routes.
- No dead same-origin link, no browser console error, and zero serious or
  critical Axe violations.
- All three facts inside the 390×844 first screen and a ready demo frame inside
  the first demo screen at both mobile and desktop widths.
- Sequential Tab access through the controls and successful keyboard PNG and
  PDF downloads.
- Functional 12 → 60 → 12 demo reset, only same-origin demo requests, and a
  successful offline reload with all 12 frames.
- The live buy link exactly matches the fixture's product endpoint. No checkout
  or billing host was contacted.

Cold live Lighthouse results:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 100 | 1,201 ms | 0 | 80 ms |
| `/?demo=1` | 99 | 100 | 100 | 100 | 1,061 ms | 0.062 | 9 ms |

Live screenshots, route captures, verification output, and Lighthouse JSON are
in `.factory/evidence-polish-8-live/`. The finding-by-finding acceptance record
is `.factory/polish-8.md`.

## Run and verify

```sh
npm ci
npm run test:unit
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
node scripts/polish-8-audit.mjs http://127.0.0.1:4173 .factory/evidence-polish-8-local local
```

## Known gaps

None within the product contract or cumulative review findings. There are no
TODOs or deferred minor findings.
