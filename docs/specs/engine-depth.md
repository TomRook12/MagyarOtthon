# Spec: Engine Depth — Story Cards, Listening, Shadowing & Quiz Enhancements

> **Status:** Approved
> **Branch:** `claude/engine-depth-spec-oepEI`

## Goal

Add engine features that convert reading-level competence into spoken fluency: comprehensible input via story cards, audio-first review via browser TTS, self-assessment via microphone shadowing, and richer quiz modes that test grammar patterns across lessons. This is the final milestone — it assumes Milestones 1–4 have provided the vocabulary and grammar; this milestone trains the ear and mouth.

## Background

After Milestones 1–4, the learner has ~2,500–3,000 words, grammar paradigms, discourse connectors, and broad vocabulary. But the app is still primarily a *reading* tool: the learner reads Hungarian text, taps to reveal translations, and types answers in quizzes.

Research shows that B2-level fluency requires:
- **Comprehensible input** (Krashen): extended connected text at i+1 level
- **Listening comprehension**: processing speech at natural speed
- **Pushed output** (Swain): producing language under mild time pressure
- **Shadowing** (Pimsleur): mimicking native-speed speech for pronunciation and rhythm

The app's zero-dependency constraint is respected: browser `SpeechSynthesis` API provides TTS at no cost, `MediaRecorder` API enables mic capture, and story cards are just data + a new view component.

## Requirements

### Must have

#### Story Cards (comprehensible input)

- [ ] A new data structure `STORIES[]` alongside `LESSONS[]`
- [ ] Each story: 8–15 sentences forming a coherent mini-narrative using vocabulary from completed lessons
- [ ] 2–3 new vocabulary items per story, glossed inline (tap to see translation)
- [ ] At least 10 initial stories covering daily family scenarios (park trip, cooking together, bedtime adventure, school day, weekend outing, etc.)
- [ ] Story view: scrollable text with tap-to-translate on any sentence; "Read aloud" button uses TTS to play the full story
- [ ] Story accessible from a new "Stories" section on the home screen (appears once learner has completed ≥20 lessons)

#### Listening Mode (audio-first review)

- [ ] A "Listen" toggle on the lesson phrase view that auto-plays each phrase via `speechSynthesis` with `lang: "hu-HU"` and `rate: 0.85`
- [ ] In listening mode: Hungarian audio plays first, 2-second pause, then English text reveals
- [ ] Playback controls: pause, replay current phrase, skip to next
- [ ] Works with existing `speakHu()` function — no new TTS dependency

#### Grammar-Pattern Quiz Filter

- [ ] A "Drill Pattern" mode accessible from any lesson with a `patternId`
- [ ] Collects all phrases across all lessons sharing the same `patternId`
- [ ] Generates a cross-lesson quiz of up to 15 phrases using existing `generateQuestions` logic
- [ ] Example: tapping "Drill" on "Give it to Your Sister" (lesson 52, the dative paradigm lesson) pulls dative phrases from paradigm-anchored lessons, Reasoning, Stories, and Breadth lessons

### Nice to have

#### Shadowing / Mic Capture

- [ ] A "Shadow" button on the phrase view that plays the Hungarian audio then records the user for the same duration
- [ ] Playback: side-by-side "Model" and "You" play buttons so the user can compare
- [ ] Uses `MediaRecorder` API — no speech recognition, just record and playback
- [ ] Recordings stored in memory only (not persisted) — privacy-first
- [ ] Graceful fallback if mic permission denied (button hidden or disabled)

#### Chunk/Reconstruct Quiz Type

- [ ] New quiz type `reconstruct`: shows English translation, presents Hungarian words as shufflable tiles, user arranges in correct order
- [ ] Tile count: 3–6 words per phrase (skip very long sentences)
- [ ] Integrates into existing `generateQuestions` — appears alongside the 6 existing types
- [ ] Tests word order and case agreement — high-value for Hungarian

#### Weekly Theme

- [ ] Auto-rotate a grammar focus each week (e.g. "This week: dative -nak/-nek")
- [ ] Show a banner on home screen with the week's pattern and a shortcut to "Drill Pattern"
- [ ] Cycle through all `patternId` values over N weeks

### Out of scope

- External speech recognition APIs (Google, Azure, etc.)
- Backend/server components
- Video or image content
- Splitting App.jsx (if the file becomes too large, a decision record should be created first)
- New dependencies beyond React + Vite

## Design

### Story Cards data structure

```js
const STORIES = [
  {
    id: 1,
    title: "A parkban",
    titleEn: "At the park",
    level: "A2",        // recommended level
    minLessons: 20,     // don't show until learner has attempted this many lessons
    glossary: [
      { hu: "hinta", pr: "hin-to", en: "swing" },
      { hu: "homokozó", pr: "ho-mo-ko-zó", en: "sandpit" },
    ],
    sentences: [
      { hu: "Ma a parkba mentünk.", en: "Today we went to the park." },
      { hu: "A gyerekek nagyon örültek.", en: "The children were very happy." },
      // ... 8-13 more
    ]
  },
];
```

Stories are read-only content — no quiz scoring, no SRS. They exist purely for comprehensible input. The learner reads, listens, and absorbs.

### Story view UI

```
┌─────────────────────────┐
│ ← A parkban        🔊   │  (back button, title, play-all button)
│                         │
│ Ma a parkba mentünk.    │  (tap → shows English below)
│ A gyerekek nagyon       │
│ örültek.                │
│                         │
│ [glossary: hinta =      │  (sticky glossary bar at bottom)
│  swing, homokozó =      │
│  sandpit]               │
└─────────────────────────┘
```

### Listening mode

Added as a toggle to the existing `PhraseView` component:

```
[Phrases] [Flash] [Listen 🎧]
```

When active, the view auto-advances through phrases:
1. Play `speakHu(phrase.hu)`
2. Show Hungarian text, hide English
3. After 2s pause, reveal English
4. After 1.5s, advance to next phrase
5. User can pause/replay at any time

### Grammar-Pattern Quiz

Adds a "Drill this pattern" button to lessons that have `patternId`:

```js
function getPatternPhrases(patternId) {
  return LESSONS
    .filter(l => l.patternId === patternId)
    .flatMap(l => l.phrases);
}
```

This feeds into the existing `generateQuestions(fakeLessonObj, weakPhrases, 15)`.

### Reconstruct quiz type

New entry in the question type pool:

```js
{
  type: "reconstruct",
  en: "We went to the park.",
  tiles: ["parkba", "A", "mentünk", "."],  // shuffled
  answer: "A parkba mentünk."
}
```

Scoring: exact match after joining tiles. Punctuation tiles included for completeness.

### Shadowing

Uses existing `speakHu()` for playback, plus:

```js
const recorder = new MediaRecorder(stream);
// Record for same duration as TTS utterance
// Store blob in component state
// Play back via Audio(URL.createObjectURL(blob))
```

No persistence. Recording is discarded when navigating away.

## Implementation tasks

### Story Cards
- [x] Define `STORIES[]` data structure in `App.jsx`
- [x] Write 10 initial stories (8–15 sentences each, with glossary)
- [x] Build `StoryView` component: tap-to-translate, play-all TTS
- [x] Add "Stories" section to home screen (gated on ≥20 lessons attempted)
- [x] Run `hungarian-teacher` skill on all story content

### Listening Mode
- [x] Add "Listen" tab to `PhraseView`
- [x] Implement auto-advance logic with play/pause/replay controls
- [ ] Test with `speechSynthesis` `hu-HU` voice availability

### Grammar-Pattern Quiz
- [x] Implement `getPatternPhrases(patternId)` utility
- [x] Add "Drill this pattern" button to lesson view when `patternId` exists
- [x] Generate cross-lesson quiz using existing `generateQuestions`

### Reconstruct Quiz (nice-to-have)
- [ ] Add `reconstruct` question type to `generateQuestions`
- [ ] Build tile-drag/tap UI for reordering words
- [ ] Integrate into quiz flow and scoring

### Shadowing (nice-to-have)
- [ ] Add "Shadow" button to phrase view
- [ ] Implement `MediaRecorder` capture + playback
- [ ] Handle mic permission denial gracefully

### Weekly Theme (nice-to-have)
- [ ] Implement week-number → patternId rotation
- [ ] Add theme banner to home screen
- [ ] Link to "Drill Pattern" quiz

### General
- [x] Verify `npm run build` succeeds
- [x] Update `docs/architecture.md` with new components and data structures
- [ ] Add decision record if App.jsx exceeds ~1,500 lines (evaluate splitting) — **App.jsx is now 1,937 lines; decision needed**

## Open questions

- **TTS voice quality**: browser `hu-HU` voices vary by OS/device. Is the quality acceptable on the target devices (Android Chrome, iOS Safari)? Should we add a "TTS unavailable" fallback banner? — *owner: user, test on devices*
- **Story content authoring**: should stories be written to match specific lesson sets (e.g. "uses vocabulary from lessons 1–20") or be more freeform? Recommendation: loosely matched — tag stories with `minLessons` threshold, don't over-constrain. — *owner: user*
- **Reconstruct quiz complexity**: should tiles be individual words, or can they be 2-word chunks (e.g. "a parkba" as one tile) for easier assembly? Recommendation: start with individual words; chunk option can be a follow-up. — *owner: user*
- **App.jsx size**: after all 5 milestones, App.jsx may exceed 2,000 lines. Should we proactively plan a file-split at this point, or keep the single-file constraint? Per CLAUDE.md, a decision record is required before splitting. — *owner: user*

## Acceptance criteria

- [ ] 10+ stories visible in a "Stories" section (gated on lesson progress)
- [ ] Tapping a story sentence reveals its English translation
- [ ] "Read aloud" plays full story via TTS
- [ ] Listening mode auto-plays phrases with timed English reveal
- [ ] "Drill this pattern" button appears on lessons with a `patternId` and generates a cross-lesson quiz
- [ ] (If implemented) Reconstruct quiz type works: tiles can be reordered, correct order scores a point
- [ ] (If implemented) Shadow mode records and plays back user audio
- [ ] No regressions in existing flows
- [ ] `npm run build` succeeds
