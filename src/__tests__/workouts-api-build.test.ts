import { describe, expect, test, vi } from "vitest";
import { getWorkoutCategoryMap, getWorkoutTitleMap, resetWorkoutLocaleMaps } from "../lib/workoutLocaleMaps";
import {
  getCategoryWikipediaLinks,
  getCategoryWikipediaUrl,
  resetWorkoutCategoryWikipediaMap,
} from "../lib/workoutCategoryWikipediaMap";
import {
  buildWorkoutSnapshotAssetUrl,
  readWorkoutSnapshotJson,
} from "../lib/workoutSnapshotUtils";
import {
  loadWorkoutDetailCatalogFromSnapshot,
  localizeWorkoutCatalogDescriptions,
} from "../lib/workoutsApi";

describe("loadWorkoutDetailCatalogFromSnapshot", () => {
  test("shares snapshot asset URL construction and JSON parsing helpers", async () => {
    expect(
      buildWorkoutSnapshotAssetUrl(
        "https://example.com/base/",
        "/workouts/locales/title/file.json",
      ),
    ).toBe("https://example.com/workouts/locales/title/file.json");

    await expect(
      readWorkoutSnapshotJson<{ ok: true }>(
        new Response(JSON.stringify({ ok: true })),
      ),
    ).resolves.toEqual({ ok: true });

    await expect(
      readWorkoutSnapshotJson(new Response("missing", { status: 404 })),
    ).rejects.toThrow("Snapshot request failed: 404");
  });

  test("loads the detail catalog through the published manifest", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/workouts/manifest.json")) {
        return new Response(
          JSON.stringify({
            generatedAt: "2026-03-17T10:00:00Z",
            detailKey: "workouts/detail/2026-03-17T10-00-00Z.json",
            titleLocaleKey: "workouts/locales/title/2026-03-17T10-00-00Z.json",
            categoryLocaleKey: "workouts/locales/category/2026-03-17T10-00-00Z.json",
            metadataLocaleKey: "workouts/locales/metadata/2026-03-17T10-00-00Z.json",
            wikipediaLocaleKey: "workouts/locales/wikipedia/2026-03-17T10-00-00Z.json",
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

      if (url.endsWith("/workouts/locales/title/2026-03-17T10-00-00Z.json")) {
        return new Response(JSON.stringify({
          "Yoga Flow": { en: "Yoga Flow", de: "Yoga Flow", ja: "ヨガフロー", ko: "요가 플로우", "zh-CN": "瑜伽流动" },
        }));
      }

      if (url.endsWith("/workouts/locales/category/2026-03-17T10-00-00Z.json")) {
        return new Response(JSON.stringify({
          Yoga: { en: "Yoga", de: "Yoga", ja: "ヨガ", ko: "요가", "zh-CN": "瑜伽" },
        }));
      }

      if (url.endsWith("/workouts/locales/metadata/2026-03-17T10-00-00Z.json")) {
        return new Response(JSON.stringify({
          page: {},
          entries: {
            "yoga-flow": {
              general: {
                digest: "general-digest",
                de: "Ursprunglicher Hinweis",
                en: "Original general text",
                ja: "ローカライズされた説明",
                ko: "현지화된 설명",
                "zh-CN": "本地化说明",
              },
            },
          },
        }));
      }

      if (url.endsWith("/workouts/locales/wikipedia/2026-03-17T10-00-00Z.json")) {
        return new Response(JSON.stringify({
          Beachvolleyball: {
            en: "https://en.wikipedia.org/wiki/Beach_volleyball",
            ja: "https://ja.wikipedia.org/wiki/%E3%83%93%E3%83%BC%E3%83%81%E3%83%90%E3%83%AC%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%AB",
          },
        }));
      }

      return new Response("not found", { status: 404 });
    });

    resetWorkoutLocaleMaps();
    resetWorkoutCategoryWikipediaMap();
    const snapshot = await loadWorkoutDetailCatalogFromSnapshot("https://example.com", fetchMock as typeof fetch);

    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(snapshot).toEqual({
      updatedAt: "2026-03-17T10:00:00Z",
      catalog: {
        "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
        "boxing-basics": { slug: "boxing-basics", title: "Boxing Basics" },
      },
      metadata: {
        page: {},
        entries: {
          "yoga-flow": {
            general: {
              digest: "general-digest",
              de: "Ursprunglicher Hinweis",
              en: "Original general text",
              ja: "ローカライズされた説明",
              ko: "현지화된 설명",
              "zh-CN": "本地化说明",
            },
          },
        },
      },
    });
    expect(getWorkoutTitleMap()["Yoga Flow"]?.ja).toBe("ヨガフロー");
    expect(getWorkoutCategoryMap().Yoga?.ko).toBe("요가");
    expect(getCategoryWikipediaUrl("ja", "Beachvolleyball")).toBe(
      "https://ja.wikipedia.org/wiki/%E3%83%93%E3%83%BC%E3%83%81%E3%83%90%E3%83%AC%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%AB",
    );
    expect(getCategoryWikipediaLinks("ja", "Beachvolleyball")).toEqual([
      {
        label: "Wikipedia",
        url: "https://ja.wikipedia.org/wiki/%E3%83%93%E3%83%BC%E3%83%81%E3%83%90%E3%83%AC%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%AB",
      },
    ]);
  });

  test("throws when a locale map fetch fails", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/workouts/manifest.json")) {
        return new Response(JSON.stringify({
          generatedAt: "2026-03-17T10:00:00Z",
          detailKey: "workouts/detail/2026-03-17T10-00-00Z.json",
          titleLocaleKey: "workouts/locales/title/2026-03-17T10-00-00Z.json",
          categoryLocaleKey: "workouts/locales/category/2026-03-17T10-00-00Z.json",
        }));
      }

      if (url.endsWith("/workouts/detail/2026-03-17T10-00-00Z.json")) {
        return new Response(JSON.stringify({}));
      }

      if (url.endsWith("/workouts/locales/title/2026-03-17T10-00-00Z.json")) {
        return new Response("not found", { status: 404 });
      }

      return new Response(JSON.stringify({}));
    });

    resetWorkoutLocaleMaps();
    await expect(
      loadWorkoutDetailCatalogFromSnapshot("https://example.com", fetchMock as typeof fetch),
    ).rejects.toThrow("Snapshot request failed: 404");
  });

  test("tolerates a missing optional metadata asset", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/workouts/manifest.json")) {
        return new Response(JSON.stringify({
          generatedAt: "2026-03-20T11:26:38Z",
          detailKey: "workouts/detail/2026-03-20T11-26-38Z.json",
          titleLocaleKey: "workouts/locales/title/2026-03-20T11-26-38Z.json",
          categoryLocaleKey: "workouts/locales/category/2026-03-20T11-26-38Z.json",
          metadataLocaleKey: "workouts/locales/metadata/2026-03-20T11-26-38Z.json",
        }));
      }

      if (url.endsWith("/workouts/detail/2026-03-20T11-26-38Z.json")) {
        return new Response(JSON.stringify({
          "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
        }));
      }

      if (url.endsWith("/workouts/locales/title/2026-03-20T11-26-38Z.json")) {
        return new Response(JSON.stringify({
          "Yoga Flow": { en: "Yoga Flow" },
        }));
      }

      if (url.endsWith("/workouts/locales/category/2026-03-20T11-26-38Z.json")) {
        return new Response(JSON.stringify({
          Yoga: { en: "Yoga" },
        }));
      }

      if (url.endsWith("/workouts/locales/metadata/2026-03-20T11-26-38Z.json")) {
        return new Response("not found", { status: 404 });
      }

      return new Response("not found", { status: 404 });
    });

    resetWorkoutLocaleMaps();
    const snapshot = await loadWorkoutDetailCatalogFromSnapshot(
      "https://example.com",
      fetchMock as typeof fetch,
    );

    expect(snapshot.metadata).toEqual({
      page: {},
      entries: {},
    });
    expect(snapshot.catalog).toEqual({
      "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
    });
  });

  test("normalizes partial metadata payloads so page and entries always exist", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/workouts/manifest.json")) {
        return new Response(JSON.stringify({
          generatedAt: "2026-03-22T19:00:00Z",
          detailKey: "workouts/detail/2026-03-22T19-00-00Z.json",
          titleLocaleKey: "workouts/locales/title/2026-03-22T19-00-00Z.json",
          categoryLocaleKey: "workouts/locales/category/2026-03-22T19-00-00Z.json",
          metadataLocaleKey: "workouts/locales/metadata/2026-03-22T19-00-00Z.json",
        }));
      }

      if (url.endsWith("/workouts/detail/2026-03-22T19-00-00Z.json")) {
        return new Response(JSON.stringify({
          "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
        }));
      }

      if (url.endsWith("/workouts/locales/title/2026-03-22T19-00-00Z.json")) {
        return new Response(JSON.stringify({
          "Yoga Flow": { en: "Yoga Flow" },
        }));
      }

      if (url.endsWith("/workouts/locales/category/2026-03-22T19-00-00Z.json")) {
        return new Response(JSON.stringify({
          Yoga: { en: "Yoga" },
        }));
      }

      if (url.endsWith("/workouts/locales/metadata/2026-03-22T19-00-00Z.json")) {
        return new Response(JSON.stringify({
          page: {},
        }));
      }

      return new Response("not found", { status: 404 });
    });

    resetWorkoutLocaleMaps();
    const snapshot = await loadWorkoutDetailCatalogFromSnapshot(
      "https://example.com",
      fetchMock as typeof fetch,
    );

    expect(snapshot.metadata).toEqual({
      page: {},
      entries: {},
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

  test("reads descriptions only from metadata, preferring locale then en", () => {
    const localized = localizeWorkoutCatalogDescriptions({
      one: {
        id: "one",
        slug: "one",
        title: "One",
        provider: "Provider",
        category: "Yoga",
        description: {
          general: "Existing general",
          price: "Existing price",
        },
        schedule: [],
        location: [],
        url: null,
      },
      two: {
        id: "two",
        slug: "two",
        title: "Two",
        provider: "Provider",
        category: "Yoga",
        description: {
          general: "Existing fallback",
        },
        schedule: [],
        location: [],
        url: null,
      },
      three: {
        id: "three",
        slug: "three",
        title: "Three",
        provider: "Provider",
        category: "Yoga",
        description: {
          general: "Existing snapshot fallback",
        },
        schedule: [],
        location: [],
        url: null,
      },
    }, {
      page: {},
      entries: {
        one: {
          general: {
            digest: "one-digest",
            de: "Eins",
            en: "English one",
            ja: "日本語の説明",
            ko: "하나",
            "zh-CN": "一",
          },
        },
        two: {
          general: {
            digest: "two-digest",
            de: "Zwei",
            en: "English two",
            ja: "",
            ko: "둘",
            "zh-CN": "二",
          },
        },
        three: {
          general: {
            digest: "three-digest",
            de: "",
            en: "",
            ja: "",
            ko: "",
            "zh-CN": "",
          },
        },
      },
    }, "ja");

    expect(localized.one.description?.general).toBe("日本語の説明");
    expect(localized.two.description?.general).toBe("English two");
    expect(localized.three.description?.general).toBe("Existing snapshot fallback");
    expect(localized.one.description?.price).toBe("Existing price");
  });
});
