# GitHub Actions Pages Deploy Design

Restore automated Cloudflare Pages deployment for the public workouts site with a daily GitHub Actions schedule.

## Goal

Build and deploy the VitePress site to Cloudflare Pages every day at 04:00 UTC, which corresponds to 06:00 during Berlin summer time (CEST), while preserving manual deploys and main-branch deploys.

## Current State

- The repository currently documents Docker Compose as the deployment path.
- `.github/workflows` exists but contains no workflow files.
- The Pages project `athena-workouts-public` already exists.
- Git history contains a previous Pages deployment workflow with snapshot-change gating.

## Proposed Approach

- Reintroduce `.github/workflows/deploy-pages.yml`.
- Trigger on:
  - `push` to `main`
  - `schedule` with cron `0 4 * * *`
  - `workflow_dispatch`
- Reuse the previous snapshot manifest gating:
  - fetch the current snapshot manifest timestamp
  - restore the last deployed snapshot timestamp from Actions cache
  - skip build and deploy for automatic runs when the snapshot is unchanged
  - always deploy on manual dispatch
- Build the site with Node 22 and deploy `docs/.vitepress/dist` with Wrangler.

## Secrets And Dependencies

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- GitHub-hosted runner tools:
  - `curl`
  - `jq`
  - `npm`
  - `npx`

## Documentation Changes

- Update `README.md` to mention:
  - Cloudflare Pages as the production deployment target
  - the daily scheduled deploy at 04:00 UTC / 06:00 CEST
  - the required GitHub secrets
  - Docker Compose remains available for local serving

## Verification

- Parse the workflow YAML locally.
- Inspect the workflow diff to confirm the schedule and deploy command.
- Rebuild the site locally with `npm run build` to confirm the workflow still matches the current build output path.
