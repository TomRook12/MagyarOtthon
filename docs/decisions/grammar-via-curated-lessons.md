# Decision: Grammar is taught via curated phrase lessons, not a separate grammar mode

> **Date:** 2026-04-07
> **Status:** Accepted

## Context

A gap analysis toward CEFR B1/B2 (April 2025) found that the existing 44 situational lessons only cover 5 of the 18 Hungarian cases and omit systematic coverage of key paradigms (past tense, conditional, future, imperative, possessives, verbal prefixes, comparison). Without structured grammar exposure the learner can produce set family phrases but cannot generalise patterns to new vocabulary.

The app's constitution says it is "phrase-based, not academic study" and must not become a general-purpose language course. Any grammar addition must stay consistent with this.

## Decision

Grammar is taught by adding a **Phase 9 "Grammar Spine"** — a set of 12 normal lessons (ids 45–56) whose phrases are deliberately chosen so that a single grammar paradigm emerges from the examples. Each lesson has the standard schema plus:

- A stronger `pat` field containing a short paradigm table (rendered as preformatted text)
- A `patternId` string field naming the paradigm (e.g. `"past-indef"`, `"dative"`)

The `patternId` field is optional and additive; existing lessons without it are unaffected.

## Alternatives considered

| Option | Why rejected |
|--------|-------------|
| Separate "Grammar" tab/mode with dedicated UI | Would require splitting `App.jsx` or significant new UI; risks becoming the "academic study" mode the constitution forbids |
| Explicit grammar tables in a separate docs section only | Learner would never encounter the tables during normal use; no reinforcement through quiz/flashcard engines |
| Annotating existing lessons with `patternId` only | Existing lessons were written for situation coverage, not paradigm coverage; the grammar gaps would remain |
| SRS drill-by-pattern mode | Worthwhile follow-up, but requires `patternId` to exist first; deferred to a separate spec |

## Consequences

**Easier:**
- Grammar Spine lessons automatically participate in the Daily Focus Engine, quizzes, and flashcard engine with zero code changes
- `patternId` field enables a future "drill by paradigm" mode or lesson-list filter without schema migration
- The constitution is preserved: all phrases are natural family sentences the user would actually say

**Harder:**
- A learner cannot yet filter or drill by grammar paradigm — that requires a follow-up spec
- The phase list grows to 9; the home screen becomes slightly longer
