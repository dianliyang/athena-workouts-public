# Workout Snapshot Last Modified Design

## Goal

Show a stable "last modified" value on generated workout pages using the snapshot manifest publish time instead of git history.

## Problem

Generated workout markdown files are recreated during the VitePress build and are ignored by git. VitePress `lastUpdated` depends on git commit metadata, so deployed builds cannot reliably show a timestamp for those pages.

## Decision

Use `generatedAt` from `workouts/manifest.json` as the source of truth for generated workout pages.

## Approach

1. Extend the snapshot manifest loader to return both the workout catalog and the manifest `generatedAt` value.
2. Pass that timestamp into generated workout page rendering.
3. Add frontmatter to generated workout markdown with a custom field carrying the manifest timestamp.
4. Render a custom last-modified line in the VitePress theme when that frontmatter field exists.
5. Leave VitePress `lastUpdated` enabled so tracked docs continue using git-derived timestamps.

## Tradeoffs

- This keeps generated-page timestamps tied to snapshot publication, which matches the data source users care about.
- It avoids committing generated pages or depending on checkout depth in CI.
- It adds a small amount of theme logic, but keeps all custom behavior explicit and local to generated pages.

## Testing

- Add a failing API test that asserts the manifest timestamp is returned from the manifest.
- Add a failing renderer test that asserts generated workout pages include the frontmatter timestamp.
- Add a small unit test for the custom last-modified theme helper so the display logic stays deterministic.
