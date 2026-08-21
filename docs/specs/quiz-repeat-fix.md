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
- [ ] No two adjacent questions in the returned array share a `phrase.hu`.
- [ ] Weak items keep their extra weight — they should still appear more often across the
      run, they just may not appear twice in a row.
- [ ] `generateQuestions` still returns exactly `count` questions (or all it can build) and
      never throws on a one-phrase Remedial pool.
- [ ] `npm run validate:curriculum` passes — R10 exercises the real `generateQuestions`.

### Nice to have
- [ ] Avoid the identical `phrase` + `type` pair appearing twice in a row even where the
      phrase differs — already implied, but assert it in the manual check.

### Out of scope
- Changing which phrases are chosen for a lesson (weak-item weighting policy stays as is).
- Any change to the six generators themselves.
- Guaranteeing a minimum gap larger than one question.

## Design

Three focused changes inside `generateQuestions`, all above the `// ─── STYLES` banner so
the validator keeps importing them.

**1. Cycle the pool instead of sampling it.** Replace the two independent `pool[random]`
draws with a cursor over a shuffled copy that reshuffles when exhausted:

```js
// Draw phrases without replacement, reshuffling each time the pool runs dry, so a
// 6-phrase lesson covers all 6 before repeating any — random sampling was giving one
// phrase five slots and another none.
let bag = shuffle(pool), bi = 0;
const nextPhrase = () => {
  if (bi >= bag.length) { bag = shuffle(pool); bi = 0; }
  return bag[bi++];
};
```

`pool` still contains the weak-item duplicates, so a weak phrase legitimately occupies
three of the bag's slots per cycle and is drawn three times as often. Reshuffling on
exhaustion means cycle boundaries do not repeat in a fixed order.

**2. Keep the existing structure otherwise.** The two loops (the first pass over `types`,
then the top-up `while`) both call `nextPhrase()` instead of sampling. The `match` special
case, the `attempts < 200` guard, and the empty-pool fallback are untouched.

**3. Separate adjacent duplicates after the shuffle.** Add a small pass applied to the
shuffled array before `slice`:

```js
// A phrase may repeat inside a run — it may not repeat back to back.
function separateAdjacent(qs) {
  const key = q => q.type === "match" ? null : q.phrase?.hu ?? null;
  for (let i = 1; i < qs.length; i++) {
    if (key(qs[i]) === null || key(qs[i]) !== key(qs[i-1])) continue;
    // find the nearest later question that differs from both neighbours and swap it in
    let j = qs.findIndex((q, k) => k > i &&
      key(q) !== key(qs[i-1]) &&
      (k + 1 >= qs.length || key(q) !== key(qs[k+1])));
    if (j > i) [qs[i], qs[j]] = [qs[j], qs[i]];
  }
  return qs;
}
```

Notes the implementer must respect:

- `match` covers four phrases at once and its `phrase` field is only `s[0]`; treat it as
  having no key so it never blocks or is blocked.
- Swapping can only fail when the pool genuinely cannot avoid it (a one-phrase Remedial
  pool). In that case leave the order alone rather than looping — the guard is `if (j > i)`,
  and a Remedial on a single missed phrase is *meant* to hammer that phrase.
- Do the pass on the shuffled array, then `slice(0, count)`. Slicing first would let the
  cut reintroduce an adjacent pair at the boundary — it cannot here, but keep the order.

### Effect on lesson 3

| | Today | After |
|---|---|---|
| Distinct phrases seen | typically 4 of 6 | all 6, twice each, plus 2 |
| Adjacent duplicates | ~4 per run | 0 |
| `gyere` appearances | 0–5, unpredictable | 2 (3 if flagged weak) |

## Implementation tasks

- [ ] Add the `nextPhrase()` bag cursor in `generateQuestions`; replace both `pool[random]`
      draws with it.
- [ ] Add `separateAdjacent()` next to `shuffle()` in `// ─── UTILITIES` and call it on the
      shuffled result before `slice`.
- [ ] Run `npm run validate:curriculum` — all rules pass, R10 in particular.
- [ ] Run `npm run build` — clean.
- [ ] Manual check: open lesson 3, play through all 15 questions, confirm no phrase appears
      twice in a row and all 6 phrases appear.
- [ ] Manual check: fail a lesson, start the Remedial with exactly one missed phrase, and
      confirm the 8-question run still works (repeats expected and correct here).
- [ ] Update `docs/app-map.md` Section G — the `generateQuestions` entry should state that
      phrases are drawn without replacement and no phrase repeats back to back.

## Open questions

None.

## Acceptance criteria

- [ ] Across 100 generated runs of lesson 3 (6 phrases), zero runs contain two consecutive
      questions with the same `phrase.hu`.
- [ ] In the same 100 runs, every one of the 6 phrases appears at least once in every run.
- [ ] A Remedial pool of one phrase still returns 8 questions and does not hang.
- [ ] A weak phrase (`wrong >= right`) still appears roughly three times as often as a
      non-weak one across many runs.
- [ ] `npm run validate:curriculum` and `npm run build` both pass.
