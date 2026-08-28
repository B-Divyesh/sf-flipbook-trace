# Flipbook Trace adversarial review 1 handoff

Work order: `flipbook-trace-review-1`

Date: 2026-08-28

Verdict: **FAIL**

## What was done

- Reviewed the deployed product cold at 390×844 and 1440×900.
- Audited the one-click demo, Reset, Start for real, demo/real storage isolation, live offline reload, and a real local-video export flow.
- Ran every exact `.factory/claims.json` command separately from a clean clone, then ran unit tests, lint, the full Playwright suite, typecheck, and production build.
- Checked claim coverage and assertion scope against all live copy and README copy.
- Crawled all links; checked route titles, metadata, canonical URLs, deep links, back/focus behavior, 404 status, headers, cache policy, visual identity, and deployment/build hashes.
- Ran axe on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page`, plus `/opt/fleet/lib/verify-url.sh`.
- Read and rechecked the earlier verification findings and latest handoff.
- Wrote the complete evidence, copy word counts, 25 findings, and concrete fixes in `.factory/review-1.md`.

No product code was modified. Existing unrelated `graphify-out` working-tree changes were preserved.

## Verification summary

- All 13 exact claim commands: exit 0, one tagged test each.
- Full Playwright suite: 25/25 passed.
- Unit tests: 3/3 passed.
- Lint, typecheck, and build: passed; `dist/` produced.
- Live axe: zero violations on five routes.
- `verify-url.sh`: passed with no console/page errors.
- Link crawl: no dead links.
- Live and clean-build hashes: matched for HTML, hashed JS/CSS, service worker, manifest, robots, and sitemap.

## What remains

The product is not review-ready. Blocking issues are: sample frames are below the first demo viewport; unknown routes are soft HTTP 200 pages; and eight registered claim tests do not prove the complete promise. Major and minor unlisted-claim, metadata, terminology, and jargon findings are documented as `F-1-11` through `F-1-25`.

Run the exact checklist in `.factory/review-1.md` after repairs. PASS requires zero remaining findings and no untested claim.
