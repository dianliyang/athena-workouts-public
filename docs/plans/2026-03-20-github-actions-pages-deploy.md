# GitHub Actions Pages Deploy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore a GitHub Actions workflow that deploys the site to Cloudflare Pages on `main`, by manual dispatch, and daily at 04:00 UTC.

**Architecture:** Reuse the previous Cloudflare Pages workflow structure from git history, including snapshot-change gating to avoid unnecessary scheduled builds. Keep the local Docker Compose flow documented for local serving, but add README guidance for the production GitHub Actions deploy path and required secrets.

**Tech Stack:** GitHub Actions, shell, Node 22, Wrangler, Cloudflare Pages, Markdown

---

### Task 1: Restore the workflow file

**Files:**
- Create: `.github/workflows/deploy-pages.yml`

**Step 1: Write the workflow**

Add a workflow with:
- `push` on `main`
- `schedule` cron `0 4 * * *`
- `workflow_dispatch`
- snapshot cache restore, manifest comparison, gated build/deploy, and cache save
- deploy command targeting `athena-workouts-public`

**Step 2: Verify the workflow structure**

Run: `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/deploy-pages.yml"); puts "ok"'`
Expected: `ok`

### Task 2: Update deployment documentation

**Files:**
- Modify: `README.md`

**Step 1: Document production deployment**

Add a short subsection that explains:
- GitHub Actions deploys to Cloudflare Pages
- the daily schedule is `04:00 UTC` (`06:00` Berlin summer time / CEST)
- required GitHub secrets are `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

**Step 2: Preserve local guidance**

Keep the Docker Compose instructions for local serving.

### Task 3: Verify the repo state

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`

**Step 1: Build locally**

Run: `npm run build`
Expected: build completes successfully and still outputs `docs/.vitepress/dist`

**Step 2: Review the final diff**

Run: `git diff -- .github/workflows/deploy-pages.yml README.md docs/plans/2026-03-20-github-actions-pages-deploy-design.md docs/plans/2026-03-20-github-actions-pages-deploy.md`
Expected: only the workflow, docs, and plan files are changed for this task
