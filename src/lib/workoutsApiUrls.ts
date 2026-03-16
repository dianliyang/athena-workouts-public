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
  description: string | null;
  schedule: Array<{
    day: string;
    time: string;
    location: string;
  }>;
  location: string | null;
  bookingUrl: string | null;
  url: string | null;
  instructor?: string;
  startDate?: string;
  endDate?: string;
  priceStudent?: number | null;
  priceStaff?: number | null;
  priceExternal?: number | null;
  priceExternalReduced?: number | null;
  bookingStatus?: string;
  semester?: string;
  isEntgeltfrei?: boolean;
  bookingLabel?: string;
  bookingOpensOn?: string;
  bookingOpensAt?: string;
  plannedDates?: string[];
  durationUrl?: string;
};

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
