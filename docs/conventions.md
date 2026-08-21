# Conventions

## File structure

The app is intentionally a single file (`src/App.jsx`). Sections are separated with ASCII banner comments:

```js
// ─── SECTION NAME ──────────────────────────────────────────────────────────
```

Maintain this order: DATA → UTILITIES → ENGINES → HOOKS → QUESTION GENERATORS → STYLES → ICONS → COMPONENTS → APP.

## Data

- Lesson `id` values are stable and used as keys in `localStorage`. Never reuse or renumber them.
- Add new lessons by appending to `LESSONS[]` with the next sequential `id`.
- Phrase fields: `hu` (Hungarian text), `pr` (pronunciation guide), `en` (English translation). All three are required. `icon` (concept key into the `ICONS` registry) is optional — currently used only by rung 1–2 phrases.
- Lessons carry `{id, trackId, band, seq, title, sub?, types, phrases, tip?, grammar?}`. `grammar` is B1+ only.
- Retired fields — do not reintroduce: `phase`, `aud`, `pat`, `patternId`.

## Components

- Inline styles only — no CSS files, no CSS-in-JS libraries, no Tailwind.
- All colours come from the `C` constants object. Never hardcode a colour outside of `C`.
- Components are functions, not classes.
- Keep components small and co-located in the file. Extract a component when JSX is repeated more than twice.

## State

- Prefer `useState` for UI state, `useCallback` for stable handlers, `useMemo` for derived values.
- All persisted state goes through `useStats`. Don't call `localStorage` directly anywhere else.
- Don't add a new top-level state manager (Redux, Zustand, etc.) without a decision record.

## Naming

- React components: `PascalCase`
- Functions and variables: `camelCase`
- Constants (data arrays, config objects): `SCREAMING_SNAKE_CASE`
- Inline style objects defined at call-site need no naming convention.

## Questions / quiz

- Every question generator (`gen*`) accepts a phrase object and returns a question object with at least `{ type, answer, phrase }`.
- `generateQuestions` is the only place that calls question generators. Don't call them directly from components.
- A generator may return `null` to decline a phrase it cannot use. `generateQuestions` keeps a `genPhraseList` / `genTyped` fallback so a narrow pool still yields questions — don't remove it.
- Generators that build wrong-answer options must take them from the `distractorPool` argument, not from the question pool. The two differ in Remedial and Band Review.

## Settings

- New user settings go in `DEFAULT_SETTINGS` and are read from `stats.settings`. Because `loadStats()` merges over the defaults, adding a key needs no `STORAGE_KEY` bump.
- Audio that plays without the user asking must respect `settings.autoPlayAudio`. Tap-triggered playback (`SpeakBtn`, feedback after a Check) is always allowed.

## Accessibility & mobile

- The app targets portrait mobile. Default touch target minimum is 44 × 44 px.
- No hover-only interactions.
- Speech buttons are supplementary; the app must be fully usable without audio.

## Dependencies

Zero production dependencies beyond `react` and `react-dom`. Adding a dependency requires a decision record explaining why the bundle cost is justified.
