# athena-workouts-public

Static VitePress site for Sports in Kiel, rendered from the workouts API backed by R2 data. The default VitePress sidebar is generated from workout categories, and each category gets its own page under `docs/workouts/`.

## Build Input

The docs build fetches from `https://sport.oili.dev` by default. Set `WORKOUTS_API_BASE_URL` or `VITEPRESS_WORKOUTS_API_BASE_URL` to override that base URL for local or preview builds.

## Commands

- `npm test -- --run`
- `npm run build`
