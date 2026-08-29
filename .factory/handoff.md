# Flipbook Trace repair handoff

- Work order: `flipbook-trace-repair-6`
- Repair code commit: `2670be1951a3da156f6b45ed1219f71472123e92`
- Base / failed candidate: `b9e6120d51e8e158e7cf4a395c5dfbf3924b8488`
- Product: local-first offline PWA, static deployment
- Live URL: <https://flipbook-trace.sociobot.in>

## Repaired release blockers

The verifier's startup regression was reproduced after a clean `npm ci` with:

```sh
npx playwright test tests/site.spec.ts --grep "demo startup keeps canvas preparation" --repeat-each=5
```

The old implementation failed one of five fresh 390 px / 4×-CPU runs at **220 ms** against the strict `<200 ms` limit. Its source frames were unnecessarily 320 × 200, its 12 overview canvases duplicated full-size backing stores, and it appended both 12-frame DOM groups in single main-thread batches.

The repair keeps the same ready twelve-frame sample, controls, exports, and first-screen overview. It now uses 240 × 150 sample source frames, 64 × 40 overview canvases, and yields every two preview or overview DOM insertions. This eliminates the startup long task without changing the real-video export dimensions or demo isolation.

The forced-200%-text finding was also reproduced on both legal routes. Scoped mail-link wrapping now prevents unbroken contact emails from forcing horizontal pan. Heading wrapping is covered as well so the full legal page remains usable at that text size.

## Regression coverage

- `tests/site.spec.ts` retains the 4×-CPU demo startup long-task assertion (`<200 ms`) and it was run with `--repeat-each=5`.
- `tests/site.spec.ts` adds `/privacy` and `/terms` tests that force a 390 px viewport to `200%` root text size, assert the actual contact-email link fits without internal scrolling, and assert the document has no horizontal overflow.

## Verification evidence

Commands run from the repaired checkout:

```sh
npm ci                                      # 141 packages; 0 audit vulnerabilities
npm audit --audit-level=high                # pass
npm run typecheck                            # pass
npm run lint                                 # pass
npm run test:unit                            # 3/3 pass
npm run build                                # pass; dist/index.html produced
npm test                                    # 55/55 pass
npx playwright test tests/site.spec.ts --grep "demo startup keeps canvas preparation" --repeat-each=5
npx playwright test tests/site.spec.ts --grep "wraps its legal contact email" --repeat-each=5
```

The startup repeat measured longest tasks of **167, 145, 158, 132, and 161 ms** (all below the 200 ms budget). The email-text repeat passed **10/10** (two legal routes × five repeats).

Fresh local production-build mobile Lighthouse 12.8.2 results for `/?demo=1`:

| Run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 1,353 ms | 42 ms | 0.031 | 64,186 B |
| 2 | 100 | 100 | 100 | 100 | 1,507 ms | 33 ms | 0.031 | 64,186 B |

Lighthouse 13.4.1 still crashes while gathering the demo in this Chromium container, so the compatible 12.8.2 runner used by the independent verifier was used for the two reportable runs.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/?demo=1` passed: 200 response, `Demo — Flipbook Trace` title, `lang=en`, one H1/main, zero missing image alternatives or unlabeled buttons, and zero browser errors. The complete Playwright suite additionally covers desktop and 390 px layouts, keyboard range/export use, axe on all app routes, privacy/network behavior, PWA install/offline reload, service-worker update notices, the full demo/local-video/export workflow, policies, response configuration, and license response behavior.

The build output is 33.91 KB raw / 11.91 KB gzip JavaScript and 16.03 KB raw / 4.41 KB gzip CSS; the mobile hero is 44,796 B. No third-party scripts or fonts are added.

## Deployment and live verification

The repaired `dist/` was deployed on 2026-08-29 UTC with:

```sh
/opt/fleet/lib/deploy-static.sh flipbook-trace dist
```

Azure Static Web Apps accepted deployment `c5a9c399-f3b6-4805-81ec-d101d803ddf0` for `sf-flipbook-trace` in `centralus`; the custom HTTPS domain returned 200. All **18** public deployed artifacts (HTML, hashed JS/CSS, service worker, manifest, policy/404 assets, icons, and art) match the final local `dist/` byte-for-byte by SHA-256.

Live `verify-url.sh` on `/?demo=1` passed at desktop and 390 px: `Demo — Flipbook Trace`, `lang=en`, one H1/main, no missing image alternatives or unlabeled buttons, and zero page/console errors. The live response has HSTS, `nosniff`, strict-origin referrer policy, restrictive permissions policy, and the self/Sociobot CSP with `frame-ancestors 'none'`.

Fresh 390 px live browser verification found 12 demo frames, keyboard Line detail changed from 142 to 143, a controlling service worker, successful offline reload, 390 px document width, zero errors, and HTTP requests to `https://flipbook-trace.sociobot.in` only. At 200% root text, both `/privacy` and `/terms` have a 390 px document width; each email link ends at 370 px with no internal horizontal scroll. Live axe scans on `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page` found zero violations, including zero serious/critical findings.

Fresh live mobile Lighthouse 12.8.2 results for `/?demo=1`:

| Run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 1,205 ms | 25 ms | 0.031 | 65,903 B |
| 2 | 100 | 100 | 100 | 100 | 1,117 ms | 20 ms | 0.031 | 64,819 B |

## Remaining gaps

None known. The repository retains the researched brief, its PWA/offline deployment class, all registered claims, local-first processing, free exports, and Studio licensing behavior.
