# Architecture

## Overview

Magyar Otthon is a **single-file React app**. All lesson data, business logic, and UI live in `src/App.jsx`. This is intentional — the app is small, the deployment target is a static host, and keeping everything in one file makes offline reading and AI-assisted editing straightforward.

## Data model

```
PHASES[]          — 11 thematic groups (Morning, Going Out, Playing, Food, Reading, Bath & Bed, End of Day, Toolkit, Reasoning, Stories, Plans & What-ifs)
LESSONS[]         — 74 lesson objects, each belonging to one phase
  └─ phrases[]    — array of { hu, pr, en } (Hungarian, pronunciation, English)
```

Each lesson also has:
- `aud` — target audience: `"kids"`, `"wife"`, or `"both"`
- `tip` — a short teaching note
- `pat` — optional grammar pattern note; if it contains `\n`, it is rendered as `<pre>`-style preformatted text in the lesson view so paradigm tables stay aligned
- `patternId` — optional string tag naming the grammar paradigm the lesson drills (e.g. `"past-indef"`, `"dative"`, `"conditional"`). Present on paradigm-anchored lessons (ids 45–56 and the merged lesson 32) distributed across phases 1–8, on all Phase 9–10 lessons (ids 57–68), and on all Phase 11 lessons (ids 69–74). Lessons without this field are unaffected.

## State

All runtime state lives in two places:

| Location | What |
|----------|------|
| React `useState` | UI state — current screen, selected lesson, active question, etc. |
| `localStorage` | Persisted stats via the `useStats` hook |

`useStats` exposes: `recordPhrase`, `recordSession`, `startTimer`, `stopTimer`, `getWeakPhrases`, `setDailyGoal`.

Stats schema (key: `"magyarStats"`):
```js
{
  totalTime,       // seconds
  dailyTime,       // { "Mon Jan 01 2025": seconds }
  streakDays,      // ["Mon Jan 01 2025", …]
  lessonScores,    // { lessonId: { best, attempts } }
  phraseScores,    // { huText: { right, wrong } }
  dailyGoal,       // minutes
}
```

## Daily Focus Engine

`getDailyFocus(stats)` scores every lesson based on:
1. **Time of day** — `TIME_TAGS` maps hour ranges to lesson IDs
2. **Day of week** — `WEEKEND_BOOST` / `WEEKDAY_BOOST` arrays
3. **Weakness** — phrase error rate from `phraseScores`
4. **Recency** — lessons not recently attempted score higher

Returns the top-scored lesson and a human-readable reason string.

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

## Speech

`speakHu(text)` uses the Web Speech API (`SpeechSynthesisUtterance`, `lang="hu-HU"`, `rate=0.85`). Falls back silently if unavailable.

## Feedback

`FeedbackModal` posts directly to the GitHub Issues API (`tomrook12/statichungarianapp`) with a category and description. No backend required.

## Navigation model

Single-page, screen-based navigation managed with a `view` state string:

```
"home" → "phases" → "lessons" → "lesson" → "quiz" → "result"
                                          → "stats"
```

No router library; `onBack` callbacks walk back up the stack.

## Build & deploy

- `vite build` — outputs to `dist/`
- `vite.config.js` `base: '/StaticHungarianApp/'` must match the GitHub Pages sub-path
- `npm run deploy` — runs `vite build && gh-pages -d dist`
