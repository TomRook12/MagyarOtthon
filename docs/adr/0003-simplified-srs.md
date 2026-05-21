# ADR 0003 — Simplified SRS Over SM-2

**Status:** Accepted  
**Date:** 2026-05-21

## Context

The current app implements SM-2 (ease factor, interval, due date) for spaced repetition. The PRD specifies a simpler model with three conditions: incorrect 2+ times → early resurfacing; not seen 7+ days → queue; band completed → mini-review of 5 hardest items.

## Decision

Drop SM-2. Track only `right`, `wrong`, `lastSeen`, `lastCorrect` per Item. SRS logic:
- `wrong >= 2` → flagged for early resurfacing
- `daysSince(lastSeen) >= 7` → queued for resurfacing
- Band completion → mini-review of 5 items with highest `wrong` count in that band

## Alternatives Considered

- **Keep SM-2**: More adaptive intervals, but designed for standalone flashcard decks. Adds `ease` and `interval` complexity the PRD does not require and users are unlikely to notice.

## Consequences

- `phraseScores` entries shrink from 6 fields to 4: `{ right, wrong, lastSeen, lastCorrect }`.
- SRS logic is transparent and auditable against the PRD spec.
- SM-2 can be reintroduced post-v1 if simple counting proves insufficient.
- New `STORAGE_KEY` required (existing SM-2 data is incompatible).
