# Spec: Grammar Card + Results Screen

> **Status:** Done
> **Branch:** `main`

## Goal

Complete the lesson loop by (1) showing a grammar card before B1+ quizzes so learners understand the pattern before drilling it, and (2) replacing the minimal inline score card with a results screen that shows missed phrases for targeted review.

## Background

Both features were explicitly deferred in earlier specs:
- `bath-time-a2-c1.md` deferred the grammar card display
- `home-screen-track-detail.md` deferred the full results screen
- `grammarSeen` persistence is already wired into `useStats` / localStorage — the card just needs to be shown

## Requirements

### Must have
- [ ] Grammar card shown before the quiz when `lesson.grammar` is set AND `!grammarSeen` for that lesson
- [ ] Grammar card displays `lesson.grammar` text with band badge, "Got it" dismiss button, and a back arrow
- [ ] Dismissing calls `markGrammarSeen(lesson.id)`; `grammarSeen` persists — card not shown again on retry
- [ ] Results screen replaces the inline "done" view in QuizEngine
- [ ] Results screen shows: emoji, score fraction, percentage, pass/fail label
- [ ] Results screen shows a "Missed" section listing unique phrases the learner got wrong (hu + pronunciation + en)
- [ ] "Back to lessons" and "Retry" buttons on results screen

### Nice to have
- [ ] Missed phrases section hidden if score is 100%

### Out of scope
- Remedial quiz (separate spec)
- Replaying individual missed questions interactively

## Design

### Grammar Card flow

The grammar card is displayed *instead of* the quiz header + QuizEngine when its conditions are met.  
It lives at `screen === "quiz"` level in App — no new screen value needed.

```
openLesson(l)
   ↓
screen = "quiz"
   ↓
lesson.grammar && !grammarSeen?
  YES → <GrammarCard>   →  [Got it] → markGrammarSeen → re-render → QuizEngine shows
  NO  → <QuizEngine>
```

`needsGrammarCard` is derived from `statsApi.stats` on every render — dismissing calls
`markGrammarSeen`, which updates stats, which triggers re-render, which switches to QuizEngine
automatically (no extra local state needed).

```
┌─────────────────────────────────────┐
│  ← back to lessons                  │
│                                     │
│  B1  Grammar Note                   │  ← band badge + "Grammar Note" label
│                                     │
│  [lesson.grammar text — may be      │
│   several sentences]                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Got it →               │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Results Screen

Replaces the `ans === "done"` inline return in QuizEngine.

Missed phrases are tracked in a new `missed` state array inside QuizEngine:
- On every `advance(correct)` call where `!correct` and `q.phrase` exists, push `q.phrase` to `missed`
- Deduplicate by `q.phrase.hu` before display

```
┌─────────────────────────────────────┐
│  🎉 / 👏 / 💪  (emoji by pct)       │
│  12 / 15                            │  ← score
│  80%                                │  ← pct (coloured green/amber/red)
│  Passed — next lesson unlocked!     │  ← sub-label
│                                     │
│  ── Missed ──  (only if missed > 0) │
│  kád        kád        bath         │
│  a fürdőkád a für-dő-kád the bathtub│
│  ...                                │
│                                     │
│  [Back to lessons]   [Retry]        │
└─────────────────────────────────────┘
```

### Affected code

| Location | Change |
|----------|--------|
| `// ─── APP` — quiz screen block | Derive `needsGrammarCard`; render GrammarCard or quiz header |
| `// ─── SCREENS` | Add `GrammarCard` component (above existing `HomeScreen`) |
| `// ─── QUIZ ENGINE` — QuizEngine | Add `missed` state; track in `advance()`; replace done view |

No new state fields, no schema changes, no new constants needed.

## Implementation tasks

- [x] Add `GrammarCard` component to `// ─── SCREENS` section
- [x] Add `needsGrammarCard` derivation and conditional rendering in App's quiz screen block
- [x] Add `missed` state to QuizEngine; push to it in `advance()` on incorrect answers
- [x] Replace inline `ans === "done"` return with a full results view using `missed`
- [x] Update `docs/app-map.md` — add `GrammarCard` to the SCREENS row

## Open questions

None — `markGrammarSeen` and `grammarSeen` are already implemented.

## Acceptance criteria

- [ ] Opening a B1 lesson for the first time shows the grammar card before any questions appear
- [ ] Tapping "Got it" moves to the quiz; tapping back returns to track detail
- [ ] Re-entering the same lesson skips the grammar card
- [ ] After finishing a quiz, the results screen shows the correct score and percentage
- [ ] Phrases answered incorrectly appear in the "Missed" section (deduplicated)
- [ ] A 100% score shows no "Missed" section
- [ ] "Retry" resets the quiz; "Back to lessons" returns to track detail
