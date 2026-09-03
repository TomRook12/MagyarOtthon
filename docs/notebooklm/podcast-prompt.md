# Podcast-style learning with NotebookLM

A review of how Magyar Otthon teaches Hungarian, and a set of prompts that turn the same
curriculum into audio episodes for the car, the walk to school, or the ten minutes before
bath time.

---

## Part 1 — How this app actually teaches

Five things define the method. A podcast that ignores them will teach a different course
under the same name, so they are worth stating before writing any prompt.

**1. One situation, all the way up.** The unit of curriculum is a *track* — a real
recurring moment of family life. Bath Time is the only one built out, and it runs the whole
way from A1 to C1 (30 lessons, 199 phrases) without ever leaving the bathroom. The learner
does not do "the accusative case"; they do *Mosd meg a fejedet!* while washing a head.

**2. A seven-rung ladder, climbed one rung at a time.** Every lesson sits on a rung, from
1 (a bare word) to 7 (extended speech). The rung caps phrase length and — more importantly
— caps how many *new* words a lesson may introduce (4–8, depending on rung). A lesson may
climb at most one rung and may never fall back.

**3. Compounding, not accumulating.** The consequence of that budget is that later lessons
are built almost entirely from earlier ones. Lesson 30's capstone —
*Először megmostad a hajad, aztán a kezed, utoljára a lábad, és most kész vagy!* — contains
no word the learner has not already met. A `spine` config enforces this: each core word must
recur across at least three lessons and must eventually appear in a sentence at rung 4+, so
nothing is taught as a museum-piece noun and then abandoned.

**4. Grammar arrives late and only once it is already familiar.** A1 and A2 teach structure
by exposure alone — the learner meets `a kád` / `az arc` for a whole lesson before anyone
mentions that Hungarian has a definite article, and meets `kezed`, `hajad`, `lábad` before
anyone says the word "possessive". Explicit grammar cards start at B1, and each one explains
a pattern the learner has been using for several lessons already. The parent-facing `tip`
field carries the same idea for A1/A2: an aside to the adult, not a lesson for the child.

**5. Recognition first, production last.** The quiz engine has seven question types and they
are deliberately ordered by difficulty of retrieval: picture-pick and match at rungs 1–2,
audio-to-text and gap-fill from a word pool in the middle, free typing only from rung 5. Item
scores drive a light SRS — a phrase you get wrong at least as often as right is weighted 3×
into the next quiz, a failed lesson generates an 8-question remedial from exactly the phrases
you missed, and each band ends with a 5-question review of its hardest items.

### What the app cannot do, and a podcast can

- **It is silent by default and screen-bound.** Audio exists (`speakHu`, slowed to 0.85× at
  A1/A2) but it is a tap-to-hear button beside text, not a listening experience. Hungarian is
  learned mostly with the eyes.
- **It never explains at A1/A2.** Implicit teaching is the right call for a child in the
  bath. It leaves the adult learner with unanswered questions — *why* `az arc` but `a kád`.
- **It has no connected speech.** Every phrase is an isolated item. Nobody ever hears two
  people actually having the exchange.
- **Production practice requires a keyboard.** There is nowhere to practise *saying* it.

The podcast should be built to fill exactly those four gaps — and nothing else. It is a
companion to the app, not a replacement for it.

---

## Part 2 — Before you prompt

1. Run `npm run export:podcast`. This writes `docs/notebooklm/bath-time-source.md`:
   every phrase, in curriculum order, with its pronunciation guide, its rung, the teaching
   tips, the grammar cards, and the lexical spine. Regenerate it whenever lessons change.
2. Create a NotebookLM notebook and upload that file. Add `CONTEXT.md` too if you want the
   hosts to understand the app's structure; leave it out if you want them to stay purely on
   the language.
3. Generate an Audio Overview, choose the **Deep Dive** format, and paste one of the prompts
   below into the customise box.

One warning worth taking seriously: **NotebookLM's hosts are English-speaking voices and
their Hungarian will be approximate.** Vowel length and the `gy` / `ny` / `ty` consonants are
where it will slip. Treat the podcast as the explanation-and-drill layer, and the app's
`hu-HU` speech synthesis as the pronunciation authority. The prompt below tells the hosts to
say so themselves.

---

## Part 3 — The main prompt

Paste this into the "Customise" box when generating the Audio Overview.

> You are making an episode of an audio course for one specific listener: a UK-based parent
> teaching Hungarian to their children at home. They are a beginner. They will listen while
> driving or walking, with no screen and no way to take notes. Everything must work by ear
> alone.
>
> **Use only the Hungarian in the source document.** Do not introduce vocabulary, phrases or
> conjugations that do not appear there — the listener is following a course where every
> lesson is built from the previous one, and an unplanned word breaks that. If you want to
> illustrate a pattern, illustrate it with words the source has already taught, and say which
> lesson they came from.
>
> **Cover only the lessons I name below.** Go deep on a few phrases rather than skating over
> many. Ten to fifteen phrases is a whole episode.
>
> **Say every Hungarian phrase three times, in this shape:** first at natural speed; then
> slowly, syllable by syllable, using the pronunciation respelling from the source (capitals
> mark the stressed syllable — in Hungarian the stress is always on the first syllable);
> then the English meaning; then the phrase once more at natural speed. After the third
> repetition, leave a genuine two-second silence and invite the listener to say it out loud.
> Never spell a Hungarian word out letter by letter — it teaches nothing by ear.
>
> **Be honest about your own accent.** Somewhere early on, one host should say plainly that
> these are English voices approximating Hungarian, that the app's own audio button is the
> real model, and that the listener should check anything that sounds odd against it.
>
> **Explain the grammar the app deliberately withholds.** The app teaches A1 and A2 patterns
> by exposure only, so the adult learner is left with unanswered questions. Answer them:
> why `a` becomes `az` before a vowel, why the ending on `kezed` and `hajad` differs, what
> vowel harmony is doing. Keep every explanation under thirty seconds and always land it back
> on a phrase from the source. Rule of thumb: one grammar point per episode, no more.
>
> **Include one unscripted-sounding exchange.** Near the end, have the two hosts act out a
> short, natural bath-time conversation between a parent and a child using only phrases from
> the lessons covered. Play it once at natural speed, then walk through it line by line. This
> is the part the app cannot do — the learner has never heard these phrases strung together
> by actual people.
>
> **Tone:** two warm, curious adults, one of whom knows Hungarian and one of whom is learning
> alongside the listener. The learner-host should ask the questions a real beginner asks and
> should sometimes get a phrase wrong and be corrected — that correction is the most useful
> thing in the episode. No hype, no "isn't that fascinating", no throat-clearing about how
> rich and complex Hungarian is. Get to the language inside twenty seconds.
>
> **Close** by naming the two or three phrases the listener should actually try at home
> tonight, and the real moment to try them in.
>
> Lessons to cover in this episode: **[LESSONS 1–3]**

Replace the last line for each episode. Everything above it stays the same.

### A suggested series

The bands are the natural episode boundaries, but A1 and A2 hold too much for one episode
each. This split keeps every episode to a listenable ten to fifteen phrases:

| Episode | Lessons | The one grammar point |
|---------|---------|-----------------------|
| 1 | 1–3 | Nothing yet — pure vocabulary and the sound system |
| 2 | 4–5 | `a` / `az`, and the `-d` "your" ending |
| 3 | 6–7 | Adjectives sit before the noun, as in English |
| 4 | 8–9 | Direction endings: `-ba` / `-be` into, `-ból` / `-ből` out of |
| 5 | 10–12 | `meg` after the verb, and why it is there |
| 6 | 13–14 | `nem`, `még nem`, `kész` — the four small words |
| 7 | 15–16 | The accusative `-t`, and when you may drop it |
| 8 | 17–18 | `ne` versus `nem` |
| 9 | 19–20 | Past tense, and who did it |
| 10 | 21–23 | `mert` / `ezért`, then `ha` / `amikor` |
| 11 | 24–25 | Chaining instructions |
| 12 | 26–28 | Diminutives, and why they are not childish |
| 13 | 29–30 | Relative clauses, and the full capstone routine |

### Short version, if the box is small

Some versions of NotebookLM cap the customise field at around 500 characters. This keeps the
essentials:

> Audio course for a UK parent learning Hungarian by ear while driving. Use ONLY phrases from
> the source — no invented vocabulary. Cover lessons [1–3] only. Say each phrase 3×: natural
> speed, then slow syllables using the source's respelling (capitals = stress), then English,
> then natural again — with a 2-second pause for the listener to repeat. Explain one grammar
> point, under 30 seconds. End with the two hosts acting out a real bath-time exchange using
> only these phrases. Warm, no hype.

### Variants worth trying

**Drill episode.** Swap the closing instruction for: *"Make this a recall drill, not an
explanation. Say the English, leave a three-second silence, then give the Hungarian. Forty
phrases from lessons 1–14, no discussion between items, hardest words repeated twice."* Good
for a second listen once the material is familiar.

**Child-facing episode.** *"Address the child directly, not the parent. Aged four to seven.
No grammar at all — no rules, no explanations, no English translations after the first time.
Turn the phrases into a game and a song. Two minutes maximum."*

**Interference episode.** *"Focus on the mistakes an English speaker will actually make with
this material: putting stress on the wrong syllable, shortening long vowels, saying `nem`
where `ne` belongs, and reaching for English word order. Demonstrate the wrong version first,
then the right one."*
