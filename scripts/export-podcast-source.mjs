#!/usr/bin/env node
// Exports the curriculum as a NotebookLM-ready source pack.
//
//   npm run export:podcast                  # writes docs/notebooklm/<track>-source.md
//   npm run export:podcast -- --track bath-time
//
// The pack is a flattened, prose-framed view of LESSONS[] — every phrase with its
// pronunciation guide, the rung it sits on, and the parent-facing tip — so an audio
// generator can narrate the real curriculum instead of inventing its own Hungarian.
// Regenerate it whenever lesson content changes. No dependencies.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/curriculum.config.json"), "utf8"));
const args = process.argv.slice(2);
const only = args.includes("--track") ? args[args.indexOf("--track") + 1] : null;

// Same import trick as validate-curriculum.mjs: everything above the STYLES banner
// is JSX-free, so it evaluates as plain JS with the React hooks stubbed out.
async function loadApp() {
  const src = fs.readFileSync(path.join(ROOT, "src/App.jsx"), "utf8");
  const logic = src.split("// ─── STYLES")[0].replace(/^import .*$/m, "");
  const stub = "const useState=()=>[],useEffect=()=>{},useCallback=f=>f,useMemo=f=>f,useRef=()=>({});" +
               "const localStorage={getItem:()=>null,setItem:()=>{}};";
  return import("data:text/javascript;base64," +
    Buffer.from(stub + logic + "\nexport {LESSONS, TRACKS, BANDS, BAND_LABELS};").toString("base64"));
}

const rungName = r => cfg.rungs[String(r)]?.name || `Rung ${r}`;

// A phrase counts as carried over when every one of its words has been heard before.
// This is the pack's "revision vs. new" split — the same idea the validator enforces
// as newLexemeBudget, reported here for the narrator rather than as a pass/fail.
const words = s => s.toLowerCase().replace(/[!?.,:;"'…—–]/g, " ").split(/\s+/).filter(Boolean);

function trackPack(track, lessons, bandLabels) {
  const out = [];
  const seen = new Set();
  const P = s => out.push(s);

  P(`# ${track.title} — full curriculum source pack`);
  P("");
  P(`Generated from \`src/App.jsx\` by \`scripts/export-podcast-source.mjs\` on ${new Date().toISOString().slice(0, 10)}.`);
  P("This is the complete, authoritative word list for the Magyar Otthon *" + track.title + "* track.");
  P("Every Hungarian phrase below is one the learner meets in the app, in the order they meet it.");
  P("");
  P("**How to read an entry.** Each line is `Hungarian — pronunciation — English`. The middle field");
  P("is an English-speaker's respelling, not IPA: capitals mark the stressed syllable, which in");
  P("Hungarian is *always* the first one. `ö` and `ü` are front rounded vowels; `á` is a long open");
  P("`ah`; `sz` is English *s*; plain `s` is English *sh*; `cs` is *ch*; `gy` is roughly the *d* in");
  P("*during*. Long consonants (`ssz`, `tt`) are genuinely held twice as long.");
  P("");
  P("## The shape of the course");
  P("");
  P("Lessons climb a seven-rung ladder from single words to extended speech. A lesson may only");
  P("climb one rung at a time and never falls back, and each rung caps how many brand-new words a");
  P("lesson may introduce — so almost everything in a later lesson is made of words taught earlier.");
  P("");
  P("| Rung | Name | Words per phrase | New words allowed |");
  P("|------|------|------------------|-------------------|");
  for (const r of Object.keys(cfg.rungs).filter(k => /^\d+$/.test(k))) {
    const d = cfg.rungs[r];
    const span = d.minTokens === d.maxTokens ? d.minTokens : `${d.minTokens}–${d.maxTokens}`;
    P(`| ${r} | ${d.name} | ${span} | up to ${d.newLexemeBudget} |`);
  }
  P("");

  let band = null;
  for (const l of lessons) {
    if (l.band !== band) {
      band = l.band;
      P("");
      P(`## ${bandLabels[band] || band}`);
      P("");
    }
    P(`### Lesson ${l.id} — ${l.title}`);
    P("");
    P(`*Band ${l.band}, lesson ${l.seq} of the band. Rung ${l.rung}: ${rungName(l.rung)}.*`);
    P("");
    if (l.tip) { P(`**Teaching note.** ${l.tip}`); P(""); }
    if (l.grammar) {
      P("**Grammar explained in the app at this point.**");
      P("");
      P(l.grammar.split("\n\n").map(para => `> ${para.replace(/\n/g, " ")}`).join("\n>\n"));
      P("");
    }
    const fresh = [];
    for (const p of l.phrases) {
      const isNew = words(p.hu).some(w => !seen.has(w));
      for (const w of words(p.hu)) if (!seen.has(w)) { seen.add(w); fresh.push(w); }
      P(`- **${p.hu}** — *${p.pr}* — ${p.en}${isNew ? "" : "  (built entirely from words already taught)"}`);
    }
    P("");
    if (fresh.length) {
      P(`New word forms here: ${fresh.join(", ")}. Everything else in this lesson is revision.`);
      P("");
    }
  }

  const spine = cfg.tracks[track.id]?.spine;
  if (spine) {
    P("");
    P("## The lexical spine");
    P("");
    P("These are the track's core words. Each one is deliberately reintroduced across several");
    P("lessons in a different grammatical form, so the learner meets the same word as a bare noun,");
    P("then marked for possession, then as an object, then inside a full sentence. Listed here as");
    P("`base word: forms the learner will hear`.");
    P("");
    for (const [lex, forms] of Object.entries(spine)) P(`- **${lex}**: ${forms.join(", ")}`);
    P("");
  }
  return out.join("\n") + "\n";
}

const app = await loadApp();
const tracks = app.TRACKS.filter(t => (!only || t.id === only) && app.LESSONS.some(l => l.trackId === t.id));
if (!tracks.length) { console.error(only ? `No lessons for track "${only}".` : "No tracks with lessons."); process.exit(1); }

const outDir = path.join(ROOT, "docs/notebooklm");
fs.mkdirSync(outDir, { recursive: true });
for (const t of tracks) {
  const lessons = app.LESSONS.filter(l => l.trackId === t.id)
    .sort((a, b) => app.BANDS.indexOf(a.band) - app.BANDS.indexOf(b.band) || a.seq - b.seq);
  const file = path.join(outDir, `${t.id}-source.md`);
  fs.writeFileSync(file, trackPack(t, lessons, app.BAND_LABELS));
  const phrases = lessons.reduce((n, l) => n + l.phrases.length, 0);
  console.log(`${path.relative(ROOT, file)} — ${lessons.length} lessons, ${phrases} phrases`);
}
