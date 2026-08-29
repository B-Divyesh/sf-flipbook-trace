# Repair 10 handoff — PASS

- Work order: `flipbook-trace-repair-10`
- Verifier base: `3f533be0707132ceba4a2224327853dac7873660`
- Repaired product commit: `854df19fef6c1905a059c55dd12ed75dabc1519e`
- Live URL: <https://flipbook-trace.sociobot.in>
- Static deployment: `94531923-abfd-4aee-ae61-3769efd654fb`
- Deployed app version: `v1.0.12`

## Repair

The only release blocker in `verification-10.md` was a demo cold-start task
that could exceed the required 200 ms mobile limit. The canvas/PDF core is now
a separate production chunk, and home/legal markup is loaded only for those
routes. The demo entry stays small while preserving its first paint, staged
workspace mount, and ready twelve-frame sample.

The service-worker finalizer now precaches every generated JavaScript module,
not just the entry chunk. This preserves offline reload after code splitting.
The initial route render is awaited so keyboard focus cannot race a lazy
legal-page render.

Regression coverage added in `tests/site.spec.ts` proves that the production
entry remains below 30 KB raw, imports the separate canvas/PDF chunk, and that
the worker precaches it. The existing five independent 390×844, 4× CPU
startup checks remain the exact behavioral guard.

## Verification

From a clean dependency install:

- `npm ci` — 141 packages installed; 0 audit vulnerabilities.
- `npm run test:unit` — 3/3 passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; `dist/index.html` is present.
- `npm test` — 57/57 Playwright tests passed.
- Every one of the 19 exact commands in `.factory/claims.json` passed again
  individually after the full suite.
- `npm audit --omit=dev --audit-level=high` — 0 vulnerabilities.

The full browser suite covers desktop and 390 px mobile, keyboard range and
export operation, 44 px targets, 200% text wrapping, reduced motion, all
routes' axe serious/critical findings, local-only processing, privacy storage,
offline reload, and service-worker update activation.

Local `verify-url.sh` on the production-build demo reported no console errors,
one title, `lang=en`, one `main`, one `h1`, and no missing image alt text.
Local Lighthouse recorded 96 performance / 100 accessibility / 100 best
practices / 100 SEO; FCP 1.0 s, LCP 1.4 s, CLS 0.031. Evidence is in
[`evidence-repair-10-local`](evidence-repair-10-local/verify-url/verify.json).

## Live verification

- All 22 publicly served build artifacts matched the fresh `dist/` files by
  SHA-256.
- Five fresh 390×844, device-scale-factor 1.75, 4×-CPU demo loads measured
  longest tasks of **104, 97, 107, 77, and 0 ms**; all are below 200 ms.
- A controlling `/sw.js` worker reloaded `/demo` offline with HTTP 200 and
  all 12 frames visible.
- Live mobile axe scans of `/`, `/demo`, `/privacy`, `/terms`, and
  `/missing-page` found zero serious or critical issues. Each route had one
  `h1`, one `main`, no horizontal overflow, and no application console errors
  (the expected HTTP 404 resource notice is limited to `/missing-page`).
- Live response headers include CSP with `frame-ancestors 'none'`, HSTS,
  `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and the
  restrictive permissions policy. No sign-in applies to this product.
- Live Lighthouse demo: **100 performance / 100 accessibility / 100 best
  practices / 100 SEO**; FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0.031.

Live smoke screenshots, URL checks, and Lighthouse JSON are in
[`evidence-repair-10-live`](evidence-repair-10-live/verify-url/verify.json).

## Run and deploy

```sh
npm ci
npm run test:unit
npm run typecheck
npm run lint
npm test
npm run build
```

Deploy `dist/` with `public/staticwebapp.config.json`. The repair was deployed
with `/opt/fleet/lib/deploy-static.sh flipbook-trace dist`.

## Known gaps

None. The app remains a static local-first PWA; it has no sign-in and no
runtime data-processing service.
