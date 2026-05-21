# Spec: Bath Time A2–C1 Content

> **Status:** Done
> **Branch:** `main`

## Goal

Author the remaining 17 Bath Time lessons (A2–C1, ids 5–21) so the track is complete end-to-end. No UI changes — pure lesson data.

## Background

Bath Time A1 (ids 1–4) shipped in the `rewrite-foundation` commit. The PRD (Section 13) specifies all content for A2–C1. This spec authors that content and validates it against the Hungarian-teacher skill before commit.

## Requirements

### Must have
- [x] A2 Lesson 2.1 — Imperative Mood (Implicit) · id 5
- [x] A2 Lesson 2.2 — Temperature & Sensation · id 6
- [x] A2 Lesson 2.3 — Sequencing Bath Time · id 7
- [x] A2 Lesson 2.4 — Simple Questions · id 8
- [x] B1 Lesson 3.1 — Imperative Mood (Explicit) · id 9
- [x] B1 Lesson 3.2 — Accusative Case · id 10
- [x] B1 Lesson 3.3 — Negation · id 11
- [x] B1 Lesson 3.4 — Describing Child's Behaviour · id 12
- [x] B1 Lesson 3.5 — Past Tense · id 13
- [x] B2 Lesson 4.1 — Parent-to-Parent Phrases · id 14
- [x] B2 Lesson 4.2 — Conditional Sentences · id 15
- [x] B2 Lesson 4.3 — Complex Instructions · id 16
- [x] B2 Lesson 4.4 — Resistance & Negotiation · id 17
- [x] C1 Lesson 5.1 — Diminutives & Affectionate Language · id 18
- [x] C1 Lesson 5.2 — Idiomatic Bath Time · id 19
- [x] C1 Lesson 5.3 — Storytelling & Extended Speech · id 20
- [x] C1 Lesson 5.4 — Capstone Scenario · id 21
- [x] B1+ lessons include `grammar` field text (3.1, 3.2, 3.3, 4.2, 5.1)
- [x] All phrases have `hu`, `pr`, `en` fields
- [x] `hungarian-teacher` skill validates all new Hungarian content
- [x] `convention-reviewer` agent passes before commit

### Out of scope
- Grammar Card screen (displayed but deferred to next spec)
- Remedial quiz
- UI changes

## Design

All 17 lessons are appended to `LESSONS[]` in `src/App.jsx`, immediately before the `// ─── UTILITIES` banner (per app-map.md workflow).

### Lesson type mappings (PRD → code)
| PRD term | `types` value |
|---|---|
| Match / Match the Correct Options | `match` |
| Phrase List | `phrase_list` |
| Fill in the Gap (word pool) | `fill_pool` |
| Fill in the Gap (typed) | `fill_typed` |
| Sentence Builder | `sentence_builder` |
| True/False | `true_false` |

Note: `fill_typed` is auto-converted to `fill_pool` for A1/A2 bands by the engine, so it can be listed freely in A2 `types`.

### B1+ grammar fields
Lessons with a grammar card get a `grammar` string. Required for:
- id 9 (imperative mood)
- id 10 (accusative case)
- id 11 (negation)
- id 15 (conditional)
- id 18 (diminutives)

### Pronunciation guide conventions
Follows A1 style: English phonetic approximations, capitals = stress, Hungarian accented letters kept where clear.
- `cs` → `ch` · `sz` → `s` · `s` → `sh` · `gy` → `dy` · `a` → `o` · `j` → `y`

## Implementation tasks

- [x] Author A2 lessons (ids 5–8) in App.jsx
- [x] Author B1 lessons (ids 9–13) in App.jsx
- [x] Author B2 lessons (ids 14–17) in App.jsx
- [x] Author C1 lessons (ids 18–21) in App.jsx
- [x] Run `hungarian-teacher` skill on all new content
- [x] Apply any corrections from skill review (megmosdjuk → megmosdunk in id 20)
- [x] Run `convention-reviewer` agent pre-commit
- [x] Run `npm run build` — confirm no errors
- [x] Update `docs/specs/index.md` via `spec-tracker` skill

## Acceptance criteria

- [x] `LESSONS[]` contains ids 1–21, no gaps, no duplicates
- [x] Every phrase object has `hu`, `pr`, `en`
- [x] Every B1+ lesson that the PRD marks as having a grammar card has a non-empty `grammar` field
- [x] `npm run build` produces a clean bundle
- [x] `convention-reviewer` reports no violations
