import { describe, expect, test, vi } from "vitest";
import { loadWorkoutDetailCatalogFromApi } from "../lib/workoutsApi";

describe("loadWorkoutDetailCatalogFromApi", () => {
  test("prefers the bulk build endpoint when available", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/api/workouts/build")) {
        return new Response(
          JSON.stringify({
            items: {
              "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
              "boxing-basics": { slug: "boxing-basics", title: "Boxing Basics" },
            },
          }),
        );
      }

      return new Response("not found", { status: 404 });
    });

    const catalog = await loadWorkoutDetailCatalogFromApi("https://example.com", fetchMock as typeof fetch);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(catalog).toEqual({
      "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
      "boxing-basics": { slug: "boxing-basics", title: "Boxing Basics" },
    });
  });

  test("loads all browse pages and detail records", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/api/workouts/build")) {
        return new Response("not found", { status: 404 });
      }

      if (url.includes("/api/workouts?page=1&pageSize=200")) {
        return new Response(
          JSON.stringify({
            items: [{ slug: "yoga-flow" }],
            total: 2,
            page: 1,
            pageSize: 200,
            pages: 2,
          }),
        );
      }

      if (url.includes("/api/workouts?page=2&pageSize=200")) {
        return new Response(
          JSON.stringify({
            items: [{ slug: "boxing-basics" }],
            total: 2,
            page: 2,
            pageSize: 200,
            pages: 2,
          }),
        );
      }

      if (url.endsWith("/api/workouts/yoga-flow")) {
        return new Response(JSON.stringify({ slug: "yoga-flow", title: "Yoga Flow" }));
      }

      if (url.endsWith("/api/workouts/boxing-basics")) {
        return new Response(JSON.stringify({ slug: "boxing-basics", title: "Boxing Basics" }));
      }

      return new Response("not found", { status: 404 });
    });

    const catalog = await loadWorkoutDetailCatalogFromApi("https://example.com", fetchMock as typeof fetch);

    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(catalog).toEqual({
      "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
      "boxing-basics": { slug: "boxing-basics", title: "Boxing Basics" },
    });
  });

  test("skips browse entries whose detail endpoint returns 404", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/api/workouts/build")) {
        return new Response("not found", { status: 404 });
      }

      if (url.includes("/api/workouts?page=1&pageSize=200")) {
        return new Response(
          JSON.stringify({
            items: [{ slug: "ok-course" }, { slug: "missing-course" }],
            total: 2,
            page: 1,
            pageSize: 200,
            pages: 1,
          }),
        );
      }

      if (url.endsWith("/api/workouts/ok-course")) {
        return new Response(JSON.stringify({ slug: "ok-course", title: "OK Course" }));
      }

      if (url.endsWith("/api/workouts/missing-course")) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      }

      return new Response("not found", { status: 404 });
    });

    const catalog = await loadWorkoutDetailCatalogFromApi("https://example.com", fetchMock as typeof fetch);

    expect(catalog).toEqual({
      "ok-course": { slug: "ok-course", title: "OK Course" },
    });
  });
});
