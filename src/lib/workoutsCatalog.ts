import type { WorkoutDetailResponse as WorkoutDetailRecord } from "./workoutsApi";

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
  const trimmed = category?.trim() || UNCATEGORIZED_LABEL;
  if (trimmed.startsWith("Ballett")) {
    return "Ballett";
  }
  return trimmed;
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
    // Remove only the number and optional day from Kurs/Wochenende/Course suffixes: "Course 1: Mo" -> "Course"
    .replace(
      /(\s*(?:Kurs|Wochenende|Course))\s+\d+(?:\s*[:]\s*(?:Mo|Di|Mi|Do|Fr|Sa|So|Mon|Tue|Wed|Thu|Fri|Sat|Sun))?$/iu,
      "$1",
    )
    // Remove group/day suffixes like "Gruppe Di", "Gruppe Sa/So", or "Gruppe Mi unbesetzt"
    .replace(
      /\s+Gruppe\s+(?:Mo|Di|Mi|Do|Fr|Sa|So|Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:\/|\\)?(?:Mo|Di|Mi|Do|Fr|Sa|So|Mon|Tue|Wed|Thu|Fri|Sat|Sun)?(?:\s+unbesetzt)?$/iu,
      "",
    )
    // Remove time ranges: "Di 19.10 - 20.10 Uhr" or "10:00-11:00"
    .replace(
      /\s+(?:Mo|Di|Mi|Do|Fr|Sa|So|Mon|Tue|Wed|Thu|Fri|Sat|Sun)?\s*\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}\s*(?:Uhr)?$/iu,
      "",
    )
    // Remove simple day + number suffixes: ": Mi 12", " Di 13"
    .replace(
      /[:\s]+(?:Mo|Di|Mi|Do|Fr|Sa|So|Mon|Tue|Wed|Thu|Fri|Sat|Sun)?\s*\d{1,2}$/iu,
      "",
    )
    // Remove full German weekday suffixes: "montags", "dienstags", etc.
    .replace(
      /\s+(?:montags|dienstags|mittwochs|donnerstags|freitags|samstags|sonntags)$/iu,
      "",
    )
    .trim();
}

function normalizeDetail(record: WorkoutDetailRecord): WorkoutDetailItem {
  return {
    ...record,
    category: normalizeCategory(record.category),
    bookingUrl: record.bookingUrl?.trim() ? record.bookingUrl : null,
  };
}

const WEEKDAY_ORDER: Record<string, number> = {
  Mo: 1,
  Mon: 1,
  Di: 2,
  Tue: 2,
  Mi: 3,
  Wed: 3,
  Do: 4,
  Thu: 4,
  Fr: 5,
  Fri: 5,
  Sa: 6,
  Sat: 6,
  So: 7,
  Sun: 7,
};

function buildTitleGroups(items: WorkoutDetailItem[]): WorkoutTitleGroup[] {
  const grouped = Object.groupBy(items, (item) =>
    normalizeTitleGroupKey(item.title),
  ) as Record<string, WorkoutDetailItem[]>;

  return Object.keys(grouped)
    .sort((left, right) => left.localeCompare(right))
    .map((title) => {
      const groupItems = grouped[title] ?? [];

      // Sort items by schedule (first day, then time)
      groupItems.sort((a, b) => {
        const schedA = a.schedule[0];
        const schedB = b.schedule[0];

        if (!schedA && !schedB) return 0;
        if (!schedA) return 1;
        if (!schedB) return -1;

        const dayA = WEEKDAY_ORDER[schedA.day] ?? 99;
        const dayB = WEEKDAY_ORDER[schedB.day] ?? 99;

        if (dayA !== dayB) return dayA - dayB;
        return schedA.time.localeCompare(schedB.time);
      });

      return {
        title,
        items: groupItems,
      };
    });
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
