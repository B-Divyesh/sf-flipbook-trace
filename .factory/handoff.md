# Flipbook Trace handoff

Work order: `flipbook-trace-build-1`

Completed: 2026-08-28

Build output: `dist/`

## What was built

- A local-first video workflow for playable browser video formats.
- A strict 1–5 second trim, with 2, 4, 6, 8, or 12 frames each second.
- Pencil-edge, high-contrast, grayscale, threshold, and previous-frame controls.
- Numbered PNG ZIP export with no runtime dependency.
- Multi-page PDF contact sheets that include every selected frame.
- A one-click `/demo` with twelve code-drawn paper bird frames.
- Demo reset, real-work exit, and a persistent sandbox banner.
- IndexedDB preferences plus JSON settings export and import.
- Installable PWA metadata, versioned shell caching, deep-route offline reload, and an offline fallback.
- Landing, demo, privacy, terms, and product-specific 404 routes with History API navigation and focus restoration.
- $9 one-time Studio tier using the Sociobot checkout, saved license return, daily cached verification, and pasted-license restore.
- Studio controls for 1920 px, source-width output, and six-column sheets. Free 960 px PNG and PDF exports remain available.
- An original risograph worktable hero, responsive WebP derivatives, social card, favicon, and install icons.
- A product-specific visual contract, copy audit, demo contract, and executable claim registry.

## Verification

Run from a clean checkout:

```sh
npm install
npm test
npm run build
```

Results recorded on 2026-08-28:

- `npm test`: 14 passed in Chromium 145.
- Seven claim tests passed, including real WebM import, ZIP/PDF downloads, no cross-origin demo requests, paid controls, and offline reload.
- Axe: zero serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, and the 404 route.
- Mobile: the 390×844 demo has no horizontal overflow and keeps the keyboard skip path.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, one H1, main landmark, English language, image alt text, and zero console errors.
- `npm run build`: passed; `dist/index.html` is at the deployment root.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Initial app JS: 28.98 KB / 10.62 KB gzip.
- Initial CSS: 14.24 KB / 4.07 KB gzip.
- Mobile hero: 44 KB WebP; desktop hero: 171 KB WebP.

Lighthouse mobile simulation on the production build:

- Performance: 99
- Accessibility: 100
- Best practices: 100
- SEO: 100
- LCP: 2.3 s
- FCP: 0.9 s
- Total blocking time: 0 ms
- CLS: 0

## Product and privacy notes

Video frames remain in page memory. The source file is not written to IndexedDB or local storage. Demo settings stay in memory and do not read the real preference database. License verification is the only product flow that contacts a non-origin service.

The generated hero source and prompt sidecars are under `assets/src/`. The prompt, date, model route, and design rationale are in `.factory/design.md`.

## Known gaps and next steps

- Video format support follows each browser. A user may need to convert an unsupported codec to MP4 or WebM.
- The source video is intentionally not retained. A reload requires the user to choose it again.
- The factory must register the `flipbook-trace` billing product and return URL before the buy link can complete a live purchase.
- Lighthouse was run in the worker container against `vite preview`; confirm the same headers and scores after deployment.
- Large source-width exports can still reach device memory limits. The app warns at 500 MB and gives a recovery step.
