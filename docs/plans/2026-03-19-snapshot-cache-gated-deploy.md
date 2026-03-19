# Snapshot Cache Gated Deploy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent automatic rebuilds and deploys when the snapshot timestamp has not changed, while preserving manual forced deploys.

**Architecture:** The workflow will fetch the current manifest timestamp, restore the latest cached deployed timestamp, and compute a deploy decision before any expensive steps. Build and deploy steps will run only when the snapshot changed or the workflow was manually dispatched, and a successful deploy will refresh the cached timestamp state.

**Tech Stack:** GitHub Actions, shell, Cloudflare Pages, npm

---

### Task 1: Add snapshot-state gating

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`

**Step 1: Write the workflow logic**

Add steps to fetch the manifest, restore cached snapshot state, compare timestamps, and expose outputs controlling downstream steps.

**Step 2: Gate expensive steps**

Apply `if` conditions so install, build, and deploy are skipped when the snapshot timestamp is unchanged for automatic runs.

**Step 3: Save state after successful deploy**

Write the current timestamp to a cache file and save it using a snapshot-specific cache key.

### Task 2: Update docs

**Files:**
- Modify: `README.md`

**Step 1: Document the new deploy behavior**

Explain that scheduled/push deploys are skipped when the snapshot timestamp is unchanged and that manual dispatch forces deployment.

### Task 3: Verify

**Files:**
- Modify: any touched files above if cleanup is needed

**Step 1: Validate workflow syntax**

Run a local YAML parse check.

**Step 2: Inspect workflow diff**

Confirm the skip logic is limited to automatic runs and manual dispatch still deploys.
