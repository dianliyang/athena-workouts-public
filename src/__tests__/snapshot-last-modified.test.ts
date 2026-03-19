import { describe, expect, test } from "vitest";
import { resolveSnapshotLastModified } from "../../docs/.vitepress/theme/snapshotLastModified";

describe("resolveSnapshotLastModified", () => {
  test("returns localized snapshot metadata for generated pages", () => {
    const date = new Date("2026-03-17T10:00:00Z");
    expect(
      resolveSnapshotLastModified("en-US", {
        snapshotUpdatedAt: "2026-03-17T10:00:00Z",
      }, {
        text: "Last updated",
      }),
    ).toEqual({
      label: "Last updated",
      datetime: "2026-03-17T10:00:00Z",
      text: new Intl.DateTimeFormat("en-US", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date),
    });
  });

  test("formats snapshot timestamps using the active page locale", () => {
    const date = new Date("2026-03-17T10:00:00Z");

    expect(
      resolveSnapshotLastModified("de-DE", {
        snapshotUpdatedAt: "2026-03-17T10:00:00Z",
      }, {
        text: "Zuletzt aktualisiert",
        formatOptions: { dateStyle: "short", timeStyle: "short", forceLocale: true },
      }),
    ).toEqual({
      label: "Zuletzt aktualisiert",
      datetime: "2026-03-17T10:00:00Z",
      text: new Intl.DateTimeFormat("de-DE", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date),
    });
  });

  test("returns null when the generated page has no snapshot timestamp", () => {
    expect(resolveSnapshotLastModified("en-US", {}, { text: "Last updated" })).toBeNull();
  });
});
