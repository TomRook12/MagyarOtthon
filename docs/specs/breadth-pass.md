# Spec: Breadth Pass — Expanding Existing Phases Toward B2

> **Status:** Draft
> **Branch:** `claude/review-hungarian-curriculum-inyIG`

## Goal

Expand existing phases (1–8) with additional lessons covering vocabulary domains that are thin or missing, pushing total vocabulary from ~1,100 (post-Milestones 1–3) toward ~2,500–3,000 words — the range needed for CEFR B2. No new phases; this deepens what already exists.

## Background

After Milestones 1–3, the learner has grammar foundations, reasoning/narrative discourse, and plans/hypotheticals. However, vocabulary breadth remains a bottleneck: many everyday domains are thin or absent. A parent at B2 needs to:

- Describe food in detail (tastes, textures, ingredients, recipes)
- Handle health situations (doctor visits, symptoms, pharmacy)
- Navigate travel (tickets, directions, hotels, emergencies)
- Discuss emotions with nuance (not just "happy/sad" but "frustrated/overwhelmed/grateful/relieved")
- Talk to shopkeepers, teachers, and strangers with appropriate register
- Manage household in detail (DIY, appliances, garden)

This milestone is a **vocabulary and domain expansion**, not a grammar or engine change. It uses the existing lesson schema, quiz engine, and (by then) SRS scheduler unchanged.

## Requirements

### Must have

#### Phase 1 — Morning (expand)
- [ ] Lesson: **Breakfast in Detail** — food names, preferences, preparation verbs (toast, cereal, egg, spread, pour)

#### Phase 2 — Going Out (expand)
- [ ] Lesson: **Directions & Navigation** — `balra`, `jobbra`, `egyenesen`, `a sarkon`, asking for and giving directions
- [ ] Lesson: **Doctor & Pharmacy** — symptoms, body parts, `fáj`, `beteg vagyok`, medicine vocabulary
- [ ] Lesson: **Travel & Transport** — `jegy`, `vonat`, `busz`, `repülő`, booking, delays

#### Phase 3 — Playing (expand)
- [ ] Lesson: **Nature & Animals** — park animals, garden creatures, trees, flowers, weather detail
- [ ] Lesson: **Sports & Movement** — `futni`, `úszni`, `labdázni`, playground and sport vocabulary

#### Phase 4 — Food (expand)
- [ ] Lesson: **Tastes & Textures** — `édes`, `sós`, `keserű`, `fűszeres`, `puha`, `ropogós`
- [ ] Lesson: **Cooking Verbs** — `sütni`, `főzni`, `vágni`, `keverni`, `pirítani`, recipe instructions
- [ ] Lesson: **At a Restaurant / Ordering** — `kérem a…`, `mit ajánl`, `számlát kérek`, polite register
- [ ] Lesson: **Ingredients & Shopping Detail** — `liszt`, `cukor`, `tojás`, `tej`, quantities, measures

#### Phase 5 — Reading (expand)
- [ ] Lesson: **Describing Characters** — adjectives of personality: `okos`, `bátor`, `vicces`, `gonosz`, `kedves`

#### Phase 7 — End of Day (expand)
- [ ] Lesson: **Nuanced Emotions** — `frusztrált`, `megkönnyebbült`, `büszke`, `zavart`, `hálás`, beyond basic happy/sad
- [ ] Lesson: **Relationship Talk** — `beszélnünk kell`, `hogyan érzed magad`, `sajnálom`, repair and connection phrases for wife
- [ ] Lesson: **Apologies & Repair** — `bocsánat`, `nem kellett volna`, `megígérem`, `hogyan tehetem jóvá`

#### Phase 8 — Toolkit (expand)
- [ ] Lesson: **Formal Register** — `Ön`, formal verb forms, polite greetings for teachers/doctors/strangers
- [ ] Lesson: **Phone & Messaging** — `hívlak`, `visszahívlak`, `küldj egy üzenetet`, `hallak?`
- [ ] Lesson: **Numbers, Dates & Money** — 11–100, months, ordinals, `forint`, `mennyibe kerül`
- [ ] Lesson: **Household & DIY** — `csavar`, `fúró`, `festeni`, `szerelni`, garden and house maintenance

### Nice to have

- [ ] Lesson: **School Subjects & Homework** (Phase 2) — `matek`, `olvasás`, `házi feladat`, as kids grow
- [ ] Lesson: **Technology & Screens** (Phase 8) — `tablet`, `jelszó`, `töltsd fel`, `wifi`, managing screen time
- [ ] Lesson: **Garden & Seasons** (Phase 3) — `tavasz`, `nyár`, `ősz`, `tél`, `ültetni`, `öntözni`

### Out of scope

- New phases (all lessons slot into existing phases 1–8)
- Grammar paradigm lessons (covered by Grammar Spine)
- Engine changes (SRS, new quiz types)
- Audio/listening features
- Splitting App.jsx

## Design

### ID allocation

Milestones 1–3 use IDs 45–74. This spec uses IDs **75–94** (20 must-have lessons). Nice-to-have lessons would continue from 95.

### Lesson distribution across phases

| Phase | Existing lessons | New lessons | New total |
|-------|-----------------|-------------|-----------|
| 1 Morning | 7 | 1 | 8 |
| 2 Going Out | 9 | 3 | 12 |
| 3 Playing | 5 (+2 pending) | 2 | 9 |
| 4 Food | 5 | 4 | 9 |
| 5 Reading | 4 | 1 | 5 |
| 6 Bath & Bed | 2 | 0 | 2 |
| 7 End of Day | 4 | 3 | 7 |
| 8 Toolkit | 5 | 4 | 9 |
| **Total** | **41 (+2)** | **18** | **61** |

(Phase 6 is already well-covered for its narrow scope.)

### Vocabulary targets

Each new lesson adds ~15–25 distinct words (broader than the 8 phrases suggest, because food/health/travel domains have rich vocabulary). Target: **~800 new words** from this milestone alone, bringing cumulative total to ~2,500–3,000.

### TIME_TAGS and WEEKEND_BOOST updates

- **Morning**: add Breakfast in Detail
- **Midday**: add Directions, Doctor, Travel, Restaurant, Shopping Detail
- **Afternoon**: add Nature, Sports, Cooking Verbs, Tastes
- **Evening**: add Nuanced Emotions, Relationship Talk, Apologies
- **Weekend boost**: add Nature, Sports, Restaurant, Travel
- **Weekday boost**: add Breakfast, Doctor, School Subjects (if implemented)

### Register awareness

The Formal Register lesson is particularly important: it introduces `Ön` (formal "you") and formal verb conjugation. The `pat` field should provide a concise paradigm comparison (informal `te` forms vs formal `Ön` forms). `patternId: "formal-register"`.

## Implementation tasks

- [ ] Draft 8 phrases for each of 18–20 new lessons (~160 phrases)
- [ ] Assign `patternId` where a grammar pattern is prominent
- [ ] Append all new lessons to `LESSONS` array
- [ ] Update `TIME_TAGS`, `WEEKEND_BOOST`, `WEEKDAY_BOOST` arrays
- [ ] Run `hungarian-teacher` skill on all new phrases
- [ ] Verify `npm run build` succeeds
- [ ] Update `docs/architecture.md` with revised lesson count and phase totals

## Open questions

- **Prioritisation within this milestone**: should all 18 lessons ship together, or in sub-batches? Recommendation: batch by phase — Food expansion first (most daily use), then Toolkit, then Going Out, then the rest. — *owner: user*
- **Formal register depth**: how much `Ön`-form conjugation to include? Just common phrases ("Hogy van?" / "Tessék?"), or a mini-paradigm? Recommendation: common phrases as a lesson, with paradigm noted in `pat`. — *owner: user*
- **Numbers range**: go up to 100 with tens (tíz, húsz, harminc…száz) or include hundreds/thousands? Recommendation: up to 100 plus `ezer` (thousand) and `forint` for money contexts. — *owner: user*

## Acceptance criteria

- [ ] 18+ new lessons distributed across phases 1–8, visible in the app under their respective phase headers
- [ ] Each lesson has 8 phrases, `tip`, `pat`, and optional `patternId`
- [ ] TIME_TAGS and boost arrays updated appropriately
- [ ] Total distinct vocabulary across all lessons exceeds 2,000 words
- [ ] All Hungarian content validated by `hungarian-teacher` skill
- [ ] No regressions in existing flows
- [ ] `npm run build` succeeds
