# Spec Index

_Updated: 2026-08-20_

## Current architecture (Track → Band → Lesson)

Specs written against the post-rewrite model. These describe the app as it exists today.

| Spec | Status | Impl tasks | Description | Next action |
|------|--------|-----------|-------------|-------------|
| [bath-time-a2-c1](bath-time-a2-c1.md) | Done | 9/9 | Author Bath Time A2–C1 lessons (ids 5–21); complete the track end-to-end | — |
| [grammar-card-results-screen](grammar-card-results-screen.md) | Done | 5/5 | Grammar card before B1+ quizzes; full results screen with missed-phrase review | — |
| [home-screen-track-detail](home-screen-track-detail.md) | Done | 7/7 | Track-card home screen, Track Detail with band sections, Recommended Next card | — |
| [rewrite-foundation](rewrite-foundation.md) | Done | 28/28 | New Track/Band/Lesson data model, simplified stats, updated quiz engine, Bath Time A1 content, legacy code removed | — |

All requirements and acceptance criteria on these four specs were verified against
`src/App.jsx` on 2026-08-20 and ticked. `npm run build` passes clean.

## Defined but not yet specced

Behaviour that `CONTEXT.md` specifies in full but which has no spec file and no
implementation in `src/App.jsx`. These are the remaining gaps in the Bath Time
prototype — the track is content-complete but the lesson loop is not.

| Gap | Defined in | Why it matters |
|-----|-----------|----------------|
| Remedial | `CONTEXT.md` § Remedial | A failed lesson currently just ends; `passed` can only be set by re-running the full lesson |
| Band Review | `CONTEXT.md` § Band Review | Bath Time has five completed bands with no transition marker between them |
| Settings screen | `CONTEXT.md` § Screen Inventory | Audio auto-play toggle; listed in the screen inventory, no component exists |

## Pre-rewrite (historical record)

These specs were completed under the previous phase/lesson architecture, which was
fully removed in `rewrite-foundation` (commit `41436ab`). Their content no longer
exists in `src/App.jsx`. Implementation-task counts reflect what was done at the
time; their requirement and acceptance-criteria checkboxes are deliberately left
unticked, as those features are gone. Retained for history — do not resurrect
without a new spec.

| Spec | Status | Impl tasks | Description |
|------|--------|-----------|-------------|
| [batch-issues-34-37](batch-issues-34-37.md) | Superseded | 7/7 | New Drawing & Counting lessons (43, 44), expanded Bath Time (30), PWA icon |
| [breadth-pass](breadth-pass.md) | Superseded | 7/7 | 18 new vocabulary lessons across phases 1–8 (ids 75–94) |
| [engine-depth](engine-depth.md) | Superseded | 23/23 | Story cards, listening mode, grammar-pattern drill, shadowing, reconstruct quiz, weekly theme |
| [grammar-spine](grammar-spine.md) | Superseded | 9/9 | B1 grammar lessons (ids 45–56) distributed across phases 1–8 |
| [plans-hypotheticals](plans-hypotheticals.md) | Superseded | 8/8 | Phase 11: future plans, conditionals, hopes (ids 69–74) |
| [reasoning-narrative](reasoning-narrative.md) | Superseded | 7/7 | Phases 9–10: reasoning connectors + narrative/storytelling (ids 57–68) |
| [srs-upgrade](srs-upgrade.md) | Superseded | 11/11 | SM-2 spaced repetition scheduler with Review Due mode and Daily Focus integration |

## Status meanings

| Status | Meaning |
|--------|---------|
| Draft | Spec written; not yet approved for implementation |
| Approved | User has signed off; ready to implement |
| In Progress | Implementation underway |
| Done | All implementation tasks complete; verified in app |
| Superseded | Was completed, but the code it describes has since been removed |

## How to keep this up to date

Run `/spec-tracker` (or ask "update specs") at the end of any session where spec files or `src/App.jsx` were modified. The `spec-tracker` skill will recount tasks, fix status headers, and rewrite this file automatically.
