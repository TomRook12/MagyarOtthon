# Sources to feed NotebookLM

Every link below was opened and checked before it was listed here. They are grouped by the
job they do, and the grammar ones are mapped to the episodes in `podcast-prompt.md` so you
can add only what a given episode actually needs.

---

## Start here: files already in this repo

| File | Upload it? | Why |
|------|-----------|-----|
| `docs/notebooklm/bath-time-source.md` | **Always** | The curriculum itself — 30 lessons, 199 phrases, pronunciation guides, grammar cards, the lexical spine. Regenerate with `npm run export:podcast` before each upload if lessons have changed. |
| `CONTEXT.md` | Sometimes | Gives the hosts the vocabulary of the course itself — bands, rungs, remedials, the spine. Add it if you want them to say "this is lesson 9, rung 4"; leave it out if you want them to stay purely on the Hungarian. |
| `docs/notebooklm/podcast-prompt.md` | **No** | It is instructions *to* NotebookLM, not material *for* it. Uploading it makes the hosts discuss the podcast instead of teaching Hungarian. It goes in the customise box. |

NotebookLM takes Markdown, plain text, PDF, Google Docs, pasted text, public URLs, and
YouTube links, so the `.md` files upload directly with no conversion.

---

## The one rule worth following

**Keep the notebook small and matched to the episode.** The main prompt's most important
instruction is *use only the Hungarian in the source document* — that is what keeps the
podcast on the same compounding ladder as the app. Every extra grammar site you add is more
Hungarian the hosts can reach for, and a full reference site will happily pull in vocabulary
from thirty lessons ahead.

So: the curriculum pack always, plus the **one or two links that episode's grammar point
needs**, and nothing else. A separate notebook per episode is cheap and works far better
than one notebook holding everything.

---

## Grammar references, mapped to the episodes

### Wikipedia and Wikimedia — freely licensed, safe to ingest

| Link | Covers | Use for episode |
|------|--------|-----------------|
| [Hungarian phonology](https://en.wikipedia.org/wiki/Hungarian_phonology) | The seven short/long vowel pairs, `gy` `ny` `ty` `sz` `s` `cs`, first-syllable stress, vowel harmony | 1 |
| [Help:IPA/Hungarian](https://en.wikipedia.org/wiki/Help:IPA/Hungarian) | Compact letter → IPA key with English approximations. Small and precise — a good companion to the pack's own respellings | 1 |
| [Hungarian grammar](https://en.wikipedia.org/wiki/Hungarian_grammar) | Possessive suffixes, accusative `-t` with linking vowels, vowel harmony, `ne` vs `nem`, word order | 2, 7, 8 |
| [Hungarian verbs](https://en.wikipedia.org/wiki/Hungarian_verbs) | Past tense in full, imperative/subjunctive, definite vs indefinite conjugation, `igekötők` (`meg-`, `le-`, `ki-`, `be-`) with tables | 5, 9 |
| [Appendix:Hungarian verbal prefixes](https://en.wiktionary.org/wiki/Appendix:Hungarian_verbal_prefixes) (Wiktionary) | A ~100-row table of prefixes; `meg-` is noted as the perfective one, which is exactly what lesson 10's `mosd meg` is doing | 5 |
| [Simplified Grammar of the Hungarian Language](https://en.wikisource.org/wiki/Simplified_Grammar_of_the_Hungarian_Language) (Wikisource) | Ignatius Singer, 1882 — a complete public-domain grammar covering the alphabet, articles, cases, personal suffixes, and verbs | Any, as a fallback |

One caveat on the Singer grammar: it is 1882, so the English is Victorian and a few
judgements are dated. The Hungarian is fine — the language has not moved much — but it will
make the hosts sound old-fashioned if it is the only source they have.

Note that Wikipedia's *Hungarian grammar* article does **not** cover the definite article
`a`/`az`, the imperative, or past tense. Episodes 2, 5 and 9 need one of the links below.

### HungarianReference.com — written for English speakers, by English speakers

The single best free match for this course's needs. Copyrighted but publicly readable; adding
the URL as a source for your own study is ordinary personal use.

| Link | Covers | Use for episode |
|------|--------|-----------------|
| [The Hungarian alphabet](http://www.hungarianreference.com/Hungarian-alphabet-phonetic-pronunciation.aspx) | Every letter and digraph with IPA *and* an English example word. Does not mention first-syllable stress — get that from Wikipedia's phonology page | 1 |
| [Possession, single objects](http://www.hungarianreference.com/Possession/SingleObjects.aspx) | The `-m` / `-d` endings and their vowel-harmony variants; the table literally contains `kezed`, the app's lesson 5 | 2 |
| [Verbal prefixes (coverbs)](http://www.hungarianreference.com/Verbs/verbal-prefixes-coverb-coverbs-meg-el-ki-le-be-fel.aspx) | `meg`, `le`, `ki`, `be` — what each means and why `meg` marks completion | 5 |
| [Splitting coverbs](http://www.hungarianreference.com/Verbs/splitting-of-coverbs-verbal-prefixes-meg-el-ki-le-be-fel.aspx) | Why the prefix jumps behind the verb — the reason it is `Mosd meg`, not `Megmosd` | 5 |
| [Imperative / subjunctive](http://www.hungarianreference.com/Verbs/Verbs-Conjunctive-Imperative-Subjunctive.aspx) | Short imperatives like `add`, and explicitly: "when using the imperative in a negative way, `nem` becomes `ne`" — lesson 18's grammar card in one line | 8 |
| [Past tense](http://www.hungarianreference.com/Verbs/Past-tense-ott.aspx) | The `-t-` / `-ott-` groups and the personal endings that say who did it | 9 |
| [Noun cases index](http://www.hungarianreference.com/nouns/) | Entry point for the `-ba/-be`, `-ból/-ből` direction endings of lesson 8 | 4 |

---

## Songs and rhymes — for the child-facing episodes

[Mama Lisa's World — Hungarian children's songs](https://www.mamalisa.com/?t=ec&c=44) holds
roughly eighty rhymes, each with Hungarian text, an English translation, and often sheet music
and a recording. Two of them land directly on this track's vocabulary:

- **[Kis kacsa fürdik](http://www.mamalisa.com/?p=334&t=es)** — "the little duck is bathing."
  A duck, in water, using `kacsa`, the exact word lesson 1 teaches and lesson 26 turns into
  `kis kacsám`. If you make one child-facing episode, make it around this.
- **[A fejem, a vállam, a térdem, a bokám](https://www.mamalisa.com/?t=es&p=1141)** —
  Hungarian "Head, Shoulders, Knees and Toes." It runs `a fejem`, `a fülem`, `a szemem`:
  the same body parts as lesson 2, carrying both the definite article of lesson 4 and the
  possessive ending of lesson 5, in a tune a child already knows in English.

Add these to a **separate** notebook from the grammar one and pair them with the child-facing
variant prompt. They bring in words outside the curriculum (`váll`, `térd`, `tó`), which is
fine for a song and wrong for a grammar episode.

---

## For the parent, not the language

If you want an episode about *method* rather than Hungarian — how to actually keep this going
at home — these are worth a notebook of their own:

- [How the OPOL method works (and how it doesn't)](https://chalkacademy.com/one-person-one-language-opol-method/) — one-parent-one-language, honestly assessed rather than sold.
- [Family language plans](https://www.bilingualbalance.com/how-to-raise-bilingual-children-family-language-plans/) — making the plan explicit, which is the step most families skip.

Do not mix these with the curriculum pack. Asked about both, the hosts will talk about
parenting strategy and never get to the Hungarian.

---

## What not to bother adding

- **YouTube links, for pronunciation.** NotebookLM reads a video's *transcript*, not its
  audio. A Hungarian pronunciation video adds a wall of Hungarian text and not one sound.
  Worth adding only if you want the hosts to discuss what a video *said*.
- **Forvo, Wiktionary audio, or any recordings.** Same reason — the audio is not ingested.
  For actual pronunciation, the app's own `hu-HU` speech synthesis is the model, and Forvo is
  worth keeping open in a browser tab beside the podcast rather than inside the notebook.
- **Duolingo, Memrise, Babbel, HungarianPod101 lesson pages.** Login-walled or dynamically
  rendered; NotebookLM gets a navigation shell or nothing.
- **A big general phrasebook.** It is the single fastest way to break the "only use the
  source vocabulary" rule — the hosts will find a hundred bath-adjacent phrases the learner
  has never met and teach those instead.

## On licensing

Wikipedia, Wiktionary, Wikisource and Wikibooks are CC BY-SA or public domain — ingest,
quote and reuse freely. HungarianReference.com, Mama Lisa's World and the parenting blogs are
ordinary copyrighted sites: reading them into a private notebook for your own family's study
is fine, publishing the generated audio is not. Keep anything you make from these private.
