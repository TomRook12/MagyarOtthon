# Spec: Build Stamp in Settings

> **Status:** Done
> **Branch:** `claude/test-feedback-feature-spec-s9pjqd`

## Goal

Show which build the running app came from, so a missing feature can be told apart from a
stale client without guesswork.

## Background

After `picture-association` and `lesson-progression` shipped and deployed successfully, the
Next-lesson button was still absent on the installed app. Every server-side link in the
chain checked out — merged, on `main`, Pages deploy green, the string present in the built
bundle — so the only remaining explanation was a stale client, and there was **no way to
confirm that from inside the app**.

The underlying cause is structural. `index.html` references a content-hashed bundle
(`assets/index-<hash>.js`). A cached `index.html` keeps pointing at the old hash, which is
still served happily by Pages. There is **no service worker**, so there is no update
mechanism at all — staleness is invisible and unbounded, and an installed home-screen PWA
in standalone mode is the stickiest case.

This spec does not fix staleness. It makes staleness *diagnosable* in five seconds.

## Requirements

### Must have
- [x] The Settings screen shows the short commit SHA and build date of the running bundle.
- [x] The values are injected at build time, not computed in the browser.
- [x] A one-line hint tells the reader what to do when a feature is missing.
- [x] No new dependency; `execSync` is a Node built-in and runs only in `vite.config.js`.
- [x] The build does not fail when git is unavailable — falls back to `GITHUB_SHA`, then
      `"unknown"`.

### Out of scope
- A service worker, precaching, or an update prompt. That is the real fix for staleness and
  needs its own spec and an ADR — it is a genuine architectural change, and service-worker
  update bugs are their own genre of pain.
- Any automatic version check against the server.

## Design

`vite.config.js` gains a `define` block:

```js
function buildSha() {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); }
  catch { return (process.env.GITHUB_SHA || 'unknown').slice(0, 7); }
}
```

`actions/checkout` leaves a usable `.git` even at depth 1, so `git rev-parse` works in CI;
the `GITHUB_SHA` fallback covers a source-only build with no git directory.

`SettingsScreen` renders the stamp at the bottom in `C.dim` at 11px — present when looked
for, invisible when not. Placed below the existing cards, inside the same padded container.

## Implementation tasks

- [x] Add the `define` block and `buildSha()` to `vite.config.js`.
- [x] Render the stamp and hint line at the bottom of `SettingsScreen`.
- [x] Verify the real SHA reaches the built bundle, not the literal token.
- [x] Verify it renders on screen in a browser.
- [x] `npm run build` and `npm run validate:curriculum` clean.

## Acceptance criteria

- [x] Settings shows `Build <sha> · <date>` — confirmed rendering as
      `Build 658c9e3 · 2026-08-22` in headless Chromium, with no page errors.
- [x] The built bundle contains the literal SHA `"658c9e3"`, so the value is baked in at
      build time rather than resolved at runtime.
- [x] The hint line is present.
- [x] `npm run validate:curriculum` passes — `SettingsScreen` sits below the validator's
      `// ─── STYLES` split, so the injected globals never reach the imported logic module.
- [x] `npm run build` passes.
