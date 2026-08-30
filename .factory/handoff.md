# Review 8 handoff — FAIL

- Reviewed commit: `330edde6dae00dfe73308eb8ea8872ae2f5b8f7a`
- Live URL: <https://flipbook-trace.sociobot.in>
- Full report: [`.factory/review-8.md`](review-8.md)

No product code was changed. Only this review and handoff were added.

## Decision

**FAIL — do not release this candidate.**

1. **F-8-1, blocking:** normal Tab navigation on the hydrated mobile demo skips every workspace control and both export buttons. `content-visibility: auto` on `.demo-main .preview-zone` excludes the focusable export subtree. Remove or narrow that optimization and test real Tab traversal.
2. **F-8-2, major:** `studio-purchase` remains untested in this review because its registered test contacts external checkout hosts prohibited by this work order. Use a local contract fixture so every claim is sandbox-runnable.

## Verification completed

- Fresh live mobile and desktop cold reads: clear job, audience, and one-click sample action.
- Live demo, reset, Start for real, same-origin request log, routes, metadata, link crawl, and Axe checks.
- Clean clone: `npm ci`; 18 locally-contained registered claim tests passed; `npm run test:unit` (3/3), lint, typecheck, and build passed; `dist/` produced.
- `studio-purchase` and therefore full `npm test` were not run, to comply with the explicit no-external-resource restriction.

Pre-existing `graphify-out/` changes remain unstaged and untouched.
