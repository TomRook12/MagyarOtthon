# ADR 0005 — Cross-Track Lexical Carry-Over

**Status:** Accepted (deferred implementation — revisit when the second track is authored)
**Date:** 2026-08-20

## Context

The `progression-ladder` spec introduces a **lexical spine** and a **carry-over** rule: each
lesson must reuse a minimum share of vocabulary already taught, so the learner climbs from
words to sentences on a thread of familiar material rather than meeting new words at every
step. Carry-over is computed by `scripts/validate-curriculum.mjs` (rule R4).

As specced for Bath Time, carry-over is measured **strictly within a track**. A lesson in
Bath Time counts a word as "known" only if an earlier Bath Time lesson taught it.

That is uncontroversial while only one track has content. It stops being obvious the moment
a second track exists. Bath Time teaches `víz`, `kéz`, `meleg`, `tiszta`, `mosd`. Mealtimes
and Getting Ready will want all five. Under within-track measurement, a learner who has
completed all 30 Bath Time lessons arrives at Mealtimes lesson 1 and the validator treats
`víz` as brand new — because *that track* has not taught it.

This has two costs:

1. **Authoring is harder than it needs to be.** Every track must re-teach the shared core
   from rung 1, spending its early new-lexeme budget on words the learner already owns.
2. **The learner's experience misrepresents what they know.** A track that opens by
   re-teaching `víz` as a bare noun is not meeting the learner where they are.

The counter-argument is real: tracks are explicitly **independent**. `CONTEXT.md` states
that each Track contains a full A1–C1 arc and that a user may begin any Track, with Bath
Time only *recommended* as the entry point. If carry-over counted cross-track vocabulary,
a learner starting with Mealtimes would hit lessons whose carry-over assumes Bath Time
words they have never seen — the validator would pass content that is, for that learner,
full of unknowns.

## Decision

**Carry-over stays within-track for now.** This is the conservative choice: it can never
produce content that assumes vocabulary the learner has not met, because it assumes nothing
beyond the current track.

**Cross-track carry-over is agreed in principle and revisited when the second track is
authored** — not before. The question cannot be answered well in the abstract; it needs a
real second track to show how much overlap actually exists and how much re-teaching the
within-track rule really forces.

When that revisit happens, the shape to evaluate is a **shared core plus per-track spine**:

- A small `shared` lexeme set in `scripts/curriculum.config.json` — the genuinely
  cross-domestic vocabulary (`víz`, `kéz`, `meleg`, `tiszta`, `nem`, `kész`, and similar).
- Every track teaches the shared core in its own A1, so any track remains a valid entry
  point. Track independence is preserved.
- Carry-over then counts a word as known if it is in the shared core **and** taught in the
  current track's A1 — which lets later lessons lean on it without assuming another track.

That preserves the property that matters (no track assumes another track's content) while
removing the pure duplication.

## Consequences

- `progression-ladder` ships with within-track carry-over. No config change needed now.
- The second track's spec must open by evaluating this ADR against real overlap data, and
  either adopt the shared-core model or record why within-track measurement should stand.
- If the shared-core model is adopted, `validate-curriculum.mjs` gains a `shared` lexeme set
  and R4 changes; existing Bath Time content should still pass, since a rule that counts
  *more* words as known can only raise carry-over.
- Deferring costs nothing: within-track is strictly the stricter rule, so no content
  authored under it becomes invalid under the looser one.
