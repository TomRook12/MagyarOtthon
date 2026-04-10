---
name: spec-tracker
description: |
  Keeps all spec files in docs/specs/ accurate and up to date, and rewrites
  docs/specs/index.md to reflect the current state of development.

  TRIGGER this skill automatically when:
  - Claude checks off or edits any task checkbox in a spec file
  - Claude changes a spec's Status header
  - The user asks Claude to implement or work on a spec
  - A spec implementation session ends (changes are being committed)
  - The user asks "where am I in development", "sync specs", "update specs",
    "track spec progress", or similar

  Do NOT wait to be explicitly asked — invoke this skill proactively at the end
  of any session that touches spec files or src/App.jsx in ways that complete
  specced tasks, so that docs/specs/index.md is always current.
---

You are the spec tracker for MagyarOtthon. Your job is to audit every spec file,
fix any stale status headers or unchecked-but-done tasks, and rewrite the index
so the user always has an accurate single-glance view of their development status.

## Step 1: Read all spec files

Read every file in `docs/specs/` except `_template.md` and `index.md`.

For each spec, record:
- **File name** (without path)
- **Status** (from the `> **Status:**` line)
- **Checked tasks** — count `- [x]` lines in the "Implementation tasks" section
- **Total tasks** — count all `- [ ]` and `- [x]` lines in the "Implementation tasks" section
- **One-line description** — from the Goal section (first sentence)

## Step 2: Compare implementation to spec status

For each spec, consider whether the current Status accurately reflects reality:

| Condition | Correct status |
|-----------|---------------|
| No tasks checked, spec not reviewed by user | Draft |
| User has approved but implementation not started | Approved |
| Some tasks checked | In Progress |
| All implementation tasks checked | Done |

If you can, also cross-check `src/App.jsx`: if lesson IDs referenced in a spec
are present in the `LESSONS` array, those lessons are implemented. Count any
implemented-but-unchecked tasks as checked for accuracy.

## Step 3: Propose status updates

List any specs where the Status header is inconsistent with task completion.
For minor corrections (e.g. "In Progress" → "Done" when all tasks are ticked),
apply the fix directly. For significant downgrades (e.g. "Done" → "In Progress"),
ask the user before changing.

Also tick any task checkboxes that you can confirm are done based on what you
found in `src/App.jsx` or other project files.

## Step 4: Update spec files

Apply all agreed-upon changes:
- Update `> **Status:**` headers
- Change `- [ ]` to `- [x]` for verified completed tasks

## Step 5: Rewrite docs/specs/index.md

Rewrite the index with accurate data from your audit. Use this structure:

```markdown
# Spec Index

_Updated: YYYY-MM-DD_

| Spec | Status | Impl tasks | Description | Next action |
|------|--------|-----------|-------------|-------------|
| [spec-name](spec-name.md) | Done | 9/9 | ... | — |
| [spec-name](spec-name.md) | In Progress | 3/7 | ... | Next unchecked task |
| [spec-name](spec-name.md) | Draft | 0/7 | ... | Approve spec |
```

Order rows by: Done first, then In Progress, then Approved, then Draft.
Within each status, order by spec file name.

Keep the "Status meanings" and "How to keep this up to date" sections from the
existing index.md — don't remove them.

## Step 6: Commit

After all edits, commit with a message like:

```
docs: sync spec statuses and update index (YYYY-MM-DD)
```

Then push to the current branch.

## Step 7: Report back

Show the user a brief summary:

```
Spec index updated.

Changes made:
- grammar-spine.md: Approved → Done
- batch-issues-34-37.md: ticked 5 tasks, In Progress → Done
- index.md: rewritten with current counts

Current status:
  Done:        grammar-spine, batch-issues-34-37
  In Progress: —
  Approved:    —
  Draft:       reasoning-narrative, plans-hypotheticals, breadth-pass,
               srs-upgrade, engine-depth
```

## Important rules

- Never mark a spec Done unless all implementation tasks are checked or you can
  verify via `src/App.jsx` that the content is present.
- Never remove tasks from a spec — only tick them.
- If you are unsure whether a task is complete, leave it unchecked and note it
  in your report.
- The index is the single source of truth for the user's at-a-glance view.
  Keep it accurate; don't leave it stale.
