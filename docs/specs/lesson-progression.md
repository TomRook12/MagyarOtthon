# Spec: Progress Straight to the Next Lesson

> **Status:** Done
> **Branch:** `claude/test-feedback-feature-spec-s9pjqd`

## Goal

When a lesson is passed, let the learner start the next one from the results screen in a
single tap, instead of going back to the track list and hunting for it.

## Background

Reported from testing: "When completing a lesson successfully I should be able to progress
easily to the next lesson."

The results screen (`src/App.jsx`, `// ─── QUIZ ENGINE`, the `if (ans === "done")` block)
currently offers only **Back to lessons** and **Retry** — even when the headline literally
reads *"Passed — next lesson unlocked!"*. The unlock happens and then nothing invites you
through it. `getRecommendedNext()` exists in `// ─── UTILITIES` but is only used by the
Home screen's Recommended Next card.

## Requirements

### Must have
- [x] On a pass (`pct >= 80`) in `mode="lesson"`, the results screen shows a primary
      **Next lesson →** button naming the next lesson's title.
- [x] The same button appears after a passed Remedial (`mode="remedial"` and `pct >= 80`),
      which also flips `passed` and unlocks the next lesson.
- [x] Tapping it opens the next lesson exactly as tapping it in Track Detail would —
      including showing the grammar card first when the next lesson has one.
- [x] On a fail, no Next-lesson button. Remedial / Retry / Back to lessons only.
- [x] At the last lesson of a band, the existing **Review {band} before moving on →** offer
      stays the primary button and Next lesson sits below it.
- [x] At the last lesson of a track, no Next-lesson button; show a track-complete message
      instead.
- [x] Never render a Next-lesson button for a locked lesson.

### Nice to have
- [x] Show the next lesson's rung name or band under the title so the learner sees what
      they are stepping into.

### Out of scope
- Auto-advancing without a tap — the results screen's missed-phrase review is the teaching
  moment and must not be skipped past.
- Cross-track progression. The next lesson is always in the same track.
- Any change to `getRecommendedNext()` or the Home screen.

## Design

**New utility** in `// ─── UTILITIES`, directly beside `getPrevLesson` and mirroring it:

```js
// Inverse of getPrevLesson — the next lesson in the same track, crossing into the next
// band that actually has content when the current band runs out.
function getNextLesson(lesson) {
  const sameBand = LESSONS.filter(l => l.trackId === lesson.trackId && l.band === lesson.band);
  const next = sameBand.find(l => l.seq === lesson.seq + 1);
  if (next) return next;
  const nb = getNextBand(lesson);                       // already skips empty bands
  if (!nb) return null;
  return getBandLessons(lesson.trackId, nb)[0] || null; // getBandLessons sorts by seq
}
```

`getNextBand` already walks forward past bands with no lessons, so an empty B2 cannot
strand the learner.

**QuizEngine** gains an `onNextLesson` prop. Inside the `ans === "done"` block:

```js
const justPassed = passed && (mode === "lesson" || mode === "remedial");
const nextLesson = justPassed ? getNextLesson(lesson) : null;
const canGoNext   = nextLesson && isUnlocked(nextLesson, statsApi.stats.lessonScores);
const trackDone   = justPassed && !nextLesson;
```

`isUnlocked` is checked defensively — after a pass it will always be true, because passing
this lesson is exactly the condition that unlocks the next one, but a stale render or a
future change to unlock rules should degrade to hiding the button, not to a dead one.

**Button hierarchy on the results screen**, top to bottom:

```
  score / % / headline
  Missed phrases (unchanged)

  [ Review A1 before moving on → ]   ← only at a band's last lesson; stays primary
  [ Next lesson → The Little Word ]  ← filled, track colour; the new primary otherwise
  [ Back to lessons ] [ Retry ]      ← existing pair, unchanged, now clearly secondary
```

- Passed, mid-band → **Next lesson** is the filled primary; Back/Retry stay as the tinted
  secondary row beneath.
- Passed, last lesson of a band → **Review {band}** filled primary (as today), **Next
  lesson** immediately below it in the tinted secondary style, then Back/Retry.
- Passed, last lesson of the track → no Next button. In its place, a centred line:
  `🏆 Bath Time complete — every lesson passed.` Keep Back to lessons.
- Failed → nothing new. The Remedial offer and Back/Retry behave exactly as today.

Reuse the existing button styles verbatim: filled primary is `background: color`, secondary
is `background: ${color}18` with `border: 1px solid ${color}35`. No new colours; everything
comes from `C` and `track.color`.

**App wiring** (`// ─── APP`): pass `onNextLesson={openLesson}` to `QuizEngine`. `openLesson`
already resets `remedialPhrases`, bumps `runId` to force fresh questions, sets `trackId`,
and routes through the grammar card via `needsGrammarCard` — so a B1+ next lesson shows its
grammar card first with no extra work. Do not write a second navigation path.

## Implementation tasks

- [x] Add `getNextLesson(lesson)` to `// ─── UTILITIES` beside `getPrevLesson`.
- [x] Add the `onNextLesson` prop to `QuizEngine` and compute `nextLesson` / `canGoNext` /
      `trackDone` in the `ans === "done"` block.
- [x] Render the Next-lesson button per the hierarchy above, including the band-review and
      track-complete cases.
- [x] Pass `onNextLesson={openLesson}` from `App()`.
- [x] Verify the grammar-card path: pass a lesson whose successor has `grammar` set and
      confirm the card appears before the quiz.
- [x] Run `npm run build` — clean.
- [x] Update `docs/app-map.md`: add `getNextLesson` to Section H's band-helpers list, and
      note the `onNextLesson` prop in the QuizEngine modes table.

## Open questions

None.

## Verification (2026-08-21)

Criteria 1–5 were checked by **running** `getNextLesson` / `getPrevLesson` / `isUnlocked`
against the real `LESSONS` array, importing App.jsx the way `scripts/validate-curriculum.mjs`
does. Results:

- `getNextLesson` is the exact inverse of `getPrevLesson` for all 30 Bath Time lessons — no
  mismatches.
- Following `getNextLesson` from lesson 1 visits all 30 lessons exactly once and terminates
  at `null`.
- Band handoffs: A1 id 7 → id 8 (A2 seq 1); A2 id 14 → id 15 (B1); B1 id 20 → id 21 (B2);
  B2 id 25 → id 26 (C1); C1 id 30 → `null`. The Band Review offer is present at the first
  four and absent at id 30, so the track-complete case never competes with it.
- `canGoNext` was false in **zero** cases: for every lesson, passing it unlocks its
  successor. The `isUnlocked` guard is genuinely defensive, not load-bearing.
- Tracks with no content (`bed-time`, `park`) return `null` without throwing.

The **UI** criteria were then driven in a real browser (headless Chromium via
playwright-core, installed outside the repo so `package.json` keeps its zero-dependency
guarantee). A solver answers each question type from the real lesson data, so complete runs
can be played end to end. 17 assertions, all passing:

- Passing lesson 1 (100%) shows **Next lesson → Body Parts**, computed background
  `rgb(74,158,204)` — the filled primary. Tapping it lands on lesson 2 at question 1/15.
- Failing lesson 1 (7%) shows no Next-lesson button.
- Failing, then passing the Remedial at exactly 80%, shows **Next lesson → Body Parts**.
- Lesson 7 (last of A1, 100%) shows both offers: Band Review at `rgb(74,158,204)` and Next
  lesson at `rgba(74,158,204,0.094)` — primary and secondary respectively.
- Lesson 30 (last of C1, 100%) shows "🏆 Bath Time complete" and no Next-lesson button.
- Passing lesson 15 and tapping Next lands on lesson 16's **Grammar Note** card, not its
  quiz.

Two harness bugs were found and fixed before these numbers could be trusted, and are worth
recording because both produced *false passes*: the solver's fallback could click the back
arrow, dumping the run onto Track Detail — where lesson rows display "100%" and read like a
passed result; and sharing one page across tests let earlier navigation state decide later
outcomes. Each test now gets a fresh browser context, and every criterion asserts it is on a
real results screen before judging anything.

`npm run build` and `npm run validate:curriculum` both pass.

## Acceptance criteria

- [x] Passing lesson 1 shows **Next lesson → Body Parts** as the primary button; tapping it
      starts lesson 2 with fresh questions.
- [x] Failing lesson 1 shows no Next-lesson button.
- [x] Passing a Remedial at ≥80% shows the Next-lesson button; failing it does not.
- [x] Passing the last A1 lesson shows the Band Review offer as primary with Next lesson
      below it, and both work.
- [x] Passing the final lesson of Bath Time shows the track-complete line and no Next
      button.
- [x] Advancing into a lesson that has a grammar card shows the card before the quiz.
- [x] `npm run build` passes.
