# ADR 0006 — STORAGE_KEY Bump to v3

**Status:** Accepted
**Date:** 2026-08-20

## Context

`docs/specs/progression-ladder.md` rebuilds Bath Time from 21 lessons to 30, restructured
around a seven-rung progression ladder (word → marked word → phrase → sentence → linked
sentence → extended speech) with a lexical spine threading the same core vocabulary
throughout. Lesson `id`s 1–3 keep roughly the same content (bare nouns, commands); `id`s
4–21 denote materially different content after the rebuild — different phrases, different
rungs, different difficulty — even though the ids themselves are reused, and `id`s 22–30
are new.

`lessonScores` is keyed by lesson `id` in `localStorage` and stores `passed: true` once a
lesson (or its Remedial) is completed at ≥ 80%. If `STORAGE_KEY` stayed at
`"magyar-otthon-stats-v2"`, an existing learner's stale `passed: true` flags on ids 4–21
would carry over onto the rebuilt lessons at those same ids — silently unlocking mid-ladder
content the learner has never actually walked. For a track whose entire premise is a
gradual, unskippable climb, that defeats the purpose: lesson 16 (rung 5, the accusative
case) would show as already-passed for a returning learner who has in fact never seen a
rung-5 sentence.

## Decision

**Bump `STORAGE_KEY` to `"magyar-otthon-stats-v3"`.** A fresh key means every learner —
new or returning — starts the rebuilt Bath Time ladder at lesson 1, walking it from the
bottom as designed. No migration is attempted.

## Alternatives Considered

- **Migrate `lessonScores`**: Re-map old id → new id `passed` flags where content is judged
  "close enough". Rejected — the whole point of the rebuild is that the old content skipped
  rungs; there is no principled way to decide which stale passes still apply to the new,
  differently-shaped lessons at the same id.
- **Keep v2 and reset only Bath Time's `lessonScores` entries in code on load**: Rejected —
  more code than a key bump, and harder to reason about; a version bump is the existing,
  well-understood pattern (see ADR 0004, v1 → v2) for "this data no longer means what it
  used to mean."

## Consequences

- Existing progress (lesson scores, phrase-level SRS stats, settings) under
  `magyar-otthon-stats-v2` is abandoned — not read, not migrated. `loadStats()` starts every
  user, new or returning, from `defaultStats()`.
- This is a one-time cost paid now, while only Bath Time has content and the user base is a
  single family. Future tracks reaching this same rebuild will need their own consideration
  of whether a key bump is warranted, per track content maturity at the time.
- No further app changes are required — `STORAGE_KEY` is the only thing consumers of
  `useStats()` need to agree on; `loadStats()`/`saveStats()` already read and write through
  the constant.
