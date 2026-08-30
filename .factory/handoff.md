# Verification 18 handoff — FAIL

- Candidate: `ed08fdd86c3fdc11b7cf8ba78dbfc7d037816899`
- Live URL: <https://flipbook-trace.sociobot.in>
- Full report: [`.factory/verification-18.md`](verification-18.md)
- Decision: **FAIL — do not release this candidate.**

## Blocking defect

**V18-1 (High):** On the hydrated demo at 390×844, sequential Tab navigation
passes from **Import or export settings** to the footer and never focuses
**Export numbered PNG pack** or **Export PDF trace sheet**. The buttons are
inside the off-screen `.demo-main .preview-zone` subtree styled with
`content-visibility: auto`. The current keyboard test calls `.focus()` directly
and therefore misses the broken Tab order.

Repair the focus traversal and add a test that reaches both enabled export
buttons using Tab alone. No product code was changed during verification.

## Verification summary

- Mandatory first-read and one-click sample gate: PASS.
- All 19 exact claim commands: PASS.
- `npm ci`, 3 unit tests, lint, typecheck, 64 Playwright tests, production build,
  and both npm audits: PASS.
- Independent live normal, boundary, invalid-input, recovery, ZIP, PDF, local
  video, privacy-request, route, mobile, 200% text, reduced-motion, Axe, headers,
  caching, PWA update, and offline checks: PASS except V18-1.
- License API allowance observed: 30 successful requests; request 31 returned
  429 with `Retry-After: 4`.
- Deployment identity: all 30 public `dist/` files match live SHA-256 exactly.
- Mobile Lighthouse: Performance 98, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1,058 ms, TBT 136.5 ms, CLS 0.0615.

Pre-existing `graphify-out/` changes remain unstaged and untouched.
