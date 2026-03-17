# Workout Schema Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the workouts detail schema to use top-level `location: string[]` and remove `bookingUrl` throughout the codebase.

**Architecture:** Change the shared API detail type first, then normalize incoming detail records at the catalog boundary so all downstream code sees trimmed location arrays. Remove `bookingUrl` from type definitions, fixtures, and normalization logic, and lock the new behavior with focused regression tests.

**Tech Stack:** TypeScript, Vitest, Cloudflare worker test fixtures

---

### Task 1: Lock the new detail schema with failing tests

**Files:**
- Modify: `src/__tests__/workouts-catalog.test.ts`
- Modify: `src/__tests__/workouts-worker-api.test.ts`
- Test: `src/lib/workoutsCatalog.ts`
- Test: `src/lib/workoutsApi.ts`

**Step 1: Write the failing test**

Add coverage for:
- top-level `location` as a string array
- empty or whitespace-only location values normalizing to `[]`
- no `bookingUrl` field in fixtures or expectations

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workouts-worker-api.test.ts`
Expected: FAIL because the current types and normalization still assume string/null `location` and `bookingUrl`

**Step 3: Write minimal implementation**

Update the shared types and normalization logic to satisfy the new schema.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workouts-worker-api.test.ts`
Expected: PASS

### Task 2: Propagate the schema update to the rest of the build path

**Files:**
- Modify: `src/lib/workoutsApi.ts`
- Modify: `src/lib/workoutsCatalog.ts`
- Modify: any affected tests under `src/__tests__`

**Step 1: Write the failing test**

Add one regression asserting normalized detail items expose trimmed `location: string[]` values after catalog build.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts`
Expected: FAIL until the catalog normalization is updated

**Step 3: Write minimal implementation**

Normalize string-array locations in the catalog layer and remove dead `bookingUrl` handling.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts`
Expected: PASS

### Task 3: Final verification

**Files:**
- Test: `src/__tests__/workouts-catalog.test.ts`
- Test: `src/__tests__/workouts-worker-api.test.ts`

**Step 1: Run focused verification**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts src/__tests__/workouts-worker-api.test.ts`
Expected: PASS

**Step 2: Review diff for scope control**

Run: `git diff -- src/lib src/__tests__ docs/plans/2026-03-17-workout-schema-migration.md`
Expected: only schema migration changes and related tests
