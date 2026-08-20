# Spec: Bath Time Loop Completion

> **Status:** Done
> **Branch:** `claude/project-progress-review-vz07qg`

## Goal

Close the three remaining gaps in the lesson loop — Remedial, Band Review, and Settings —
so that Bath Time is a complete, proven vertical slice. Once this ships, adding a new
track is purely a content exercise with no engine work.

## Background

Bath Time is content-complete: 21 lessons, 113 phrases, A1 through C1, with grammar
cards on the six B1+ lessons that need them. The navigation, quiz engine, and results
screen all work.

But `CONTEXT.md` defines three behaviours in full that have never been built:

- **Remedial** — the 8-question follow-up generated from a failed lesson's wrong answers
- **Band Review** — the 5-question advisory interstitial after a band is completed
- **Settings** — an audio auto-play toggle, listed in the Screen Inventory

The Remedial gap is the one that actually hurts a learner. Today a lesson scored below
80% simply ends: the only route to `passed: true` is re-running all 15 questions. For a
child who missed four phrases, that is fifteen questions of mostly-known material to get
past a gate. The Remedial is the designed answer to exactly this, and it is missing.

These are engine features, not content. Building them now — while there is one track to
test against — means every future track inherits a finished loop. Building them after
five tracks exist means retrofitting.

## Requirements

### Must have

**Remedial**
- [x] Results screen offers "Try the Remedial" when a lesson is failed (< 80%) and at least one phrase was missed
- [x] Remedial is 8 questions drawn only from the phrases missed in that attempt
- [x] Remedial uses the same `lesson.types[]` pool and band rules as its parent lesson
- [x] Passing the Remedial (≥ 80%) sets `passed: true` on the *original* lesson, unlocking the next
- [x] Failing the Remedial offers another Remedial attempt — reattemptable indefinitely
- [x] Remedial state is ephemeral: never written to `localStorage`, no `lessonScores` entry of its own
- [x] Remedial does not alter the parent lesson's `best` score or increment `attempts`
- [x] `phraseScores` still updates per answer during a Remedial

**Band Review**
- [x] Triggered after passing the final lesson of a band, when a next band exists in the track
- [x] 5 questions built from the band's phrases with the highest `wrong` count
- [x] Advisory only — any score completes it; it never gates access to the next band
- [x] Skippable: a "Skip for now" control returns to Track Detail without penalty
- [x] `phraseScores` updates per answer; no `lessonScores` entry is written
- [x] Not shown after the final band of a track (C1 has no successor)

**Settings**
- [x] Settings screen reachable from a control in the Home header
- [x] Audio auto-play toggle, persisted through `useStats`
- [x] When auto-play is off, `true_false` / `phrase_list` prompts and `fill_typed` answer
      playback do not fire automatically; the manual `SpeakBtn` still works everywhere
- [x] `settings` added to the stats schema with a default, merged safely for existing
      users whose stored object predates the field — no `STORAGE_KEY` bump

### Nice to have
- [ ] Remedial results screen shows which of the previously-missed phrases are now correct
- [x] Band Review completion shows a short band-summary line ("A2 complete — 4 lessons passed")
- [x] Settings shows the detected `hu-HU` voice name, or a notice when no Hungarian voice is available

### Out of scope
- New lesson content for Bath Time or any other track
- Any of the seven empty tracks — those follow, as content
- Reworking the SRS rules (ADR 0003 stands)
- Reviving anything cut in ADR 0004 (streaks, stats dashboard, story mode, phrase browse)
- Triage of the seven pre-rewrite GitHub issues

## Design

### Navigation

```
Home ──gear──> Settings
 │
 └─> Track Detail ─> [Grammar Card] ─> Quiz ─> Results
                                                 │
                              failed ────────────┼──> Remedial ─> Remedial Results
                              (< 80%)            │                      │
                                                 │         pass ────────┘ sets parent passed
                                                 │         fail ────────> Remedial again
                                                 │
                              passed final ──────┴──> Band Review ─> Track Detail
                              lesson of band              │
                                                    skip ─┘
```

`screen` gains two values: `"settings"` and `"bandreview"`. The Remedial is *not* a screen
value — it is a mode of the existing quiz screen, carried in React state that dies with the
component. That is what makes "closed mid-Remedial returns to the failed lesson" fall out
for free: nothing was ever stored.

### Remedial

`QuizEngine` takes a `mode` plus an optional phrase `pool` (settled during implementation;
`mode` is clearer than inferring intent from a phrase array, and Band Review reuses it):

```js
<QuizEngine mode="remedial" pool={missedPhrases} lesson={lesson} ... />
```

When `mode` is `"remedial"`:
- question count is 8 instead of 15
- the generator pool is `remedialPhrases`, not `lesson.phrases`
- weak-item boosting is skipped (the whole pool is already weak)
- on completion, `recordLesson` is **not** called; `markLessonPassed(lesson.id)` is called
  instead, and only when the score is ≥ 80%

Questions come from a shallow copy, `{...lesson, phrases: pool}`. `generateQuestions` did
need a signature change after all — see **Generator defects** below.

New `useStats` method:

```js
markLessonPassed(id)   // sets passed: true, leaves best and attempts untouched
```

### Band Review

New utility:

```js
function getBandReviewItems(trackId, band, phraseScores, count = 5)
```

Collects every phrase across the band's lessons, sorts by `phraseScores[hu].wrong`
descending (unseen phrases sort last, `wrong: 0`), returns the top `count`.

Trigger check on results screen, when a lesson has just been passed:

```js
isLastLessonOfBand(lesson) && hasNextBand(lesson) && !alreadyReviewedThisSession
```

The review is a lightweight reuse of `QuizEngine` with a synthetic lesson object
(`{band, types, phrases: reviewItems}`) and no `lessonScores` write. Because it is
advisory, its results view shows the score but no pass/fail language and a single
"Back to lessons" action.

### Settings

Stats schema gains:

```js
settings: { autoPlayAudio: true }
```

`loadStats()` merges this over the parsed object so users on the current v2 schema pick up
the default without a key bump:

```js
return { ...DEFAULT_STATS, ...parsed, settings: { ...DEFAULT_STATS.settings, ...parsed.settings } };
```

`useStats` gains `setSetting(key, value)`. The three auto-play `useEffect` calls in
`QuizEngine` become conditional on `stats.settings.autoPlayAudio`. `SpeakBtn` is untouched —
manual playback is always available regardless of the toggle.

### Generator defects found during implementation

Narrowing the question pool exposed three pre-existing faults in `generateQuestions` and
its helpers. All three were latent under normal lessons, where the pool is 15+ varied
phrases, and all three become reachable with a Remedial pool of one to three phrases.

1. **`genTF` could build an unanswerable question.** It picked `answer` at random, then
   looked for a different English translation to show. With no alternative available it
   fell back to `p.en` — displaying the *correct* translation while `answer` was `false`.
   Fixed by forcing `answer: true` when the pool offers no alternative.

2. **Distractors were drawn from the question pool.** `genPhraseList` on a one-phrase pool
   produced a single option; `genFill` had no distractor words. Fixed by splitting the two
   roles: `generateQuestions(lesson, weakItems, huVoiceAvail, count, distractorPool)` takes
   questions from the narrow pool and wrong-answer options from the full lesson.

3. **An empty question set crashed the render.** Every declared type can decline — `match`
   below four phrases, `fill_pool` on a single word, `sentence_builder` outside 3–7 words.
   A lesson whose types are all decliners produced `qs = []`, then `total = 0` and
   `qs[0].type` threw. Fixed with a fallback to `genPhraseList` / `genTyped`, neither of
   which ever declines.

Verified by generating 3,360 Remedials — every lesson × pools of one to four missed
phrases × 40 trials — with no empty sets and no single-option questions.

### Incidental cleanup

`goNext()` currently reads:

```js
statsApi.recordLesson(lesson.id, score + (ans === "match_done" || ans === "sb_correct" ? 0 : 0), total);
```

Both branches add zero. `match` and `sentence_builder` already score correctly through
`setScore` and `advance` respectively, so the expression is dead and the score it passes is
right. Reduced to `score` while this code is being touched anyway.

## Implementation tasks

- [x] Add `markLessonPassed(id)` to `useStats`
- [x] Add `settings` to the default stats object and merge it in `loadStats()`
- [x] Add `setSetting(key, value)` to `useStats`
- [x] Add `remedialPhrases` prop to `QuizEngine`; branch count, pool, and completion handling
- [x] Add "Try the Remedial" action to the failed-lesson results screen
- [x] Add Remedial results view — pass sets parent lesson passed, fail offers another attempt
- [x] Add `getBandReviewItems()` and `isLastLessonOfBand()` / `hasNextBand()` utilities
- [x] Add `BandReview` screen component and `"bandreview"` route in `App()`
- [x] Trigger Band Review from the results screen on passing a band's final lesson
- [x] Add `Settings` screen component and `"settings"` route; gear control in Home header
- [x] Gate the three auto-play `speakHu` effects on `settings.autoPlayAudio`
- [x] Simplify the dead `score + (... ? 0 : 0)` expression in `goNext()`
- [x] Update `docs/app-map.md` — new components, new `useStats` methods, new stats field
- [x] Refresh `docs/conventions.md` — it still documents the retired `aud` phrase field
- [ ] Add a decision record if the Band Review trigger point proves contentious — not needed; built as `CONTEXT.md` describes

## Open questions

- **Band Review timing.** Spec'd here as immediately after the band's final lesson passes,
  which is what `CONTEXT.md` describes. The alternative is offering it from Track Detail as a
  persistent per-band action, which is less interruptive but easier to ignore. Going with the
  `CONTEXT.md` reading unless you'd rather it be pull rather than push.
- **Remedial after a Remedial.** If a learner fails the Remedial, the next Remedial is built
  from the phrases missed in *that* attempt, not the original set. This narrows toward the
  genuinely hardest items, but means a phrase answered correctly in the Remedial drops out of
  the pool even if it was wrong in the parent lesson. Reasonable, but worth a sanity check.

## Acceptance criteria

- [x] `npm run build` passes with no errors or warnings
- [x] Scoring a Bath Time lesson below 80% shows a "Try the Remedial" action
- [x] The Remedial presents 8 questions, all drawn from phrases missed in that attempt
- [x] Passing the Remedial marks the parent lesson passed and unlocks the next lesson
- [x] Passing the Remedial does not change the parent lesson's `best` or `attempts`
- [x] Failing the Remedial offers another attempt; no `lessonScores` entry is created for it
- [x] Reloading mid-Remedial returns to the parent lesson, not the Remedial
- [x] Passing lesson 2.4 (id 8, final A2 lesson) offers a Band Review of 5 questions
- [x] Band Review can be skipped, and skipping does not block access to B1
- [x] Passing lesson C1.4 (id 21, final lesson of the track) offers no Band Review
- [x] Settings is reachable from Home and the auto-play toggle persists across a reload
- [x] With auto-play off, no audio fires on question load; `SpeakBtn` still speaks on tap
- [x] A stats object saved before this change loads without error and defaults auto-play on
