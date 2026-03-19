# Translation Map Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove redundant checked-in translation-map artifacts and keep snapshot locale maps as the only translation source of truth.

**Architecture:** The code will continue to read localized labels from `workoutLocaleMaps.ts`. Static title/category/spreadsheet map files will be deleted, production code will stop importing them, and tests will inject minimal locale fixtures through `setWorkoutLocaleMaps()`.

**Tech Stack:** TypeScript, VitePress, Vue 3, Vitest

---

### Task 1: Protect the remaining translation path with tests

**Files:**
- Modify: `src/__tests__/workouts-catalog.test.ts`
- Modify: `src/__tests__/workout-title-i18n.test.ts`
- Modify: `src/__tests__/workout-page-renderer.test.ts`

**Step 1: Write the failing test**

Replace imports of removed static maps with inline locale fixtures and add one renderer assertion that group headers still localize through runtime locale maps.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts src/__tests__/workout-page-renderer.test.ts`
Expected: FAIL because production code still imports redundant map files.

**Step 3: Write minimal implementation**

Remove the redundant map imports from production code and switch the renderer to use the runtime locale map path only.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts src/__tests__/workout-page-renderer.test.ts`
Expected: PASS except for unrelated existing failures.

### Task 2: Remove redundant files

**Files:**
- Delete: `src/lib/workoutTitleMap.ts`
- Delete: `src/lib/workoutCategoryMap.ts`
- Delete: `src/lib/workoutTitleSpreadsheetMap.ts`
- Delete: `src/__tests__/workout-title-spreadsheet-map.test.ts`
- Delete: `Sports Translations.xlsx`
- Delete: `src/plans/2026-03-16-workouts-vitepress-design.md`
- Delete: `src/plans/2026-03-16-workouts-vitepress.md`
- Delete: `src/plans/runtime-smoke-check.md`

**Step 1: Delete the files**

Remove the redundant artifacts after tests no longer depend on them.

**Step 2: Run targeted tests**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts src/__tests__/workout-pages-generated.test.ts`
Expected: PASS

### Task 3: Verify repository state

**Files:**
- Modify: any remaining references if required

**Step 1: Run build**

Run: `npm run build`
Expected: PASS

**Step 2: Search for dead references**

Run: `rg "workoutTitleMap|workoutCategoryMap|workoutTitleSpreadsheetMap|Sports Translations.xlsx|src/plans"`
Expected: only intentional references in docs/plans or none
