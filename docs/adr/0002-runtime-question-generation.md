# ADR 0002 — Runtime Question Generation from Vocabulary

**Status:** Accepted  
**Date:** 2026-05-21

## Context

The PRD specifies ~357 questions for the Bath Time track and describes AI-generated content. Two approaches were considered: pre-storing every question object, or storing vocabulary and generating questions at runtime.

## Decision

Questions are generated at runtime from vocabulary stored in each Lesson. Each Lesson carries a `types[]` field listing the question types the generator may use for that lesson. The existing `generateQuestions()` entry point is preserved; two new generator functions are added (typed fill-in-gap, audio-triggered phrase list).

## Alternatives Considered

- **Pre-stored question objects**: Full editorial control but ~357 explicit objects for Bath Time alone would make App.jsx unmaintainable and require splitting the file.

## Consequences

- Lesson data stays compact: vocabulary + allowed types + optional grammar card.
- The phrase "AI-generated at build time" in the PRD refers to the vocabulary and phrase content, not pre-rendered question objects.
- Per-lesson question type restrictions are expressed declaratively as a `types[]` array on each lesson.
- Two new generator functions are required: `genTyped` (free-text answer, B1+) and `genPhraseList` (hear audio, select written match).
