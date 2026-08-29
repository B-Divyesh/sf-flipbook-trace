# Flipbook Trace repair 2 handoff

- Work order: `flipbook-trace-repair-2`
- Verifier report: `7a8e5c5442a69d51185828b26b74e6204f802a96`
- Repaired candidate: `bd8f6b791388fa12754f96f8ed98bfe5afd0dd9a`
- Repair commit: `d9710ca0f3e84913bad89a2b77a6f9f9440ca81e`
- Version: `1.0.6`
- Product class: static local-first offline PWA
- Live URL: <https://flipbook-trace.sociobot.in>
- Azure Static Web Apps deployment: `98636335-58d1-409c-bebb-4488362049a8`

## Findings reproduced before repair

The candidate production build reproduced the verifier's license failure exactly. Verifying an invalid token made one request and stored `{"valid":false,"checked":…}`. Immediate reload made a second request and left `#license-status` empty. A separate stale-valid-to-revoked response stored a negative verdict but also left the notice empty.

The candidate Terms page also omitted the merchant-of-record, refund, and automatic license-revocation terms.

## Repairs

- Valid, invalid, expired, wrong-product, and revoked verdicts now use the same 24-hour cache window.
- Cached state is restored before home markup is rendered. Fresh cached verdicts do not make a request.
- New verdict records keep the token and reason. A verdict cannot be reused for a different saved token.
- License verification now starts after the page is mounted, so a fresh revocation is announced and remains visible.
- Revoked and inactive states use persistent plain-language notices and a non-success visual treatment.
- A revoked or inactive verdict resets Studio-only export controls to the free choices.
- Invalid JSON, non-2xx responses, and malformed API verdicts fail soft without blocking the free app.
- Terms now state that Sociobot/Dodo is the merchant of record, handles refunds, and automatically revokes a refunded license.
- `@claim:studio-license-cache` covers fresh valid and invalid reloads, the exact 24-hour boundary, stale revalidation, revoked reload, persistent notices, request counts, and paid-control relocking.
- A separate Terms regression asserts the required merchant, refund, and revocation wording.

## Local verification

The exact work-order build command passed from a clean install:

```sh
npm ci && npm test && npm run build
```

- npm audit: 0 vulnerabilities.
- Unit tests: 3/3 passed.
- TypeScript: passed with no emit.
- ESLint: passed.
- Production browser suite: 49/49 passed in Chromium 1.58.2.
- Every one of the 19 commands in `.factory/claims.json` passed independently.
- Desktop checks passed at 1366×768 and 1440×900.
- Mobile route, overflow, first-screen, and every-action target checks passed at 390×844.
- Keyboard range operation, focus, route focus restoration, and keyboard export passed.
- Axe found zero serious or critical issues on home, demo, privacy, terms, and not-found routes.
- Privacy tests inspected IndexedDB, Cache Storage, OPFS, localStorage, and sessionStorage. Video and frame sentinels were absent.
- Offline demo reload restored its banner and 12 frames. The update test activated a changed worker, replaced the shell cache, and announced the update.
- Local URL verifier found no console errors and confirmed title, `lang`, one H1, one main, alt text, and labeled buttons.
- Local Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; LCP 2.3 s, TBT 0 ms, CLS 0.
- Production output: JavaScript 32.67 KB raw / 11.53 KB gzip; CSS 15.88 KB raw / 4.36 KB gzip.

Package/consumer tests do not apply because this artifact is a browser PWA, not a published package.

## Live verification

- `/`, `/demo`, `/privacy`, and `/terms` return 200. The designed `/missing-page` returns 404.
- All five routes have one H1, one main, `lang=en`, no 390 px overflow, no serious/critical axe issue, and no cold cross-origin request.
- Invalid verdict: one verification request total before and after reload; the inactive notice persisted.
- Fresh valid verdict: zero verification requests across two loads; Studio remained active.
- Stale valid verdict: one request returned revoked; reload made no second request and retained the revoked notice.
- The deployed demo reloaded offline with all 12 frames and its demo banner.
- Reduced-motion mode reported zero running animations.
- Live Terms displayed both required purchase disclosures.
- The checkout endpoint returned 303 to a Dodo checkout session.
- The verification endpoint returned 200, `Access-Control-Allow-Origin: https://flipbook-trace.sociobot.in`, and `Cache-Control: no-store`.
- HTML has HSTS, CSP, Referrer-Policy, Permissions-Policy, and `nosniff`. Hashed assets are immutable for one year. `sw.js` is no-store.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.8 s, TBT 0 ms, CLS 0.

The deployed HTML, manifest, service worker, JavaScript, and CSS match local `dist/` byte-for-byte. Representative SHA-256 values:

- `index.html`: `6d085f0ffe3d8a853cf1d195f793b9cd53300e3c1a7cfd463b14f08a4b9def0d`
- `sw.js`: `59f93e169f4de2aa52dcc25978acf970f57968f8d0dd2ee135836a6555c59730`
- JavaScript: `ebc1928c1cf2474fcfba0b6d590863dbb8b4dab9709284a187a8ed7559d19a67`
- CSS: `bea09084978f43dab78b57c0f47de23525f649399cb5bd01b30c4f20abc7d24f`

Evidence is in `.factory/evidence-repair-2/`, including local/live Lighthouse JSON, route and license audit JSON, screenshots, and URL-verifier output.

## Known gaps and next steps

No release-blocking product gap remains. The external hosted checkout was verified through its redirect and existing claim test; no real purchase was placed.
