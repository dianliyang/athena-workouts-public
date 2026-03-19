# Translation Map Cleanup Design

## Goal

Remove redundant checked-in translation-map artifacts and keep runtime snapshot locale maps as the only translation source of truth.

## Scope

- Delete redundant map files in `src/lib`
- Delete `Sports Translations.xlsx`
- Delete obsolete plan docs under `src/plans`
- Remove stale generated-file comments that refer to deleted scripts

## Decision

Use `workoutLocaleMaps.ts` as the only translation storage layer. Tests that previously imported static maps will seed `setWorkoutLocaleMaps()` with local fixtures instead.

## Files To Remove

- `src/lib/workoutTitleMap.ts`
- `src/lib/workoutCategoryMap.ts`
- `src/lib/workoutTitleSpreadsheetMap.ts`
- `src/__tests__/workout-title-spreadsheet-map.test.ts`
- `Sports Translations.xlsx`
- `src/plans/2026-03-16-workouts-vitepress-design.md`
- `src/plans/2026-03-16-workouts-vitepress.md`
- `src/plans/runtime-smoke-check.md`

## Behavioral Changes

- Group header title localization will no longer use a separate spreadsheet override file.
- Tests will explicitly provide the translations they require instead of depending on large checked-in generated maps.

## Testing

- Update title and catalog tests to seed locale maps with inline fixtures.
- Add a renderer test that confirms group headers still localize from the seeded runtime locale maps.
- Run targeted tests and a site build.
