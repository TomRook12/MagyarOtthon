# Spec: Rewrite — Foundation

> **Status:** Done
> **Branch:** `feature/rewrite-foundation`

## Goal

Replace the existing phase/lesson model with the new Track > Band > Lesson architecture. By the end of this spec the app can run a complete Bath Time A1 lesson end-to-end. All legacy content and retired components are gone.

## Background

A new PRD (May 2026) redefines the app as a CEFR-structured curriculum of topic Tracks. All design decisions are captured in `CONTEXT.md` and `docs/adr/0001–0004`. This spec implements the foundational layer — data constants, stats schema, and quiz engine — plus Bath Time A1 content as the first vertical slice. Navigation, full results screen, grammar cards, and remaining Bath Time content follow in subsequent specs.

Reference: `C:\Users\tomro\Downloads\hungarian-app-prd.md` (PRD), especially Sections 5–10 (model) and 13 (Bath Time content).

---

## Requirements

### Must have

**Data constants**
- [ ] `TRACKS[]` constant defined (8 tracks; see Design section)
- [ ] All legacy content removed: `PHASES[]`, `LESSONS[]` ids 1–94, `STORIES[]`
- [ ] All legacy scheduling constants removed: `TIME_TAGS`, `WEEKEND_BOOST`, `WEEKDAY_BOOST`
- [ ] New `LESSONS[]` using the schema: `{id, trackId, band, seq, title, sub, types, phrases, tip, grammar?}`
- [ ] Bath Time A1 lessons authored (ids 1–4; see Design section)

**Stats schema**
- [ ] `STORAGE_KEY` = `"magyar-otthon-stats-v2"`
- [ ] `loadStats()` default object rewritten (see Design section)
- [ ] `useStats()` updated: `recordPhrase`, `recordLesson`, `markGrammarSeen`, `setLastActiveLesson`, `getWeakItems`
- [ ] Retired stat methods removed: `setDailyGoal`, streak tracking, `todayMins`, `totalTime`/`todayTime`

**Quiz engine**
- [ ] `genPhraseList(p, all)` — new generator: 4 written options, answer = phrase heard via TTS
- [ ] `genTyped(p)` — new generator: free-text Hungarian input (B1+)
- [ ] `generateQuestions(lesson, weakItems)` uses `lesson.types[]` as the allowed-type pool
- [ ] Band-aware fill routing: `fill_pool` (A1/A2) vs `fill_typed` (B1+) — `generateQuestions` resolves this from `lesson.band`
- [ ] `normalize(str, accentSensitive)` — second boolean parameter; insensitive at A1/A2, sensitive B1+
- [ ] True/False → Phrase List fallback: if `!huVoiceAvailable`, exclude `true_false` from pool and add `phrase_list`
- [ ] `QuizEngine` handles all 6 question types including the two new ones

**Retired components removed**
- [ ] `GoalRing`, `DailyFocusCard`, `getDailyFocus()`
- [ ] `ReviewDueCard`
- [ ] `StatsView`
- [ ] `FeedbackModal`, `FEEDBACK_CATEGORIES`
- [ ] `StoryView`, `ListenView`
- [ ] `FlashView`, `PhraseView` (lesson browse tabs)
- [ ] `SRS_MAX_INTERVAL`, `schedulePhraseReview()`, `getDuePhrases()`
- [ ] `getWeeklyPattern()`

**Minimal working lesson flow (scaffolding)**
- [ ] `App()` routes: home (flat lesson list) → `QuizEngine` → basic score display
- [ ] Tapping a lesson starts the quiz directly (no browse/tabs)
- [ ] On quiz complete: show score %, pass/fail label, and a "Back" button
- [ ] `recordLesson()` called on completion; `phraseScores` updated per answer
- [ ] `docs/app-map.md` updated to reflect new schema and section layout

### Nice to have
- [ ] Lock icon on lessons whose predecessor is not yet passed (visual only — no hard gate in this spec)

### Out of scope
- Full home screen (Recommended Next card + Track list with progress bars) — next spec
- Track Detail screen — next spec
- Grammar Card screen — next spec
- Full Results Screen (missed questions review) — next spec
- Remedial Quiz — next spec
- Band Review — next spec
- Bath Time A2–C1 content (ids 5–21) — next spec

---

## Design

### `TRACKS[]`

```js
const TRACKS = [
  { id: "bath-time",     title: "Bath Time",              emoji: "🛁", color: "#4A9ECC" },
  { id: "bed-time",      title: "Bed Time",               emoji: "🌙", color: "#7B61C1" },
  { id: "getting-ready", title: "Getting Ready",          emoji: "🌅", color: "#E8913A" },
  { id: "mealtimes",     title: "Mealtimes",              emoji: "🍽️", color: "#3A8F6E" },
  { id: "school-run",    title: "School Run",             emoji: "🎒", color: "#C1513A" },
  { id: "park",          title: "Going to the Park",      emoji: "🌳", color: "#5C9E4A" },
  { id: "homework",      title: "Homework & School Prep", emoji: "📚", color: "#8F6E3A" },
  { id: "playing",       title: "Playing",                emoji: "🧩", color: "#C13A8F" },
];
```

### New `LESSONS[]` schema

```js
{
  id:      number,    // stable integer, never reused; keyed in lessonScores
  trackId: string,    // matches a TRACKS[].id
  band:    string,    // "A1" | "A2" | "B1" | "B2" | "C1"
  seq:     number,    // 1-based position within the band
  title:   string,
  sub:     string,    // optional subtitle for navigation context
  types:   string[],  // allowed question types (see below)
  phrases: [{ hu, pr, en }],
  tip:     string,    // optional teaching note
  grammar: string,    // optional grammar card text — B1+ only
}
```

Valid `types` values: `"match"`, `"phrase_list"`, `"fill_pool"`, `"fill_typed"`, `"sentence_builder"`, `"true_false"`.

### Bath Time A1 lessons

```js
{ id:1, trackId:"bath-time", band:"A1", seq:1,
  title:"Bath Time Objects", sub:"kád · víz · szappan · sampon",
  types:["match","phrase_list"],
  phrases:[
    {hu:"kád",       pr:"kád",         en:"bath"},
    {hu:"víz",       pr:"víz",         en:"water"},
    {hu:"szappan",   pr:"SOP-pon",     en:"soap"},
    {hu:"sampon",    pr:"SHOM-pon",    en:"shampoo"},
    {hu:"törölköző", pr:"tö-röl-kö-ző",en:"towel"},
    {hu:"kacsa",     pr:"KO-cho",      en:"duck"},
    {hu:"csap",      pr:"chop",        en:"tap"},
    {hu:"buborék",   pr:"BU-bo-rék",   en:"bubble"},
  ],
  tip:"Repeat the word as you point to each object at bath time." },

{ id:2, trackId:"bath-time", band:"A1", seq:2,
  title:"Body Parts", sub:"haj · fül · kéz · láb",
  types:["match","phrase_list","fill_pool"],
  phrases:[
    {hu:"haj",  pr:"hoy",  en:"hair"},
    {hu:"fül",  pr:"fül",  en:"ear"},
    {hu:"kéz",  pr:"kéz",  en:"hand"},
    {hu:"láb",  pr:"láb",  en:"foot"},
    {hu:"arc",  pr:"orts", en:"face"},
    {hu:"has",  pr:"hosh", en:"tummy"},
    {hu:"ujj",  pr:"uy",   en:"finger"},
    {hu:"hát",  pr:"hát",  en:"back"},
  ],
  tip:"Point to each body part as you wash it. 'Hol a füled?' then touch the ear." },

{ id:3, trackId:"bath-time", band:"A1", seq:3,
  title:"Single-Word Commands", sub:"Gyere! · Fel! · Ki! · Be!",
  types:["true_false","phrase_list"],
  phrases:[
    {hu:"Gyere!", pr:"DYE-re", en:"Come!"},
    {hu:"Állj!",  pr:"állj",   en:"Stop!"},
    {hu:"Fel!",   pr:"fel",    en:"Up!"},
    {hu:"Ki!",    pr:"ki",     en:"Out!"},
    {hu:"Be!",    pr:"be",     en:"In!"},
    {hu:"Csitt!", pr:"chitt",  en:"Shh!"},
  ],
  tip:"These are the natural shortened imperative forms parents use with young children. Use one every bath time." },

{ id:4, trackId:"bath-time", band:"A1", seq:4,
  title:"First Full Phrases", sub:"Gyere a kádba! · Kész vagyunk.",
  types:["sentence_builder","fill_pool"],
  phrases:[
    {hu:"Gyere a kádba!",  pr:"DYE-re o KÁD-bo",     en:"Come into the bath!"},
    {hu:"Jó meleg víz.",   pr:"yó ME-leg víz",        en:"Nice warm water."},
    {hu:"Kész vagyunk.",   pr:"kés VO-dyunk",         en:"We're done."},
    {hu:"Gyorsan, gyorsan!",pr:"DYOR-shon DYOR-shon", en:"Quick, quick!"},
    {hu:"Mindjárt kész.",  pr:"MIND-yárt kés",        en:"Nearly done."},
  ],
  tip:"Treat each phrase as a memorised chunk — do not try to break it apart yet." },
```

### Stats schema v2

```js
// STORAGE_KEY = "magyar-otthon-stats-v2"
{
  lastActiveLessonId: null,          // number | null

  lessonScores: {
    "1": { best: 55, attempts: 2, passed: false, grammarSeen: false },
  },

  phraseScores: {
    "kád": { right: 3, wrong: 1, lastSeen: "2026-05-20", lastCorrect: "2026-05-20" },
  },
}
```

### `useStats()` API changes

| Method | Signature | Notes |
|---|---|---|
| `recordPhrase` | `(hu: string, correct: boolean) => void` | Updates `right`/`wrong`, `lastSeen`, `lastCorrect` |
| `recordLesson` | `(id: number, score: number, total: number) => void` | Updates `best`, `attempts`; sets `passed: true` if score/total ≥ 0.8 |
| `markGrammarSeen` | `(id: number) => void` | Sets `lessonScores[id].grammarSeen = true` |
| `setLastActiveLesson` | `(id: number) => void` | Sets `lastActiveLessonId` |
| `getWeakItems` | `(phrases: phrase[]) => phrase[]` | Returns phrases where `wrong >= right` |

Removed from hook: `setDailyGoal`, `startTimer`, `stopTimer`, `todayMins`, `sessionsCompleted`, streak methods.

### Quiz engine changes

**`generateQuestions(lesson, weakItems, count = 15)`**

1. Start with `allowedTypes = [...lesson.types]`
2. If `lesson.band` is `"A1"` or `"A2"`: replace any `"fill_typed"` with `"fill_pool"` in the pool (defensive — should never be authored that way, but safe)
3. If `!huVoiceAvailable`: remove `"true_false"` from pool; if pool is now empty or `"true_false"` was the only type, add `"phrase_list"`
4. `weakItems` are triple-weighted in the selection pool (same as current behaviour)
5. `match` is only generated when `lesson.phrases.length >= 4`

**`normalize(str, accentSensitive = false)`**

When `accentSensitive` is false (default, used at A1/A2): strip diacritics before comparison. When true (B1+): compare exact. The `accentSensitive` flag should be `lesson.band` ∈ `["B1","B2","C1"]`.

**`genPhraseList(p, all)`** — new

Returns `{ type: "phrase_list", phrase: p, prompt: p.hu, promptPr: p.pr, answer: p.en, options: [p.en, ...3 distractors] }`. Audio plays `p.hu` on question load. Distractors drawn from `all` (other phrases in lesson), shuffled.

**`genTyped(p)`** — new

Returns `{ type: "fill_typed", phrase: p, prompt: p.en, answer: p.hu, pr: p.pr }`. User types the Hungarian. Evaluated with `normalize(input, true)` vs `normalize(answer, true)`.

### Minimal home screen (scaffolding — replaced in next spec)

A flat scrollable list of all lessons grouped by `trackId`. No lock state, no progress bars, no Recommended Next card. Each lesson shows `band + seq` label, `title`, and best score if available. Tapping opens `QuizEngine` directly.

---

## Implementation tasks

### Data constants
- [x] Define `TRACKS[]` (8 entries as above)
- [x] Remove `PHASES[]`, all `LESSONS[]` ids 1–94, `STORIES[]`
- [x] Remove `TIME_TAGS`, `WEEKEND_BOOST`, `WEEKDAY_BOOST`
- [x] Add new `LESSONS[]` with Bath Time A1 lessons 1–4

### Stats + hook
- [x] Set `STORAGE_KEY = "magyar-otthon-stats-v2"`; rewrite `loadStats()` default object
- [x] Rewrite `recordPhrase()` for new `phraseScores` schema (`right`, `wrong`, `lastSeen`, `lastCorrect`)
- [x] Rewrite `recordSession()` → `recordLesson(id, score, total)` — writes `best`, `attempts`, `passed`
- [x] Add `markGrammarSeen(id)` to `useStats`
- [x] Add `setLastActiveLesson(id)` to `useStats`
- [x] Rename `getWeakPhrases` → `getWeakItems`; remove retired methods (`setDailyGoal`, streak tracking, timers)

### Quiz engine
- [x] Add `genPhraseList(p, all)` generator
- [x] Add `genTyped(p)` generator
- [x] Update `generateQuestions()`: use `lesson.types[]`, band-aware fill routing, TTS fallback logic
- [x] Update `normalize()` to accept `accentSensitive` boolean
- [x] Add `phrase_list` and `fill_typed` render branches in `QuizEngine`

### Retired code removal
- [x] Remove `GoalRing`, `DailyFocusCard`, `getDailyFocus()`
- [x] Remove `ReviewDueCard`
- [x] Remove `StatsView`
- [x] Remove `FeedbackModal`, `FEEDBACK_CATEGORIES`
- [x] Remove `StoryView`, `ListenView`
- [x] Remove `FlashView`, `PhraseView` and all lesson-tab logic
- [x] Remove `SRS_MAX_INTERVAL`, `schedulePhraseReview()`, `getDuePhrases()`
- [x] Remove `getWeeklyPattern()`

### Minimal UI + app wiring
- [x] Rewrite `App()`: home (scaffolding list) → `QuizEngine` → basic score display
- [x] `QuizEngine` calls `setLastActiveLesson(id)` on lesson start
- [x] `QuizEngine` calls `recordLesson()` and `recordPhrase()` on completion
- [x] Basic results: score %, pass/fail, "Back to lessons" button
- [x] Update `docs/app-map.md`: new section banners, lesson schema, stats schema, generator table

---

## Open questions

- Pronunciation guide accuracy — the `pr` values above are approximations. A native-speaker review of A1 content is planned pre-release (PRD Section 12) but is not a blocker for this spec.

---

## Acceptance criteria

- [ ] `npm run build` passes with no errors or warnings
- [ ] Bath Time Lesson 1.1 can be opened and completed end-to-end (all questions answered, score shown)
- [ ] Bath Time Lesson 1.4 uses `sentence_builder` and `fill_pool` — both render correctly
- [ ] Answering a question correctly increments `phraseScores[hu].right`; incorrectly increments `.wrong`
- [ ] Completing a lesson at ≥ 80% sets `lessonScores[id].passed = true`
- [ ] Completing at < 80% leaves `passed: false`
- [ ] If TTS is unavailable, no `true_false` questions appear in any lesson session
- [ ] No references to `PHASES`, `TIME_TAGS`, `GoalRing`, `StatsView`, `StoryView`, or `getDailyFocus` remain in `App.jsx`
- [ ] `docs/app-map.md` reflects the new schema accurately
