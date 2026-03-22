# Schedule Timeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the schedule mini-card layout with a connected timeline that repeats the relevant session details inside each schedule entry.

**Architecture:** Keep the existing grouped schedule-entry logic, but swap the rendered markup from simple mini-cards to timeline entries with a left time/day block and a right detail panel. Reuse current localization and formatting helpers for status, duration, instructor, price, and schedule text so the new layout changes presentation rather than data flow.

**Tech Stack:** TypeScript, VitePress renderer helpers, CSS, Vitest

---

### Task 1: Add failing renderer assertions for the timeline structure

**Files:**
- Modify: `src/__tests__/workout-page-renderer.test.ts`

**Step 1: Write the failing test updates**

Add assertions that verify:
- `workout-schedule-timeline` and `workout-schedule-entry` are rendered
- multiple schedules produce multiple timeline entries
- each entry includes separated time/day content and repeated detail content
- status is rendered inside the timeline entry area rather than only in the old side block

**Step 2: Run the targeted test file**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: FAIL because the renderer still outputs mini-card markup.

### Task 2: Implement the timeline renderer

**Files:**
- Modify: `docs/.vitepress/workouts/workoutPageRenderer.ts`

**Step 1: Replace the schedule card renderer**

Update the renderer to output:
- a timeline container
- one timeline entry per grouped schedule item
- a left time/day block
- a connector rail and node
- a right detail panel with status, opens-at, duration, instructor, price, and location

**Step 2: Remove obsolete old-layout coupling**

Stop rendering the old standalone status block and price panel outside the schedule area once those details live inside each timeline entry.

### Task 3: Style the timeline component

**Files:**
- Modify: `docs/.vitepress/theme/workouts.css`

**Step 1: Add timeline layout styles**

Create styles for:
- timeline container and entries
- left time/day column
- rail, node, and connector
- right detail panel
- responsive mobile stacking

**Step 2: Preserve empty states and dark mode**

Update the empty schedule and dark theme styles to match the new component.

### Task 4: Verify the change

**Files:**
- Modify: `src/__tests__/workout-page-renderer.test.ts`
- Modify: `docs/.vitepress/workouts/workoutPageRenderer.ts`
- Modify: `docs/.vitepress/theme/workouts.css`

**Step 1: Run targeted renderer tests**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: PASS

**Step 2: Run a local production build**

Run: `npm run build`
Expected: PASS and the site still renders successfully.

**Step 3: Inspect the diff**

Run: `git diff -- src/__tests__/workout-page-renderer.test.ts docs/.vitepress/workouts/workoutPageRenderer.ts docs/.vitepress/theme/workouts.css docs/plans/2026-03-20-schedule-timeline-design.md docs/plans/2026-03-20-schedule-timeline.md`
Expected: only the new timeline component, tests, and plan files change.
