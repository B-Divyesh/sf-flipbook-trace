# Flipbook Trace visual thesis

## Direction

**Risograph tactile collage.** Flipbook Trace should feel like a working table shared by an animator and a printmaker. Off-register ink, clipped paper corners, crop marks, and pencilled frame numbers make the digital preparation step point toward the physical tracing exercise. It must not resemble a video editor or a generic software landing page.

The single-mode, light treatment is intentional: warm paper is the work surface, black ink is the drawing line, and spot inks mark actions and state. Dark mode is not used because it would break the print-table metaphor. The browser background is always painted.

## Tokens

- `--paper: #f2ead7` — warm uncoated stock and page background.
- `--paper-high: #fffaf0` — raised sheets and form surfaces.
- `--ink: #181713` — body text and outlines; 15.4:1 on paper.
- `--ink-soft: #5d5549` — supporting text; 6.1:1 on paper.
- `--blue: #0b5f71` — cyan-like spot ink for primary controls; white is 7.1:1.
- `--red: #ad352d` — dark vermilion spot ink for registration marks and warnings.
- `--yellow: #e6bd3c` — highlights only, never body text.
- `--green: #356447` — success text and status.
- `--danger: #9c2f28` — errors with labels, never color alone.

## Type

Display text uses `Arial Black`, `Arial Narrow`, then a system sans fallback: condensed, blunt, and poster-like without downloading a font. Body and controls use `ui-monospace`, `SFMono-Regular`, Consolas, and monospace fallbacks, echoing exposure notes and frame counters. This avoids third-party files and keeps first load small.

Scale: 14, 16, 20, 28, and fluid 44–72 px. Body is at least 16 px. Text measures stay below 68 characters.

## Spacing and shapes

The base unit is 8 px. Section gaps use 48, 64, and 96 px. Controls have 44 px minimum targets. Sheets use clipped 10 px corners and a 2 px ink outline. Shadows are hard, offset ink impressions rather than blurred elevation. Dotted perforation lines and registration crosses separate stages.

## Interaction grammar

The product workspace is a horizontal strip of numbered frames beside a trim/filter control column. Selection uses a double outline and a written state. Buttons depress by two pixels, like a small print press. Progress is described in text. Links stay underlined.

Signature motion: the hero frame stack fans into registration on load, and new preview frames arrive in a short left-to-right sequence. UI transitions take 180–240 ms and animate only opacity and transform. With `prefers-reduced-motion: reduce`, every state changes instantly and decorative fan motion is removed.

## Asset plan and provenance

- `hero-worktable.webp`: original wide risograph collage of hands arranging numbered animation frames on a printmaker's table. It explains the product's output without pretending to be the UI.
- `social-card.webp`: a 1200×630 crop/composition derived from the same original art.
- App icons and favicon: hand-authored vector registration mark plus an `F`; deterministic, original SVG.
- Demo frames: drawn at runtime with Canvas from an original bouncing-paper-bird motion study. They contain no downloaded media and work offline.

### Generation prompt

Use case: stylized-concept. Asset type: landing hero illustration. Primary request: overhead printmaker's worktable with two hands arranging six numbered flipbook animation frames showing a simple paper bird in progressive motion. Scene: warm uncoated paper, torn scraps, registration crosses, crop marks, ink roller partly cropped at the edge. Style: tactile two-colour risograph collage, visible halftone dots, imperfect cyan and vermilion ink registration, bold black pencil contours, editorial cut-paper shapes. Composition: wide 3:2, action concentrated center-right with calm paper space on the left, no interface mockup. Lighting: flat workshop daylight. Palette: warm cream paper, near-black graphite, deep cyan, vermilion, mustard accent. Constraints: no readable text, no logos, no watermark, no brands, no extra fingers, no photorealism, no glossy gradients, no neon.

Generated with the factory image deployment through `/opt/fleet/lib/gen-image.sh` on 2026-08-28. Original product asset; no third-party source material.

## Why this fits

The user is converting motion into physical drawing prompts. Paper texture, numbered frames, and registration errors make the destination visible before a file is chosen. The restrained palette also keeps the actual black trace lines easy to judge.
