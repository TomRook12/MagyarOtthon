# Magyar Otthon — App.jsx Structural Map

> **Read this before opening `src/App.jsx`.** This file covers schemas, constants, and
> section locations — the stable structural knowledge Claude needs most often.
>
> Line numbers are intentionally absent — they shift with every lesson addition.
> Use `Grep` on the exact banner text below to jump to any section.

---

## Keeping This Doc Fresh

Update this file when any of the following changes:

- A new field is added to the **lesson schema** or **phrase schema**
- A new **`gen*` question-generator function** is added or renamed
- A new method is added to **`useStats`**
- A key is added to or renamed in the **`C` colour object**
- A new **top-level section banner** is added to App.jsx
- **`STORAGE_KEY`** changes

**Do NOT update** for: new lessons appended, lesson count changes, or phrase text edits.
`lesson-scout` tracks IDs and phrase content dynamically.

---

## A. Section Map

Grep the exact banner text to jump to any region of App.jsx.

| Banner (grep for this exact string)      | What lives here                                             |
|------------------------------------------|-------------------------------------------------------------|
| `// ─── LESSON DATA`                     | `BAND_LABELS`, `TRACKS[]`, `LESSONS[]`                      |
| `// ─── UTILITIES`                       | `getRecommendedNext()`, `shuffle()`, `normalize()`, `getPrevLesson()`, `isUnlocked()` |
| `// ─── STATS HOOK`                      | `STORAGE_KEY`, `loadStats()`, `saveStats()`, `useStats()`   |
| `// ─── QUESTION GENERATORS`             | All `gen*` functions, `generateQuestions()`                 |
| `// ─── STYLES`                          | `C` colour constants object                                 |
| `// ─── SPEECH UTILITY`                  | `speakHu()`, `SpeakBtn`, `useHuVoiceAvailable()` hook       |
| `// ─── SMALL COMPONENTS`               | `Header`, `ProgressBar`                                     |
| `// ─── QUIZ ENGINE`                    | `QuizEngine` component — question display, answer, feedback |
| `// ─── SCREENS`                        | `GrammarCard`, `BandReview`, `SettingsScreen`, `HomeScreen`, `TrackDetail` |
| `// ─── APP`                            | `App()` — navigation state (`screen`, `trackId`, `lessonId`, `remedialPhrases`, `reviewBand`, `runId`), screen routing |

---

## B. Lesson Schema

Fields marked **required** are checked by the `convention-reviewer` agent.

```js
{
  id:      number,    // stable integer, never reused; keyed in lessonScores
  trackId: string,    // matches a TRACKS[].id  e.g. "bath-time"
  band:    string,    // "A1" | "A2" | "B1" | "B2" | "C1"
  seq:     number,    // 1-based position within the band
  rung:    number,    // 1–7, the progression-ladder rung (see below); required
  title:   string,    // short display title
  sub:     string,    // subtitle for navigation context (optional)
  types:   string[],  // allowed question type names (see Section G)
  phrases: [
    { hu: "kád", pr: "kád", en: "bath" },
    // hu = Hungarian text   pr = pronunciation guide   en = English
    // All three fields required on every phrase object.
  ],
  tip:     string,    // optional teaching note for the parent
  grammar: string,    // optional grammar card text — B1+ only
}
```

### Rung — the progression ladder

Every lesson climbs one of seven rungs, from bare words to extended speech. `rung`
drives three things: `generateQuestions`' `fill_pool`/`fill_typed` routing (rungs 1–4 get
`fill_pool`, rungs 5–7 get `fill_typed` — see Section G), the shape rules enforced by
`npm run validate:curriculum` (`scripts/validate-curriculum.mjs`, config in
`scripts/curriculum.config.json`), and the human-readable rung name shown in-app.

| Rung | Name | Tokens/phrase | Question types allowed (R9) |
|------|------|----------------|------------------------------|
| 1 | Word | 1 | `match`, `phrase_list` |
| 2 | Marked word | 1–2 | `match`, `phrase_list` |
| 3 | Two-part phrase | 2–3 | `match`, `phrase_list`, `fill_pool` |
| 4 | Simple sentence | 3–5 | `match`, `phrase_list`, `fill_pool`, `sentence_builder`, `true_false` |
| 5 | Full sentence | 4–7 | + `fill_typed` |
| 6 | Linked sentence | 6–10 | + `fill_typed` |
| 7 | Extended speech | 8–14 | + `fill_typed` |

The validator also enforces: rung climbs by at most 1 per lesson and never falls back
(R2); rung sits inside its band's allowed range, e.g. A1 is rungs 1–3 (R8); each lesson's
carry-over (share of its phrases' lexemes already taught earlier in the same track) meets
the rung's minimum, and new-lexeme count stays within the rung's budget (R4/R5); and every
lexeme in a track's lexical spine (`scripts/curriculum.config.json` →
`tracks.<id>.spine`) appears in at least 3 lessons and reaches a lesson at rung ≥ 4 (R6/R7)
— a word taught as a bare noun must eventually be used in a sentence. Run
`npm run validate:curriculum -- --track <id> --verbose` for a per-lesson breakdown of
carry-over and new-lexeme counts when authoring. Only Bath Time has a spine defined today;
see `docs/specs/progression-ladder.md` for the full design.

**Append point for new lessons:** Grep for `// ─── UTILITIES` — the `];` immediately
before that banner closes the `LESSONS` array. Insert the new lesson object before it.

**IDs are permanent.** Never change an existing `id` value — they are keyed in localStorage.

---

## C. TRACKS Registry

```js
const TRACKS = [
  { id:"bath-time",     title:"Bath Time",              emoji:"🛁", color:"#4A9ECC" },
  { id:"bed-time",      title:"Bed Time",               emoji:"🌙", color:"#7B61C1" },
  { id:"getting-ready", title:"Getting Ready",          emoji:"🌅", color:"#E8913A" },
  { id:"mealtimes",     title:"Mealtimes",              emoji:"🍽️", color:"#3A8F6E" },
  { id:"school-run",    title:"School Run",             emoji:"🎒", color:"#C1513A" },
  { id:"park",          title:"Going to the Park",      emoji:"🌳", color:"#5C9E4A" },
  { id:"homework",      title:"Homework & School Prep", emoji:"📚", color:"#8F6E3A" },
  { id:"playing",       title:"Playing",                emoji:"🧩", color:"#C13A8F" },
];
```

Only `"bath-time"` has lesson content in v1. All others appear as locked placeholders.

---

## D. Stats / localStorage Schema

**Storage key:** `"magyar-otthon-stats-v2"` (constant `STORAGE_KEY`)

```js
{
  lastActiveLessonId: null,   // number | null — drives Recommended Next

  lessonScores: {
    "1": { best: 55, attempts: 2, passed: false, grammarSeen: false },
    // best      = highest raw score from any main-lesson attempt
    // passed    = true once lesson OR its Remedial scored ≥ 80%
    // grammarSeen = true once grammar card dismissed (skip on retry)
  },

  phraseScores: {
    "kád": { right: 3, wrong: 1, lastSeen: "2026-05-20", lastCorrect: "2026-05-20" },
    // keyed by phrase.hu
    // SRS: wrong >= 2 → flag; daysSince(lastSeen) >= 7 → queue
  },

  settings: { autoPlayAudio: true },   // see DEFAULT_SETTINGS
}
```

`loadStats()` merges the stored object over `defaultStats()`, and merges `settings` over
`DEFAULT_SETTINGS` key-by-key. New settings keys therefore need **no `STORAGE_KEY` bump** —
add the key to `DEFAULT_SETTINGS` and existing users pick up the default on next load.

---

## E. useStats Hook API

Call `useStats()` inside a component. Returns:

```js
const {
  stats,               // full stats object (see Section D)
  recordPhrase,        // (hu: string, correct: boolean) => void
  recordLesson,        // (id: number, score: number, total: number) => void
  markGrammarSeen,     // (id: number) => void
  markLessonPassed,    // (id: number) => void — Remedial pass; leaves best/attempts alone
  setLastActiveLesson, // (id: number) => void
  setSetting,          // (key: string, value: any) => void
  getWeakItems,        // (phrases: phrase[]) => phrase[]  — wrong >= right
} = useStats();
```

Never call `localStorage` directly — all persistence goes through `useStats`.

---

## F. Constants Reference

### Colour palette — `C` object (`// ─── STYLES` section)

```js
const C = {
  bg:     "#0F1117",  // page background (darkest)
  card:   "#161822",  // card / panel surface
  border: "#1E2030",  // subtle dividers
  text:   "#E8E6E1",  // primary body text
  sub:    "#7A7B8A",  // secondary / label text
  dim:    "#555668",  // muted / disabled
  green:  "#3A8F6E",  // correct / success
  red:    "#D94A4A",  // wrong / danger
  amber:  "#E8913A",  // warning / highlight
};
```

Always reference as `C.key` in style props. Raw hex anywhere else is a convention violation.

---

## G. Question Generator Interface

All generators live in the `// ─── QUESTION GENERATORS` section.

| Function | Signature | `type` field | Key return fields |
|----------|-----------|--------------|-------------------|
| `genTF` | `(p, all)` | `"true_false"` | `prompt` (hu), `promptPr`, `shown` (en string), `answer` (bool) |
| `genFill` | `(p, all)` | `"fill_pool"` | `prompt` (en), `display` (hu with blank), `answer` (word), `options[]`, `fullHu`, `pr` |
| `genMatch` | `(phrases)` | `"match"` | `pairs: [{hu, en}]` (4 pairs) |
| `genReconstruct` | `(p)` | `"sentence_builder"` | `en` (English prompt), `tiles[]` (shuffled), `correctTiles[]` |
| `genPhraseList` | `(p, all)` | `"phrase_list"` | `prompt` (hu, played as audio), `promptPr`, `answer` (hu), `options[]` (4 hu strings) |
| `genTyped` | `(p)` | `"fill_typed"` | `prompt` (en), `answer` (hu), `pr` |

All generators also return `phrase` — the source phrase object.

**Entry point** (the only function components should call):

```js
generateQuestions(lesson, weakItems, huVoiceAvail, count = 15, distractorPool = null)
// → question[] — shuffled, length = count
// phrases are drawn without replacement (a shuffled bag, reshuffled on exhaustion), a
// declined draw does not consume its phrase's turn, and no two adjacent questions share a
// phrase.hu — see peekPhrase()/build()/separateAdjacent() below
// weakItems are triple-weighted in the selection pool, so they cycle through the bag more often
// match is only generated when lesson.phrases.length >= 4; generated at most once per session
// true_false is removed and phrase_list added if huVoiceAvail === false
// fill_typed is replaced with fill_pool if lesson.rung <= 4 (routes by rung, not band)
// distractorPool (>= 4 phrases) supplies wrong-answer options; defaults to lesson.phrases
```

**No back-to-back repeats.** `generateQuestions` draws phrases from a shuffled "bag"
(`peekPhrase()`, cursor `bi` over `shuffle(pool)`, reshuffled when the cursor runs past the
end) instead of sampling `pool[random]` with replacement — every phrase in the pool is used
once before any repeats. The `build(type)` helper wraps the draw: it only advances `bi`
(commits the phrase) when the generator actually produces a question, so a declined draw
(most commonly `match` after its first use) does not burn that phrase's turn — an earlier
version advanced the cursor unconditionally and could drop a phrase from the run entirely.
`match` is generated without a draw at all, since `genMatch` ignores the phrase argument and
picks its own four phrases.

After building and shuffling the question array, `separateAdjacent()` (next to `shuffle()`
in `// ─── UTILITIES`) rebuilds the order from scratch — greedily placing, at each step, the
phrase with the most questions left that isn't the phrase just placed — rather than trying
to swap individual collisions. `match` questions have no adjacency key (their `phrase` field
is only the first of their four pairs) and are held aside as filler that resets the
"just placed" phrase, so a match can separate two instances of the same phrase. This has no
last-index blind spot (an earlier swap-based version did, since a collision at the final
index has nothing later to swap with) — it fails to fully separate only when one phrase
holds more than half the run's slots, which is exactly the intended one-phrase Remedial
case: it hammers that phrase by design rather than looping forever.

**Narrow pools.** Remedial and Band Review pass a small `lesson.phrases` (as few as one
phrase) with the full lesson as `distractorPool`. Questions come from the narrow pool;
options come from the wide one. Without this split, `genPhraseList` yields a single option
and `genFill` has no distractors. Any new generator that builds options from its `all`
argument must receive `dis`, not `all`.

**Every type may decline.** `genMatch` (< 4 phrases), `genFill` (single-word phrase), and
`genReconstruct` (outside 3–7 words) return `null`. `generateQuestions` falls back to
`genPhraseList` / `genTyped` — which never decline — if nothing else produced a question.
Keep that fallback if you touch the selection loop; without it a narrow pool can yield an
empty question array and crash `QuizEngine`.

**Never** call `gen*` functions directly from components. All quiz question creation goes
through `generateQuestions`.

**Generators decline silently, so declaring a type does not mean it will appear.** If you
add a generator or change a length constraint, `npm run validate:curriculum` rule R10 will
catch lessons whose declared types can no longer be built — it runs the real
`generateQuestions` per lesson and fails any type that never surfaces. Run it after any
change to this section.

---

## H. Unlock Logic

```js
getPrevLesson(lesson)  // → lesson | null — finds the immediately preceding lesson in track
isUnlocked(lesson, lessonScores)  // → boolean — true if prev is null OR prev.passed
```

Band order for crossing band boundaries: `A1 → A2 → B1 → B2 → C1` (the `BANDS` constant).
The first lesson of A1 in any track is always unlocked.

### Band helpers (`// ─── UTILITIES`)

```js
getBandLessons(trackId, band)        // → lesson[] sorted by seq
getBandTypes(trackId, band)          // → string[] — union of the band's question types
isLastLessonOfBand(lesson)           // → boolean — drives the Band Review offer
getNextBand(lesson)                  // → band | null — null at the track's final band
getBandReviewItems(trackId, band, phraseScores, count = 5)  // → phrase[], hardest first
```

---

## I. Workflow Cheat-Sheet

### Add a lesson

1. Run **lesson-scout** agent → confirms next available ID, flags any duplicate phrases
2. Grep `// ─── UTILITIES` → the `];` immediately before that banner closes `LESSONS[]`
3. `Edit` App.jsx — insert the new lesson object before that `];`
4. Update **Section C** of this doc if a new track is added

### Add a quiz type

1. Grep `// ─── QUESTION GENERATORS`
2. Add a new `gen*` function (must return `{type, phrase, ...}`)
3. Add the new type to the `gen()` dispatch inside `generateQuestions`
4. Handle the new `type` in the `QuizEngine` component (`// ─── QUIZ ENGINE`)
5. Update **Section G** of this doc

### QuizEngine modes

`QuizEngine` runs in three modes, set by the `mode` prop:

| mode | count | Pool | On completion |
|------|-------|------|---------------|
| `"lesson"` (default) | 15 | `lesson.phrases`, weak items triple-weighted | `recordLesson()` |
| `"remedial"` | 8 | `pool` — phrases missed in the failed attempt | `markLessonPassed()` at ≥ 80% only |
| `"review"` | 5 | `pool` — `getBandReviewItems()` | nothing written; advisory |

Remedial and Band Review write `phraseScores` per answer like any other question. Neither
creates a `lessonScores` entry. Remedial state lives in `App()` React state only — it is
never persisted, so a reload returns to the parent lesson.

### Add a stat field

1. Grep `// ─── STATS HOOK`
2. Add the field to the default object in `loadStats()`
3. Add or update a method in `useStats()`; expose it in the return object if callers need it
4. Update **Sections D and E** of this doc

### Add a setting

1. Add the key to `DEFAULT_SETTINGS` (`// ─── STATS HOOK`) — no `STORAGE_KEY` bump needed
2. Read it as `stats.settings.<key>`; write it with `setSetting(key, value)`
3. Add a control to `SettingsScreen` (`// ─── SCREENS`)
4. Update **Section D** of this doc
