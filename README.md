# athena-workouts-public

Static VitePress site for Sports in Kiel. The site builds from published workout snapshot JSON and generates one page per workout category under `docs/workouts/`.

## Build Input

The docs build fetches published snapshot files from `https://athena-public-snapshots.oili.workers.dev` by default. Set `WORKOUTS_SNAPSHOT_BASE_URL` or `VITEPRESS_WORKOUTS_SNAPSHOT_BASE_URL` to override that base URL for local or preview builds.

## Commands

- `npm test -- --run`
- `npm run build`

## Deployment

Serve this repo as a static site with Docker Compose. The image builds the VitePress site, then serves the generated files from `nginx`.

### Run with Docker Compose

Build and start the container:

```bash
docker compose up --build
```

The site is then available at `http://localhost:8080`.

You can stop it with `Ctrl+C`, or run it detached with:

```bash
docker compose up --build -d
```

Snapshot generation and publishing still stay in the separate `athena-public-snapshots` Worker project.

### Build Configuration

The Docker build uses the same snapshot source configuration as local builds. Set `WORKOUTS_SNAPSHOT_BASE_URL` or `VITEPRESS_WORKOUTS_SNAPSHOT_BASE_URL` when you need a different snapshot source during image builds.
