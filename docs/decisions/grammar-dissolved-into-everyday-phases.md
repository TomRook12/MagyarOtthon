# Decision: Grammar Spine dissolved into everyday phases

> **Date:** 2026-04-10
> **Status:** Accepted
> **Supersedes:** `grammar-via-curated-lessons.md` (2026-04-07)

## Context

On 2026-04-07 we added a Phase 9 "Grammar Spine" — 12 curated phrase lessons (ids 45–56) each anchored to a grammar paradigm (past tense, conditional, dative, possessives, prefixes, comparison…). The intent was to close a B1 gap identified by the CEFR analysis without breaking the app's phrase-based constitution.

In daily use, the separate phase turned out to create a visual and conceptual "grammar corner" in the home screen at odds with the constitution: *"phrase-based lessons organised by daily-life situations… not academic study"*. The content of the 12 lessons is good — the phrases are natural family utterances and the paradigm tables are useful — but packaging them behind their own phase header subtly re-introduces the "grammar tab" pattern the original decision explicitly rejected.

## Decision

Dissolve Phase 9. Relocate lessons 45–56 into the existing everyday phases (1–8) with everyday-themed titles, so a learner encounters the conditional inside Food ("I Would Like…"), imperatives inside Playing ("Come Here! Go Back!"), past tense inside End of Day ("What Everyone Did Today"), and so on. Lesson 47 "Past Tense — Talking About Yesterday" merges into lesson 32 "Their Day" since both cover the same evening conversation; the other 11 become new everyday-titled lessons in their target phase.

Preserved:
- **Lesson ids 45–56.** Stats persistence (`stats.lessonScores`, keyed by numeric id) and `stats.phraseScores` (keyed by `p.hu`) stay attached to the same lessons the learner has already drilled.
- **All Hungarian phrase text, pronunciations, English translations.** No rewriting.
- **All `pat` paradigm tables.** The Pattern: card renderer is already phase-agnostic (`src/App.jsx:1065`, `whiteSpace:"pre-wrap"`) and the tables carry real teaching value.
- **The `patternId` field on every relocated lesson.** Additive, harmless, and required by follow-up specs (`engine-depth.md` drill-by-pattern, `plans-hypotheticals.md`).

## Mapping

| id | New title | Phase | Source lesson |
|---|---|---|---|
| 45 | Reading the Book vs a Book | 5 Reading | Definite vs Indefinite Verbs |
| 46 | What Everyone Did Today | 7 End of Day | Past Tense — Full Paradigm |
| 47 | *(merged into lesson 32 Their Day)* | 7 End of Day | Past Tense — Talking About Yesterday |
| 48 | I Would Like… | 4 Food | Conditional — I Would… |
| 49 | What We'll Do Today | 1 Morning | Future with fog |
| 50 | Come Here! Go Back! | 3 Playing | Imperative — Asking & Telling |
| 51 | Where's Your Shoe? | 1 Morning | Possessive Suffixes |
| 52 | Give it to Your Sister | 3 Playing | Dative -nak/-nek |
| 53 | Going Together | 2 Going Out | Instrumental -val/-vel |
| 54 | Coming Home From… | 2 Going Out | From-cases -tól/-ről/-ből |
| 55 | In, Out, Up, Down | 1 Morning | Prefixes be/ki/fel/le/át/vissza |
| 56 | Bigger, Smaller, Best | 3 Playing | Comparison |

Resulting counts per phase: Morning 10, Going Out 11, Playing 11, Food 6, Reading 5, Bath & Bed 2, End of Day 5, Toolkit 5. Total: 55 lessons (56 − 1 for the 47→32 merge).

Relocated lessons are also wired into `TIME_TAGS` so the Daily Focus Engine surfaces them at natural times of day (planning in the morning, imperatives in the afternoon, past-tense reflection in the evening, etc.).

## Alternatives considered

| Option | Why rejected |
|---|---|
| Aggressive merging — fold every grammar lesson into an existing situational lesson | Discards many of the 96 paradigm phrases and dilutes the focused situational lessons. The "grammar in a box" problem reappears in reverse. |
| Delete lessons 45–56 entirely | Throws away good B1-foundation content. The gap analysis still holds. |
| Hide Phase 9 behind a toggle | Conceals the problem instead of fixing it. |
| Shorten or remove the `pat` paradigm tables | Discards the primary teaching anchor. The tables only render as a small "Pattern:" card and don't dominate the lesson view. |

## Consequences

**Easier**
- Constitution restored: grammar is encountered in context, inside situational phases.
- Phase list is 8 entries again; home screen is shorter.
- Daily Focus Engine surfaces grammar-flavoured lessons at appropriate times of day.
- Stats and progress transfer cleanly — ids and phrase text preserved.

**Harder**
- The `LESSONS` array has non-monotonic ids (lesson 45 sits in Phase 5, lesson 49 in Phase 1, etc.). This matches existing practice (lessons 40, 42–44 were already out of numeric order).
- A small number of relocated lessons (e.g. "In, Out, Up, Down") show a denser Pattern: card than their phase neighbours.
- One orphaned `stats.lessonScores[47]` entry may exist in user localStorage; the stats view silently skips missing ids (`src/App.jsx:950`) so it is harmless.
