# Snapshot Cache Gated Deploy Design

## Goal

Skip automatic build and deploy runs when the workout snapshot `generatedAt` has not changed, while still allowing manual deploys.

## Current Problem

The deployment workflow rebuilds and redeploys on every push to `main` and every scheduled run, even when the upstream snapshot content is unchanged.

## Decision

Use GitHub Actions cache state to remember the last successfully deployed snapshot timestamp.

## Rules

- `push` and `schedule`: skip build and deploy if current manifest `generatedAt` matches the last deployed snapshot timestamp.
- `workflow_dispatch`: always build and deploy.
- After a successful deploy, save the current snapshot timestamp back into the cache state.

## Approach

1. Fetch `workouts/manifest.json` at the start of the workflow.
2. Restore a small cache entry containing the last deployed snapshot timestamp.
3. Compare restored timestamp to current `generatedAt`.
4. Gate install, build, and deploy steps behind that comparison.
5. Save the current timestamp in a new cache entry after successful deploy.

## Tradeoffs

- This intentionally ignores code-only changes for automatic deploys.
- Cache-backed state avoids noisy tracking commits, but uses GitHub cache semantics rather than a transparent file in the repo.

## Verification

- Validate workflow YAML parses.
- Confirm the skip condition is wired only for automatic runs.
- Confirm manual dispatch bypasses the skip and still updates cache after deploy.
