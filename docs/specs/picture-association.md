# Spec: Picture Association for Rung 1–2 Vocabulary

> **Status:** Done
> **Branch:** `claude/test-feedback-feature-spec-s9pjqd`

## Goal

Give the single-word lessons a picture, so a learner meeting `törölköző` builds an
association with *a towel* rather than with the English string "towel" — or, in the case of
`phrase_list` today, with nothing at all.

## Background

Reported from testing: *"When matching words hard to know what the word is — törölköző?
what is it? A picture picker would be good here, or something to build the association
without writing English. Applies to the individual word picker."*

Two distinct problems in `src/App.jsx`:

- **`genMatch`** carries meaning only as an English string. The association being trained is
  Hungarian ↔ English, never Hungarian ↔ thing.
- **`genPhraseList`** is worse: you hear audio and pick between four Hungarian strings. For
  lesson 1 (`kád · víz · szappan · sampon · törölköző · kacsa · csap · buborék`) there is no
  meaning anywhere on the screen. It is pure sound-to-spelling matching and teaches nothing
  about what the word denotes.

Scope is deliberately the **basic words, not the sentences**: rungs 1–2 only, which is
lessons 1–5 of Bath Time, 38 phrases resolving to **22 unique concepts** (lessons 4 and 5
re-use lessons 1–2's vocabulary with articles and possessive endings).

Constraints this design respects: zero production dependencies beyond React
(`docs/conventions.md`), no service worker exists so every asset must be part of the JS
bundle, and `App.jsx` stays a single file (`docs/decisions/002-keep-single-file.md`).
Icons are therefore **inline SVG constants**, not image files.

## Requirements

### Must have
- [x] An optional `icon` field on the phrase schema holding a concept key.
- [x] An `ICONS` registry of 22 inline-SVG icons, tinted with the active track's colour.
- [x] A new question type **`picture_pick`**: audio prompt, four option tiles each showing
      an icon with its Hungarian word underneath.
- [x] `picture_pick` declared on lessons 1–5, **replacing** `phrase_list` there.
- [x] `match` tiles show the icon instead of the English word — but only on lessons where
      *every* phrase has an icon, so a single grid never mixes pictures and English.
- [x] `fill_pool` and `true_false` show the phrase's icon beside the Hungarian prompt when
      the phrase has one.
- [x] `picture_pick` added to rungs 1 and 2 in `scripts/curriculum.config.json`.
- [x] `npm run validate:curriculum` passes, R9 and R10 included.
- [x] Every icon is legible at 48 px on a dark background and readable in both the option
      grid and the match grid.

### Nice to have
- [x] Icons keyed by concept so a future track can reuse `víz` or `kéz` without redrawing.

### Out of scope
- Icons for rung 3+ phrases. A picture of a sentence is not a thing.
- Icons on the results-screen missed list or on Track Detail cards.
- Raster images, an `img/` directory, or any external asset. Bundle-only.
- Replacing the English `en` field in the data. It stays; it is simply not rendered in the
  places listed above.

## Design

### 1. Phrase schema — one new optional field

```js
{ hu:"törölköző", pr:"TÖ-röl-kö-ző", en:"towel", icon:"törölköző" }
{ hu:"a törölköző", pr:"o TÖ-röl-kö-ző", en:"the towel", icon:"törölköző" }   // lesson 4
{ hu:"kezed", pr:"KE-zed", en:"your hand", icon:"kéz" }                        // lesson 5
```

The key is explicit, never derived by stripping articles or endings — string-munging
Hungarian morphology to find an icon is exactly the kind of cleverness that breaks on the
next lesson. `icon` is optional; a phrase without it behaves exactly as today.

Lessons 1–5 phrase → icon key mapping:

| Lesson | Phrases → keys |
|---|---|
| 1 | `kád`, `víz`, `szappan`, `sampon`, `törölköző`, `kacsa`, `csap`, `buborék` (identity) |
| 2 | `haj`, `fej`, `fül`, `kéz`, `láb`, `arc`, `has`, `ujj` (identity) |
| 3 | `Gyere!`→`gyere`, `Ülj!`→`ülj`, `Állj!`→`állj`, `Várj!`→`várj`, `Nézd!`→`nézd`, `Csitt!`→`csitt` |
| 4 | `a kád`→`kád`, `a víz`→`víz`, `a szappan`→`szappan`, `a törölköző`→`törölköző`, `az arc`→`arc`, `a kéz`→`kéz`, `a láb`→`láb`, `a haj`→`haj` |
| 5 | `kezed`→`kéz`, `lábad`→`láb`, `hajad`→`haj`, `arcod`→`arc`, `fejed`→`fej`, `füled`→`fül`, `hasad`→`has`, `ujjad`→`ujj` |

### 2. Where the registry lives

A new banner section **`// ─── ICONS`**, placed *between* `// ─── STYLES` and
`// ─── SPEECH UTILITY`.

This position matters, and for two reasons rather than one. `scripts/validate-curriculum.mjs`
imports App.jsx by splitting on `"// ─── STYLES"` and evaluating only what comes before it,
because that part is JSX-free. The icons are JSX, so they must stay below the split — and
`C` itself is defined *below* that banner, so an `ICONS` map placed above it would throw
`C is not defined` on import even if every icon were rewritten JSX-free. Below the split is
mandatory, not merely tidy. The generator therefore may only read
`phrase.icon` (a plain string in the data, above the split); resolving that key to a drawing
is the renderer's job. **Do not import `ICONS` into `generateQuestions`** — it will break
the validator.

### 3. The icon registry

Each entry is a function of the accent colour, so no raw hex appears outside `C` and the
icons pick up each track's palette automatically:

```jsx
// ─── ICONS ────────────────────────────────────────────────────────────────
// Inline SVG so the whole set ships in the JS bundle — there is no service worker, and
// image files would not be available offline. Each icon is a function of the track colour.
// Keys are concepts, not phrases: "a kád", "kád" and a future "kádban" all point at `kád`.

// Body parts share one figure so the learner reads "which part of this person", not
// "what is this bean shape" — an isolated ear at 48px is unidentifiable.
const FIG = <g stroke={C.dim} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="32" cy="15" r="8.5"/><path d="M32 24v3"/>
  <path d="M23 30a9 9 0 0 1 18 0v12H23z"/>
  <path d="M23 32l-8 10 3 4M41 32l8 10-3 4"/>
  <path d="M27 42v12M37 42v12"/><path d="M23 55h6M35 55h6"/>
</g>;
const ring = (x,y,r) => <circle cx={x} cy={y} r={r} stroke={C.amber} strokeWidth="2"
  strokeDasharray="3 3" fill="none" opacity="0.8"/>;

const ICONS = {
  // — lesson 1, objects —
  "kád": c => <><path d="M8 30h48v6a12 12 0 0 1-12 12H20A12 12 0 0 1 8 36z" fill={c} fillOpacity="0.28"/>
    <path d="M18 30V18a5 5 0 0 1 10 0v2"/><path d="M16 48l-3 7M48 48l3 7"/></>,
  "víz": c => <><path d="M32 8c9 12 15 19 15 27a15 15 0 0 1-30 0c0-8 6-15 15-27z" fill={c} fillOpacity="0.35"/>
    <path d="M25 38a7 7 0 0 0 5 6"/></>,
  "szappan": c => <><rect x="10" y="24" width="44" height="26" rx="9" fill={c} fillOpacity="0.28"/>
    <path d="M19 24c0-4 4-7 9-7"/><circle cx="44" cy="14" r="4"/><circle cx="34" cy="9" r="2.5"/></>,
  "sampon": c => <><rect x="18" y="24" width="26" height="32" rx="6" fill={c} fillOpacity="0.28"/>
    <path d="M27 24v-6h8v6"/><path d="M35 12h9a5 5 0 0 1 5 5v3"/><path d="M22 36h18" strokeOpacity="0.55"/></>,
  "törölköző": c => <><path d="M8 14h48"/>
    <path d="M18 14v34a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V14z" fill={c} fillOpacity="0.28"/>
    <path d="M27 14v38M37 14v38" strokeOpacity="0.5"/></>,
  "kacsa": c => <><path d="M14 44c0-9 8-15 17-15h6a9 9 0 0 0 9-9 9 9 0 0 0-18 0c0 2 .6 3.6 1.6 5" fill={C.amber} fillOpacity="0.3"/>
    <path d="M14 44h30c-2 6-8 9-15 9s-13-3-15-9z" fill={C.amber} fillOpacity="0.3"/>
    <circle cx="41" cy="17" r="1.6" fill={C.text} stroke="none"/>
    <path d="M48 20l7 3-7 3z" fill={C.amber} fillOpacity="0.6"/></>,
  "csap": c => <><path d="M12 20h14v10H12z" fill={c} fillOpacity="0.28"/>
    <path d="M26 25h14a8 8 0 0 1 8 8v5"/><path d="M42 38h12"/>
    <path d="M48 44v3M48 52v3" strokeOpacity="0.6"/><path d="M19 20v-6h12"/></>,
  "buborék": c => <><circle cx="25" cy="36" r="14" fill={c} fillOpacity="0.28"/>
    <circle cx="45" cy="21" r="8" fill={c} fillOpacity="0.28"/>
    <circle cx="47" cy="43" r="5" fill={c} fillOpacity="0.28"/>
    <circle cx="20" cy="30" r="3" fill={C.text} stroke="none" opacity="0.8"/></>,

  // — lesson 2, body parts (drawn on FIG, highlighted in amber) —
  "haj": () => <>{FIG}<path d="M23.5 13a8.5 8.5 0 0 1 17 0c0-1-2-5-8.5-5S23.5 12 23.5 13z"
    fill={C.amber} stroke={C.amber} strokeWidth="2.5" strokeLinejoin="round"/>{ring(32,15,12.5)}</>,
  "fej": () => <>{FIG}<circle cx="32" cy="15" r="8.5" fill={C.amber} fillOpacity="0.45"
    stroke={C.amber} strokeWidth="2.5"/>{ring(32,15,12.5)}</>,
  "fül": () => <>{FIG}<path d="M40 12a3.5 4.5 0 0 1 0 7" fill="none" stroke={C.amber}
    strokeWidth="3" strokeLinecap="round"/>{ring(41,15,7)}</>,
  "arc": () => <>{FIG}<g stroke={C.amber} strokeWidth="2.2" strokeLinecap="round">
    <circle cx="29" cy="14" r="1.1" fill={C.amber}/><circle cx="35" cy="14" r="1.1" fill={C.amber}/>
    <path d="M29 18.5a4 4 0 0 0 6 0" fill="none"/></g>{ring(32,15,12.5)}</>,
  "has": () => <>{FIG}<circle cx="32" cy="36" r="5.5" fill={C.amber} fillOpacity="0.45"
    stroke={C.amber} strokeWidth="2.5"/>{ring(32,36,9.5)}</>,
  "kéz": () => <>{FIG}<path d="M15 42a4 4 0 0 0 8 0" fill={C.amber} fillOpacity="0.45"
    stroke={C.amber} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M15 42v-4M19 42v-5M23 42v-4" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round"/>{ring(19,41,9)}</>,
  "ujj": () => <>{FIG}<path d="M15 44a4 4 0 0 0 8 0" fill="none" stroke={C.dim} strokeWidth="2.5"/>
    <path d="M19 40V29" stroke={C.amber} strokeWidth="3.5" strokeLinecap="round"/>{ring(19,35,10)}</>,
  "láb": () => <>{FIG}<path d="M35 55h6" stroke={C.amber} strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M37 44v11" stroke={C.amber} strokeWidth="3" strokeLinecap="round"/>{ring(38,52,9)}</>,

  // — lesson 3, commands (pictograms; Állj! and Várj! are deliberately unalike) —
  "gyere": () => <><circle cx="24" cy="14" r="6"/><path d="M24 20v14M18 40l6-6 6 6M20 52l4-12M28 52l-4-12"/>
    <path d="M34 26c5-3 9-1 11 2"/><path d="M52 30l-8-4 1 8z" fill={C.amber} stroke="none"/>
    <path d="M44 34c3 3 7 4 10 3" stroke={C.amber} strokeOpacity="0.7"/></>,
  "ülj": () => <><circle cx="26" cy="13" r="6"/><path d="M26 19v13h14"/>
    <path d="M40 32v18M26 32v8h10"/><path d="M40 50h8M18 40h10v10"/><path d="M22 50v-6"/></>,
  "állj": () => <><path d="M22 34V20a3.5 3.5 0 0 1 7 0v10" fill={C.red} fillOpacity="0.22"/>
    <path d="M29 30V16a3.5 3.5 0 0 1 7 0v14" fill={C.red} fillOpacity="0.22"/>
    <path d="M36 30V19a3.5 3.5 0 0 1 7 0v11" fill={C.red} fillOpacity="0.22"/>
    <path d="M43 30v-8a3.5 3.5 0 0 1 7 0v20a12 12 0 0 1-12 12h-6a10 10 0 0 1-10-10V34" fill={C.red} fillOpacity="0.22"/></>,
  "várj": c => <><path d="M18 8h28M18 56h28"/>
    <path d="M22 8v6c0 8 10 12 10 18s-10 10-10 18v6" fill={c} fillOpacity="0.2"/>
    <path d="M42 8v6c0 8-10 12-10 18s10 10 10 18v6" fill={c} fillOpacity="0.2"/>
    <path d="M26 48c2-5 10-5 12 0z" fill={c} fillOpacity="0.55" stroke="none"/></>,
  "nézd": c => <><path d="M6 32s10-14 26-14 26 14 26 14-10 14-26 14S6 32 6 32z" fill={c} fillOpacity="0.18"/>
    <circle cx="32" cy="32" r="8" fill={c} fillOpacity="0.45"/>
    <circle cx="32" cy="32" r="3" fill={C.text} stroke="none"/></>,
  "csitt": c => <><circle cx="32" cy="30" r="20" fill={c} fillOpacity="0.14"/>
    <circle cx="24" cy="25" r="1.6" fill={C.text} stroke="none"/>
    <circle cx="40" cy="25" r="1.6" fill={C.text} stroke="none"/>
    <path d="M26 38h12"/><path d="M32 14v24" stroke={C.amber} strokeWidth="4"/></>,
};

function Icon({name, color, size = 48}) {
  const draw = ICONS[name];
  if (!draw) return null;                       // unknown key renders nothing, never crashes
  return <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke={C.text}
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{draw(color)}</svg>;
}
```

`Icon` returning `null` on an unknown key is deliberate: a typo in a phrase's `icon` value
degrades to today's behaviour rather than a white screen.

### 4. The `picture_pick` question type

**Direction:** audio prompt → pick the picture. Each option shows the icon **with its
Hungarian word underneath**, permanently, before and after answering. There is no English
anywhere in the question.

Generator — sits with the others in `// ─── QUESTION GENERATORS`:

```js
function genPicturePick(p, all){
  if(!p.icon) return null;
  const others = all.filter(x => x.icon && x.icon !== p.icon);
  if(others.length < 3) return null;           // fewer than 4 tiles is not a question
  const distractors = shuffle(others).slice(0,3);
  const options = shuffle([p, ...distractors]).map(x => ({hu:x.hu, icon:x.icon}));
  return {type:"picture_pick", prompt:p.hu, promptPr:p.pr, answer:p.hu, options, phrase:p};
}
```

Note it dedupes on `icon`, not `hu`: lesson 5 must not offer `kezed` and a second hand.

Dispatch in `generateQuestions`'s `gen()`:

```js
if(type==="picture_pick") return genPicturePick(p, dis);
```

`dis` (the wide distractor pool), never `all` — the same rule every option-building
generator already follows, so a Remedial on one phrase still gets four tiles.

**Rendering** in `QuizEngine`, modelled on the existing `phrase_list` block:

```
        ┌─────────────────────────┐
        │   Which one is it?      │
        │        🔊  (SpeakBtn)   │
        │    TÖ-röl-kö-ző         │   ← pr guide, italic, C.dim
        ├───────────┬─────────────┤
        │  [icon]   │   [icon]    │
        │ törölköző │   sampon    │   ← 2×2 grid, 60px icons
        ├───────────┼─────────────┤
        │  [icon]   │   [icon]    │
        │  kacsa    │    csap     │
        └───────────┴─────────────┘
```

- Two different strings, deliberately: the top-right type chip reads **"Pick the
  picture"** (add `picture_pick: "Pick the picture"` to the `label` map, where every entry
  names its type), and the on-screen header above the speak button reads **"Which one is
  it?"**, styled exactly like `phrase_list`'s `"What did you hear?"` line. `phrase_list`
  happens to use the same string in both places; `picture_pick` does not, and that is not
  a transcription slip.
- Autoplay: extend the existing effect — `if(autoPlay && (q.type==="true_false" ||
  q.type==="phrase_list" || q.type==="picture_pick")) speakHu(q.prompt, lesson.band)`.
- Tiles are buttons in a `1fr 1fr` grid, minimum 44 px touch target, correct/wrong styling
  identical to `mcBtn` (green border + `${C.green}12` fill, red for the wrong pick).
- Answer handling: `onClick={() => {setAns(o.hu); advance(o.hu === q.answer);}}`.
- **No-TTS behaviour needs no special case.** `phrase_list` already handles a missing
  Hungarian voice by leaving the `promptPr` pronunciation guide on screen; `picture_pick`
  inherits that by rendering the same header. Do **not** add `picture_pick` to the
  `huVoiceAvail === false` filter — it stays playable as a reading question.

### 5. `match` — icon instead of English, all-or-nothing per lesson

`genMatch` gains a coverage check and passes the key through:

```js
function genMatch(phrases){
  const s = shuffle(phrases).slice(0,4);
  // Icons replace English only when the whole lesson is covered — a grid mixing pictures
  // and English words reads as a bug, not as a design.
  const useIcons = phrases.every(p => p.icon);
  return {type:"match", pairs:s.map(p => ({hu:p.hu, en:p.en, icon:useIcons ? p.icon : null})), phrase:s[0]};
}
```

In `QuizEngine`'s `matchItems` memo, carry `icon` onto the `lang:"en"` tiles. When a tile has
an `icon`, render `<Icon name={item.icon} color={color} size={38}/>` in place of its text;
`hu` tiles are unchanged. Matching logic, `key`, and the speak-on-tap behaviour all stay
exactly as they are — only the tile's contents change.

### 6. `fill_pool` and `true_false` prompts

Where the phrase has an `icon`, render `<Icon name={q.phrase.icon} color={color} size={40}/>`
above the Hungarian prompt in both blocks.

**Be honest about what this does today: nothing visible.** `fill_pool` first appears at
rung 3 and `true_false` at rung 4, and no rung 3+ phrase carries an icon. This is a
five-line forward-looking change so that a future rung 1–2 lesson declaring these types
gets the icon for free. Do not add icons to rung 3+ phrases to make it visible.

### 7. Lesson `types` and the validator

Lessons 1–5 change from `types:["match","phrase_list"]` to
**`types:["match","picture_pick"]`**.

`picture_pick` *replaces* `phrase_list` on these lessons rather than joining it. With the
labels always visible, the two types would otherwise be near-identical questions — the same
audio prompt and the same four Hungarian words — and mixing them in one run just looks like
a rendering glitch. `picture_pick` is a strict superset: it tests the same sound-to-spelling
recognition and adds the picture.

`scripts/curriculum.config.json`: add `"picture_pick"` to `rungTypes` `"1"` and `"2"`.
Do not add it to rungs 3–7; nothing there has an icon and R10 would fail the lesson.

R10 runs the real `generateQuestions` 120 times per lesson and fails any declared type that
never appears — so it will catch a mistyped `icon` key that makes `genPicturePick` decline
every phrase. That is the safety net for this whole spec; run it.

## Implementation tasks

- [x] Add the `icon` field to all 38 phrases in lessons 1–5 per the mapping table.
- [x] Add the `// ─── ICONS` section with `FIG`, `ring`, `ICONS` (22 entries) and `Icon`,
      placed between `// ─── STYLES` and `// ─── SPEECH UTILITY`.
- [x] Add `genPicturePick` and dispatch it from `generateQuestions`' `gen()` with `dis`.
- [x] Render `picture_pick` in `QuizEngine`; add its `label` entry and its autoplay case.
- [x] Add the coverage check to `genMatch` and render icons on covered `en` tiles.
- [x] Add the icon to the `fill_pool` and `true_false` prompt blocks.
- [x] Change lessons 1–5 `types` to `["match","picture_pick"]`.
- [x] Add `picture_pick` to `rungTypes` 1 and 2 in `scripts/curriculum.config.json`.
- [x] Run `npm run validate:curriculum` — R9 and R10 must pass for lessons 1–5.
- [x] Run `npm run build` — clean.
- [x] Check every icon at 48 px on a real phone screen; redraw any that are unreadable. —
      Verified by running: a Playwright harness (420×900 viewport, matching mobile) drove
      the real app and screenshotted the live `picture_pick` and `match` screens for
      lessons 1, 2, and 3, rendering icons at the actual in-app sizes (60px option tiles,
      38px match tiles, bracketing the 48px benchmark). All 22 icons render, none blank.
      One is a known weak spot already flagged in Open Questions below (`csitt`), not a
      rendering defect — see that note; nothing was redrawn per the "transcription, not
      invention" instruction.
- [x] Update `docs/app-map.md`: Section A (new `// ─── ICONS` banner), Section B (the
      `icon` field), Section F (note that `ICONS` consumes `C.dim` / `C.amber` / `C.red` /
      `C.text`), Section G (the `genPicturePick` row and the `picture_pick` type), and the
      "Add a quiz type" cheat-sheet — its step 2 ("add a `gen*` function") is exactly where
      someone will reach for `ICONS`, so the below-the-split constraint belongs there.
- [x] Update `docs/conventions.md`: the phrase-fields line ("`hu`, `pr`, `en`. All three
      are required.") gains `icon` as an optional concept key, and the mandated banner
      order gains `ICONS` after `STYLES`.
- [x] Add `docs/adr/0007-inline-svg-icons.md` recording why icons are inline SVG rather
      than image files (no service worker; bundle-only offline story; zero-dep rule).
      Note the two directories: `docs/adr/` is 4-digit and currently runs 0001–0006, which
      is the sequence `docs/specs/index.md` cites as "ADR 0005"; `docs/decisions/` is the
      older 3-digit set. This record belongs in `docs/adr/`.

## Open questions

- **The labels make the picture passive.** With every tile showing icon *and* Hungarian
  word, a learner can answer correctly on sound-to-text alone and never look at the
  drawing — the association is available but not required. The alternative is labels on
  the reveal only: tiles are pictures while you choose, and every tile gains its word the
  moment you tap. That is a one-condition change in the render block
  (`{ans !== null && <div style={{fontSize:13,fontWeight:800,color:C.text,marginTop:6}}>{o.hu}</div>}`).
  Use the app for a week and decide;
  it is cheap to flip either way. — *Tom*
- **Command pictograms are the weak link.** `gyere` / `ülj` / `nézd` / `csitt` are
  reasonable, but a pictogram for "Come!" is a convention that has to be learned once
  before it teaches anything. Watch whether the kids get lesson 3 wrong more often than
  lessons 1–2 after this ships; if so, the honest fix is dropping icons from lesson 3, not
  redrawing them a third time. — *Tom*

## Acceptance criteria

- [x] With Hungarian TTS available, lesson 1 runs with `match` and `picture_pick` only;
      no English appears in any question during the run. (With TTS unavailable
      `generateQuestions` re-injects `phrase_list` by design — still no English.) — Verified
      by running a Playwright harness through a full 15-question lesson-1 run: only `match`
      and `picture_pick` appeared, and neither exposes an `en` string as visible button
      text.
- [x] A `picture_pick` question plays the Hungarian on appearance (with autoplay on), shows
      four labelled icons, and marks the tapped tile green or red correctly. — Verified by
      running: captured `speechSynthesis.speak()` calls confirmed the prompt is spoken on
      appearance with autoplay on; screenshots show four icon+label tiles; DOM inspection
      after a correct and a wrong tap confirmed the green (`rgb(58,143,110)`) and red
      (`rgb(217,74,74)`) styling both apply (the browser serialises `C.green`/`C.red` hex
      as `rgb()`, which is why a raw hex substring check first came up empty).
- [x] With Hungarian TTS unavailable, `picture_pick` is still answerable from the
      pronunciation guide. — Verified by running with `window.speechSynthesis` deleted:
      `useHuVoiceAvailable` reports unavailable, `phrase_list` is re-injected as designed,
      `picture_pick` is **not** filtered out, and the harness's pr-guide-only solver
      answered every `picture_pick` question it hit.
- [x] Lesson 1's `match` grid shows four icons and four Hungarian words — no English. —
      Verified by running and screenshotting the live grid.
- [x] A rung 3+ lesson's `match` grid is unchanged, still Hungarian ↔ English. — Verified by
      running lesson 6: its `match` question showed English button text and zero `<svg>`
      elements, i.e. `useIcons` correctly evaluated false (no rung-6 phrase carries an
      `icon`).
- [x] Lesson 5's `picture_pick` never shows the same icon on two tiles. — Verified
      programmatically: 120 generated quizzes for lesson 5 produced zero duplicate-icon
      option sets.
- [x] A Remedial on a single missed phrase from lesson 2 still produces four distinct tiles.
      — Verified programmatically: 200 runs of `generateQuestions` on a 1-phrase pool with
      the full lesson as `distractorPool` always yielded 4-option `picture_pick` questions
      with no duplicate icons.
- [x] All 22 icons render, none is blank, and none is a duplicate of another. — Verified
      programmatically (registry has exactly 22 keys, each producing distinct SVG output)
      and visually (screenshots of lessons 1–3's `picture_pick` and lesson 1's `match`
      screens in the live app).
- [x] `npm run validate:curriculum` and `npm run build` both pass. — Verified by running
      both; clean.
