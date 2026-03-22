import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

describe("nginx static site config", () => {
  test("serves VitePress clean URLs through an nginx try_files fallback", () => {
    const nginxConfigPath = path.join(repoRoot, "nginx.conf");

    expect(existsSync(nginxConfigPath)).toBe(true);

    const nginxConfig = readFileSync(nginxConfigPath, "utf8");

    expect(nginxConfig).toContain("try_files $uri $uri.html $uri/ =404;");
  });

  test("copies the nginx config into the runtime image", () => {
    const dockerfile = readFileSync(path.join(repoRoot, "Dockerfile"), "utf8");

    expect(dockerfile).toContain("COPY nginx.conf /etc/nginx/conf.d/default.conf");
  });
});
