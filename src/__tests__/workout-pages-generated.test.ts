import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = path.resolve(__dirname, "../..");

const localeDirs = [
  { locale: "de", dir: path.join(repoRoot, "docs/de/workouts") },
  { locale: "en", dir: path.join(repoRoot, "docs/en/workouts") },
  { locale: "ja", dir: path.join(repoRoot, "docs/ja/workouts") },
  { locale: "ko", dir: path.join(repoRoot, "docs/ko/workouts") },
  { locale: "zh-CN", dir: path.join(repoRoot, "docs/zh-cn/workouts") },
] as const;

function readPageFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((entry) => entry.endsWith(".md") && entry !== "index.md")
    .sort();
}

function getFrontmatterTitle(markdown: string): string | null {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) return null;

  const titleLine = frontmatter[1]
    .split("\n")
    .find((line) => line.startsWith("title:"));
  if (!titleLine) return null;

  const rawValue = titleLine.slice("title:".length).trim();
  if (!rawValue) return null;

  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    if (rawValue.startsWith('"')) {
      try {
        return JSON.parse(rawValue);
      } catch {
        return rawValue.slice(1, -1);
      }
    }

    return rawValue
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"');
  }

  return rawValue;
}

function getFirstH1(markdown: string): string | null {
  const markdownMatch = markdown.match(/^#\s+(.+)$/m);
  if (markdownMatch) {
    return markdownMatch[1]?.trim() ?? null;
  }

  const htmlMatch = markdown.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return htmlMatch?.[1]
    ?.replace(/&quot;/g, '"')
    ?.replace(/&amp;/g, "&")
    ?.replace(/&lt;/g, "<")
    ?.replace(/&gt;/g, ">")
    ?.trim() ?? null;
}

function getAllH2(markdown: string): string[] {
  return [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
}

describe("generated workout pages", () => {
  for (const { locale, dir } of localeDirs) {
    test(`every ${locale} workout page has consistent header metadata`, () => {
      const files = readPageFiles(dir);
      expect(files.length).toBeGreaterThan(0);

      for (const file of files) {
        const markdown = fs.readFileSync(path.join(dir, file), "utf8");
        const frontmatterTitle = getFrontmatterTitle(markdown);
        const h1 = getFirstH1(markdown);
        const h2s = getAllH2(markdown);

        expect(frontmatterTitle, `${locale}/${file} missing frontmatter title`).toBeTruthy();
        expect(h1, `${locale}/${file} missing H1`).toBeTruthy();
        expect(frontmatterTitle, `${locale}/${file} frontmatter title mismatch`).toBe(h1);
        expect(h2s.length, `${locale}/${file} should contain at least one workout group`).toBeGreaterThan(0);
        expect(
          h2s.every((heading) => heading.length > 0),
          `${locale}/${file} contains an empty H2 heading`,
        ).toBe(true);
      }
    });
  }
});
