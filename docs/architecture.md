# Architecture

## Overview

Magyar Otthon is a **single-file React app**. All lesson data, business logic, and UI live in `src/App.jsx`. This is intentional — the app is small, the deployment target is a static host, and keeping everything in one file makes offline reading and AI-assisted editing straightforward.

## Data model

```
PHASES[]          — 11 thematic groups (Morning, Going Out, Playing, Food, Reading, Bath & Bed, End of Day, Toolkit, Reasoning, Stories, Plans & What-ifs)
LESSONS[]         — 92 lesson objects, each belonging to one phase
  └─ phrases[]    — array of { hu, pr, en } (Hungarian, pronunciation, English)
STORIES[]         — 10 short narrative stories for comprehensible input (read-only, no quiz)
  └─ sentences[]  — array of { hu, en }
  └─ glossary[]   — array of { hu, pr, en } for new vocabulary items per story
```

Each lesson also has:
- `aud` — target audience: `"kids"`, `"wife"`, or `"both"`
- `tip` — a short teaching note
- `pat` — optional grammar pattern note; if it contains `\n`, it is rendered as `<pre>`-style preformatted text in the lesson view so paradigm tables stay aligned
- `patternId` — optional string tag naming the grammar paradigm the lesson drills (e.g. `"past-indef"`, `"dative"`, `"conditional"`). Present on paradigm-anchored lessons (ids 45–56 and the merged lesson 32) distributed across phases 1–8, on all Phase 9–10 lessons (ids 57–68), on all Phase 11 lessons (ids 69–74), and on lesson 89 (`"formal-register"`). Lessons without this field are unaffected.

## State

All runtime state lives in two places:

| Location | What |
|----------|------|
| React `useState` | UI state — current screen, selected lesson, active question, etc. |
| `localStorage` | Persisted stats via the `useStats` hook |

`useStats` exposes: `recordPhrase`, `recordSession`, `startTimer`, `stopTimer`, `getWeakPhrases`, `setDailyGoal`.

Stats schema (key: `"magyar-otthon-stats-v1"`):
```js
{
  totalTime,       // seconds
  todayTime,       // seconds today
  todayDate,       // toDateString() of last active day
  streakDays,      // ["Mon Jan 01 2025", …]
  lessonScores,    // { lessonId: { best, attempts } }
  phraseScores,    // { huText: { right, wrong, ease, interval, due, lastSeen } }
  dailyGoal,       // minutes
}
```

`phraseScores` entry fields:
| Field | Type | Description |
|-------|------|-------------|
| `right` | number | Correct answer count |
| `wrong` | number | Incorrect answer count |
| `ease` | number | SM-2 ease factor (starts 2.5, min 1.3, max 3.0) |
| `interval` | number | Days until next review |
| `due` | string | ISO date (`"YYYY-MM-DD"`) when phrase is next due |
| `lastSeen` | string | ISO date of last review |

On first load with old data (missing `ease`), `loadStats()` migrates all entries automatically, setting `due` to today so they enter the review queue immediately. Max interval is capped at 60 days.

## Daily Focus Engine

`getDailyFocus(stats)` scores every lesson based on:
1. **Time of day** — `TIME_TAGS` maps hour ranges to lesson IDs
2. **Day of week** — `WEEKEND_BOOST` / `WEEKDAY_BOOST` arrays
3. **Weakness** — phrase error rate from `phraseScores`
4. **Recency** — lessons not recently attempted score higher
5. **SRS due count** — lessons with 2+ due phrases score +2; 5+ due phrases score +4

Returns up to 3 top-scored lessons (max 2 per phase) with human-readable reason strings.

## Engine depth features (Milestone 5)

### Story cards

`STORIES[]` holds 10 short family narratives (8–15 sentences). Stories are read-only — no SRS, no scoring. They appear in a "Stories" section on the home screen once the learner has attempted ≥ 20 lessons. Each story has a `minLessons` threshold so harder stories are unlocked later.

`StoryView` renders tap-to-reveal sentences (tap → shows English), a "New words" glossary block, and a 🔊 button that plays the full story via TTS using sequential `SpeechSynthesisUtterance` calls.

### Listening mode

`ListenView` is a new study mode added alongside Phrases / Cards / Quiz in `LessonView`. It auto-advances through a lesson's phrases: plays Hungarian TTS (`hu-HU`, rate 0.85), waits for utterance end, pauses 2 s, reveals English for 1.5 s, then advances. Uses a generation counter (`genRef`) to safely cancel stale callbacks when the user pauses or skips.

Controls: ▶/⏸ play-pause, ↺ replay current phrase, ⏭ skip to next.

### Grammar-pattern drill

`getPatternPhrases(patternId)` scans `LESSONS[]` for all entries sharing a `patternId` and flattens their phrases. `LessonView` exposes a "Drill" tab on any lesson that has a `patternId`; it feeds a synthetic lesson object into the existing `generateQuestions` engine, producing a cross-lesson quiz of up to 15 phrases.

## Quiz engine

`generateQuestions(lesson, weakPhrases, count)` produces a mixed question set from six types:

| Type | Description |
|------|-------------|
| `mc_en_hu` | English prompt → pick Hungarian |
| `mc_hu_en` | Hungarian prompt → pick English |
| `type` | English prompt → type Hungarian |
| `tf` | Hungarian prompt → true/false English match |
| `fill` | English prompt → fill missing word in Hungarian sentence |
| `match` | Match 4 pairs (shown as a pairing UI) |

Weak phrases (wrong > 0) are over-represented in the pool.

## SRS scheduler

`schedulePhraseReview(entry, correct)` implements a simplified SM-2 variant:
- Correct answer: interval grows (0→1, 1→3, then `round(interval × ease)`, capped at 60 days); ease increases by 0.1
- Wrong answer: interval resets to 1 day; ease decreases by 0.2 (min 1.3)

`getDuePhrases(stats)` returns all phrases (from attempted lessons only) where `due <= today`.

The **Review Due** screen (`screen="review-due"`) presents a cross-lesson quiz of up to 15 due phrases, accessible from the home screen via `ReviewDueCard`.

## Speech

`speakHu(text)` uses the Web Speech API (`SpeechSynthesisUtterance`, `lang="hu-HU"`, `rate=0.85`). Falls back silently if unavailable.

## Feedback

`FeedbackModal` posts directly to the GitHub Issues API (`tomrook12/statichungarianapp`) with a category and description. No backend required.

## Navigation model

Single-page, screen-based navigation managed with a `screen` state string:

```
"home" → "phase" → "lesson" (tabs: Phrases / Cards / Quiz / Listen / Drill*)
       → "story"                    (* Drill tab shown only when lesson.patternId exists)
       → "stats"
       → "review-due"
```

No router library; `onBack` callbacks walk back up the stack.

## Build & deploy

- `vite build` — outputs to `dist/`
- `vite.config.js` `base: '/StaticHungarianApp/'` must match the GitHub Pages sub-path
- `npm run deploy` — runs `vite build && gh-pages -d dist`
