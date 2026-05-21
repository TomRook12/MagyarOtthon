# Spec Index

_Updated: 2026-05-21_

| Spec | Status | Impl tasks | Description | Next action |
|------|--------|-----------|-------------|-------------|
| [bath-time-a2-c1](bath-time-a2-c1.md) | Done | 9/9 | Author Bath Time A2–C1 lessons (ids 5–21); complete the track end-to-end | — |
| [rewrite-foundation](rewrite-foundation.md) | Done | 28/28 | New Track/Band/Lesson data model, simplified stats, updated quiz engine, Bath Time A1 content, legacy code removed | — |
| [batch-issues-34-37](batch-issues-34-37.md) | Done ¹ | 7/7 | New Drawing & Counting lessons (43, 44), expanded Bath Time (30), PWA icon | — |
| [breadth-pass](breadth-pass.md) | Done ¹ | 7/7 | 18 new vocabulary lessons across phases 1–8 (ids 75–94); push to ~2,500 words | — |
| [engine-depth](engine-depth.md) | Done ¹ | 23/23 | Story cards, listening mode, grammar-pattern drill, shadowing, reconstruct quiz, weekly theme | — |
| [grammar-spine](grammar-spine.md) | Done ¹ | 9/9 | B1 grammar lessons (ids 45–56) distributed across phases 1–8 | — |
| [plans-hypotheticals](plans-hypotheticals.md) | Done ¹ | 8/8 | Phase 11: future plans, conditionals, hopes (ids 69–74) | — |
| [reasoning-narrative](reasoning-narrative.md) | Done ¹ | 7/7 | Phases 9–10: reasoning connectors + narrative/storytelling (ids 57–68) | — |
| [srs-upgrade](srs-upgrade.md) | Done ¹ | 11/11 | SM-2 spaced repetition scheduler with Review Due mode and Daily Focus integration | — |

¹ Pre-rewrite. These specs were completed under the previous phase/lesson architecture, which was fully removed in `rewrite-foundation` (commit `41436ab`). Their content no longer exists in `src/App.jsx`; the specs are retained as historical record.

## Status meanings

| Status | Meaning |
|--------|---------|
| Draft | Spec written; not yet approved for implementation |
| Approved | User has signed off; ready to implement |
| In Progress | Implementation underway |
| Done | All implementation tasks complete; verified in app |

## How to keep this up to date

Run `/spec-tracker` (or ask "update specs") at the end of any session where spec files or `src/App.jsx` were modified. The `spec-tracker` skill will recount tasks, fix status headers, and rewrite this file automatically.
