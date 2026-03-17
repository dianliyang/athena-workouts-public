# Lib I18n Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify redundant `src/lib` i18n logic and normalize translation data while preserving existing public behavior.

**Architecture:** Introduce a small internal helper layer for normalization and localized lookup, then route sidebar/title/page-locale logic through that shared path. Keep existing exports stable while normalizing map entries and adding regression coverage for whitespace, trailing punctuation, and fallback behavior.

**Tech Stack:** TypeScript, Vitest, VitePress content helpers

---

### Task 1: Lock current normalization behavior with tests

**Files:**
- Modify: `src/__tests__/workouts-catalog.test.ts`
- Modify: `src/__tests__/workout-title-i18n.test.ts`
- Test: `src/lib/workoutSidebarI18n.ts`
- Test: `src/lib/workoutPageLocale.ts`

**Step 1: Write the failing tests**

Add coverage for:
- category lookup with trailing colon/full-width colon and repeated spaces
- localized sidebar grouping using normalized labels
- title localization using normalized direct category/title matches
- weekday localization with direct aliases and range fallback

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts`
Expected: FAIL on the new normalization cases

**Step 3: Write minimal implementation**

Update the i18n helpers to make the tests pass without changing exported function names.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts`
Expected: PASS

### Task 2: Extract shared lookup helpers and normalize map access

**Files:**
- Create: `src/lib/workoutI18nUtils.ts`
- Modify: `src/lib/workoutSidebarI18n.ts`
- Modify: `src/lib/workoutPageLocale.ts`
- Modify: `src/lib/workoutI18nMapping.ts`
- Test: `src/__tests__/workouts-catalog.test.ts`
- Test: `src/__tests__/workout-title-i18n.test.ts`

**Step 1: Write the failing test**

Add one regression asserting that the public helpers still return normalized labels from the same source data after internal extraction.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts`
Expected: FAIL before the helper extraction is complete

**Step 3: Write minimal implementation**

Move shared trim/normalize/lookup logic into `src/lib/workoutI18nUtils.ts`, reuse it from sidebar/title/page-locale helpers, and keep current public exports unchanged.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts`
Expected: PASS

### Task 3: Normalize static translation data

**Files:**
- Modify: `src/lib/workoutCategoryMap.ts`
- Modify: `src/lib/workoutPageLocale.ts`
- Modify: `src/lib/workoutTitleMap.ts` if needed only for shape-consistency-safe edits
- Test: `src/__tests__/workouts-catalog.test.ts`
- Test: `src/__tests__/workout-title-i18n.test.ts`

**Step 1: Write the failing test**

Add focused assertions for normalized access paths that depend on consistent data shape, not content redesign.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts`
Expected: FAIL if normalization assumptions are not yet met

**Step 3: Write minimal implementation**

Normalize map entries only where it removes duplication or inconsistent key formatting without changing visible translations unexpectedly.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts`
Expected: PASS

### Task 4: Final verification

**Files:**
- Test: `src/__tests__/workouts-catalog.test.ts`
- Test: `src/__tests__/workout-title-i18n.test.ts`

**Step 1: Run focused verification**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts`
Expected: PASS

**Step 2: Review diff for scope control**

Run: `git diff -- src/lib src/__tests__/workouts-catalog.test.ts src/__tests__/workout-title-i18n.test.ts docs/plans/2026-03-17-lib-i18n-cleanup.md`
Expected: only the intended cleanup, normalization, and tests
