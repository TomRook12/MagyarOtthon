# Spec: Grammar Spine

> **Update 2026-04-10:** Phase 9 was dissolved. Lessons 45–56 still exist (same ids, same phrases, same `patternId` and `pat` paradigm tables) but now live inside everyday phases 1–8 with everyday-themed titles — e.g. "Past Tense — Full Paradigm" is now "What Everyone Did Today" in End of Day; "Conditional" is now "I Would Like…" in Food. See [`docs/decisions/grammar-dissolved-into-everyday-phases.md`](../decisions/grammar-dissolved-into-everyday-phases.md). References below to "Phase 9" and the standalone "Grammar Spine" header are historical.
>
> **Status:** Done
> **Branch:** `claude/review-hungarian-curriculum-inyIG`

## Goal

Add a curated set of phrase-based lessons whose examples are deliberately chosen to expose core Hungarian grammar paradigms (verb conjugations, cases, possessives, prefixes). Give the learner systematic coverage of B1-level grammar without abandoning the app's situational, phrase-first constitution.

## Background

The current 44 lessons are organised by daily situation and teach grammar only implicitly through the `pat` field. A gap analysis toward CEFR B1/B2 (see conversation 2026-04-05) identified that:

- Only 5 of ~18 Hungarian cases appear across the curriculum
- No dedicated coverage of future tense, conditional, definite/indefinite conjugation distinction, full past-tense paradigm, imperative paradigm, possessive suffix paradigm, comparative/superlative, or verbal prefix families
- The learner can produce set family phrases but cannot yet generalise patterns to new vocabulary

A "Grammar Spine" sits alongside the situational phases: same phrase schema, same family context (kids + wife), but each lesson's 8ish phrases are picked so that a single paradigm emerges from the examples. This preserves the constitution ("phrase-based, natural daily use, not academic study") while closing the structural gap that blocks B1.

## Requirements

### Must have

- [ ] A new Phase 9 titled "Grammar Spine" (or similar) added to the phases list, sitting after Phase 8 Toolkit
- [ ] 12 new lessons, 8 phrases each (~96 phrases total), all family-context sentences the user would genuinely say to kids or wife
- [ ] Each lesson has a stronger `pat` field than current lessons: a short paradigm table (e.g. full past-tense endings) embedded in the string
- [ ] Each lesson has a `patternId` tag (new optional field on the lesson object) naming the paradigm it drills, e.g. `past-indef`, `dative`, `conditional`
- [ ] `patternId` is additive: existing lessons are unaffected if the field is absent
- [ ] Lessons appear in the app under their own phase header, reachable from the normal lesson list
- [ ] Lessons are eligible for the Daily Focus Engine and quizzes like any other lesson

### Nice to have

- [ ] A filter/toggle in the lesson list to view lessons grouped by `patternId` instead of by phase
- [ ] A small "Paradigm" card shown above the phrase list when `pat` contains a table (rendered as preformatted text, no markdown parser needed)
- [ ] Light weighting in the Daily Focus Engine so one Grammar Spine lesson surfaces per day once the learner has passed A2 thresholds (e.g. >30 other lessons attempted)

### Out of scope

- Splitting `App.jsx`
- New dependencies
- A true SRS scheduler (separate spec, Milestone 1b)
- Quiz "drill by patternId" mode (follow-up spec once `patternId` exists)
- Audio, listening, or shadowing features
- Any B2-level grammar (future perfect, past conditional, complex participles) — scoped to B1 foundations only

## Design

### The 12 lessons

Ordered roughly by dependency and frequency. All `aud: "both"` unless noted.

| id | Title | patternId | What the 8 phrases expose |
|----|-------|-----------|---------------------------|
| 45 | Definite vs Indefinite Verbs | `def-vs-indef` | Contrast pairs: `Olvasok egy könyvet` / `Olvasom a könyvet` |
| 46 | Past Tense — Full Paradigm | `past-indef` | One verb (`csinál`) across én/te/ő/mi/ti/ők |
| 47 | Past Tense — Talking About Yesterday | `past-use` | Mixed verbs in past, narrative flow |
| 48 | Conditional — "I Would…" | `conditional` | `-nék/-nél/-na/-nánk/-nátok/-nának` |
| 49 | Future with `fog` | `future-fog` | `fogok, fogsz, fog…` + infinitive |
| 50 | Imperative — Asking & Telling | `imperative` | `-j-` paradigm across persons |
| 51 | My, Your, His — Possessive Suffixes | `possessive` | `kutyám, kutyád, kutyája, kutyánk, kutyátok, kutyájuk` |
| 52 | Giving & Telling — Dative `-nak/-nek` | `dative` | "Adok a kutyának", "Mondd apának" |
| 53 | With — Instrumental `-val/-vel` | `instrumental` | Assimilation: `autóval`, `késsel`, `anyával` |
| 54 | From — `-tól/-ről/-ből` | `from-cases` | Ablative vs delative vs elative contrast |
| 55 | Prefixes Compared — `be/ki/fel/le/át/vissza` | `prefixes` | Same verb stem (`megy/jön`) with different prefixes |
| 56 | Bigger, Biggest — Comparison | `comparative` | `-bb`, `leg-`, `mint` |

Exact phrase lists to be drafted per lesson during implementation and validated by the `hungarian-teacher` skill.

### Schema change

The `LESSONS` array item gains one optional field:

```js
{
  id: 45,
  phase: 9,
  title: "Definite vs Indefinite Verbs",
  sub: "Olvasok vs olvasom — when you know which one",
  aud: "both",
  patternId: "def-vs-indef",   // NEW, optional
  phrases: [ ... ],
  tip: "...",
  pat: "Indefinite: -ok/-ek/-ök\nDefinite: -om/-em/-öm\n..."
}
```

No migration is needed for existing lessons; `patternId` is simply `undefined` for them.

### Phase registration

Wherever the phases list lives in `App.jsx` (phase titles / ordering), add:

```js
9: "Grammar Spine"
```

No changes to `TIME_TAGS` or `WEEKEND_BOOST` — these lessons are time-agnostic.

### Daily Focus Engine

Minimal change. Grammar Spine lessons score like normal lessons in `getDailyFocus`. The "max 2 per phase" cap already prevents the phase from dominating the daily three. Nice-to-have weighting (surface once the learner has ≥30 attempts elsewhere) is additive and can be a follow-up.

### UI

Lesson list already groups by phase. Adding Phase 9 to the phases list is enough to make the new lessons appear. If `pat` contains a multi-line paradigm, render it in a `<pre>` block above the phrases so the table stays aligned.

## Implementation tasks

- [ ] Add Phase 9 title to the phases list in `App.jsx`
- [ ] Draft 8 family-context phrases for each of the 12 lessons
- [ ] Add `patternId` to lesson objects 45–56
- [ ] Append lessons 45–56 to the `LESSONS` array
- [ ] Render multi-line `pat` content as preformatted text in the lesson view
- [ ] Run `hungarian-teacher` skill on all new lessons
- [ ] Verify `npm run build` succeeds
- [ ] Update `docs/architecture.md` to document the `patternId` field
- [ ] Add a decision record in `docs/decisions/` noting that grammar is taught via curated phrase lessons, not as a separate "grammar mode"

## Resolved decisions

- **Phase title:** "Grammar Spine" is the working title; can be refined later.
- **Delivery:** All 12 lessons ship in one branch / PR.
- **`aud` field:** "both" on every Grammar Spine lesson.
- **Lesson 45 contrast pairs:** Appear as consecutive phrases (indefinite then definite) so the contrast is visible without any schema change.

## Acceptance criteria

- [ ] 12 new lessons (ids 45–56) visible under a new Phase 9 in the app
- [ ] Each lesson has 8 phrases, a `tip`, and a `pat` field containing a short paradigm note
- [ ] Each new lesson has a `patternId` field
- [ ] Existing lessons are unchanged; existing quizzes and Daily Focus still function
- [ ] `npm run build` succeeds
- [ ] All Hungarian content validated by `hungarian-teacher` skill
- [ ] Architecture doc updated; decision record added
