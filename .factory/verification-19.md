# Independent verification 19 — PASS

- **Candidate:** `a956a4ff45e808b97aea16fcfebe2747b284b41d`
- **Live URL:** <https://flipbook-trace.sociobot.in>
- **Work order:** `flipbook-trace-verify-19`
- **Verified:** 2026-08-30 UTC
- **Decision:** **PASS — release candidate accepted.**

No high, medium, or low severity product defects were found. No product code
was changed during this verification.

## First read and demo gate

A cold Chromium visit at 1440×900 and 390×844 passed the first-screen gate.
The page says it **“Turn[s] your video into tracing frames,”** names
**short-form creators** making a hand-drawn flipbook, and presents **“Try it
with sample data”** with the adjacent result: a ready 12-frame paper-bird
sample. The same screen gives the three required facts: browser-only video,
offline after the first visit, and free PNG/PDF exports.

The one-click action opened `/?demo=1`, showed the persistent **“Demo — sample
data, nothing is saved”** banner, and displayed twelve visible sample frames.
The 390 px first screen had no horizontal overflow and retained the complete
headline, audience, action, outcome, and facts.

## Required claim suite

`.factory/claims.json` exists and contains 19 entries. After `npm ci`, every
listed command was run separately against the production-build Playwright demo
entry point. Every claim passed:

`clip-workflow`, `demo-ready`, `demo-workflow`, `demo-isolation`, `png-export`,
`pdf-export`, `local-processing`, `ephemeral-project`, `trace-controls`,
`settings-portability`, `offline-reload`, `pwa-installable`, `free-quality`,
`studio-quality`, `studio-purchase`, `studio-license-check`,
`studio-license-cache`, `browser-data-deletion`, and `app-update-check`.

The final Playwright run record is `passed` with no failed tests.

## Clean-install quality gates

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages installed; npm reported 0 vulnerabilities |
| `npm run test:unit` | PASS — 3/3 |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 64/64 Playwright tests |
| `npm run build` | PASS — produced `dist/` |

The built JavaScript totals 59,560 B raw / 22,016 B gzip and CSS is 16,877 B
raw / 4,631 B gzip. The mobile hero asset is 44,796 B. These are within the
static/PWA budgets.

## Independent live workflow, privacy, and accessibility

On the live deployment, a fresh desktop context started with 12 frames,
regenerated to 60 after selecting a five-second section at 12 frames per
second, and Reset demo returned to 12. An invalid 0.5-second selection showed
the recovery text **“The selected section must be 1–5 seconds…”**; correcting
it to one second regenerated six frames. No console or page errors occurred.

The live demo request log contained only `https://flipbook-trace.sociobot.in`
resources: no analytics, upload, third-party script/font, or media request.
The exact local-video privacy claim also passed, proving no HTTP request during
local import, trace processing, and exports. The deployed document sends CSP
as a response header with `frame-ancestors 'none'`, HSTS,
`X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a
camera/microphone/geolocation-denying Permissions Policy.

Playwright Axe scans found **zero serious or critical violations** on the live
demo. The local route audit found the same result for `/`, `/?demo=1`, `/demo`,
`/privacy`, `/terms`, and the designed not-found route. These pages each have
`lang=en`, one H1, one main landmark, route-specific titles, working legal
links, and no console errors. The live unknown route returns HTTP 404.

Sequential keyboard testing reached Reset, every frame setting, Make tracing
frames, **Export numbered PNG pack**, and **Export PDF trace sheet**; keyboard
activation downloaded both exports in the local production audit. Live focus
uses the visible 3 px red, 4 px offset ring. Reduced-motion media results in
0.01 ms animation and transition durations. At 390 px, `scrollWidth` equalled
`clientWidth` (390 px).

## PWA, cache, and deployment identity

A fresh live demo registered a controlling `/sw.js` worker at scope `/`.
`registration.update()` completed with the active worker retained. With the
network disabled after first visit, a reload restored the demo banner and all
12 frames. The required changed-worker claim test also passed. The manifest
uses standalone display, a versioned start URL, 192/512 icons, and a maskable
icon.

Live cache headers are appropriate: HTML revalidates after 30 seconds, hashed
JS/CSS use `max-age=31536000, immutable`, `sw.js` is no-store, and the manifest
revalidates hourly. SHA-256 comparisons matched candidate `dist/` bytes for
`index.html`, `sw.js`, `manifest.webmanifest`, and every shipped JS, CSS, and
WebP asset. The live build therefore matches candidate `a956a4f`.

## Scope notes

- The repository does not contain a `verify-url.sh`, so it could not be run.
  The independently run Playwright route audit covered its required title,
  language, main landmark, image alternative, console, and accessibility
  checks instead.
- This static PWA has no product-origin server endpoint. Its optional Studio
  license verification targets the factory billing API, which is outside the
  permitted `sf-flipbook-trace` resource scope in this work order. I therefore
  did not probe that external API's rate limit. Its request shape, token
  containment, cache behavior, and checkout contract were exercised by the
  required fixture-backed claims. No sign-in is present, so Entra, backend
  health, persistence-boundary, and concurrency checks are not applicable.
- Pre-existing `graphify-out/` changes were left untouched and are not part of
  this verification commit.
