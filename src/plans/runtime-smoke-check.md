# Workouts Runtime Smoke Check

## Verification Steps
1. Deploy worker: `npx wrangler deploy`
2. Test browse API: `curl https://athena-workouts-public.<your-subdomain>.workers.dev/api/workouts`
   - Should return JSON with `items` array.
3. Test search: `curl "https://athena-workouts-public.<your-subdomain>.workers.dev/api/workouts?q=yoga"`
4. Test detail: `curl https://athena-workouts-public.<your-subdomain>.workers.dev/api/workouts/<slug>`
5. Verify Frontend: Open the deployed URL in browser.
