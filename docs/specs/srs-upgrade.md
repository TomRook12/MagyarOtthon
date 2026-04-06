# Spec: SRS Upgrade — Spaced Repetition Scheduler

> **Status:** Draft
> **Branch:** `claude/review-hungarian-curriculum-inyIG`

## Goal

Replace the count-based weakness scoring with a forgetting-curve scheduler so that phrases are reviewed at scientifically optimal intervals, dramatically improving long-term retention. This is the single highest-ROI engine change for reaching B1.

## Background

The current `phraseScores` model stores `{ right, wrong }` counts per Hungarian phrase. The Daily Focus Engine uses these counts to surface weak lessons, but has no concept of *when* a phrase was last seen or *when* it should next be reviewed. Research (Ebbinghaus, Wozniak/SM-2, FSRS) shows that timing reviews to the edge of forgetting yields 2–3× better retention than massed or random practice.

The app's zero-dependency constraint means we implement a lightweight scheduler in vanilla JS — no Anki/FSRS library. A simplified SM-2 variant is sufficient: track ease, interval, and due date per phrase.

## Requirements

### Must have

- [ ] Extend `phraseScores` schema to include scheduling data per phrase
- [ ] Implement a scheduling algorithm that computes the next review date after each answer
- [ ] Migrate existing `phraseScores` data seamlessly (no data loss on upgrade)
- [ ] Add a "Review Due" mode accessible from the home screen that pulls due phrases across all lessons
- [ ] Integrate due-phrase counts into the Daily Focus Engine scoring (lessons with more overdue phrases score higher)
- [ ] Persist all scheduling data in `localStorage` alongside existing stats

### Nice to have

- [ ] Show due-phrase count as a badge on the home screen (e.g. "12 phrases due")
- [ ] Visual indicator on lesson cards showing how many phrases are due in that lesson
- [ ] "Review strength" indicator per phrase in the lesson phrase list (e.g. color-coded dot: red/amber/green)
- [ ] Allow user to manually reset a phrase's schedule (long-press → "Reset this phrase")

### Out of scope

- Server sync or multi-device scheduling
- Multiple user profiles
- Full FSRS v4 implementation (overkill for ~1,000 phrases)
- Changes to the 6 existing quiz question types
- Audio/listening features (see Engine Depth spec)

## Design

### Schema change

Current `phraseScores` entry:
```js
{ right: 5, wrong: 2 }
```

New `phraseScores` entry:
```js
{
  right: 5,
  wrong: 2,
  ease: 2.5,       // multiplier (starts 2.5, min 1.3)
  interval: 4,     // days until next review
  due: "2026-04-10", // ISO date string — when this phrase should next be seen
  lastSeen: "2026-04-06" // ISO date string — last review
}
```

### Migration

On `loadStats()`, if a phrase entry lacks `ease`/`interval`/`due`, initialise from existing counts:

```
if right > wrong*2 → ease 2.5, interval 7, due today (assume rusty)
if right > wrong   → ease 2.3, interval 3, due today
if wrong >= right  → ease 1.8, interval 1, due today
if no data         → ease 2.5, interval 0, due today (new)
```

All migrated phrases become due immediately so the scheduler starts fresh. This is intentional — better to over-review than to assume mastery.

### Scheduling algorithm (SM-2 simplified)

After each phrase answer:

```
if correct:
  if interval === 0:  interval = 1
  elif interval === 1: interval = 3
  else: interval = round(interval * ease)
  ease = max(1.3, ease + 0.1)
else:
  interval = 1          // reset to 1 day
  ease = max(1.3, ease - 0.2)

due = today + interval days
lastSeen = today
right/wrong incremented as before
```

This keeps the algorithm under 20 lines — no new dependencies.

### "Review Due" mode

A new entry point on the home screen (alongside Daily Focus):

1. Collect all phrases where `due <= today` across all lessons
2. If count > 0, show a button: "Review Due (N phrases)"
3. On tap, generate a cross-lesson quiz of up to 15 due phrases using existing `generateQuestions` logic
4. After the quiz, update each reviewed phrase's schedule
5. If 0 phrases due, show "All caught up!" with next due date

### Daily Focus integration

In `getDailyFocus`, add a scoring factor:

```
dueCount = lesson.phrases.filter(p => phraseScores[p.hu]?.due <= today).length
if dueCount >= 5: score += 4, reason "many due"
elif dueCount >= 2: score += 2, reason "some due"
```

This naturally surfaces lessons with overdue phrases without replacing the existing time-of-day and weakness signals.

### UI changes

- **Home screen**: "Review Due" button between Daily Focus and lesson list, styled as a prominent card when phrases are due, muted when caught up
- **Lesson card** (nice-to-have): small "3 due" badge in corner
- **Phrase list** (nice-to-have): colored dot (red = overdue, amber = due soon, green = fresh)

### State shape

No new top-level keys in stats. The `phraseScores` object grows richer per entry but remains keyed by Hungarian text. `loadStats` handles migration transparently.

## Implementation tasks

- [ ] Add migration logic in `loadStats()` to initialise SRS fields on existing phraseScores
- [ ] Implement `schedulePhraseReview(phraseKey, correct, stats)` utility function
- [ ] Update `recordPhrase` in `useStats` to call the scheduler and update due/interval/ease
- [ ] Add `getDuePhrases(stats)` utility that returns all phrases due today or earlier
- [ ] Add due-phrase count to Daily Focus scoring in `getDailyFocus`
- [ ] Build "Review Due" quiz mode: cross-lesson quiz from due phrases
- [ ] Add "Review Due" button/card to home screen UI
- [ ] Verify existing quiz flow still works (regression)
- [ ] Verify migration: load app with old-format localStorage, confirm no errors and phrases gain SRS fields
- [ ] Update `docs/architecture.md` with new phraseScores schema
- [ ] `npm run build` succeeds

## Open questions

- Should the scheduler use calendar days (simple) or hours (more granular for same-day reviews)? Recommendation: calendar days — the app targets one session per day. — *owner: user*
- Should "Review Due" pull from *all* lessons or only lessons the user has attempted at least once? Recommendation: only attempted lessons — avoids spoiling unseen content. — *owner: user*
- Maximum interval cap? SM-2 can push intervals to 6+ months. Recommendation: cap at 60 days for an active family learner. — *owner: user*

## Acceptance criteria

- [ ] Answering a phrase correctly increases its interval; answering wrong resets to 1 day
- [ ] Old localStorage data loads without errors; phrases gain SRS fields on first load
- [ ] "Review Due" button appears on home screen with accurate count
- [ ] Completing a "Review Due" quiz updates due dates for all reviewed phrases
- [ ] Daily Focus scoring reflects due-phrase counts
- [ ] No regressions in existing lesson/quiz/stats flows
- [ ] `npm run build` succeeds
