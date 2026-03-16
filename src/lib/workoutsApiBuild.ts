import {
  buildWorkoutDetailUrl,
  buildWorkoutsBrowseUrl,
  buildWorkoutsBuildUrl,
} from "./workoutsApiUrls";

type BrowseItem = {
  slug: string;
};

type BrowseResponse = {
  items: BrowseItem[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

type BuildResponse = {
  items: Record<string, Record<string, unknown>>;
};

export type ApiFetch = typeof fetch;

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function readJsonOrNull<T>(response: Response): Promise<T | null> {
  if (response.status === 404) {
    return null;
  }

  return readJson<T>(response);
}

export async function loadWorkoutDetailCatalogFromApi(
  baseUrl: string,
  fetchImpl: ApiFetch = fetch,
): Promise<Record<string, Record<string, unknown>>> {
  const buildUrl = buildWorkoutsBuildUrl(baseUrl);
  const buildResponse = await fetchImpl(buildUrl);

  if (buildResponse.ok) {
    const buildPayload = await readJson<BuildResponse>(buildResponse);
    return buildPayload.items;
  }

  const firstPageUrl = buildWorkoutsBrowseUrl(baseUrl, { page: 1, pageSize: 200 });
  const firstPage = await readJson<BrowseResponse>(await fetchImpl(firstPageUrl));

  const browseItems = [...firstPage.items];
  for (let page = 2; page <= firstPage.pages; page += 1) {
    const pageUrl = buildWorkoutsBrowseUrl(baseUrl, { page, pageSize: firstPage.pageSize || 200 });
    const nextPage = await readJson<BrowseResponse>(await fetchImpl(pageUrl));
    browseItems.push(...nextPage.items);
  }

  const uniqueSlugs = [...new Set(browseItems.map((item) => item.slug).filter(Boolean))];
  const detailEntries = await Promise.all(
    uniqueSlugs.map(async (slug) => {
      const detailUrl = buildWorkoutDetailUrl(baseUrl, slug);
      const detail = await readJsonOrNull<Record<string, unknown>>(await fetchImpl(detailUrl));
      return detail ? ([slug, detail] as const) : null;
    }),
  );

  return Object.fromEntries(detailEntries.filter(Boolean));
}
