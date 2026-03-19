# Workout Snapshot Last Modified Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show a custom last-modified value on generated workout pages using `generatedAt` from `workouts/manifest.json`.

**Architecture:** Extend the snapshot manifest loader to return the manifest timestamp together with the catalog, inject that timestamp into generated workout page frontmatter, and render it in the custom VitePress theme only when that frontmatter field exists. Keep VitePress git-based `lastUpdated` enabled for tracked docs.

**Tech Stack:** TypeScript, VitePress, Vue 3, Vitest

---

### Task 1: Load the manifest timestamp

**Files:**
- Modify: `src/lib/workoutsApi.ts`
- Test: `src/__tests__/workouts-api-build.test.ts`

**Step 1: Write the failing test**

Add an assertion that `loadWorkoutDetailCatalogFromSnapshot` returns the manifest timestamp value along with the catalog.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-api-build.test.ts`
Expected: FAIL because the loader does not yet expose the manifest timestamp.

**Step 3: Write minimal implementation**

Extend the manifest type and loader return type so the manifest timestamp is returned from the manifest fetch result.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-api-build.test.ts`
Expected: PASS

### Task 2: Add generated page frontmatter

**Files:**
- Modify: `docs/.vitepress/workouts/workoutPageBuilder.ts`
- Modify: `docs/.vitepress/workouts/workoutPageRenderer.ts`
- Test: `src/__tests__/workout-page-renderer.test.ts`

**Step 1: Write the failing test**

Add a renderer test asserting generated workout markdown includes a custom frontmatter field carrying the manifest timestamp.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: FAIL because generated markdown does not yet include the timestamp metadata.

**Step 3: Write minimal implementation**

Thread the manifest timestamp into generated page rendering and prepend frontmatter to generated page markdown.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: PASS

### Task 3: Render the custom last-modified value

**Files:**
- Create: `docs/.vitepress/theme/snapshotLastModified.ts`
- Create: `src/__tests__/snapshot-last-modified.test.ts`
- Modify: `docs/.vitepress/theme/Layout.vue`
- Modify: `docs/.vitepress/theme/workouts.css`

**Step 1: Write the failing test**

Add a unit test for a helper that formats and localizes the custom last-modified value from page frontmatter.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/snapshot-last-modified.test.ts`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Create the helper, use it from the theme layout, and style the rendered line to match the docs footer.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/snapshot-last-modified.test.ts`
Expected: PASS

### Task 4: Verify end-to-end behavior

**Files:**
- Modify: `docs/.vitepress/theme/index.ts` if required by the implementation

**Step 1: Run targeted tests**

Run: `npm test -- --run src/__tests__/workouts-api-build.test.ts src/__tests__/workout-page-renderer.test.ts src/__tests__/snapshot-last-modified.test.ts`
Expected: PASS

**Step 2: Run the site build**

Run: `npm run build`
Expected: PASS and generated workout pages include the custom snapshot timestamp metadata.
