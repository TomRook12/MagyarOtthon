# Spec: Full Home Screen + Track Detail

> **Status:** Done
> **Branch:** `main`

## Goal

Replace the flat 21-lesson list with a proper home screen showing track cards and a Track Detail screen showing lessons within a track. This gives the app a navigable structure that scales as new tracks are added.

## Background

The current home renders all lessons in a single flat list. With 21 Bath Time lessons already in and more tracks planned, this won't scale. The PRD calls for a Recommended Next card, track progress bars, and lock gates on tracks without content.

## Requirements

### Must have
- [ ] Home screen shows one card per track (8 tracks)
- [ ] Each track card shows: emoji, title, progress bar (passed / total lessons), and a locked state for tracks with no lesson content
- [ ] "Recommended Next" section at the top of home — shows the next unpassed lesson in the last-active track, driven by `lastActiveLessonId` from stats
- [ ] Track Detail screen: reachable by tapping an unlocked track card; shows lessons in that track as a vertical list, grouped by band (A1 / A2 / B1 / B2 / C1)
- [ ] Track Detail header: back button, track emoji + title, colored accent, overall progress bar
- [ ] Lesson rows in Track Detail: band badge, lesson title, subtitle, score badge (if attempted), lock icon (if locked)
- [ ] Tapping an unlocked lesson row in Track Detail navigates to quiz (existing behaviour)
- [ ] Navigation state: `screen` values become `"home"` | `"track"` | `"quiz"`

### Nice to have
- [x] Band section headers in Track Detail — descriptive labels: "A1 — Foundation", "A2 — Developing", "B1 — Building", "B2 — Expanding", "C1 — Mastery"
- [x] Completed track card shows a subtle "all done" indicator (green border or checkmark)

### Out of scope
- Grammar Card screen (separate spec)
- Results screen (separate spec)
- Remedial Quiz (separate spec)
- Animations / transitions

## Design

### Navigation flow

```
Home
 └─ tap unlocked track → Track Detail
                           └─ tap unlocked lesson → Quiz → back to Track Detail
```

Back from Quiz returns to Track Detail (not Home). Back from Track Detail returns to Home.

### New state in `App()`

```js
const [screen,  setScreen]  = useState("home");   // "home" | "track" | "quiz"
const [trackId, setTrackId] = useState(null);      // string | null  (track-detail context)
const [lessonId,setLessonId]= useState(null);      // number | null  (quiz context)
```

`trackId` is set when entering Track Detail and kept while in Quiz (so back from Quiz returns to the same Track Detail).

### Recommended Next logic

```
lastActiveLessonId → find lesson → walk forward until first unpassed lesson in same track
If no lastActiveLessonId: first unpassed lesson in Bath Time (id 1 if nothing done)
If all lessons in track passed: show a "Track Complete!" card instead
```

Use `getPrevLesson` / `isUnlocked` (already implemented) to confirm the next lesson is actually reachable.

### Track card unlock rule

A track card is **unlocked** if `LESSONS.some(l => l.trackId === track.id)`.  
Currently only `"bath-time"` qualifies; all others show locked/greyed.

### Track progress

```js
const total  = LESSONS.filter(l => l.trackId === tid).length;
const passed = LESSONS.filter(l => l.trackId === tid)
                      .filter(l => statsApi.stats.lessonScores[String(l.id)]?.passed).length;
```

Progress bar width = `passed / total * 100%`. Show `passed/total` as text label.

### ASCII layout — Home

```
┌─────────────────────────────┐
│ Magyar Otthon               │
│ Tanulj minden nap           │  (sub: "Learn every day")
├─────────────────────────────┤
│ ▶ Recommended Next          │
│ ┌───────────────────────┐   │
│ │ 🛁  Bath Time         │   │
│ │     Lesson 5 · A2     │   │
│ │     Temperature       │   │
│ └───────────────────────┘   │
├─────────────────────────────┤
│ Tracks                      │
│ ┌──────────┐ ┌──────────┐  │
│ │ 🛁        │ │ 🌙 🔒    │  │
│ │ Bath Time │ │ Bed Time │  │
│ │ ████░ 3/5│ │          │  │
│ └──────────┘ └──────────┘  │
│  ...                        │
└─────────────────────────────┘
```

Track cards: single-column list (full width). Each card ~72px tall.

### ASCII layout — Track Detail

```
┌─────────────────────────────┐
│ ← 🛁 Bath Time    ████░ 3/21│
├─────────────────────────────┤
│ A1 — Foundation             │
│ ┌───────────────────────┐   │
│ │ A1·1  Objects    100% │   │
│ │ A1·2  Body Parts  72% │   │
│ │ A1·3  Commands   ›    │   │  ← unlocked, not attempted
│ │ A1·4  First...   🔒   │   │  ← locked
│ └───────────────────────┘   │
│ A2 — Developing             │
│  ...                        │
└─────────────────────────────┘
```

## Implementation tasks

- [x] Add `trackId` state to `App()`; update `screen` to `"home" | "track" | "quiz"`
- [x] Implement `getRecommendedNext(stats)` helper — returns a lesson object or null
- [x] Build Home screen: header, Recommended Next card, single-column track list
- [x] Build Track Detail screen: header with back + progress bar, band section headers, lesson rows
- [x] Wire Quiz back-navigation to return to Track Detail (`setScreen("track")`) instead of Home
- [x] Update `docs/app-map.md` — add `trackId` state and `getRecommendedNext` to the section map
- [x] Run convention-reviewer agent before committing

## Open questions

_All resolved._

## Acceptance criteria

- [ ] Home shows 8 track cards; 7 show as locked (no lesson content)
- [ ] Bath Time card shows correct passed/total count and progress bar
- [ ] Recommended Next card appears after any quiz is completed; tapping it starts the right lesson
- [ ] Track Detail lists all 21 Bath Time lessons in band order, each correctly locked/unlocked
- [ ] Back from Quiz goes to Track Detail; back from Track Detail goes to Home
- [ ] No regressions in Quiz flow (questions, scoring, stats recording)
