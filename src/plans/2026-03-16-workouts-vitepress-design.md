# Workouts VitePress Design

**Goal:** Render workouts as a default-theme VitePress site where the built-in sidebar contains only category pages derived from the static browse snapshot.

## Context

The browse snapshot schema changed. The current browse records are now flat:

- `id`
- `slug`
- `title`
- `provider`
- `category`
- `searchText`

The previous single-page category filter no longer fits the updated requirement or the default VitePress sidebar model.

## Architecture

Use VitePress default theme navigation as intended:

- Sidebar contains only category links
- Each category is its own page under `docs/workouts/`
- The page body lists workouts in that category using default VitePress document styling

No custom theme CSS or custom sidebar-like component behavior is needed.

## Data Flow

At build time, import `/Users/wagagaha/vibe/athena-public-snapshots/out/workouts-browse.json`, normalize records to the new flat schema, derive sorted categories, group workouts by category, and use that result in two places:

1. `themeConfig.sidebar` in `docs/.vitepress/config.ts`
2. generated category pages in `docs/workouts/`

The root page can stay minimal and point readers to the category pages.

## Content Model

Each category page should show:

- Category title as the page heading
- A short count summary
- A simple list of workouts in that category
- For each workout: title and provider

No schedule, location, excerpt, or booking link should be rendered from the browse snapshot because those fields are no longer present.

## Verification

Before claiming completion:

1. Add or update tests for the new flat browse schema and category grouping.
2. Verify the targeted test fails first.
3. Implement the new catalog/page-generation helpers.
4. Re-run the targeted test and full suite.
5. Run `npm run build` and confirm the VitePress site builds with generated category pages and sidebar config.
