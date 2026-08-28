# Flipbook Trace adversarial review 2 handoff

Work order: `flipbook-trace-review-2`

Reviewed commit: `c0f95d0dd669f3413f1bd8e7d047ead974639f27`

Date: 2026-08-28

Verdict: **FAIL**

## Done

- Performed cold first reads of the live deployment at 390×844 and 1440×900.
- Audited every landing-page and README sentence/fragment, plus headings, actions, terminology, and claim coverage.
- Entered the one-click demo; exercised reset, real-data isolation, network interception, offline reload, and core controls.
- Ran all 16 exact `.factory/claims.json` commands independently from a clean clone.
- Rechecked all 25 review-1 findings against live behavior and current source/tests.
- Crawled live links and checked route status, titles, H1/main structure, descriptions, canonical/OG data, icons, header/footer consistency, route focus, and the designed 404.
- Ran live axe scans and the factory URL verifier. No product code was changed.

The complete evidence, sentence counts, finding rewrites, claim matrix, and history matrix are in `.factory/review-2.md`.

## Verification

Clean clone: `/tmp/flipbook-review2-clean.yRp8L6/repo` at the reviewed commit.

- `npm ci`: PASS, zero reported vulnerabilities.
- Every exact claim command: PASS at command level; F-1-7, F-1-8, and F-1-9 remain blocking because their assertions do not prove the full registered claim.
- `npm run test:unit`: PASS, 3/3.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 36/36.
- `npm run build`: PASS; JS 30.90 KB (11.01 KB gzip), CSS 15.43 KB (4.27 KB gzip).
- `/opt/fleet/lib/verify-url.sh https://flipbook-trace.sociobot.in ...`: PASS; 589 ms, no home-page errors, one H1/main, `lang=en`, no missing alt or unlabeled button.
- Live axe: zero violations on `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and `/missing-page` at 390×844.
- Live unknown route: HTTP 404 with designed page.
- Live asset names match the clean build: `index-DfMvz6Nt.js` and `index-BIY-7Ovp.css`.

## Remaining work

- Blocking: make demo trim/frame-rate generation real; close the persistent-storage and independent-PDF proof gaps recorded as F-1-7, F-1-8, and F-1-9.
- Major: fit all three facts in the phone first screen, register the free 960 px claim, and complete 404 metadata/shell consistency.
- Minor: apply the five exact copy/terminology rewrites in the review.

The repository already contained modified `graphify-out/*` files before this review. They were not touched or included in the review commit.
