# Flipbook Trace

Turn your video into printable tracing frames.

Flipbook Trace is a local browser tool for short-form video creators. Choose a 1–5 second section, set the frame rate and trace style, then export numbered PNGs or a PDF trace sheet.

The app decodes and processes video in the browser. The video and frames disappear on reload. After the first visit, the app and its built-in demo work offline.

Live site: <https://flipbook-trace.sociobot.in>

Demo: <https://flipbook-trace.sociobot.in/?demo=1>

## What it includes

- Choose a video this browser can play
- 2, 4, 6, 8, or 12 frames each second
- Pencil edges, high contrast, and grayscale trace styles
- Optionally show the previous frame in red
- Numbered PNG pack and printable PDF trace sheet
- A twelve-frame paper bird demo that does not read or change real saved data
- Install the app and reopen the demo offline
- Settings export and import

The free version exports 960 px PNGs and a PDF trace sheet. Studio costs $9 once and adds 1920 px, exports at your video's original width, and six-column PDF trace sheets. Dodo is the merchant of record for Sociobot. Dodo handles refunds. A refund automatically revokes the Studio license.

## Who it is for

This tool is for creators preparing a hand-drawn flipbook from a video they own. It replaces manual frame extraction. It is not a video editor, publishing service, or style-transfer tool.

## Run locally

Requirements: Node.js 20 or newer and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use `/?demo=1` to open the bundled sample.

## Test and build

```sh
npm ci
npm run test:unit
npm run lint
npm test
npm run build
```

`npm test` builds and serves the production bundle, then runs the claim, offline, mobile, console, and accessibility checks in Chromium. The build command writes the static deployment to `dist/`, with `dist/index.html` at its root.

Each published product claim and its exact test command is recorded in [`.factory/claims.json`](.factory/claims.json). The demo contract is in [`.factory/demo.md`](.factory/demo.md).

## Privacy and file handling

Video frames live only in page memory and disappear when the page reloads or closes. This site's browser data stores your control settings, Studio license, and latest license check. Demo mode does not read or change those real-data stores. Technically, settings use IndexedDB and a license uses localStorage. `/privacy` and `/terms` contain the user-facing policies.

## Deploy

Deploy the contents of `dist/` as a static site. Keep the host rules that send valid routes to `index.html` and return the designed 404 for unknown routes. Keep the listed security headers too. The factory handles infrastructure, DNS, and billing registration.

Set `VITE_BILLING_BASE` only when the factory needs a non-production billing endpoint. It defaults to `https://api.sociobot.in`.

## License

MIT. See [LICENSE](LICENSE).
