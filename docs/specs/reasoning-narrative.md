# Spec: Reasoning & Narrative — Phases 10 + 11

> **Status:** Done
> **Branch:** `claude/complete-specs-SZCay`

## Goal

Add two new content phases that bridge the learner from A2 to B1 by teaching the language of reasoning (because, so, I think, if…then) and narrative (sequencing events, reported speech, storytelling). These are the highest-leverage content additions for a parent: they unlock explaining *why*, justifying decisions, and telling stories at bedtime.

## Background

The current 55 lessons (including the 12 paradigm-anchored lessons 45–56, distributed across phases 1–8) cover situational phrases for daily routines. The learner can give instructions, name objects, and handle basic social exchanges — but cannot yet:

- Explain *why* ("because the road is wet")
- Express opinions with reasons ("I think we should go, because…")
- Tell a story in sequence ("first we went to the park, then…")
- Report what someone said ("She said that…")
- Connect ideas across sentences

CEFR B1 requires all of these. The paradigm-anchored lessons (Milestone 1a, ids 45–56 distributed across phases 1–8) provide the verb/case foundations; this milestone builds discourse and pragmatics on top of that grammar.

### Phase numbering

> **Note (2026-04-10):** Phase 9 "Grammar Spine" was dissolved — its lessons now live inside phases 1–8. The phase numbers below are pre-existing draft placeholders; when implemented, they may be renumbered to start at Phase 9 now that the slot is free. See `docs/decisions/grammar-dissolved-into-everyday-phases.md`.

- Milestone 1a: paradigm-anchored lessons (ids 45–56, distributed across phases 1–8)
- **Phase 10: Reasoning & Opinion** (this spec)
- **Phase 11: Telling Stories** (this spec)

## Requirements

### Must have

#### Phase 10 — Reasoning & Opinion (~6 lessons, ~48 phrases)

- [x] Lesson: **Because & So** — `mert`, `ezért`, `azért, mert`, `tehát`
- [x] Lesson: **I Think** — `szerintem`, `azt hiszem`, `úgy gondolom`, `úgy érzem`
- [x] Lesson: **If… Then** — `ha… akkor`, basic real conditionals ("if it rains, we stay home")
- [x] Lesson: **Agreeing & Disagreeing** — `egyetértek`, `nem értek egyet`, `igazad van`, `nem biztos`
- [x] Lesson: **Comparing Things** — `jobb, mint`, `ugyanolyan`, `inkább`, `kevésbé`
- [x] Lesson: **Explaining a Problem** — `az a baj, hogy`, `a probléma az, hogy`, `nem működik`

#### Phase 11 — Telling Stories (~6 lessons, ~48 phrases)

- [x] Lesson: **What We Did Today** — past tense narrative using `ma`, `aztán`, `végül`
- [x] Lesson: **First, Then, After That** — sequencing connectors: `először`, `aztán`, `utána`, `végül`
- [x] Lesson: **What She/He Said** — reported speech: `azt mondta, hogy`, `megkérdezte, hogy`
- [x] Lesson: **When I Was Little** — extended past, childhood memories with `amikor… voltam`
- [x] Lesson: **Bedtime Story Retelling** — "what happened in the story?" vocabulary for narrative comprehension
- [x] Lesson: **The Funny Thing That Happened** — anecdotes, humour markers: `képzeld`, `tudod mit`, `és akkor`

#### Infrastructure

- [x] Phase 10 and Phase 11 added to `PHASES` array with distinct emoji + color
- [x] All lessons follow existing schema: `{ id, phase, title, sub, aud, phrases[], tip, pat }`
- [x] All lessons include optional `patternId` field (introduced by the paradigm-anchored lessons 45–56)
- [x] `TIME_TAGS` updated: Reasoning lessons are time-agnostic; Story lessons boosted in `evening` (bedtime storytelling context)
- [x] `aud` set per lesson: Reasoning lessons → `"both"`, Story lessons → mix of `"kids"` and `"wife"`

### Nice to have

- [ ] Cross-references in `tip` fields pointing back to paradigm-anchored lessons ("See lesson 48 'I Would Like…' for conditional paradigm")
- [ ] A "Conversation Builder" exercise type: given a prompt, pick 3 connected phrases in order (beyond current quiz types — could be a follow-up)

### Out of scope

- New quiz question types (use existing 6 types)
- Audio/listening features (see Engine Depth spec)
- SRS integration (see SRS Upgrade spec — these lessons just need to exist; SRS will pick them up automatically)
- Splitting App.jsx

## Design

### Phase registration

```js
{ id: 10, emoji: "💡", title: "Reasoning", color: "#D4A843" },
{ id: 11, emoji: "📝", title: "Stories", color: "#8B5E3C" },
```

Colors chosen to be distinct from existing 9 phases. Emoji conveys "ideas" (reasoning) and "writing/narrative" (stories).

### Lesson structure

Each lesson follows the existing pattern. Example:

```js
{
  id: 57, phase: 10, title: "Because & So",
  sub: "mert · ezért · azért, mert",
  aud: "both", patternId: "connectors-cause",
  phrases: [
    { hu: "Nem mehetünk ki, mert esik.", pr: "...", en: "We can't go out because it's raining." },
    // ... 7 more
  ],
  tip: "Start with 'mert' (because) — it's the most versatile connector. Use it to answer every 'Miért?' (Why?).",
  pat: "mert = because (mid-sentence)\nezért = so/therefore\nazért… mert = the reason is… because"
}
```

### ID allocation

Paradigm-anchored lessons use ids 45–56. This spec uses:
- Phase 10 (Reasoning): ids **57–62**
- Phase 11 (Stories): ids **63–68**

### Vocabulary targets

Each phase adds ~100 distinct new words (connectors, abstract nouns, narrative verbs, opinion vocabulary). Combined with the paradigm-anchored lessons and existing lessons, this pushes total vocabulary toward ~800–900 words.

### Grammar patterns covered

| Lesson | Key grammar | patternId |
|--------|------------|-----------|
| Because & So | subordinate clauses with `mert`, `hogy` | `connectors-cause` |
| I Think | `azt hiszem, hogy` + clause | `connectors-opinion` |
| If… Then | `ha` + present/conditional + `akkor` | `conditional-real` |
| Agreeing & Disagreeing | `hogy` clauses, negation patterns | `connectors-agree` |
| Comparing Things | comparative `-bb` in context, `mint` | `comparative-use` |
| Explaining a Problem | `az a baj, hogy` + clause | `connectors-problem` |
| What We Did Today | past tense narrative, mixed verbs | `narrative-past` |
| First, Then, After That | sequencing adverbs, past tense | `narrative-sequence` |
| What She Said | reported speech: `azt mondta, hogy` | `reported-speech` |
| When I Was Little | `amikor` clauses, past tense | `narrative-when` |
| Bedtime Story Retelling | question words in past context | `narrative-retell` |
| The Funny Thing | discourse markers: `képzeld`, `és akkor` | `narrative-anecdote` |

## Implementation tasks

- [x] Add Phase 10 and Phase 11 to `PHASES` array
- [x] Draft 8 family-context phrases for each of the 12 lessons (96 phrases total)
- [x] Append lessons 57–68 to the `LESSONS` array with `patternId` fields
- [x] Update `TIME_TAGS.evening` to include Story lesson IDs (63–68)
- [x] Run `hungarian-teacher` skill on all new phrases
- [x] Verify `npm run build` succeeds
- [x] Update `docs/architecture.md` to reflect new phases

## Open questions

- Should "Comparing Things" (Phase 10) overlap with paradigm-anchored lesson 56 "Bigger, Smaller, Best"? Recommendation: minimal overlap — lesson 56 teaches the paradigm, this lesson teaches usage in arguments ("I think the park is better because…"). — *owner: user*
- Should reported speech (lesson "What She Said") cover only `hogy`-clauses, or also indirect questions (`megkérdezte, hogy…`)? Recommendation: both — they use the same `hogy` connector. — *owner: user*

## Acceptance criteria

- [x] 12 new lessons (ids 57–68) visible under Phase 9 and Phase 10 in the app (renumbered: 9 = Reasoning, 10 = Stories)
- [x] Each lesson has 8 phrases, `tip`, `pat`, and `patternId`
- [x] Story lessons appear in evening Daily Focus suggestions
- [x] All Hungarian content validated by `hungarian-teacher` skill
- [x] No regressions in existing lesson/quiz/stats flows
- [x] `npm run build` succeeds
