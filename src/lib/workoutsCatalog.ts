type WorkoutDetailRecord = {
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

export type WorkoutDetailItem = WorkoutDetailRecord & {
  category: string;
};

export type WorkoutTitleGroup = {
  title: string;
  items: WorkoutDetailItem[];
};

export type WorkoutCategoryGroup = {
  category: string;
  items: WorkoutDetailItem[];
  titleGroups: WorkoutTitleGroup[];
};

export type WorkoutDetailCatalog = {
  categories: string[];
  groups: Record<string, WorkoutCategoryGroup>;
};

export type WorkoutCategoryPage = {
  category: string;
  slug: string;
  route: string;
  path: string;
  group: WorkoutCategoryGroup;
};

export const UNCATEGORIZED_LABEL = "Uncategorized";
export const CATEGORY_INDEX_PATH = "docs/workouts";

function normalizeCategory(category: string | null): string {
  return category?.trim() || UNCATEGORIZED_LABEL;
}

function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "category";
}

function normalizeTitleGroupKey(title: string): string {
  return title
    .replace(/\s+\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}\s*$/u, "")
    .trim();
}

function normalizeDetail(record: WorkoutDetailRecord): WorkoutDetailItem {
  return {
    ...record,
    category: normalizeCategory(record.category),
    bookingUrl: record.bookingUrl?.trim() ? record.bookingUrl : null,
  };
}

function buildTitleGroups(items: WorkoutDetailItem[]): WorkoutTitleGroup[] {
  const grouped = Object.groupBy(items, (item) => normalizeTitleGroupKey(item.title)) as Record<
    string,
    WorkoutDetailItem[]
  >;

  return Object.keys(grouped)
    .sort((left, right) => left.localeCompare(right))
    .map((title) => ({
      title,
      items: grouped[title] ?? [],
    }));
}

export function buildWorkoutDetailCatalog(
  records: Record<string, WorkoutDetailRecord>,
): WorkoutDetailCatalog {
  const items = Object.values(records).map(normalizeDetail);
  const grouped = Object.groupBy(items, (item) => item.category) as Record<string, WorkoutDetailItem[]>;
  const categories = Object.keys(grouped).sort((left, right) => left.localeCompare(right));

  const groups = Object.fromEntries(
    categories.map((category) => [
      category,
      {
        category,
        items: grouped[category] ?? [],
        titleGroups: buildTitleGroups(grouped[category] ?? []),
      },
    ]),
  ) as Record<string, WorkoutCategoryGroup>;

  return { categories, groups };
}

export function buildWorkoutCategoryPages(catalog: WorkoutDetailCatalog): {
  sidebar: Array<{ text: string; link: string }>;
  pages: WorkoutCategoryPage[];
};
export function buildWorkoutCategoryPages(
  catalog: WorkoutDetailCatalog,
  options?: { docsBasePath?: string; routeBasePath?: string },
): {
  sidebar: Array<{ text: string; link: string }>;
  pages: WorkoutCategoryPage[];
} {
  const docsBasePath = options?.docsBasePath ?? CATEGORY_INDEX_PATH;
  const routeBasePath = options?.routeBasePath ?? "/workouts";
  const pages = catalog.categories.map((category) => {
    const slug = slugifyCategory(category);
    return {
      category,
      slug,
      route: `${routeBasePath}/${slug}`,
      path: `${docsBasePath}/${slug}.md`,
      group: catalog.groups[category],
    };
  });

  return {
    sidebar: pages.map((page) => ({ text: page.category, link: page.route })),
    pages,
  };
}
