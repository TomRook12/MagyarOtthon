# Magyar Otthon — Project Constitution

A family Hungarian language learning PWA. The goal is natural, daily language use between a parent and their children and partner, not academic study.

## What this app is

- Phrase-based lessons organised by daily-life situations (morning, outings, food, bedtime, etc.)
- Quiz engine that reinforces weak phrases and adapts to time of day
- Deployed as a mobile-first PWA to GitHub Pages; used offline

## What this app is not

- A general-purpose language course
- Multi-user / server-connected
- Monetised

## Key files

| Path | Purpose |
|------|---------|
| `src/App.jsx` | Entire app — data, logic, and UI (single file by design) |
| `docs/app-map.md` | Compact structural reference — read before App.jsx for schemas, constants, section locations |
| `public/manifest.json` | PWA manifest |
| `vite.config.js` | Build config; `base` must match GitHub Pages path |
| `docs/architecture.md` | Deeper architecture notes |
| `docs/conventions.md` | Coding standards |
| `docs/specs/` | One spec file per planned feature |
| `docs/decisions/` | Lightweight ADRs |

## Working with Claude

1. **Before implementing a feature**, write a spec in `docs/specs/` using `_template.md` and get approval.
2. **Reference the spec** throughout implementation; check off tasks as they complete.
3. **Don't split `App.jsx`** into multiple files without a decision record in `docs/decisions/`.
4. **Don't add dependencies** without discussing trade-offs first; the app is intentionally zero-dependency beyond React and Vite.
5. **Before reading `App.jsx`**, check `docs/app-map.md` for schemas, constants, and section banner names. To jump to a specific region, `Grep` the banner text listed there rather than reading the whole file.

## Deploy

```bash
npm run deploy   # builds and pushes to gh-pages branch
```

## Sub-agents

Specialised read-only sub-agents live in `.claude/agents/`. Launch them via the `Agent` tool (`subagent_type: "<name>"`) when you need focused work without bloating the main context. They complement the existing skills in `.claude/skills/`.

| Agent | When to use |
|-------|-------------|
| `lesson-scout` | Searching `LESSONS[]` for existing phrases, ids, phases, or patterns without reading all of `App.jsx` |
| `spec-scout` | Reporting on `docs/specs/` status — "what's approved but unstarted?", "what ids does spec X reserve?" (read-only counterpart to the `spec-tracker` skill) |
| `convention-reviewer` | Reviewing `git diff` against the hard rules in this file and `docs/conventions.md` before committing or pushing |
| `quiz-engine-explorer` | Explaining or debugging `getDailyFocus`, `generateQuestions`, `TIME_TAGS`, and the six quiz types with file:line citations |

All four are read-only. Translation review stays with the `hungarian-teacher` skill; spec-index rewrites stay with the `spec-tracker` skill; issue triage stays with the `issue-manager` skill.
