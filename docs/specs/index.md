# Spec Index

_Updated: 2026-08-21_

## Current architecture (Track → Band → Lesson)

Specs written against the post-rewrite model. These describe the app as it exists today.

| Spec | Status | Impl tasks | Description | Next action |
|------|--------|-----------|-------------|-------------|
| [bath-time-loop-completion](bath-time-loop-completion.md) | Done | 14/15 | Remedial, Band Review, and the Settings audio toggle — closes the lesson loop | — |
| [bath-time-a2-c1](bath-time-a2-c1.md) | Done | 9/9 | Author Bath Time A2–C1 lessons (ids 5–21); complete the track end-to-end | — |
| [grammar-card-results-screen](grammar-card-results-screen.md) | Done | 5/5 | Grammar card before B1+ quizzes; full results screen with missed-phrase review | — |
| [home-screen-track-detail](home-screen-track-detail.md) | Done | 7/7 | Track-card home screen, Track Detail with band sections, Recommended Next card | — |
| [progression-ladder](progression-ladder.md) | Done | 14/14 | Rebuild Bath Time as a 7-rung ladder with a lexical spine that threads through the whole track | — |
| [rewrite-foundation](rewrite-foundation.md) | Done | 28/28 | New Track/Band/Lesson data model, simplified stats, updated quiz engine, Bath Time A1 content, legacy code removed | — |
| [lesson-progression](lesson-progression.md) | Done | 7/7 | "Next lesson →" button on the results screen after a pass | — |
| [picture-association](picture-association.md) | Done | 14/14 | Inline-SVG icons and a `picture_pick` question type for rung 1–2 vocabulary | — |
| [quiz-repeat-fix](quiz-repeat-fix.md) | Done | 9/9 | Draw phrases without replacement; never repeat a phrase back to back | — |
| [build-stamp](build-stamp.md) | Done | 5/5 | Commit SHA and build date in Settings, so a stale client is diagnosable | — |

All requirements and acceptance criteria on the first six specs above were verified against
`src/App.jsx` on 2026-08-20 and ticked. `npm run build` passes clean.

**Bath Time is a complete vertical slice, rebuilt as a 30-lesson, 7-rung ladder.**
Every behaviour `CONTEXT.md` defines is built: the full lesson loop (grammar card → quiz →
results → remedial), Band Review, Settings, and A1–C1 content that climbs gradually from
bare words to extended speech on a lexical spine (`scripts/curriculum.config.json`),
enforced by `npm run validate:curriculum`.

Two nice-to-haves were specced and deliberately not built, both in
`bath-time-loop-completion`: a "now correct" indicator on the Remedial results screen,
and a decision record for the Band Review trigger point (unnecessary — it was built
exactly as `CONTEXT.md` describes). `progression-ladder` also left two nice-to-haves
unbuilt: a "builds on: …" line in Track Detail, and extra grammar cards at rungs 2–3.

## Test-feedback round 1 (2026-08-21) — all three shipped

Three specs from the first round of real family testing, all implemented, verified and
pushed on `claude/test-feedback-feature-spec-s9pjqd`.

| Spec | Commit | What it changed |
|------|--------|-----------------|
| quiz-repeat-fix | `fa655ac` | `generateQuestions` draws phrases without replacement and never repeats one back to back |
| lesson-progression | `eddbb2d` | `getNextLesson()` and a **Next lesson →** button on the results screen |
| picture-association | `12a88ff` | 22 inline-SVG icons, the `picture_pick` question type, icons replacing English in `match` |

**`quiz-repeat-fix` needed two design passes.** The first implementation followed the spec
verbatim, measured itself, and failed its own acceptance criteria: a forward-only swap pass
could not fix a collision at the last index, and the bag cursor advanced on declined draws,
silently dropping phrases. Both are recorded in that spec's "Why the first design failed"
section — keep it, it is the reason the algorithm looks the way it does. The corrected
design measures 0 adjacent pairs and 0 missing phrases across 400 runs of lesson 3, and 0
adjacency across all 30 lessons.

**Verification went beyond the build.** `lesson-progression` and `picture-association` were
driven in headless Chromium against the real dev server — 17 and 8 assertions respectively,
covering the pass / fail / remedial-pass / band-boundary / track-end / grammar-card paths and
the icon rendering. The browser tooling lives outside the repo, so `package.json` still has
zero production dependencies beyond React.

Two open questions were deliberately left for after a week of real use, both in
`picture-association`: the always-visible Hungarian labels make the picture *available* but
not *required* to answer (a one-condition change flips it to reveal-only), and the command
pictograms for lesson 3 are the weak link — `csitt` in particular reads more like a clock
face than a "shh" gesture. If lesson 3 starts scoring worse than lessons 1–2, the fix is
dropping icons from it rather than redrawing them a third time.

## Next up

The seven remaining tracks, as content, now that `progression-ladder` has landed and
proven the rung-ladder shape on Bath Time. `CONTEXT.md` § TRACKS Registry lists the
remaining seven: Bed Time, Getting Ready, Mealtimes, School Run, Park, Homework, Playing.
Per ADR 0005, the second track's spec should open by evaluating whether cross-track
lexical carry-over is worth adopting before authoring begins.

Note that `picture-association` keys icons by concept rather than by phrase precisely so a
second track can reuse `víz`, `kéz` and friends without redrawing them.

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
