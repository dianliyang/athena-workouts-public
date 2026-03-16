import { describe, expect, test } from "vitest";
import { formatWorkoutDuration, formatWorkoutDurationLocalized } from "../lib/workoutDate";

describe("formatWorkoutDuration", () => {
  test("formats ISO ranges in the same year", () => {
    expect(formatWorkoutDuration("2026-04-16", "2026-07-09", "Summer 2026")).toBe(
      "Apr 16 - Jul 9, 2026",
    );
  });

  test("infers summer semester year for dotted dates without year", () => {
    expect(formatWorkoutDuration("26.08.", "30.08.", "Summer 2026")).toBe(
      "Aug 26 - 30, 2026",
    );
  });

  test("infers winter semester year across calendar years", () => {
    expect(formatWorkoutDuration("18.11.", "14.02.", "Winter 2026")).toBe(
      "Nov 18, 2026 - Feb 14, 2027",
    );
  });

  test("falls back to the raw value when parsing is not possible", () => {
    expect(formatWorkoutDuration("soon", "later", "Summer 2026")).toBe("soon to later");
  });

  test("formats ranges in the requested locale", () => {
    expect(formatWorkoutDurationLocalized("2026-04-16", "2026-07-09", "Summer 2026", "zh-CN")).toBe(
      "2026年4月16日 - 7月9日",
    );
  });
});
