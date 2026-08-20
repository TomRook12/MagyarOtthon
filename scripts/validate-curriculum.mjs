#!/usr/bin/env node
// Curriculum shape validator. Checks that lesson content climbs the rung ladder
// gradually and that the lexical spine actually threads through the track.
//
//   npm run validate:curriculum            # all tracks with a spine defined
//   npm run validate:curriculum -- --track bath-time
//   npm run validate:curriculum -- --verbose
//
// Exits non-zero if any rule fails. No dependencies.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/curriculum.config.json"), "utf8"));
const args = process.argv.slice(2);
const only = args.includes("--track") ? args[args.indexOf("--track") + 1] : null;
const verbose = args.includes("--verbose");

// LESSONS lives in App.jsx above the STYLES banner, which is JSX-free.
async function loadLessons() {
  const src = fs.readFileSync(path.join(ROOT, "src/App.jsx"), "utf8");
  const logic = src.split("// ─── STYLES")[0].replace(/^import .*$/m, "");
  const stub = "const useState=()=>[],useEffect=()=>{},useCallback=f=>f,useMemo=f=>f,useRef=()=>({});" +
               "const localStorage={getItem:()=>null,setItem:()=>{}};";
  const mod = await import("data:text/javascript;base64," +
    Buffer.from(stub + logic + "\nexport {LESSONS};").toString("base64"));
  return mod.LESSONS;
}

const norm = s => s.toLowerCase().replace(/[!?.,:;"'…—–]/g, " ").replace(/\s+/g, " ").trim();
const tokens = s => norm(s).split(" ").filter(Boolean);

// Map a surface form back to its spine lexeme, so "kezed" counts as "kéz".
function lexemeIndex(spine) {
  const idx = new Map();
  for (const [lex, forms] of Object.entries(spine))
    for (const f of forms) for (const t of tokens(f)) if (!idx.has(t)) idx.set(t, lex);
  return idx;
}

const problems = [];
const note = (lessonId, rule, msg) => problems.push({ lessonId, rule, msg });

function validateTrack(trackId, lessons, spine) {
  const idx = lexemeIndex(spine);
  const lex = t => idx.get(t) || t;          // spine lexeme, else the token itself
  const ordered = [...lessons].sort((a, b) => a.id - b.id);

  const taught = new Set();                   // lexemes seen in earlier lessons
  const lessonsPerLexeme = new Map();         // spine lexeme -> [lessonId]
  const maxRungPerLexeme = new Map();
  let prevRung = null;

  console.log(`\n── ${trackId} — ${ordered.length} lessons ──`);

  for (const l of ordered) {
    const rung = l.rung;
    const R = cfg.rungs[String(rung)];

    // A missing rung fails R1 but must not mask the spine checks below.
    const rungOK = Boolean(rung && R);
    if (!rungOK) note(l.id, "R1", `missing or invalid \`rung\` (got ${JSON.stringify(rung)})`);

    // R2 — rung climbs by at most one and never falls back
    if (rungOK && prevRung !== null) {
      if (rung < prevRung) note(l.id, "R2", `rung drops ${prevRung} → ${rung}`);
      else if (rung > prevRung + 1) note(l.id, "R2", `rung jumps ${prevRung} → ${rung} (max +1 per lesson)`);
    }
    if (rungOK) prevRung = rung;

    // R8 — rung must sit inside the band's allowed range
    const [lo, hi] = cfg.bandRungs[l.band] || [];
    if (rungOK && lo !== undefined && (rung < lo || rung > hi))
      note(l.id, "R8", `rung ${rung} outside ${l.band} range ${lo}–${hi}`);

    // R3 — phrase length must match the rung
    for (const p of l.phrases) {
      const n = tokens(p.hu).length;
      if (rungOK && (n < R.minTokens || n > R.maxTokens))
        note(l.id, "R3", `"${p.hu}" is ${n} token(s); rung ${rung} (${R.name}) allows ${R.minTokens}–${R.maxTokens}`);
    }

    // R9 — declared question types must be buildable at this rung
    const allowed = cfg.rungTypes[String(rung)] || [];
    if (rungOK) for (const t of (l.types || []))
      if (!allowed.includes(t))
        note(l.id, "R9", `type "${t}" not allowed at rung ${rung} (${R.name}); allowed: ${allowed.join(", ")}`);

    // R4/R5 — carry-over and new-lexeme budget
    const lexemes = [...new Set(l.phrases.flatMap(p => tokens(p.hu)).map(lex))];
    const known = lexemes.filter(x => taught.has(x));
    const fresh = lexemes.filter(x => !taught.has(x));
    const carry = lexemes.length ? known.length / lexemes.length : 1;

    if (rungOK && carry < R.minCarryOver)
      note(l.id, "R4", `carry-over ${Math.round(carry * 100)}% below rung ${rung} minimum ${Math.round(R.minCarryOver * 100)}%` +
        ` — new: ${fresh.join(", ")}`);
    if (rungOK && fresh.length > R.newLexemeBudget)
      note(l.id, "R5", `${fresh.length} new lexemes, budget ${R.newLexemeBudget} — ${fresh.join(", ")}`);

    if (verbose)
      console.log(`  ${String(l.id).padStart(2)} r${rung ?? "?"} ${String(Math.round(carry * 100) + "%").padStart(4)} carry` +
        `  +${String(fresh.length).padStart(2)} new   ${l.title}`);

    for (const x of lexemes) {
      if (!(x in spine)) continue;
      if (!lessonsPerLexeme.has(x)) lessonsPerLexeme.set(x, []);
      lessonsPerLexeme.get(x).push(l.id);
      maxRungPerLexeme.set(x, Math.max(maxRungPerLexeme.get(x) || 0, rung || 0));
    }
    lexemes.forEach(x => taught.add(x));
  }

  // R6/R7 — the spine must actually thread through
  const { minLessonsPerLexeme, minRungForMaturity } = cfg.spineRules;
  for (const lexeme of Object.keys(spine)) {
    const appearances = lessonsPerLexeme.get(lexeme) || [];
    if (appearances.length === 0)
      note("—", "R6", `spine lexeme "${lexeme}" never appears in any lesson`);
    else if (appearances.length < minLessonsPerLexeme)
      note("—", "R6", `spine lexeme "${lexeme}" appears in only ${appearances.length} lesson(s) [${appearances}], needs ${minLessonsPerLexeme}`);
    if (appearances.length && (maxRungPerLexeme.get(lexeme) || 0) < minRungForMaturity)
      note("—", "R7", `spine lexeme "${lexeme}" never reaches rung ${minRungForMaturity} — taught but never used in a sentence`);
  }
}

const LESSONS = await loadLessons();
const tracks = Object.keys(cfg.tracks).filter(t => !only || t === only);
if (only && !tracks.length) { console.error(`No spine defined for track "${only}"`); process.exit(2); }

for (const t of tracks) {
  const lessons = LESSONS.filter(l => l.trackId === t);
  if (!lessons.length) { console.log(`\n── ${t} — no lessons yet, skipped ──`); continue; }
  validateTrack(t, lessons, cfg.tracks[t].spine);
}

const byRule = problems.reduce((a, p) => ((a[p.rule] = (a[p.rule] || 0) + 1), a), {});
const RULES = {
  R1: "lesson has a valid `rung`",
  R2: "rung climbs by at most 1, never falls back",
  R3: "phrase length matches its rung",
  R4: "carry-over meets the rung minimum",
  R5: "new lexemes within budget",
  R6: "every spine lexeme recurs across lessons",
  R7: "every spine lexeme reaches a sentence",
  R8: "rung sits inside its band's range",
  R9: "question types are buildable at the rung",
};

console.log("\n" + "─".repeat(60));
if (!problems.length) {
  console.log("Curriculum shape OK — all rules pass.");
  process.exit(0);
}
for (const [rule, msgText] of Object.entries(RULES)) {
  const hits = problems.filter(p => p.rule === rule);
  if (!hits.length) continue;
  console.log(`\n${rule} — ${msgText} (${hits.length} failure${hits.length === 1 ? "" : "s"})`);
  for (const h of hits.slice(0, 12)) console.log(`   lesson ${h.lessonId}: ${h.msg}`);
  if (hits.length > 12) console.log(`   … and ${hits.length - 12} more`);
}
console.log("\n" + "─".repeat(60));
console.log(`${problems.length} failures across ${Object.keys(byRule).length} rules.`);
process.exit(1);
