export type WorkoutBrowseItem = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  category: string | null;
  searchText: string;
};

export type WorkoutsBrowseResponse = {
  items: WorkoutBrowseItem[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

export type WorkoutDetailResponse = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  category: string | null;
  description: {
    general?: string | null;
    price?: string | null;
  } | null;
  price?: {
    student?: number | null;
    staff?: number | null;
    external?: number | null;
    externalReduced?: number | null;
    adults?: number | null;
    children?: number | null;
    discount?: number | null;
  };
  schedule: Array<{
    day: string;
    time: string;
    location: string;
  }>;
  location: string[] | null;
  url: string | null;
  instructor?: string;
  startDate?: string;
  endDate?: string;
  bookingStatus?: string;
  semester?: string;
  isEntgeltfrei?: boolean;
  bookingLabel?: string;
  bookingOpensOn?: string;
  bookingOpensAt?: string;
  plannedDates?: string[];
  durationUrl?: string;
};

export type WorkoutsBuildResponse = {
  items: Record<string, WorkoutDetailResponse>;
};

export type ApiFetch = typeof fetch;

export function buildWorkoutsBrowseUrl(
  baseUrl: string,
  params: Record<string, string | number | undefined>,
): string {
  const url = new URL("/api/workouts", baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

export function buildWorkoutDetailUrl(baseUrl: string, slug: string): string {
  return new URL(`/api/workouts/${slug}`, baseUrl).toString();
}

export function buildWorkoutsBuildUrl(baseUrl: string): string {
  return new URL("/api/workouts/build", baseUrl).toString();
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
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
): Promise<Record<string, WorkoutDetailResponse>> {
  const buildUrl = buildWorkoutsBuildUrl(baseUrl);
  const buildResponse = await fetchImpl(buildUrl);

  if (buildResponse.ok) {
    const buildPayload = await readJson<WorkoutsBuildResponse>(buildResponse);
    return buildPayload.items;
  }

  const firstPageUrl = buildWorkoutsBrowseUrl(baseUrl, {
    page: 1,
    pageSize: 200,
  });
  const firstPage = await readJson<WorkoutsBrowseResponse>(
    await fetchImpl(firstPageUrl),
  );

  const browseItems = [...firstPage.items];
  for (let page = 2; page <= firstPage.pages; page += 1) {
    const pageUrl = buildWorkoutsBrowseUrl(baseUrl, {
      page,
      pageSize: firstPage.pageSize || 200,
    });
    const nextPage = await readJson<WorkoutsBrowseResponse>(
      await fetchImpl(pageUrl),
    );
    browseItems.push(...nextPage.items);
  }

  const uniqueSlugs = [
    ...new Set(browseItems.map((item) => item.slug).filter(Boolean)),
  ];
  const detailEntries = await Promise.all(
    uniqueSlugs.map(async (slug) => {
      const detailUrl = buildWorkoutDetailUrl(baseUrl, slug);
      const detail = await readJsonOrNull<WorkoutDetailResponse>(
        await fetchImpl(detailUrl),
      );
      return detail ? ([slug, detail] as const) : null;
    }),
  );

  return Object.fromEntries(detailEntries.filter(Boolean)) as Record<
    string,
    WorkoutDetailResponse
  >;
}
