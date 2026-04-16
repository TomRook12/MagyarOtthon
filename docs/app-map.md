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
- **`TIME_TAGS`, `WEEKEND_BOOST`, or `WEEKDAY_BOOST`** values change
- A key is added to or renamed in the **`C` colour object**
- A new **top-level section banner** is added to App.jsx
- **`STORAGE_KEY`** or **`SRS_MAX_INTERVAL`** constants change

**Do NOT update** for: new lessons appended, lesson count changes, or phrase text edits.
`lesson-scout` tracks IDs and phrase content dynamically.

The `convention-reviewer` agent flags structural changes at commit time as a reminder.

---

## A. Section Map

Grep the exact banner text to jump to any region of App.jsx.

| Banner (grep for this exact string)      | What lives here                                             |
|------------------------------------------|-------------------------------------------------------------|
| `// ─── LESSON DATA`                     | `PHASES[]`, `TIME_TAGS`, boost arrays, `LESSONS[]`          |
| `// ─── STORIES DATA`                    | `STORIES[]` — comprehensible input stories with sentences and glossary |
| `// ─── UTILITIES`                       | `shuffle()`, `normalize()`, `getWeeklyPattern()`            |
| `// ─── DAILY FOCUS ENGINE`              | `getDailyFocus(stats)` — lesson scoring & ranking           |
| `// ─── STATS HOOK`                      | `STORAGE_KEY`, `loadStats()`, `saveStats()`, `useStats()`   |
| `// ─── SRS UTILITIES`                   | `SRS_MAX_INTERVAL`, `schedulePhraseReview()`, `getDuePhrases()` |
| `// ─── QUESTION GENERATORS`             | All `gen*` functions, `generateQuestions()`                 |
| `// ─── STYLES`                          | `C` colour constants object                                 |
| `// ─── SPEECH UTILITY`                  | `speakHu()`, `SpeakBtn`, `useHuVoiceAvailable()` hook       |
| `// ─── FEEDBACK MODAL`                  | `FEEDBACK_CATEGORIES`, `FeedbackModal` component            |
| `// ─── SMALL COMPONENTS`               | `Header`, `ProgressBar`, `Badge`                            |
| `// ─── GOAL RING`                       | `GoalRing` component                                        |
| `// ─── DAILY FOCUS CARD`               | `DailyFocusCard` component                                  |
| `// ─── REVIEW DUE CARD`                | `ReviewDueCard` component                                   |
| `// ─── GOAL SETTINGS MODAL`            | `GoalSettings` component                                    |
| `// ─── STATS DASHBOARD`                | `StatsView` component                                       |
| `// ─── QUIZ ENGINE`                    | `QuizEngine` component — question display, answer, feedback |
| `// ─── PHRASE & FLASH VIEWS`           | `ShadowBtn`, `PhraseView()`, `FlashView()`, `ListenView()`, `StoryView()` |
| `// ─── REVIEW DUE QUIZ`               | `ReviewDueQuiz` component — cross-lesson SRS review         |
| `// ─── LESSON VIEW`                    | `LessonView` component — phrases / flash / quiz tabs        |
| `// ─── APP`                            | `App()` — navigation state, screen routing, home screen     |

---

## B. Lesson Schema

Fields marked **required** are checked by the `convention-reviewer` agent.

```js
{
  id: 75,                    // integer — stable forever, never reuse; ask lesson-scout for next ID
  phase: 1,                  // 1–11 matching PHASES[] ids
  title: "Example Lesson",   // short display title
  sub: "Topic · Detail",     // subtitle, topics separated by ·
  aud: "kids",               // "kids" | "wife" | "both"
  phrases: [
    { hu: "Jó reggelt!", pr: "Yó reg-gelt", en: "Good morning!" },
    //  hu = Hungarian text   pr = pronunciation guide   en = English
    //  All three fields required on every phrase object.
  ],
  tip: "Teaching note for the parent — 1–2 sentences.",
  // --- optional ---
  pat: "-tál = past tense 'you did'",  // grammar note; use \n for multi-line tables
  patternId: "past-indef",             // grammar paradigm tag (e.g. "dative", "past-indef")
}
```

**Append point for new lessons:** Grep for `// ─── UTILITIES` — the `];` immediately
before that banner closes the `LESSONS` array. Insert the new lesson object before it.

**IDs are permanent.** Never change an existing `id` value — they are keyed in localStorage.

---

## C. Time-of-Day & Scheduling Data

These arrays live at the top of the `// ─── LESSON DATA` section. They drive which lessons
the Daily Focus Engine recommends. When adding lessons, decide which slots they belong in
and add their IDs here — then update this section of the doc.

```js
const TIME_TAGS = {
  morning:   [1,2,3,4,5,6,40,49,51,55],
  midday:    [7,8,9,10,11,12,13,14,21,22,23,24,25,42,48,53,54],
  afternoon: [15,16,17,18,19,20,26,27,28,29,41,42,43,44,50,52,56],
  evening:   [30,31,32,33,34,35,45,46,63,64,65,66,67,68,69,70,71,72,73,74],
};
const WEEKEND_BOOST = [9,10,12,15,16,17,19,20,26,27,28,42,43,44,69,73];
const WEEKDAY_BOOST = [1,2,3,4,5,7,8,11,13,23];
```

For deeper explanation of how these interact with scoring weights, use the
`quiz-engine-explorer` agent.

---

## D. Stats / localStorage Schema

**Storage key:** `"magyar-otthon-stats-v1"` (constant `STORAGE_KEY`)

```js
{
  totalTime: 0,              // cumulative seconds across all sessions
  todayTime: 0,              // seconds today — resets when todayDate changes
  todayDate: "Mon Apr 14…",  // new Date().toDateString() — day-change detection
  sessionsCompleted: 0,      // total quiz sessions finished
  streakDays: [],            // array of toDateString() values, one per day practiced
  lastActive: null,          // toDateString() of last completed session
  dailyGoal: 15,             // daily target in minutes (default 15)

  lessonScores: {
    "42": { best: 87, attempts: 3 },  // keyed by String(lesson.id)
  },

  phraseScores: {
    "Jó reggelt!": {         // keyed by phrase.hu
      right: 5,              // total correct answers
      wrong: 1,              // total wrong answers
      ease: 2.5,             // SM-2 ease factor, range 1.3–3.0
      interval: 7,           // days until next review (max: SRS_MAX_INTERVAL = 60)
      due: "2026-04-20",     // ISO date string (YYYY-MM-DD)
      lastSeen: "2026-04-13",
    },
  },
}
```

---

## E. useStats Hook API

Call `useStats()` inside a component. Returns:

```js
const {
  stats,          // full stats object (see Section D)
  startTimer,     // () => void         — call when lesson begins
  stopTimer,      // () => number       — call when lesson ends; returns elapsed seconds
  recordPhrase,   // (phraseHu: string, correct: boolean) => void
  recordSession,  // (lessonId: number, score: number, total: number) => void
  getWeakPhrases, // (lessonPhrases: phrase[]) => phrase[]  — wrong >= right
  setDailyGoal,   // (mins: number) => void
  todayMins,      // number (derived)   — minutes practiced today; 0 if different day
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

### Other constants

```js
const STORAGE_KEY     = "magyar-otthon-stats-v1";
const SRS_MAX_INTERVAL = 60;   // days — maximum SRS review interval
```

---

## G. Question Generator Interface

All generators live in the `// ─── QUESTION GENERATORS` section.

| Function | Signature | `type` field | Key return fields |
|----------|-----------|--------------|-------------------|
| `genMC_EnToHu` | `(p, all)` | `"mc_en_hu"` | `prompt` (en), `answer` (hu), `options[]`, `pr` |
| `genMC_HuToEn` | `(p, all)` | `"mc_hu_en"` | `prompt` (hu), `promptPr`, `answer` (en), `options[]` |
| `genType`      | `(p)`      | `"type"`     | `prompt` (en), `answer` (hu), `pr` |
| `genTF`        | `(p, all)` | `"tf"`       | `prompt` (hu), `promptPr`, `shown` (en string), `answer` (bool) |
| `genFill`      | `(p)`      | `"fill"`     | `prompt` (en), `display` (hu with blank), `answer` (word), `fullHu`, `pr` |
| `genMatch`     | `(phrases)`| `"match"`    | `pairs: [{hu, en}]` (4 pairs) |
| `genReconstruct` | `(p)`    | `"reconstruct"` | `en` (English prompt), `tiles[]` (shuffled), `correctTiles[]`, skips phrases < 3 or > 7 words |

All generators also return `phrase` — the source phrase object.

**Entry point** (the only function components should call):

```js
generateQuestions(lesson, weakPhrases, count = 15)
// → question[] — shuffled, length = count
// weakPhrases are triple-weighted in the selection pool
// match is only generated when lesson.phrases.length >= 4
```

**Never** call `gen*` functions directly from components. All quiz question creation goes
through `generateQuestions`.

---

## H. Workflow Cheat-Sheet

### Add a lesson

1. Run **lesson-scout** agent → confirms next available ID, flags any duplicate phrases
2. Grep `// ─── UTILITIES` → the `];` immediately before that banner closes `LESSONS[]`
3. `Edit` App.jsx — insert the new lesson object before that `];`
4. Decide which time slots apply → add lesson ID to `TIME_TAGS` and/or boost arrays
5. Update **Section C** of this doc if TIME_TAGS / boost arrays changed

### Add a quiz type

1. Grep `// ─── QUESTION GENERATORS`
2. Add a new `gen*` function following existing patterns (must return `{type, phrase, ...}`)
3. Add the new type string to the `types` array inside `generateQuestions`
4. Add a dispatch branch in the `for` loop and the fill-up `while` loop
5. Handle the new `type` in the `QuizEngine` component (`// ─── QUIZ ENGINE`)
6. Update **Section G** of this doc

### Add a stat field

1. Grep `// ─── STATS HOOK`
2. Add the field to the default object in `loadStats()`
3. Add or update a method in `useStats()`; expose it in the return object if callers need it
4. Update **Sections D and E** of this doc

### Streaming-error mitigation

> Use `Edit` for all targeted insertions and replacements.  
> Break large LESSONS additions into ≤ 40-line edits — never rewrite a whole array block.  
> Never use `Write` to overwrite the full App.jsx (1,475+ lines causes streaming failures).
