# Spec: New Lessons & PWA Icon (Issues #34, #35, #36, #37)

> **Status:** In Progress
> **Branch:** `claude/plan-lesson-suggestions-OHwVa`

## Goal

Add two new lessons (Drawing/Colouring, Counting/Numbers), expand Bath Time with more phrases, and improve the PWA icon so the installed app looks polished.

## Background

Four user suggestions submitted via in-app feedback. The app currently has 42 lessons but no drawing/art or counting content, and the bath lesson is minimal at 7 phrases. The PWA installs fine but the icon/branding needs work.

## Requirements

### Must have

#### Issue #34 — Drawing & Colouring lesson
- [ ] New lesson id 43, phase 3, aud "kids"
- [ ] 9 phrases covering: what are you drawing, let's draw X, colour it in, inside the lines, encouragement
- [ ] Tip and pattern fields

#### Issue #35 — PWA icon
- [ ] SVG icon with "MO" text and Hungarian tricolour accent
- [ ] PNG exports at 192x192 and 512x512
- [ ] Updated manifest.json with SVG entry

#### Issue #36 — Counting & Numbers lesson
- [ ] New lesson id 44, phase 3, aud "kids"
- [ ] 10 phrases covering: numbers 1-10, how many, count them, practical counting
- [ ] Tip and pattern fields

#### Issue #37 — Expand Bath Time
- [ ] 5 additional phrases for lesson 30: washing body parts, bath toys, splashing, temperature
- [ ] Updated subtitle

### Nice to have
- [ ] Add lessons 43, 44 to TIME_TAGS.afternoon and WEEKEND_BOOST

### Out of scope
- Splitting App.jsx
- New dependencies

## Design

All lesson changes are data-only additions to the `LESSONS` array in `src/App.jsx`. New lessons append after id 42. Bath Time expansion adds phrases to the existing lesson 30 object. TIME_TAGS and WEEKEND_BOOST arrays get two new IDs each.

The PWA icon is a new SVG file in `/public/` with PNG fallbacks, plus a manifest entry.

## Implementation tasks

- [ ] Expand lesson 30 with 5 new phrases, update sub field
- [ ] Append lesson 43 (Drawing & Colouring) to LESSONS
- [ ] Append lesson 44 (Counting & Numbers) to LESSONS
- [ ] Add 43, 44 to TIME_TAGS.afternoon and WEEKEND_BOOST
- [ ] Create SVG icon, generate PNGs, update manifest
- [ ] Run hungarian-teacher validation
- [ ] Verify build succeeds

## Open questions

None — all decisions made during planning.

## Acceptance criteria

- [ ] Lessons 43 and 44 render in the app under Phase 3
- [ ] Lesson 30 shows 12 phrases (7 original + 5 new)
- [ ] PWA icon displays correctly when installed
- [ ] `npm run build` succeeds
- [ ] Hungarian content validated by hungarian-teacher skill
