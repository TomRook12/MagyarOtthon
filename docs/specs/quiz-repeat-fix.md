# Spec: No Back-to-Back Repeats in a Quiz Run

> **Status:** Approved
> **Branch:** `claude/test-feedback-feature-spec-s9pjqd`

## Goal

Stop the same phrase appearing in two consecutive questions, and stop a quiz spending
fifteen questions on three of a lesson's six phrases. Repeating a phrase inside a run is
fine and wanted; repeating it *immediately* is what makes the quiz feel broken.

## Background

Reported from testing: "Sometimes I receive the same question back to back, eg. gyere then
gyere. It's ok to repeat the question in the lesson imo but not back to back."

This is structural, not bad luck. In `generateQuestions` (`src/App.jsx`, `// ─── QUESTION
GENERATORS`) every iteration of both selection loops does:

```js
const p = pool[Math.floor(Math.random()*pool.length)];
```

— an independent draw **with replacement**. Lesson 3 (the `Gyere!` lesson) has 6 phrases
and declares `["match","phrase_list"]`; `match` fires at most once per run, so 14 of the 15
questions are `phrase_list` drawn independently from 6 phrases. Adjacent duplicates are the
expected outcome, not an edge case, and some phrases never appear at all. Weak-item
triple-weighting (`pool = [...pool, ...weakItems, ...weakItems]`) makes both effects worse
precisely on the phrases the learner already sees most.

The final `shuffle(qs).slice(0, count)` does nothing to help — shuffling a bag that already
contains five copies of `gyere` still puts two of them together most of the time.

## Requirements

### Must have
- [ ] Phrase selection draws **without replacement**: every phrase in the pool is used once
      before any phrase is used a second time, and so on for each subsequent cycle.
- [ ] A draw that produces no question does **not** consume its phrase's slot in the cycle.
- [ ] No two adjacent questions in the returned array share a `phrase.hu`, in every run
      where any arrangement of that run's questions could avoid it.
- [ ] Weak items keep their extra weight — they should still appear more often across the
      run, they just may not appear twice in a row.
- [ ] `generateQuestions` still returns exactly `count` questions (or all it can build) and
      never throws on a one-phrase Remedial pool.
- [ ] `npm run validate:curriculum` passes — R10 exercises the real `generateQuestions`.

### Nice to have
- [ ] Some randomness in how equally-sized phrase groups are ordered, so two runs of the
      same lesson do not produce the same phrase sequence.

### Out of scope
- Changing which phrases are chosen for a lesson (weak-item weighting policy stays as is).
- Any change to the six generators themselves.
- Guaranteeing a minimum gap larger than one question.


## Design

> **Revised 2026-08-21, after the first implementation measured itself and failed.** The
> original design used a forward-only swap pass and a bag cursor that advanced on every
> draw. Implemented verbatim, it left an adjacent pair in 10–17 of every 100 lesson-3 runs
> and dropped a phrase entirely from 8–17 of them. Both causes are recorded in
> "Why the first design failed" below; keep that section, it is the reason this one looks
> the way it does.

Three changes inside `generateQuestions`, all above the `// ─── STYLES` banner so the
validator keeps importing them.

**1. Cycle the pool instead of sampling it — and only consume a phrase that was used.**

```js
// Draw phrases without replacement, reshuffling each time the pool runs dry, so a
// 6-phrase lesson covers all 6 before repeating any — random sampling was giving one
// phrase five slots and another none.
let bag = shuffle(pool), bi = 0;
const peekPhrase = () => { if (bi >= bag.length) { bag = shuffle(pool); bi = 0; } return bag[bi]; };

// A generator that declines must not burn the phrase's turn. `match` declines every time
// after its first use, so on a two-type lesson roughly half the draws are discarded — and
// advancing the cursor on those was silently dropping phrases from the run entirely.
const build = (type) => {
  if (type === "match") return gen(type, null);   // genMatch chooses its own four phrases
  const q = gen(type, peekPhrase());
  if (q) bi++;                                    // commit only on a produced question
  return q;
};
```

Both loops call `build(type)` and push whatever it returns if truthy. `match` is handled
before any draw, because `genMatch` ignores the phrase argument entirely — committing a
phrase for it would drop that phrase from the cycle for nothing.

`pool` still contains the weak-item duplicates, so a weak phrase legitimately occupies
three of the bag's slots per cycle and is drawn three times as often.

**2. Keep the rest of the structure.** The two loops (the first pass over `types`, then the
top-up `while`), the `attempts < 200` guard, and the empty-pool fallback are untouched
apart from calling `build`.

**3. Reorder greedily instead of swapping.** Replace the shuffled array's order entirely:

```js
// Reorder so no two adjacent questions drill the same phrase. Greedy: repeatedly take the
// phrase with the most questions left, unless that is the phrase just placed, in which case
// take the runner-up. This succeeds whenever any arrangement can — i.e. unless one phrase
// holds more than half the slots, which is exactly the single-phrase Remedial case.
function separateAdjacent(qs){
  const key=q=>q.type==="match"?null:(q.phrase?.hu??null);
  const groups=new Map();
  for(const q of qs){const k=key(q);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(q);}
  // `match` covers four phrases and reports only s[0], so it belongs to no phrase — hold
  // those aside as filler that can separate any pair.
  const free=groups.get(null)||[]; groups.delete(null);
  const out=[]; let prev=null;
  while(groups.size||free.length){
    let best=null;
    for(const [k,arr] of groups)
      if(k!==prev&&(best===null||arr.length>groups.get(best).length))best=k;
    if(best===null){
      if(free.length){out.push(free.pop());prev=null;continue;}
      best=groups.keys().next().value;   // only `prev` is left — unavoidable, and correct
    }                                    // for a Remedial pool of one phrase
    const arr=groups.get(best);
    out.push(arr.pop());
    if(!arr.length)groups.delete(best);
    prev=best;
  }
  return out;
}
```

Why greedy rather than swapping: a swap pass can only fix a collision by finding somewhere
else to put one of the two questions, and at the **last index there is nowhere later to
look** — `qs` is already exactly `count` long, so there is no surplus. That single blind
spot accounted for most of the measured failures. Rebuilding the order from scratch has no
blind spot: taking the largest remaining group each step is the standard optimal strategy
for this rearrangement, and it fails only when one phrase genuinely holds more than half
the slots.

Notes the implementer must respect:

- `separateAdjacent` now **returns a new array** rather than mutating in place. Call it as
  `separateAdjacent(shuffle(qs)).slice(0, count)`.
- The `prev = null` after placing a `match` is deliberate: a match question separates two
  instances of the same phrase perfectly well, so the phrase before it is not a constraint
  on the phrase after it.
- The final fallback (`groups.keys().next().value`) is what makes a one-phrase Remedial
  pool work. It is meant to hammer that phrase; do not "fix" it.

### Why the first design failed

Keep this section. It is the evidence for the two rules above, measured on the real code.

1. **Forward-only swap.** `qs.findIndex((q,k) => k > i && …)` has nothing to find when the
   collision is at the last index, and the `if (j > i)` guard then correctly declines to
   swap — leaving the pair in place. Common on an ordinary 15-question run, not just on the
   Remedial pool the original notes anticipated.
2. **Bag cursor advanced on declined draws.** On lesson 3 the top-up loop picks `match` or
   `phrase_list` 50/50, and `match` declines after its first use. Every declined attempt
   still consumed a phrase's slot, so that phrase got no further draw until the bag
   reshuffled — and the run often hit `count` first, leaving the phrase absent.

Measured before the fix, across four independent 100-run samples of lesson 3: 10–17 runs
per sample contained an adjacent pair, 8–17 runs were missing at least one of the 6
phrases.

### Effect on lesson 3

| | Before any fix | After |
|---|---|---|
| Distinct phrases seen | typically 4 of 6 | all 6, every run |
| Adjacent duplicates | ~4 per run | 0 |
| `gyere` appearances | 0–5, unpredictable | 2 (3 if flagged weak) |

## Implementation tasks

- [ ] Replace `nextPhrase()` with `peekPhrase()` + the `build(type)` helper that commits the
      cursor only on a produced question and handles `match` without a draw.
- [ ] Point both selection loops at `build(type)`.
- [ ] Replace `separateAdjacent()` in `// ─── UTILITIES` with the greedy rebuild; call it as
      `separateAdjacent(shuffle(qs)).slice(0, count)`.
- [ ] Run `npm run validate:curriculum` — all rules pass, R10 in particular.
- [ ] Run `npm run build` — clean.
- [ ] Re-run the verification script from the first attempt and record the new numbers in
      this spec. The adjacency and coverage counts must both be zero across 4 × 100 runs.
- [ ] Manual check: open lesson 3, play through all 15 questions, confirm no phrase appears
      twice in a row and all 6 phrases appear.
- [ ] Manual check: fail a lesson, start the Remedial with exactly one missed phrase, and
      confirm the 8-question run still works (repeats expected and correct here).
- [ ] Update `docs/app-map.md` Section G — the `generateQuestions` entry should state that
      phrases are drawn without replacement, that a declined draw does not consume its
      phrase, and that no phrase repeats back to back.

## Open questions

None.

## Acceptance criteria

- [ ] Across 4 × 100 generated runs of lesson 3 (6 phrases), **zero** runs contain two
      consecutive questions with the same `phrase.hu`.
- [ ] In the same runs, **zero** runs are missing any of the 6 phrases.
- [ ] A Remedial pool of one phrase still returns 8 questions and does not hang.
- [ ] A weak phrase (`wrong >= right`) still appears roughly three times as often as a
      non-weak one across many runs.
- [ ] `npm run validate:curriculum` and `npm run build` both pass.
