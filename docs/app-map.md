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
| `// ─── LESSON DATA`                     | `TRACKS[]`, `LESSONS[]`                                     |
| `// ─── UTILITIES`                       | `shuffle()`, `normalize()`, `getPrevLesson()`, `isUnlocked()` |
| `// ─── STATS HOOK`                      | `STORAGE_KEY`, `loadStats()`, `saveStats()`, `useStats()`   |
| `// ─── QUESTION GENERATORS`             | All `gen*` functions, `generateQuestions()`                 |
| `// ─── STYLES`                          | `C` colour constants object                                 |
| `// ─── SPEECH UTILITY`                  | `speakHu()`, `SpeakBtn`, `useHuVoiceAvailable()` hook       |
| `// ─── SMALL COMPONENTS`               | `Header`, `ProgressBar`                                     |
| `// ─── QUIZ ENGINE`                    | `QuizEngine` component — question display, answer, feedback |
| `// ─── APP`                            | `App()` — navigation state, screen routing, home screen     |

---

## B. Lesson Schema

Fields marked **required** are checked by the `convention-reviewer` agent.

```js
{
  id:      number,    // stable integer, never reused; keyed in lessonScores
  trackId: string,    // matches a TRACKS[].id  e.g. "bath-time"
  band:    string,    // "A1" | "A2" | "B1" | "B2" | "C1"
  seq:     number,    // 1-based position within the band
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
}
```

---

## E. useStats Hook API

Call `useStats()` inside a component. Returns:

```js
const {
  stats,               // full stats object (see Section D)
  recordPhrase,        // (hu: string, correct: boolean) => void
  recordLesson,        // (id: number, score: number, total: number) => void
  markGrammarSeen,     // (id: number) => void
  setLastActiveLesson, // (id: number) => void
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
generateQuestions(lesson, weakItems, huVoiceAvail, count = 15)
// → question[] — shuffled, length = count
// weakItems are triple-weighted in the selection pool
// match is only generated when lesson.phrases.length >= 4; generated at most once per session
// true_false is removed and phrase_list added if huVoiceAvail === false
// fill_typed is replaced with fill_pool if lesson.band is A1 or A2
```

**Never** call `gen*` functions directly from components. All quiz question creation goes
through `generateQuestions`.

---

## H. Unlock Logic

```js
getPrevLesson(lesson)  // → lesson | null — finds the immediately preceding lesson in track
isUnlocked(lesson, lessonScores)  // → boolean — true if prev is null OR prev.passed
```

Band order for crossing band boundaries: `A1 → A2 → B1 → B2 → C1`.
The first lesson of A1 in any track is always unlocked.

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

### Add a stat field

1. Grep `// ─── STATS HOOK`
2. Add the field to the default object in `loadStats()`
3. Add or update a method in `useStats()`; expose it in the return object if callers need it
4. Update **Sections D and E** of this doc
