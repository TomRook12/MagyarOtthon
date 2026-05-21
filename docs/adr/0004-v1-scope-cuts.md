# ADR 0004 — v1 Scope Cuts

**Status:** Accepted  
**Date:** 2026-05-21

## Context

The rewrite replaces the current app's free-browsing, gamified, time-of-day-routed model with a structured Track > Band > Lesson progression. Several current systems have no equivalent in the PRD and are explicitly excluded from v1.

## Decision

The following components and systems are removed in the rewrite and not replaced in v1:

| Removed | Reason |
|---|---|
| `GoalRing` | No daily goal mechanic in v1 |
| `DailyFocusCard` + `getDailyFocus()` | Replaced by Recommended Next card; no time-of-day routing |
| `TIME_TAGS`, `WEEKEND_BOOST`, `WEEKDAY_BOOST` | No scheduling weights in new model |
| `ReviewDueCard` | SRS surfaces within lessons; no standalone review screen |
| `StatsView` | No stats dashboard in v1 (data is persisted for future use) |
| `FeedbackModal` | No user feedback mechanism in PRD |
| `StoryView` / `ListenView` / `STORIES[]` | No comprehensible-input stories concept in PRD |
| `FlashView` / `PhraseView` | Lesson entry is quiz-only; no browse or flashcard tabs |
| `streakDays` in stats | No gamification in v1 |
| `dailyGoal` in stats | No daily goal in v1 |
| `sessionsCompleted` in stats | Replaced by lesson-level pass tracking |
| `totalTime` / `todayTime` in stats | No time tracking in v1 |

## Consequences

- Stats schema shrinks significantly. New `STORAGE_KEY` = `"magyar-otthon-stats-v2"` to avoid reading stale v1 data.
- All listed components can be recovered from git history if reinstated post-v1.
- `StatsView` data (lesson scores, phrase scores) is still persisted — the display layer is cut, not the underlying tracking.
