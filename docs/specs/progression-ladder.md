# Spec: Progression Ladder — Bath Time

> **Status:** Draft
> **Branch:** `claude/progression-ladder`
> **Intended executor:** Sonnet 5, medium/low effort. Every rule in this spec is
> machine-checkable via `npm run validate:curriculum`. When in doubt, run the validator
> and believe it over your own judgement.

## Goal

Rebuild the Bath Time curriculum so it climbs a **gradual ladder** — words → marked words →
phrases → sentences → linked sentences → extended speech — with a **lexical spine** that
threads the same core vocabulary all the way up. Bath Time is the blueprint; the shape
proven here is what the other seven tracks will follow.

## Background

The current 21 Bath Time lessons fail on both counts, measurably.

**The jump is far too fast.** Lessons 1–3 are single words (average 1.0 words per phrase).
Lesson 4 is 2.4, lesson 5 is 3.0 with four-word imperatives. The learner goes from bare
nouns to full imperative sentences in one step, at lesson 4 of 21.

**The thread is broken.** Of the 22 words taught in lessons 1–3, **15 never appear again
anywhere in the track**: `kád`, `szappan`, `sampon`, `törölköző`, `csap`, `buborék`, `haj`,
`fül`, `kéz`, `láb`, `arc`, `has`, `ujj`, `állj`, `csitt`. The learner is taught the actual
furniture of bath time and then never uses it.

**Where a thread does exist, it is invisible.** Lesson 2 teaches `kéz`. Lesson 5 asks for
`Mosd meg a kezed!` — same word, different surface form, with nothing in between. Every
phrase in lesson 5 has **zero** previously-taught words. Lesson 4, named "First Full
Phrases", is 80% new vocabulary.

This is the actual diagnosis: the missing rung is not between "words" and "sentences", it
is **morphological**. `kéz` → `a kezed` → `Mosd meg a kezed!` is three steps, and the
current content takes it in one.

Running the validator built for this spec against today's content:

```
R1 — lesson has a valid `rung`               21 failures
R6 — every spine lexeme recurs across lessons 18 failures
R7 — every spine lexeme reaches a sentence    25 failures
64 failures across 3 rules.
```

R7 is the damning one: 25 of 28 spine words are taught but never used in a sentence.

## Requirements

### Must have
- [ ] `rung` field (integer 1–7) on every Bath Time lesson
- [ ] Bath Time rebuilt to 30 lessons following the **Lesson Map** below
- [ ] `npm run validate:curriculum` exits 0 with zero failures
- [ ] Every phrase reviewed by the `hungarian-teacher` skill before commit
- [ ] `STORAGE_KEY` bumped to `magyar-otthon-stats-v3` (see **Decisions**)
- [ ] `generateQuestions` selects question types by `rung`, not by `band`
- [ ] `docs/app-map.md` documents the `rung` field and the rung→types table
- [ ] `CONTEXT.md` gains a **Rung** entry in the domain glossary

### Nice to have
- [ ] Track Detail shows a small "builds on: kád · víz · meleg" line under each lesson
- [ ] Grammar cards at rungs 2 and 3 explaining the suffix being bridged (`-d`, `-ba/-be`)

### Out of scope
- The other seven tracks — they follow once this blueprint is proven
- Any change to the quiz engine's scoring, Remedial, or Band Review behaviour
- New question types
- Reviving anything cut in ADR 0004

## Design

### The rung ladder

Seven rungs. `scripts/curriculum.config.json` is the machine-readable source of truth;
this table is the human summary.

| Rung | Name | Tokens/phrase | Min carry-over | New lexeme budget | Example |
|------|------|---------------|----------------|-------------------|---------|
| 1 | Word | 1 | — | 8 | `kád` |
| 2 | Marked word | 1–2 | 60% | 4 | `a kád`, `kezed` |
| 3 | Two-part phrase | 2–3 | 70% | 4 | `meleg víz`, `a kádba` |
| 4 | Simple sentence | 3–5 | 75% | 4 | `Gyere a kádba!` |
| 5 | Full sentence | 4–7 | 75% | 5 | `Mosd meg a kezed és az arcod!` |
| 6 | Linked sentence | 6–10 | 80% | 5 | `Gyere ki, mert hideg a víz.` |
| 7 | Extended speech | 8–14 | 80% | 5 | multi-clause narration |

**Carry-over** = the share of a lesson's distinct *lexemes* that were already taught in an
earlier lesson of the same track. It is measured on lexemes, not surface forms: `kezed`
counts as `kéz` because `scripts/curriculum.config.json` lists it as a form of `kéz`.

**Rung 2 is the rung that does not exist today, and it is the most important one.** It is
where a bare noun acquires an article and a possessive suffix, with no new vocabulary at
all. Lesson 5 in the map below introduces *zero* new words and scores 100% carry-over —
it exists purely to build the bridge from `kéz` to `kezed` so that `Mosd meg a kezed!` is
recognisable when it arrives.

### The lexical spine

28 lexemes in `scripts/curriculum.config.json` under `tracks.bath-time.spine`, each with
its accepted surface forms. These are the words that must thread through the whole track.

Rules R6 and R7 enforce the thread: every spine lexeme must appear in **at least 3
lessons**, and must reach **at least one lesson at rung 4 or above**. A word that is taught
as a bare noun and never used in a sentence fails R7. That single rule is what prevents the
current situation from recurring.

Non-spine words are allowed and untracked — they still count toward carry-over and the new
lexeme budget, they just are not required to recur.

**When you inflect a spine word into a form not yet listed, add the form to the config.**
That is expected and normal. Do not work around a missing form by avoiding the word.

### The nine rules

All enforced by `npm run validate:curriculum`:

| Rule | Check |
|------|-------|
| R1 | lesson has a valid `rung` (1–7) |
| R2 | rung climbs by at most 1 per lesson and never falls back |
| R3 | every phrase's token count matches its rung's range |
| R4 | carry-over meets the rung's minimum |
| R5 | new lexemes within the rung's budget |
| R6 | every spine lexeme appears in ≥ 3 lessons |
| R7 | every spine lexeme reaches a lesson at rung ≥ 4 |
| R8 | rung sits inside its band's allowed range |
| R9 | declared `types` are buildable at that rung |

R9 matters more than it looks: `genReconstruct` needs 3–7 words and `genFill` needs 2+, so
declaring `sentence_builder` on a single-word lesson produces a generator that silently
declines. Matching types to rungs means fewer declined generations and better quizzes.

### Lesson Map — 30 lessons

Rung sequence: `1,1,1,2,2,3,3 | 3,4,4,4,4,4,4 | 4,5,5,5,5,5 | 5,6,6,6,6 | 6,7,7,7,7`

| id | Band | Rung | Title | What it does |
|----|------|------|-------|--------------|
| 1 | A1 | 1 | Bath Time Objects | 8 bare nouns: kád, víz, szappan, sampon, törölköző, csap, buborék, kacsa |
| 2 | A1 | 1 | Body Parts | 8 bare nouns: haj, fej, fül, kéz, láb, arc, has, ujj |
| 3 | A1 | 1 | Single-Word Commands | gyere, ülj, állj, várj, nézd, csitt |
| 4 | A1 | 2 | The Little Word "a" | article + the nouns from 1–2. No new nouns. |
| 5 | A1 | 2 | Your Body | possessive `-d`: kezed, lábad, hajad… **zero new lexemes** |
| 6 | A1 | 3 | Warm and Cold | introduces `meleg`, `hideg` only, over known nouns |
| 7 | A1 | 3 | Clean and Dirty | introduces `tiszta`, `piszkos` only, over known nouns |
| 8 | A2 | 3 | Into the Bath | directional `-ba/-be/-ból`: a kádba, a vízbe. Zero new lexemes. |
| 9 | A2 | 4 | First Sentences | **first sentences, built only from words already owned** |
| 10 | A2 | 4 | Wash Yourself | `mos` + known body parts |
| 11 | A2 | 4 | Drying Off | `töröl` + known body parts, `hol` question |
| 12 | A2 | 4 | Soap and Shampoo | brings `szappan`, `sampon`, `buborék` into sentences |
| 13 | A2 | 4 | Temperature Questions | `Hideg a víz?`, `Túl forró!`, `Jó meleg.` |
| 14 | A2 | 4 | Yes, No, Not Yet | `nem`, `még`, `igen`, `kész` |
| 15 | B1 | 4 | Simple Questions | `Kész vagy?`, `Hol a kacsa?` |
| 16 | B1 | 5 | The Accusative Case | explicit `-t`; grammar card |
| 17 | B1 | 5 | Sequencing | `először`, `aztán`, `majd`, `utoljára` over known nouns |
| 18 | B1 | 5 | Negation in Sentences | `ne`, `nem` in full sentences; grammar card |
| 19 | B1 | 5 | Past Tense | `megmostad`, `megmostam`; grammar card |
| 20 | B1 | 5 | Describing Behaviour | `ügyes`, `fröcsköl`, praise and correction |
| 21 | B2 | 5 | Parent-to-Parent | adult-to-adult phrases about the bath |
| 22 | B2 | 6 | Because and So | `mert`, `ezért` joining two known clauses; grammar card |
| 23 | B2 | 6 | If and When | `ha`, `amikor`; grammar card |
| 24 | B2 | 6 | Complex Instructions | two chained imperatives |
| 25 | B2 | 6 | Resistance & Negotiation | `tudom, hogy…`, `de…` |
| 26 | C1 | 6 | Diminutives & Affection | `-ka/-ke`, `kacsám`, `kicsi` |
| 27 | C1 | 7 | Idiomatic Bath Time | natural idiom over the established spine |
| 28 | C1 | 7 | Telling What Happened | narrating a finished bath |
| 29 | C1 | 7 | Storytelling | extended multi-clause speech |
| 30 | C1 | 7 | Capstone | full bath-time scenario, spine words throughout |

### Worked exemplars — lessons 1–12

**These twelve have been dry-run against the validator and pass every shape rule.** Use them
verbatim for the Hungarian where shown, and copy their *shape* for lessons 13–30. Carry-over
and new-lexeme counts are the validator's own output.

```
id  rung  carry-over  new   lesson
 1   r1        0%      8    kád víz szappan sampon törölköző csap buborék kacsa
 2   r1        0%      8    haj fej fül kéz láb arc has ujj
 3   r1        0%      6    gyere ülj állj várj nézd csitt
 4   r2       80%      2    a kád · a víz · a szappan · a törölköző · az arc · a kéz · a láb · a haj
 5   r2      100%      0    kezed · lábad · hajad · arcod · fejed · füled · hasad · ujjad
 6   r3       71%      2    meleg víz · hideg víz · meleg kéz · hideg láb · meleg kád · hideg arc
 7   r3       78%      2    tiszta kéz · piszkos láb · tiszta arc · piszkos haj · tiszta víz · a meleg víz
 8   r3      100%      0    a kádba · a vízbe · a kádból · a csapból · meleg vízbe · tiszta vízbe
 9   r4      100%      0    Gyere a kádba! · Ülj a kádba! · Nézd a vizet! · Állj a kádban! · Gyere a meleg vízbe!
10   r4       78%      2    Mosd meg a kezed! · …az arcod! · …a hajad! · …a lábad! · …a hasad!
11   r4       80%      2    Töröld meg a kezed! · …a hajad! · …az arcod! · …a lábad! · Hol a törölköző?
12   r4       91%      1    Hol a szappan? · Add a szappant! · Mosd meg a hajad samponnal! · A szappan a kádban. · Nézd a buborékot!
```

Compare lesson 9 with what it replaces. Today's "First Full Phrases" is 20% carry-over —
the learner's first sentences are mostly words they have never seen. The new lesson 9 is
100%: **every word in the learner's first sentence is one they already own.** That is the
whole point of this spec, in one line.

### Decisions

**`STORAGE_KEY` bumps to `magyar-otthon-stats-v3`.** Lesson ids 4–21 will denote materially
different content after this change. Keeping v2 would leave stale `passed: true` flags that
unlock mid-ladder lessons the learner has not walked — which defeats the entire purpose of
a gradual ladder. The ladder only works walked from the bottom. Cost: existing progress is
lost. Add an ADR in `docs/decisions/`.

**Question types move from band to rung.** `generateQuestions` currently switches on
`lesson.band` for the `fill_typed` → `fill_pool` downgrade. Change it to switch on
`lesson.rung`: rungs 1–4 get `fill_pool`, rungs 5–7 get `fill_typed`. Band still governs
accent sensitivity and TTS rate — do not change those.

## Implementation tasks

Work in this order. Do not start authoring content before task 3 passes.

- [ ] 1. Add `rung: number` to the lesson schema; add it to every existing lesson so the
      validator can run (temporary values are fine — they get replaced in task 4)
- [ ] 2. Change `generateQuestions` to route `fill_pool` / `fill_typed` by `rung` not `band`
- [ ] 3. Run `npm run validate:curriculum` and confirm it executes and reports failures
- [ ] 4. Rewrite `LESSONS[]` for Bath Time as 30 lessons per the Lesson Map, using the
      worked exemplars verbatim for ids 1–12
- [ ] 5. Author ids 13–30, running the validator after **every two or three lessons**
- [ ] 6. Extend `tracks.bath-time.spine` in the config with any new surface forms you use
- [ ] 7. Set each lesson's `types` to a subset of its rung's allowed types (R9)
- [ ] 8. Add grammar cards at ids 16, 18, 19, 22, 23 (B1+ only, per `CONTEXT.md`)
- [ ] 9. Bump `STORAGE_KEY` to `magyar-otthon-stats-v3`
- [ ] 10. Run the `hungarian-teacher` skill over every new or changed phrase; fix what it flags
- [ ] 11. `npm run validate:curriculum` → 0 failures; `npm run build` → clean
- [ ] 12. Update `docs/app-map.md`: `rung` in the lesson schema, the rung→types table, the validator
- [ ] 13. Add a **Rung** entry to the `CONTEXT.md` domain glossary
- [ ] 14. Add `docs/decisions/` ADR for the `STORAGE_KEY` bump

### The authoring loop

For each lesson, mechanically:

1. Read its row in the Lesson Map — rung, title, what it does.
2. Look up the rung's token range, carry-over minimum, and new-lexeme budget.
3. Write 5–8 phrases. **Start from words already taught**, then spend your new-lexeme
   budget deliberately on the one or two words the lesson is actually about.
4. Set `types` to a subset of the rung's allowed types.
5. Run `npm run validate:curriculum -- --track bath-time --verbose`.
6. If R4 fails, you introduced too much at once — replace a new word with a known one.
   If R3 fails, your phrase is the wrong length for the rung.
7. Repeat until clean.

**Rule of thumb for R4:** at rung 3 and above, aim for at least five previously-taught
lexemes per lesson and at most two new ones. That comfortably clears every threshold.

Do not weaken a threshold in `curriculum.config.json` to make a lesson pass. The thresholds
are the spec. If one is genuinely unachievable, stop and say so rather than lowering it.

## Open questions

- **Spine size.** 28 lexemes for a 30-lesson track means each recurs roughly three times,
  which is the R6 minimum. If authoring feels cramped, the fix is a larger spine, not a
  lower `minLessonsPerLexeme`.
- **Do other tracks share a spine?** Cross-track words (`víz`, `kéz`, `meleg`) will recur in
  Mealtimes and Getting Ready. Whether carry-over should count words learned in *another*
  track is a real question, deferred until a second track exists. For now carry-over is
  strictly within-track, which is the conservative choice.

## Acceptance criteria

- [ ] `npm run validate:curriculum` exits 0 with zero failures across all nine rules
- [ ] Bath Time has 30 lessons, ids 1–30, rungs matching the Lesson Map exactly
- [ ] No lesson's rung is more than 1 above its predecessor
- [ ] Zero spine lexemes appear in fewer than 3 lessons
- [ ] Zero spine lexemes fail to reach a rung-4 lesson
- [ ] Lesson 9's carry-over is 100% — the first sentences use only owned words
- [ ] `hungarian-teacher` reports no unresolved translation or pronunciation issues
- [ ] `npm run build` passes with no errors or warnings
- [ ] A fresh install can walk lessons 1 → 30 in order, each unlocking the next
- [ ] `docs/app-map.md` and `CONTEXT.md` describe the `rung` field accurately
