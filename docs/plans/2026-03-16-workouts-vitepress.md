# Workouts VitePress Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the single-page workouts catalog with default-theme VitePress category pages and a sidebar containing only category links derived from the updated flat browse snapshot.

**Architecture:** A small pure helper module will normalize the flat browse snapshot, derive sorted categories, group workouts by category, and generate sidebar entries plus page source. The VitePress config will consume that helper to define the default sidebar, and the docs tree will contain generated category pages instead of a custom in-page category selector.

**Tech Stack:** VitePress default theme, Vue/Vite build tooling, Vitest, TypeScript, static JSON import, generated Markdown pages

---

### Task 1: Update the catalog helper test for flat-schema categories

**Files:**
- Modify: `src/__tests__/workouts-catalog.test.ts`
- Test: `src/lib/workoutsCatalog.ts`

**Step 1: Write the failing test**

Replace the old rich-field expectations with tests that assert:

- flat string records normalize correctly
- categories are derived and sorted without an `All` entry
- workouts are grouped by category
- duplicate slugs remain preserved in grouped output order if present

Also add a test for sidebar/page metadata generation if that logic lives in the helper.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts`
Expected: FAIL because the helper still returns the old single-page catalog shape.

**Step 3: Commit**

```bash
git add src/__tests__/workouts-catalog.test.ts
git commit -m "test: update workouts catalog coverage for category pages"
```

### Task 2: Simplify the catalog helper for the new schema

**Files:**
- Modify: `src/lib/workoutsCatalog.ts`
- Test: `src/__tests__/workouts-catalog.test.ts`

**Step 1: Write minimal implementation**

Implement a flat-schema helper that exports the normalized item type plus functions to:

- derive sorted categories
- group workouts by category
- create sidebar items/page metadata as needed for VitePress generation

Remove obsolete handling for missing fields that no longer exist in the browse snapshot.

**Step 2: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workouts-catalog.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add src/lib/workoutsCatalog.ts src/__tests__/workouts-catalog.test.ts
git commit -m "feat: simplify workouts catalog for flat browse schema"
```

### Task 3: Switch VitePress to generated category pages

**Files:**
- Modify: `docs/.vitepress/config.ts`
- Modify: `docs/index.md`
- Delete: `docs/.vitepress/theme/components/WorkoutsCatalog.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Create: `docs/workouts/*.md`

**Step 1: Write the failing build check**

Change config/page generation toward sidebar category pages before the full implementation is finished.

**Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL until the generated pages and sidebar data are wired correctly.

**Step 3: Write minimal implementation**

Configure the default sidebar with category page links only, create the category pages from snapshot data, and simplify the root page to point into the category navigation.

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add docs/.vitepress/config.ts docs/index.md docs/.vitepress/theme/index.ts docs/workouts
git commit -m "feat: generate category pages for vitepress sidebar"
```

### Task 4: Remove obsolete single-page catalog behavior and verify

**Files:**
- Delete: `docs/.vitepress/theme/components/WorkoutsCatalog.vue`
- Modify: `README.md`
- Modify: other docs/build files only if required

**Step 1: Remove obsolete files and references**

Delete the custom catalog component and any remaining references to the in-page category selector.

**Step 2: Run full verification**

Run: `npm test -- --run`
Expected: PASS

Run: `npm run build`
Expected: PASS

**Step 3: Update docs**

Document that the site now exposes workouts through default VitePress category pages backed by the snapshot.

**Step 4: Commit**

```bash
git add README.md docs src
git commit -m "refactor: switch workouts site to default vitepress category pages"
```
