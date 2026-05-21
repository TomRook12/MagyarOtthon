# ADR 0001 — Wipe Legacy Lessons on Rewrite

**Status:** Accepted  
**Date:** 2026-05-21

## Context

The current `LESSONS[]` array contains ~75 phrase-based lessons organised across 11 time-of-day phases. The new PRD introduces a structured Track > Band > Lesson curriculum (A1–C1 CEFR) beginning with Bath Time. The two bodies of content are incompatible in schema, progression model, and pedagogical approach.

## Decision

All existing lesson content is removed. The rewrite begins with a clean data model built to the new schema. The Bath Time arc (21 lessons, Sections 5 and 13 of the PRD) is the initial content.

## Alternatives Considered

- **Migrate**: Tag existing lessons with trackId, band, and sequence. Rejected — the current lessons lack CEFR band alignment and typed-answer content; the mapping would be arbitrary for most of them.
- **Parallel tracks**: Run the new engine alongside the existing one. Rejected — doubles maintenance burden and produces a confusing UX split during the transition.

## Consequences

- The 75+ legacy lessons are preserved in git history but removed from the live app.
- No user data migration is needed (there is no server; localStorage is per-device).
- The Bath Time arc must be substantially complete before any user-facing release replaces the current app.
