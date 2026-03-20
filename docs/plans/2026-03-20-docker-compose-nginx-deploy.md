# Docker Compose Nginx Deploy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace GitHub Actions Pages deployment with a Docker Compose setup that builds the VitePress site and serves the static output from nginx.

**Architecture:** Use a multi-stage Docker build. The first stage installs Node dependencies and runs `npm run build` to generate `docs/.vitepress/dist`. The second stage copies the generated static assets into the default nginx web root and serves them on port 80. `docker-compose.yml` becomes the primary local and deployment entry point.

**Tech Stack:** Docker, Docker Compose, nginx, Node.js, VitePress

---

### Task 1: Remove GitHub Actions deployment

**Files:**
- Delete: `.github/workflows/deploy-pages.yml`

**Step 1: Remove the workflow**

Delete `.github/workflows/deploy-pages.yml`.

**Step 2: Verify it is no longer tracked**

Run: `git status --short`
Expected: `.github/workflows/deploy-pages.yml` shows as deleted.

### Task 2: Add containerized static serving

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Step 1: Add a multi-stage Dockerfile**

Create a `Dockerfile` that:
- uses a Node build stage,
- runs `npm ci`,
- runs `npm run build`,
- copies `docs/.vitepress/dist` into `nginx:alpine`.

**Step 2: Add Compose entrypoint**

Create `docker-compose.yml` with a single service that builds the local `Dockerfile`, maps host port `8080` to container port `80`, and restarts unless stopped.

**Step 3: Add `.dockerignore`**

Ignore `node_modules`, git metadata, local build output, and docs plans noise that should not be part of the image context.

**Step 4: Validate configuration shape**

Run: `docker compose config`
Expected: valid merged compose output with one web service.

### Task 3: Update repository docs

**Files:**
- Modify: `README.md`

**Step 1: Remove Cloudflare Pages deployment documentation**

Delete the GitHub Actions and Cloudflare Pages deployment sections.

**Step 2: Add Docker usage**

Document:
- `docker compose up --build`
- default exposed URL `http://localhost:8080`
- that build input still comes from the snapshot base URL environment variables.

**Step 3: Keep local Node commands**

Retain `npm test -- --run` and `npm run build` for direct local verification.

### Task 4: Verify the result

**Files:**
- Modify if needed: `Dockerfile`, `docker-compose.yml`, `README.md`

**Step 1: Build the site locally**

Run: `npm run build`
Expected: VitePress build succeeds and writes static output.

**Step 2: Validate Compose**

Run: `docker compose config`
Expected: Compose file parses successfully.

**Step 3: Review final diff**

Run: `git diff -- .github/workflows/deploy-pages.yml Dockerfile docker-compose.yml .dockerignore README.md`
Expected: only the deployment migration changes appear.
