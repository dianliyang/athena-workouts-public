import { describe, expect, test } from "vitest";
import { getCategoryWikipediaUrl } from "../lib/workoutCategoryWikipediaMap";

describe("workout category wikipedia map", () => {
  test("returns the locale-specific URL when present", () => {
    expect(getCategoryWikipediaUrl("ja", "Beachvolleyball")).toBe(
      "https://ja.wikipedia.org/wiki/%E3%83%93%E3%83%BC%E3%83%81%E3%83%90%E3%83%AC%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%AB",
    );
  });

  test("falls back to English when the requested locale is missing", () => {
    expect(getCategoryWikipediaUrl("zh-CN", "Bouldering")).toBe(
      "https://en.wikipedia.org/wiki/Bouldering",
    );
  });

  test("returns null when the category has no wikipedia mapping", () => {
    expect(getCategoryWikipediaUrl("en", "Dance Fit")).toBeNull();
  });
});
