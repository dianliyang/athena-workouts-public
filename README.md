# athena-workouts-public

Static VitePress site for Sports in Kiel. The site builds from published workout snapshot JSON and generates one page per workout category under `docs/workouts/`.

## Build Input

The docs build fetches published snapshot files from `https://athena-public-snapshots.oili.workers.dev` by default. Set `WORKOUTS_SNAPSHOT_BASE_URL` or `VITEPRESS_WORKOUTS_SNAPSHOT_BASE_URL` to override that base URL for local or preview builds.

## Commands

- `npm test -- --run`
- `npm run build`

## Deployment

Deploy this repo on Cloudflare Pages. Snapshot generation and publishing stay in the separate `athena-public-snapshots` Worker project.

## GitHub Actions Deployment

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

- Pushes to `main` deploy the site to Cloudflare Pages.
- A scheduled rebuild runs every day at `03:00 UTC`.
- You can also trigger it manually with `workflow_dispatch`.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
