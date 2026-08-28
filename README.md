# Flipbook Trace

Turn your video into printable tracing frames.

Flipbook Trace is a local browser tool for short-form video creators. Choose a 1–5 second section, set the frame rate and trace style, then export numbered PNGs or a PDF contact sheet.

The app decodes and processes video in the browser. The clip and frames disappear on reload. After the first visit, the app and its built-in demo work offline.

Live site: <https://flipbook-trace.sociobot.in>

Demo: <https://flipbook-trace.sociobot.in/demo>

## What it includes

- Video formats supported by the current browser
- 2, 4, 6, 8, or 12 frames each second
- Pencil edge, high contrast, and grayscale trace styles
- Optional previous-frame onion skin
- Numbered PNG pack and printable PDF contact sheet
- A twelve-frame paper bird demo that does not read or change real saved data
- Installable PWA shell and offline reload
- Settings export and import

The free version includes 960 px PNG and PDF exports. Studio costs $9 once and adds 1920 px, source-width exports, and six-column sheets. Purchases and license checks use the Sociobot billing API.

## Who it is for

This tool is for creators preparing a hand-drawn flipbook study from footage they own. It replaces manual frame extraction. It is not a video editor, publishing service, or style-transfer tool.

## Run locally

Requirements: Node.js 20 or newer and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use `/demo` to open the bundled sample.

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

Video frames live only in page memory and disappear when the page reloads or closes. IndexedDB stores control settings. Local storage holds a Studio license and its latest verification result when a buyer adds one. Demo mode does not read or change either real-data store. `/privacy` and `/terms` contain the user-facing policies.

## Deploy

Deploy the contents of `dist/` as a static site. Keep the SPA navigation fallback and response headers from `public/staticwebapp.config.json`. The factory handles infrastructure, DNS, and billing registration.

Set `VITE_BILLING_BASE` only when the factory needs a non-production billing endpoint. It defaults to `https://api.sociobot.in`.

## License

MIT. See [LICENSE](LICENSE).
