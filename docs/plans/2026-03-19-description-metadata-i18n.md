# Description Metadata I18n Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge locale-specific workout descriptions from optional metadata snapshot files into generated locale pages.

**Architecture:** The manifest loader will optionally fetch a metadata JSON file and return it beside the detail catalog. The page builder will apply locale-specific description fallback before building each locale’s workout pages, leaving current behavior unchanged when metadata is absent.

**Tech Stack:** TypeScript, VitePress, Vitest

---

### Task 1: Add failing metadata-loading tests

**Files:**
- Modify: `src/__tests__/workouts-api-build.test.ts`
- Modify: `src/lib/workoutsApi.ts`

**Step 1: Write the failing test**

Assert that the loader fetches optional description metadata from the manifest and exposes it in the snapshot result.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-api-build.test.ts`
Expected: FAIL because the loader does not fetch or return metadata yet.

**Step 3: Write minimal implementation**

Add an optional manifest metadata key, fetch that asset when present, and return its parsed content.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-api-build.test.ts`
Expected: PASS

### Task 2: Add failing locale-merge tests

**Files:**
- Modify: `src/__tests__/workouts-api-build.test.ts`
- Modify: `docs/.vitepress/workouts/workoutPageBuilder.ts`

**Step 1: Write the failing test**

Assert fallback order `locale -> original -> existing snapshot description.general`.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-api-build.test.ts`
Expected: FAIL because locale-specific description merge does not exist.

**Step 3: Write minimal implementation**

Apply description metadata per locale before building generated pages.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-api-build.test.ts`
Expected: PASS

### Task 3: Verify build

**Files:**
- Modify: any touched files above if build requires cleanup

**Step 1: Run targeted tests**

Run: `npm test -- --run src/__tests__/workouts-api-build.test.ts src/__tests__/workout-page-renderer.test.ts`
Expected: PASS

**Step 2: Run build**

Run: `npm run build`
Expected: PASS
