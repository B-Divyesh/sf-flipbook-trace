# Polish 6 handoff — PASS

Repair code commit: `eff8868e45fad0974d4c196ed9dfccbaf398d656`

Deployed site: <https://flipbook-trace.sociobot.in>
Deployed build: `v1.0.17`

## What changed

- Removed unprovable refund and automatic-revocation promises from the landing page, terms, and README.
- Replaced payment jargon with the plain, observable sentence: **Dodo opens the checkout for Sociobot.**
- Narrowed `studio-purchase` to the behavior it proves: Flipbook Trace Studio opens in Dodo checkout for USD 9.00 once.
- Added a regression assertion that all published purchase surfaces contain the plain checkout sentence and contain neither removed promise class.
- Updated the catalog description, copy audit, release version, static 404 build id, and service-worker cache version.

## How verified

- Fresh clone: `/tmp/flipbook-polish6-clean.a6HgPl/repo` at `eff8868e45fad0974d4c196ed9dfccbaf398d656`.
- All 19 exact `.factory/claims.json` commands passed independently. Logs are in `/tmp/flipbook-polish6-clean.a6HgPl/logs/claim-*.log`.
- Fresh-clone quality gates passed: `npm run test:unit` (3/3), `npm run lint`, `npm run typecheck`, `npm test` (59/59), and `npm run build` (`dist/index.html` present).
- Local URL check passed with no console errors, one H1/main, `lang=en`, complete image alternatives, and labelled controls: `/tmp/flipbook-polish6-local-verify.n9Iu7I`.
- Local axe scans found zero serious/critical findings on `/`, `/?demo=1`, `/privacy`, `/terms`, and `/missing-page`.
- Deployed through the static work-order command: `/opt/fleet/lib/deploy-static.sh flipbook-trace dist`.
- Cold production URL check passed: `/tmp/flipbook-polish6-live-verify.cusxIx`. A cold 390px live audit rechecked the first-screen fold, one-click demo, reset, start-for-real, metadata, legal links, 44px targets, route focus, 404 status, and axe. The 1440px fact block ended at 794.56px within the 900px viewport.
- The live checkout redirect still showed **Flipbook Trace Studio**, **USD $9.00**, and **One-time**.

## Known gaps and next steps

No known product gaps remain. Preserve the claim suite, isolated demo path, and live 404/mobile checks on future releases. Pre-existing `graphify-out/` worktree changes were left untouched.
