# ADR 0007 — Inline SVG Icons, Not Image Files

**Status:** Accepted
**Date:** 2026-08-21

## Context

`docs/specs/picture-association.md` adds a picture-association question type
(`picture_pick`) and picture-carrying `match` tiles for the rung 1–2 vocabulary in Bath
Time (lessons 1–5, 22 concepts). Those pictures need to ship somehow.

Two constraints from the project constitution rule this out fast:

- **Zero production dependencies beyond React and Vite** (`docs/conventions.md`) — no icon
  library, no SVG-optimisation tool, no image CDN.
- **No service worker exists.** The PWA is used offline, but nothing currently caches
  network assets; the only thing guaranteed to be available offline is whatever shipped in
  the JS bundle at install time. A `public/icons/*.png` (or `.svg`) directory would work
  online and then silently 404 offline — a bath-time app that stops showing pictures the
  moment the phone loses signal is a worse regression than the article.

`App.jsx` staying a single file (`docs/decisions/002-keep-single-file.md`) is also in force,
so wherever the icons live, they live in that file.

## Decision

**Icons are inline SVG constants in a new `// ─── ICONS` section of `App.jsx`**, not image
files. Each of the 22 icons is a small function `color => <>...JSX paths...</>`, collected
in an `ICONS` registry keyed by concept, and rendered through one `Icon({name, color,
size})` component.

This makes the icons:

- **Bundle-only.** They compile into the same JS chunk as everything else and are available
  offline with no service worker and no extra fetch.
- **Zero-dependency.** No SVG optimiser, no icon font, no asset pipeline — just JSX, the
  same tool already used for every other visual in the app.
- **On-brand automatically.** Each icon is a function of the track's accent colour, so a
  future track reusing a concept (`víz`, `kéz`) picks up its own palette without redrawing
  anything.

The registry sits **below** the `// ─── STYLES` banner, not above it, for a reason that is
mechanical rather than stylistic: `scripts/validate-curriculum.mjs` imports `App.jsx` by
splitting the file on the literal string `"// ─── STYLES"` and evaluating only what precedes
it, because that part is JSX-free and safe to `import()` as a data module. The icons are
JSX and reference the `C` colour object, which is itself defined below that split — so
`ICONS` cannot go above it without breaking the validator's import. Question generators
(`// ─── QUESTION GENERATORS`, above the split) are consequently forbidden from importing
`ICONS` or `Icon`; they may only read `phrase.icon`, a plain string in the lesson data,
leaving the drawing lookup entirely to the render layer.

## Alternatives Considered

- **Raster images in `public/`**: Rejected — not part of the JS bundle, so unavailable
  offline without a service worker (out of scope), and it would be the first binary asset
  in a project that currently ships none.
- **An icon font or a small icon library (e.g. lucide-react)**: Rejected by the zero-new-
  dependency rule; also generic icon sets don't have "kád" or "csitt" — every one of these
  22 concepts would need custom artwork regardless of the delivery mechanism.
- **Emoji as icons**: Considered and rejected in the spec's design phase — emoji rendering
  is platform-dependent (a duck renders differently, or not at all, across devices) and
  offers no way to tint to the track's accent colour, unlike a stroke-based SVG.

## Consequences

- Every new icon is a hand-drawn SVG path added directly to `App.jsx`; there is no asset
  build step to forget.
- The single-file size grows with each icon, which is an accepted, explicit trade-off of
  `docs/decisions/002-keep-single-file.md` — the same trade-off already made for lesson
  data and every component.
- Because the registry must stay below the STYLES split, any future section reordering in
  `App.jsx` needs to preserve that constraint; `docs/conventions.md`'s banner order records
  it (`... → STYLES → ICONS → COMPONENTS → ...`).
