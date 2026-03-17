# Multi-Schedule Session Cards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render sessions with multiple schedule entries as one parent session card containing schedule mini-cards instead of one flattened schedule block.

**Architecture:** Keep the existing session-group card as the outer container, but replace the single schedule strip with a list of mini-cards derived from each schedule entry. Shared fields such as status, instructor, duration, and price remain on the parent card so schedule-specific location and time can be read clearly without duplicating the whole card.

**Tech Stack:** TypeScript, Vitest, VitePress default theme CSS

---

### Task 1: Lock the renderer behavior with a failing test

**Files:**
- Modify: `src/__tests__/workout-page-renderer.test.ts`
- Test: `docs/.vitepress/workouts/workoutPageRenderer.ts`

**Step 1: Write the failing test**

Add a renderer test asserting that:
- multiple schedule entries render as repeated mini-card containers
- each mini-card preserves its own weekday/time and location pairing
- shared details remain outside the schedule mini-card list

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: FAIL because the renderer still flattens schedules into one schedule block

**Step 3: Write minimal implementation**

Update the renderer to output a stacked schedule mini-card section for each session row.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: PASS

### Task 2: Style the mini-card layout

**Files:**
- Modify: `docs/.vitepress/theme/workouts.css`
- Modify: `docs/.vitepress/workouts/workoutPageRenderer.ts`
- Test: `src/__tests__/workout-page-renderer.test.ts`

**Step 1: Write the failing test**

Add one assertion for the new schedule mini-card class names so the structure is locked.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: FAIL until the new markup is in place

**Step 3: Write minimal implementation**

Add schedule mini-card markup and CSS for stacked cards that stay readable on desktop and mobile.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: PASS

### Task 3: Final verification

**Files:**
- Test: `src/__tests__/workout-page-renderer.test.ts`
- Test: `src/__tests__/workouts-catalog.test.ts`
- Test: `src/__tests__/workouts-worker-api.test.ts`

**Step 1: Run focused verification**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts src/__tests__/workouts-catalog.test.ts src/__tests__/workouts-worker-api.test.ts`
Expected: PASS

**Step 2: Review diff for scope control**

Run: `git diff -- docs/.vitepress/workouts/workoutPageRenderer.ts docs/.vitepress/theme/workouts.css src/__tests__/workout-page-renderer.test.ts docs/plans/2026-03-17-multi-schedule-session-cards.md`
Expected: only the schedule mini-card rendering changes, CSS, tests, and plan
