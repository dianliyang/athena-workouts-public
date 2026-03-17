# Pages Runtime Smoke Check

## Verification Steps
1. Confirm snapshot input is reachable:
   - `curl https://athena-public-snapshots.oili.workers.dev/workouts/manifest.json`
2. Trigger a Cloudflare Pages build or push a new commit.
3. Open the deployed site and confirm category pages render.
4. Use local search and verify category names are discoverable.
5. Open several workout cards and verify they still link to the original provider pages.
