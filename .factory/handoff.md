# Flipbook Trace polish round 1 handoff

Work order: `flipbook-trace-polish-1`  
Repair commit: `fc17a02` (`fix: close adversarial review findings`)  
Base reviewed: `c03c947d6a3c6263f7fa78fc043536ee1a472698` / review `bcb39bbeb42132a4aaaec53a5b852984ef29a760`  
Date: 2026-08-28

## Done

- Closed every F-1-1 through F-1-25 finding. The detailed finding-to-change-to-evidence map is in `.factory/polish-1.md`.
- Made `/?demo=1` a one-click, isolated 12-frame paper-bird sandbox with a persistent banner, Reset demo, Start for real, first-viewport frames, and no real-store read/write.
- Added/strengthened the claims registry to 16 observable claim tests. The tests now cover trim boundaries, all browser persistence surfaces, same-origin upload protection, PDF frame layout, Studio output dimensions, Dodo product/price/one-time billing, deletion, and update behavior.
- Added real static-host 404 handling via `responseOverrides.404` and a product-styled `404.html`.
- Rewrote copy to use **video**, **selected section**, and **PDF trace sheet** consistently; removed unprovable billing/refund promises and jargon; refreshed route-specific social metadata.
- Preserved the risograph print-table visual system, local-first PWA class, original artwork, and static deployment model.

## Verification

Fresh clean clone: `/tmp/flipbook-trace-clean.rJ7SFc/repo` at `fc17a02`.

- `npm ci`: pass, 0 reported vulnerabilities.
- Every exact command in `.factory/claims.json`: pass, one tagged test per each of 16 claim IDs.
- `npm run test:unit`: pass, 3/3.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass, 36/36 Chromium tests, including axe serious/critical scans, console errors, mobile/keyboard behavior, offline reload, privacy/storage, PWA update, routing, and 404 regressions.
- `npm run build`: pass; `dist/` contains root `index.html`, `404.html`, `staticwebapp.config.json`, service worker, manifest, and hashed assets.
- Production build sizes: JS 30.90 KB / 11.01 KB gzip; CSS 15.43 KB / 4.27 KB gzip; largest hero image remains below the 300 KB mobile limit.
- `/opt/fleet/lib/verify-url.sh https://flipbook-trace.sociobot.in /tmp/flipbook-live-evidence`: pass. It recorded 778 ms cold load, no console/page errors, `lang=en`, title, one H1, one main, and no missing image alt or unlabeled button.
- Live cold Playwright recheck: `/?demo=1` after landing click showed 12 frames and the banner at 390 px; first frame bottom was 520.44 px inside the 844 px viewport, with no horizontal overflow. Reset returned threshold 142; Start for real removed the banner and returned `/`.
- Live route check: `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page` each had the intended title, one H1/main, route-specific Open Graph fields, and no console errors. `https://flipbook-trace.sociobot.in/missing-page` returned HTTP **404** and the designed page.
- Deployed through `/opt/fleet/lib/deploy-static.sh flipbook-trace dist`; Azure deployment `54a4b989-57ce-4513-9312-2a5c05422e11` succeeded. Live HTML references `/assets/index-DfMvz6Nt.js`, matching this build.

Lighthouse was attempted against the live site. The container’s installed Lighthouse could not connect to its supplied Playwright Chromium, so it produced no new report. The direct bundle budgets, live browser checks, and full axe-backed browser suite above pass; the preceding independent live run recorded 93 performance, 100 accessibility, 100 best practices, and 100 SEO.

## Known gaps

None. The only verification-tool limitation is the Lighthouse Chromium launcher mismatch described above; it is not a product failure.
