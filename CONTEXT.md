# Magyar Otthon — Domain Glossary

> Canonical terms for the Hungarian Daily Life App. Implementation details do not belong here.
> Update this file as terms are resolved in design sessions.

---

## Track (Theme Track)
A daily home-life activity that forms the top-level curriculum unit (e.g. Bath Time, Bed Time, Getting Ready). Each Track contains a full A1–C1 learning arc, independent of other Tracks. A user can begin any Track, though Bath Time is the recommended entry point.

## Band
A CEFR proficiency level (A1, A2, B1, B2, C1) within a Track. Each Band contains 3–5 Lessons. Bands are sequential — a user must complete a Band before the next one unlocks. Each Band has a stated communicative goal (e.g. "I can name things and follow simple instructions").

## Lesson
A single unit of learning within a Band. Contains 15–20 questions. Lessons unlock sequentially: a user must pass the current Lesson (score ≥ 80%) to unlock the next. A Lesson is the smallest completable unit in the progression.

## Question
A single interactive prompt within a Lesson. Questions have a type (Fill in the Gap, Match, Sentence Builder, True/False, Phrase List) and belong to exactly one Lesson. Questions are not surfaced individually in navigation — they are internal to the Lesson engine.

## Item
A vocabulary word or phrase that is the subject of a Question. Items are tracked individually for spaced repetition purposes (correct attempts, incorrect attempts, date last seen, date last correct). An Item is not the same as a Question — one Item may appear across multiple Questions and multiple Lessons.

## Remedial
A shortened follow-up Lesson of 8 Questions, generated automatically from the Items a user answered incorrectly in a failed Lesson. Not a full repeat. Passing the Remedial (≥ 80%) unlocks the next Lesson. The Remedial can be reattempted indefinitely.

## Grammar Card
A dismissible explanation screen shown at the start of a Lesson where a new grammatical concept is first introduced. Grammar Cards appear at B1 and above only. They explain the *why* behind a structure; A1–A2 Lessons present grammar implicitly through repeated exposure.

## Rung
A Lesson's position (1–7) on the progression ladder within its Track, from bare words up to extended speech: 1 Word, 2 Marked word, 3 Two-part phrase, 4 Simple sentence, 5 Full sentence, 6 Linked sentence, 7 Extended speech. Rung climbs by at most one per Lesson and never falls back, and must sit inside its Band's allowed rung range (A1: 1–3, A2: 3–4, B1: 4–5, B2: 5–6, C1: 6–7). Rung — not Band — decides whether a Lesson's `fill_typed` questions downgrade to `fill_pool` (rungs 1–4 downgrade; rungs 5–7 keep `fill_typed`). Each Track that defines a lexical spine (`scripts/curriculum.config.json`) is checked by `npm run validate:curriculum`: every spine word must recur across several Lessons and reach a Lesson at rung ≥ 4, so a word taught as a bare noun is guaranteed to eventually appear in a sentence. See `docs/specs/progression-ladder.md` for the full design; only Bath Time has a spine as of this writing.

## Pass
A Lesson outcome achieved by scoring ≥ 80%. Unlocks the next Lesson in sequence.

## Recommended Next
The persistent home-screen card pointing to the user's most recent in-progress or just-unlocked Lesson. On first launch, it points to Bath Time Lesson 1.1. Updated after each Lesson is completed.

---

## Lesson Schema Fields (canonical)

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Stable, never reused. Keyed in `lessonScores`. |
| `trackId` | string | e.g. `"bath-time"`. Replaces `phase`. |
| `band` | string | `"A1"` \| `"A2"` \| `"B1"` \| `"B2"` \| `"C1"` |
| `seq` | integer | 1-based position within the Band. |
| `rung` | integer | 1–7, the progression-ladder rung. See **Rung** above. |
| `title` | string | Display title. |
| `sub` | string? | Optional subtitle for navigation context. |
| `types` | string[] | Allowed question type names for this Lesson. |
| `phrases` | object[] | `{hu, pr, en}` — vocabulary. All three fields required. |
| `tip` | string? | Optional teaching note for the parent. |
| `grammar` | string? | Optional grammar card shown before Lesson. B1+ only. |

**Retired fields:** `phase`, `aud`, `pat`, `patternId`.

## lessonScores Entry

```js
lessonScores: {
  "1": { best: 55, attempts: 2, passed: true, grammarSeen: true }
}
```

`best` = highest raw score from any main-lesson attempt. `passed` = true once either the main Lesson or its Remedial is completed at ≥ 80%. Unlock logic reads `passed`, not `best`. `grammarSeen` = true once the grammar card has been dismissed; card is skipped on all subsequent attempts.

## Remedial
A Remedial is ephemeral — built in-memory from the wrong answers of a failed Lesson, never persisted to localStorage. If the app is closed mid-Remedial, the user returns to the failed Lesson. Passing the Remedial sets `passed: true` on the original Lesson's `lessonScores` entry.

## v1 Scope (what is NOT in the new app)

No daily goals, streaks, stats dashboard, time tracking, story/listen modes, flashcard browse, phrase browse, time-of-day routing, feedback modal, or standalone SRS review screen. These existed in the previous app and may return post-v1. All lesson-score and phrase-score data is still persisted — the display layer is cut, not the tracking.

## Screen Inventory

| Screen | Triggered by |
|---|---|
| Home | App launch / back navigation |
| Track Detail | Tapping a Track on Home |
| Lesson flow | Tapping a Lesson card (unlocked) |
| → Grammar Card | Shown at lesson start if `lesson.grammar` exists (B1+) |
| → Quiz Engine | Immediately after Grammar Card (or lesson start if no card) |
| → Results Screen | After final question answered |
| → Remedial Quiz | "Try the Remedial" from Results (failed lesson) |
| Band Review | After passing final Lesson of a Band (advisory, skippable) |
| Settings | Accessible from Home (audio auto-play toggle) |

No phrase-browse or flashcard mode. The Lesson flow is quiz-only.

## lastActiveLessonId
A `number | null` stored in stats. Set whenever the user opens any Lesson. Drives the Recommended Next card: null → default to Bath Time Lesson 1.1; if the pointed-to Lesson is already passed → advance to the next unpassed Lesson in the same Track.

## Band Review
A short interstitial screen shown after completing the final Lesson in a Band, before Band N+1 is accessible. Contains 5 questions built from the Items with the highest `wrong` count in the completed Band. Advisory only — no pass/fail threshold; completing it (any score) is sufficient. It is not a gate: the user may proceed to Band N+1 whether or not they attempt it.

## phraseScores Entry (Item-level SRS)

```js
phraseScores: {
  "kád": { right: 3, wrong: 1, lastSeen: "2026-05-20", lastCorrect: "2026-05-20" }
}
```

Keyed by `phrase.hu`. SRS conditions: `wrong >= 2` → flag for early resurfacing; `daysSince(lastSeen) >= 7` → queue. No SM-2 ease/interval fields.

## TRACKS Registry

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

Only `"bath-time"` has lesson content in v1. All other tracks appear on the home screen as 0% / locked placeholders.

## Typed Answer Rules

Input type is decided by **Rung**, not Band: rungs 1–4 get a word pool (`fill_pool`);
rungs 5–7 get free text (`fill_typed`). Accent sensitivity is still decided by Band:

| Band | Accent sensitivity |
|---|---|
| A1, A2 | Insensitive (accents optional) |
| B1, B2, C1 | Sensitive (accents required) |

Band and Rung usually move together (A1/A2 lessons are rung ≤ 4, B1+ lessons are rung ≥
4), but a rung-4 Lesson in a B1+ Band still gets `fill_pool` — the word pool is a shape
property of the sentence, not a property of the Band.

## True/False Audio Fallback

If `hu-HU` TTS is unavailable at session start, all `true_false` questions for that session are replaced by `phrase_list` questions covering the same Items. No error shown to the user.

## TTS Voice Selection

| Band | Voice preference |
|---|---|
| A1, A2 | Female `hu-HU` voice (where available) |
| B1, B2, C1 | Default `hu-HU` voice |

Speech rate: 0.85 at A1/A2, 1.0 at B1+.

## Storage Key

`"magyar-otthon-stats-v3"` — bumped from v2 because the Bath Time progression-ladder rebuild (`docs/specs/progression-ladder.md`) makes Lesson ids 4–21 denote materially different content; see `docs/adr/0006-storage-key-v3.md`. Existing v2 data is abandoned (no migration).

## Valid Question Type Names

| Name | Description | Generator |
|---|---|---|
| `"match"` | 4-pair matching grid | existing `genMatch` |
| `"phrase_list"` | Hear audio, select written match | new `genPhraseList` |
| `"fill_pool"` | Fill-in-gap with word pool (A1/A2) | existing `genFill` |
| `"fill_typed"` | Fill-in-gap, free text (B1+) | new `genTyped` |
| `"sentence_builder"` | Tap chips to assemble sentence | existing `genReconstruct` |
| `"true_false"` | Hear audio, confirm/deny written phrase | existing `genTF` |
