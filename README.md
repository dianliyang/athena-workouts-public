# athena-workouts-public

Static VitePress site for Sports in Kiel. The site builds from published workout snapshot JSON and generates one page per workout category under `docs/workouts/`.

## Build Input

The docs build fetches published snapshot files from `https://athena-public-snapshots.oili.workers.dev` by default. Set `WORKOUTS_SNAPSHOT_BASE_URL` or `VITEPRESS_WORKOUTS_SNAPSHOT_BASE_URL` to override that base URL for local or preview builds.

## Commands

- `npm test -- --run`
- `npm run build`

## Deployment

Deploy this repo on Cloudflare Pages. Snapshot generation and publishing stay in the separate `athena-public-snapshots` Worker project.
