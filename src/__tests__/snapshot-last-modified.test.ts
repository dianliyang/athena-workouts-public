import { describe, expect, test } from "vitest";
import { resolveSnapshotLastModified } from "../../docs/.vitepress/theme/snapshotLastModified";

describe("resolveSnapshotLastModified", () => {
  test("returns localized snapshot metadata for generated pages", () => {
    expect(
      resolveSnapshotLastModified("en", {
        snapshotUpdatedAt: "2026-03-17T10:00:00Z",
      }),
    ).toEqual({
      label: "Last updated",
      datetime: "2026-03-17T10:00:00Z",
      text: "Mar 17, 2026, 10:00",
    });
  });

  test("returns null when the generated page has no snapshot timestamp", () => {
    expect(resolveSnapshotLastModified("en", {})).toBeNull();
  });
});
