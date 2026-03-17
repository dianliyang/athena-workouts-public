import { describe, expect, test, vi } from "vitest";
import { loadWorkoutDetailCatalogFromSnapshot } from "../lib/workoutsApi";

describe("loadWorkoutDetailCatalogFromSnapshot", () => {
  test("loads the detail catalog through the published manifest", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/workouts/manifest.json")) {
        return new Response(
          JSON.stringify({
            detailKey: "workouts/detail/2026-03-17T10-00-00Z.json",
          }),
        );
      }

      if (url.endsWith("/workouts/detail/2026-03-17T10-00-00Z.json")) {
        return new Response(
          JSON.stringify({
            "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
            "boxing-basics": { slug: "boxing-basics", title: "Boxing Basics" },
          }),
        );
      }

      return new Response("not found", { status: 404 });
    });

    const catalog = await loadWorkoutDetailCatalogFromSnapshot("https://example.com", fetchMock as typeof fetch);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(catalog).toEqual({
      "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
      "boxing-basics": { slug: "boxing-basics", title: "Boxing Basics" },
    });
  });

  test("throws when the manifest fetch fails", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/workouts/manifest.json")) {
        return new Response("not found", { status: 404 });
      }

      return new Response("not found", { status: 404 });
    });

    await expect(
      loadWorkoutDetailCatalogFromSnapshot("https://example.com", fetchMock as typeof fetch),
    ).rejects.toThrow("Snapshot request failed: 404");
  });
});
