# Spec: Plans & Hypotheticals — Phase 12

> **Status:** Draft
> **Branch:** `claude/review-hungarian-curriculum-inyIG`

## Goal

Add a content phase covering future plans, wishes, conditional reasoning, and hypothetical language. This marks the real crossing into B1: the learner can now talk about what *will* happen, what *might* happen, and what they *wish* would happen — essential for family life (planning weekends, discussing possibilities, expressing hopes for the kids).

## Background

After Milestones 1 and 2, the learner has:
- Grammar foundations (Grammar Spine): future with `fog`, conditional `-nék/-nél/-na`, imperative
- Reasoning connectors (Phase 10): `mert`, `ha…akkor`, `szerintem`
- Narrative past (Phase 11): sequencing events, reported speech

What's missing is *sustained use* of future and conditional in real family conversations. The Grammar Spine teaches the paradigm; Phase 10 introduces `ha…akkor`; this phase provides the extended practice needed for fluency with these structures.

CEFR B1 descriptor: "Can describe hopes, dreams, and ambitions. Can give reasons and explanations for opinions and plans."

### Phase numbering

- Phase 12: Plans, Hopes, What-ifs (this spec)
- Lesson IDs: **69–74** (following Milestone 2's 57–68)

## Requirements

### Must have

- [ ] Lesson: **Tomorrow We Will…** — making plans with `fog` + infinitive, `holnap`, `a hétvégén`
- [ ] Lesson: **I Would Like To…** — `szeretnék` + infinitive, wishes for self/family
- [ ] Lesson: **If I Could…** — `ha tudnék`, `ha lenne`, extended conditional chains
- [ ] Lesson: **Maybe, Probably, Definitely** — hedging and certainty: `talán`, `valószínűleg`, `biztosan`, `lehet, hogy`
- [ ] Lesson: **Making Decisions Together** — collaborative planning: `mit szólsz`, `melyiket válasszuk`, `inkább`
- [ ] Lesson: **Dreams & Hopes** — `remélem`, `szeretném, ha`, `álmom az, hogy`, aspirational family talk

#### Infrastructure

- [ ] Phase 12 added to `PHASES` array
- [ ] All lessons follow existing schema with `patternId`
- [ ] `TIME_TAGS.evening` updated to include these lessons (planning conversations happen in the evening)
- [ ] `WEEKEND_BOOST` updated for "Making Decisions Together" and "Tomorrow We Will" (weekend planning)
- [ ] `aud: "both"` for all lessons (this is adult-level discourse, but kids hear it)

### Nice to have

- [ ] `tip` fields reference Grammar Spine lessons for paradigm review (e.g. "See lesson 48 for full conditional endings")
- [ ] A "Planning Conversation" prompt card: a scenario (e.g. "Plan a birthday party") that encourages stringing multiple phrases together

### Out of scope

- Past conditional (`lett volna`) — this is B2 territory; defer to Milestone 4 breadth pass
- New quiz types
- Audio features

## Design

### Phase registration

```js
{ id: 12, emoji: "🔮", title: "Plans & What-ifs", color: "#7B4FA0" },
```

### Lesson structure example

```js
{
  id: 69, phase: 12, title: "Tomorrow We Will…",
  sub: "Making plans · fog + infinitive",
  aud: "both", patternId: "future-plans",
  phrases: [
    { hu: "Mit fogunk csinálni holnap?", pr: "...", en: "What are we going to do tomorrow?" },
    // ... 7 more
  ],
  tip: "Weekend mornings are perfect for this lesson — plan the day in Hungarian.",
  pat: "fog + infinitive for definite plans\nPresent tense also works: 'Holnap megyünk' = 'We're going tomorrow'"
}
```

### Grammar patterns covered

| Lesson | Key grammar | patternId |
|--------|------------|-----------|
| Tomorrow We Will | `fog` + infinitive, time expressions | `future-plans` |
| I Would Like To | `szeretnék` + infinitive, polite wishes | `conditional-wishes` |
| If I Could | `ha` + conditional, extended chains | `conditional-if` |
| Maybe, Probably | modal adverbs, `lehet, hogy` + clause | `modal-hedging` |
| Making Decisions | question forms, `melyik`, `válasszuk` | `decision-questions` |
| Dreams & Hopes | `remélem, hogy`, `szeretném, ha` + subjunctive | `hopes-subjunctive` |

### Vocabulary targets

~80 new words focused on: time expressions (jövő héten, nyáron, hamarosan), modal adverbs (talán, biztosan, valószínűleg), planning verbs (tervezni, eldönteni, választani), aspiration nouns (álom, remény, terv, cél).

Combined with previous milestones, total vocabulary reaches ~1,000–1,100 words — approaching B1 threshold.

## Implementation tasks

- [ ] Add Phase 12 to `PHASES` array
- [ ] Draft 8 family-context phrases for each of the 6 lessons (48 phrases total)
- [ ] Append lessons 69–74 to the `LESSONS` array with `patternId` fields
- [ ] Update `TIME_TAGS.evening` with lesson IDs 69–74
- [ ] Update `WEEKEND_BOOST` with lesson IDs 69, 73
- [ ] Run `hungarian-teacher` skill on all new phrases
- [ ] Verify `npm run build` succeeds
- [ ] Update `docs/architecture.md` to reflect Phase 12

## Open questions

- Should "Dreams & Hopes" include kid-appropriate aspirations ("I hope you'll be happy") alongside adult ones ("I'd like us to visit Hungary")? Recommendation: both — models range of register. — *owner: user*
- The subjunctive in `szeretném, ha…` is grammatically advanced (B1+/B2). Include it anyway since the phrase itself is high-frequency? Recommendation: yes — teach it as a chunk, not a paradigm. — *owner: user*

## Acceptance criteria

- [ ] 6 new lessons (ids 69–74) visible under Phase 12 in the app
- [ ] Each lesson has 8 phrases, `tip`, `pat`, and `patternId`
- [ ] Lessons appear in evening Daily Focus and weekend boost where specified
- [ ] All Hungarian content validated by `hungarian-teacher` skill
- [ ] No regressions in existing lesson/quiz/stats flows
- [ ] `npm run build` succeeds
