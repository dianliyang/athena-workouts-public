# Schedule View Switcher Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the previous schedule card layout as an alternate view while keeping the new connected timeline layout as the default.

**Architecture:** Reuse the same grouped schedule-entry data to render two parallel schedule variants: `timeline` and `cards`. Add a small theme-level client enhancement that stores the selected view in `localStorage` and toggles a root attribute so CSS can reveal the correct layout without changing the underlying data flow.

**Tech Stack:** TypeScript, VitePress theme, Vue, CSS, Vitest

---

### Task 1: Add failing tests for dual-layout schedule markup

**Files:**
- Modify: `src/__tests__/workout-page-renderer.test.ts`

**Step 1: Write the failing assertions**

Assert that rendered rows include:
- a schedule view switcher
- a timeline container
- a cards container
- timeline-specific entry markup and cards-specific card markup

**Step 2: Run the targeted renderer test**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: FAIL because only one layout is currently rendered.

### Task 2: Render both schedule layouts

**Files:**
- Modify: `docs/.vitepress/workouts/workoutPageRenderer.ts`

**Step 1: Extract shared grouped schedule data**

Keep one grouping step and use it for both render variants.

**Step 2: Emit switcher and parallel variants**

Render:
- a switcher control with `timeline` as the default selection
- a `timeline` variant container
- a `cards` variant container that restores the previous mini-card presentation

### Task 3: Add the client-side schedule view controller

**Files:**
- Create: `docs/.vitepress/theme/ScheduleViewSwitcher.vue`
- Modify: `docs/.vitepress/theme/Layout.vue`
- Modify: `docs/.vitepress/theme/index.ts`

**Step 1: Add a theme-level client hook**

Mount a small client component that:
- reads `localStorage`
- applies the selected mode to the document
- listens for toggle interactions

**Step 2: Keep timeline as the default without JavaScript**

Ensure the markup and CSS show timeline mode before hydration or when JavaScript is unavailable.

### Task 4: Style both modes

**Files:**
- Modify: `docs/.vitepress/theme/workouts.css`

**Step 1: Restore card mode styles**

Bring back the old mini-card schedule styling under the `cards` variant.

**Step 2: Refine timeline visuals**

Keep the connected rail but reduce the feeling of isolated right-side cards.

**Step 3: Add switcher styles**

Style the view toggle and active states.

### Task 5: Verify the result

**Files:**
- Modify: `src/__tests__/workout-page-renderer.test.ts`
- Modify: `docs/.vitepress/workouts/workoutPageRenderer.ts`
- Modify: `docs/.vitepress/theme/workouts.css`
- Create: `docs/.vitepress/theme/ScheduleViewSwitcher.vue`
- Modify: `docs/.vitepress/theme/Layout.vue`

**Step 1: Run targeted tests**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: PASS

**Step 2: Run a production build**

Run: `npm run build`
Expected: PASS

**Step 3: Inspect the diff**

Run: `git diff -- src/__tests__/workout-page-renderer.test.ts docs/.vitepress/workouts/workoutPageRenderer.ts docs/.vitepress/theme/workouts.css docs/.vitepress/theme/Layout.vue docs/.vitepress/theme/index.ts docs/.vitepress/theme/ScheduleViewSwitcher.vue docs/plans/2026-03-20-schedule-view-switcher-design.md docs/plans/2026-03-20-schedule-view-switcher.md`
Expected: only the dual-layout schedule switcher changes appear
