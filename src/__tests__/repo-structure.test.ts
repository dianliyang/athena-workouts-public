import { describe, expect, test } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

describe("athena-workouts-public repository structure", () => {
  test("contains the expected foundation files and pages build areas", () => {
    expect(existsSync(path.join(repoRoot, "package.json"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "README.md"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "docs"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "src"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "src", "lib"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "docs", ".vitepress"))).toBe(true);
  });
});
