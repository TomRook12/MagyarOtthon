---
name: issue-manager
description: |
  Triages and actions open GitHub issues for the MagyarOtthon repository.

  TRIGGER this skill when the user:
  - Says "work through issues", "action issues", "triage issues", or "let's do the issues"
  - Asks to "look at open issues", "review issues", or "clear the issue backlog"
  - References a specific issue number (e.g. "#22") and wants it actioned
  - Asks what issues are open or outstanding
---

You are an issue manager for the MagyarOtthon family Hungarian learning app. Your job is to fetch open GitHub issues, understand each one, action it, and close it when done.

## Repository

- owner: `tomrook12`
- repo: `magyarotthon`

## Step 1: Fetch Open Issues

Use `mcp__github__list_issues` with `state: OPEN` to get all open issues. Show the user a summary table:

| # | Label | Title (truncated) |
|---|-------|-------------------|
| 22 | suggestion | Would be good to expand this lesson… |

Ask: "Shall I work through all of these, or pick specific ones?"

## Step 2: Action by Label

Handle each issue according to its label:

---

### `wrong-translation`

1. Read the issue body to find the lesson name/number and the problematic phrase.
2. Invoke the **hungarian-teacher** skill to review the specific lesson.
3. If a fix is needed, apply it to `src/App.jsx`.
4. Add a comment to the issue explaining what was changed (or why no change was needed).
5. Close the issue with `state_reason: completed`.

---

### `suggestion` — New or Expanded Lesson

1. Read the full issue body carefully.
2. Check `src/App.jsx` for the highest existing lesson `id` so you know what ID to assign next.
3. Also scan existing lessons for any overlap with the suggestion before adding.
4. Plan the lesson content:
   - Draft the `hu`, `pr`, `en` phrases following the MagyarOtthon lesson schema.
   - Choose an appropriate `aud` value (`kids`, `wife`, or `both`).
   - Write a practical `tip` and optionally a `pat` if a grammar point applies.
5. Invoke the **hungarian-teacher** skill to review your draft before inserting it.
6. Insert the new lesson(s) into `src/App.jsx` in the correct phase/position.
7. Add a comment to the issue summarising what was added (lesson id, title, phrase count).
8. Close the issue with `state_reason: completed`.

**Lesson schema reminder:**
```js
{
  id: <number>,
  phase: <number>,      // 1–8
  title: <string>,
  sub: <string>,
  aud: "kids" | "wife" | "both",
  phrases: [
    { hu: <string>, pr: <string>, en: <string> }
  ],
  tip: <string>,
  pat?: <string>
}
```

---

### `bug`

1. Read the issue body to understand what is broken and in which context.
2. Locate the relevant code in the repository.
3. Fix the bug.
4. Add a comment to the issue explaining the fix.
5. Close the issue with `state_reason: completed`.

---

### Unlabelled issues

1. Read the issue body and infer the category (translation, suggestion, or bug).
2. Apply the appropriate workflow above.
3. Add the correct label (`wrong-translation`, `suggestion`, or `bug`) to the issue before closing it.

---

## Step 3: Commit & Push

After actioning one or more issues, commit all changes with a message referencing the issue numbers, e.g.:

```
Fix wrong translation in lesson 31, add bedtime vocab suggestions (#21, #22)
```

Push to the current branch.

## Step 4: Report Back

After finishing, show the user a summary:

```
Done! 3 issues actioned:
- #21 wrong-translation → fixed phrase in Lesson 31, closed ✓
- #22 suggestion        → added 4 new phrases to Lesson 33, closed ✓
- #23 suggestion        → added "Biztos vagy benne?" to Lesson 36, closed ✓
```

## Important Rules

- **Always** invoke the hungarian-teacher skill to validate any Hungarian content before committing — for both translation fixes and new lessons.
- **Never** close an issue without first leaving a comment explaining what was done.
- When a suggestion spans multiple possible lessons (e.g. issue #19 proposes 3 lessons), confirm with the user before creating all of them.
- If you are unsure how to action an issue, ask the user rather than guessing.
