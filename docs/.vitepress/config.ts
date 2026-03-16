import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import {
  buildWorkoutCategoryPages,
  buildWorkoutDetailCatalog,
  type WorkoutDetailItem,
  type WorkoutTitleGroup,
} from "../../src/lib/workoutsCatalog";
import { formatWorkoutDuration } from "../../src/lib/workoutDate";
import { localizeSidebarItems, type SidebarLocale } from "../../src/lib/workoutSidebarI18n";
import { loadWorkoutDetailCatalogFromApi } from "../../src/lib/workoutsApiBuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const workoutsDocsRoot = path.resolve(repoRoot, "docs/workouts");
const englishDocsRoot = path.resolve(repoRoot, "docs/en");
const englishWorkoutsDocsRoot = path.resolve(englishDocsRoot, "workouts");
const japaneseDocsRoot = path.resolve(repoRoot, "docs/ja");
const japaneseWorkoutsDocsRoot = path.resolve(japaneseDocsRoot, "workouts");
const koreanDocsRoot = path.resolve(repoRoot, "docs/ko");
const koreanWorkoutsDocsRoot = path.resolve(koreanDocsRoot, "workouts");
const chineseDocsRoot = path.resolve(repoRoot, "docs/zh-cn");
const chineseWorkoutsDocsRoot = path.resolve(chineseDocsRoot, "workouts");

type SnapshotDetailRecord = {
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatStatus(value: string | undefined): string {
  if (!value) return "Status TBD";
  return value.replace(/_/g, " ");
}

function statusClass(value: string | undefined): string {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("cancel") || normalized.includes("closed")) return "is-canceled";
  if (normalized.includes("wait")) return "is-waitlist";
  if (normalized.includes("available") || normalized.includes("scheduled")) return "is-scheduled";
  return "";
}

function formatSchedule(item: WorkoutDetailItem): string {
  if (!item.schedule.length) return "";
  return item.schedule
    .map((entry) => [entry.day, entry.time].filter(Boolean).join(" "))
    .join("; ");
}

function formatDuration(item: WorkoutDetailItem): string {
  return formatWorkoutDuration(item.startDate, item.endDate, item.semester);
}

function formatSessionCount(item: WorkoutDetailItem): string {
  const count = item.plannedDates?.length ?? 0;
  if (count <= 0) return "";
  return `${count} session${count === 1 ? "" : "s"}`;
}

function formatOpeningDateTime(item: WorkoutDetailItem): string {
  if (item.bookingStatus !== "scheduled" || !item.bookingOpensAt) return "";

  const date = new Date(item.bookingOpensAt);
  if (Number.isNaN(date.getTime())) {
    return item.bookingLabel ?? "";
  }

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${month} ${day}, ${year} at ${time}`;
}

function splitLocation(item: WorkoutDetailItem): { title: string; detail: string } {
  const title = item.schedule[0]?.location?.trim() || "Location";
  const location = item.location?.trim() || "";

  if (!location) {
    return { title, detail: "" };
  }

  const normalizedTitle = title.toLowerCase();
  const normalizedLocation = location.toLowerCase();

  if (normalizedLocation.startsWith(normalizedTitle)) {
    const remainder = location.slice(title.length).replace(/^[,\s]+/, "");
    return { title, detail: remainder };
  }

  return { title, detail: location };
}

function formatPriceRange(item: WorkoutDetailItem): string {
  const entries = [
    { label: "Student", value: item.priceStudent },
    { label: "Staff", value: item.priceStaff },
    { label: "External", value: item.priceExternal },
    { label: "Ext. Reduced", value: item.priceExternalReduced },
  ].filter((entry) => entry.value != null);

  if (entries.length === 0) return '<div class="workout-price-value">Price TBD</div>';

  return entries
    .map(
      (entry, index) =>
        `${index > 0 ? '<div class="workout-price-separator"></div>' : ""}<div class="workout-price-item"><span class="workout-price-label">${escapeHtml(entry.label)}</span><span class="workout-price-value">€${escapeHtml(String(entry.value))}</span></div>`,
    )
    .join("");
}

function renderRow(item: WorkoutDetailItem): string {
  const locationParts = splitLocation(item);
  const details = [
    item.location
      ? `<div class="workout-detail is-location"><div class="workout-detail-icon">📍</div><div class="workout-detail-copy"><strong>${escapeHtml(locationParts.title)}</strong>${locationParts.detail ? `<span>${escapeHtml(locationParts.detail)}</span>` : ""}</div></div>`
      : "",
    item.instructor
      ? `<div class="workout-detail is-instructor"><div class="workout-detail-icon">👤</div><div class="workout-detail-copy"><strong>${escapeHtml(item.instructor)}</strong><span>Instructor</span></div></div>`
      : "",
    formatDuration(item)
      ? `<div class="workout-detail is-duration"><div class="workout-detail-icon">🗓</div><div class="workout-detail-copy"><strong>${escapeHtml(formatDuration(item))}</strong><span>${escapeHtml(formatSessionCount(item))}</span></div></div>`
      : "",
  ].filter(Boolean);

  const booking = item.bookingUrl
    ? `<p class="workout-booking"><a href="${escapeHtml(item.bookingUrl)}">Open booking</a></p>`
    : "";
  const status = formatStatus(item.bookingStatus);
  const statusClasses = statusClass(item.bookingStatus);
  const opensAt = formatOpeningDateTime(item);

  return [
    '<div class="workout-row">',
    '  <div class="workout-row-main">',
    '    <div class="workout-row-top">',
    `      <div class="workout-row-schedule">${escapeHtml(formatSchedule(item) || "Schedule TBD")}</div>`,
    '      <div class="workout-status-block">',
    `        <div class="workout-status ${statusClasses}"><span class="workout-status-dot"></span><span>${escapeHtml(status)}</span></div>`,
    opensAt ? `        <div class="workout-opens-at">Opens ${escapeHtml(opensAt)}</div>` : "",
    "      </div>",
    "    </div>",
    `    <div class="workout-row-details">${details.join("")}</div>`,
    `    <div class="workout-price-panel">${formatPriceRange(item)}</div>`,
    "  </div>",
    booking ? `  <div>${booking}</div>` : "",
    "</div>",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderGroup(titleGroup: WorkoutTitleGroup): string[] {
  const provider = titleGroup.items[0]?.provider ?? "";
  const lines = [
    `## ${titleGroup.title}`,
    "",
    `<p class="workout-group-provider">Provider: ${escapeHtml(provider)}</p>`,
    "",
    '<div class="workout-table">',
  ];

  for (const item of titleGroup.items) {
    lines.push(renderRow(item));
  }

  lines.push("</div>");
  lines.push("");
  return lines;
}

function renderCategoryPage(category: string, titleGroups: WorkoutTitleGroup[]): string {
  const variantCount = titleGroups.length;
  const lines = [
    "---",
    `title: ${JSON.stringify(category)}`,
    "layout: doc",
    "---",
    "",
    `# ${category}`,
    "",
    `${variantCount} variant${variantCount === 1 ? "" : "s"}.`,
    "",
  ];

  for (const group of titleGroups) {
    lines.push(...renderGroup(group));
  }

  return lines.join("\n");
}

function localizeSidebar(
  locale: SidebarLocale,
  items: Array<{ text: string; link: string }>,
) {
  return localizeSidebarItems(locale, items);
}

function writeGeneratedPages(root: string, pages: Array<{ path: string; category: string; group: { titleGroups: WorkoutTitleGroup[] } }>) {
  fs.mkdirSync(root, { recursive: true });

  for (const entry of fs.readdirSync(root)) {
    if (entry.endsWith(".md")) {
      fs.unlinkSync(path.join(root, entry));
    }
  }

  for (const page of pages) {
    fs.writeFileSync(page.path, renderCategoryPage(page.category, page.group.titleGroups), "utf8");
  }
}

async function ensureWorkoutPages() {
  const apiBaseUrl =
    process.env.WORKOUTS_API_BASE_URL ??
    process.env.VITEPRESS_WORKOUTS_API_BASE_URL ??
    "https://sport.oili.dev";
  const rawRecords = (await loadWorkoutDetailCatalogFromApi(apiBaseUrl)) as Record<
    string,
    SnapshotDetailRecord
  >;
  const catalog = buildWorkoutDetailCatalog(rawRecords);
  const rootPages = buildWorkoutCategoryPages(catalog, {
    docsBasePath: "docs/workouts",
    routeBasePath: "/workouts",
  });
  const enPages = buildWorkoutCategoryPages(catalog, {
    docsBasePath: "docs/en/workouts",
    routeBasePath: "/en/workouts",
  });
  const jaPages = buildWorkoutCategoryPages(catalog, {
    docsBasePath: "docs/ja/workouts",
    routeBasePath: "/ja/workouts",
  });
  const koPages = buildWorkoutCategoryPages(catalog, {
    docsBasePath: "docs/ko/workouts",
    routeBasePath: "/ko/workouts",
  });
  const zhCnPages = buildWorkoutCategoryPages(catalog, {
    docsBasePath: "docs/zh-cn/workouts",
    routeBasePath: "/zh-cn/workouts",
  });

  writeGeneratedPages(workoutsDocsRoot, rootPages.pages);
  fs.mkdirSync(englishDocsRoot, { recursive: true });
  writeGeneratedPages(englishWorkoutsDocsRoot, enPages.pages);
  fs.mkdirSync(japaneseDocsRoot, { recursive: true });
  writeGeneratedPages(japaneseWorkoutsDocsRoot, jaPages.pages);
  fs.mkdirSync(koreanDocsRoot, { recursive: true });
  writeGeneratedPages(koreanWorkoutsDocsRoot, koPages.pages);
  fs.mkdirSync(chineseDocsRoot, { recursive: true });
  writeGeneratedPages(chineseWorkoutsDocsRoot, zhCnPages.pages);

  return {
    de: localizeSidebar("de", rootPages.sidebar),
    en: localizeSidebar("en", enPages.sidebar),
    ja: localizeSidebar("ja", jaPages.sidebar),
    ko: localizeSidebar("ko", koPages.sidebar),
    "zh-CN": localizeSidebar("zh-CN", zhCnPages.sidebar),
  };
}

const workoutSidebar = await ensureWorkoutPages();
const defaultWorkoutsLink = workoutSidebar.de[0]?.link ?? "/";
const defaultEnglishWorkoutsLink = workoutSidebar.en[0]?.link ?? "/en/";
const defaultJapaneseWorkoutsLink = workoutSidebar.ja[0]?.link ?? "/ja/";
const defaultKoreanWorkoutsLink = workoutSidebar.ko[0]?.link ?? "/ko/";
const defaultChineseWorkoutsLink = workoutSidebar["zh-CN"][0]?.link ?? "/zh-cn/";

export default defineConfig({
  title: "Sports in Kiel",
  description: "Static workouts catalog rendered from the R2-backed workouts API.",
  lastUpdated: true,
  locales: {
    root: {
      label: "Deutsch",
      lang: "de-DE",
      themeConfig: {
        nav: [
          { text: "Workout", link: defaultWorkoutsLink },
          { text: "About", link: "/about" },
        ],
        sidebar: {
          "/": workoutSidebar.de,
          "/workouts/": workoutSidebar.de,
        },
      },
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      themeConfig: {
        nav: [
          { text: "Workout", link: defaultEnglishWorkoutsLink },
          { text: "About", link: "/en/about" },
        ],
        sidebar: {
          "/en/": workoutSidebar.en,
          "/en/workouts/": workoutSidebar.en,
        },
      },
    },
    ja: {
      label: "日本語",
      lang: "ja-JP",
      link: "/ja/",
      themeConfig: {
        nav: [
          { text: "ワークアウト", link: defaultJapaneseWorkoutsLink },
          { text: "このサイトについて", link: "/ja/about" },
        ],
        sidebar: {
          "/ja/": workoutSidebar.ja,
          "/ja/workouts/": workoutSidebar.ja,
        },
      },
    },
    ko: {
      label: "한국어",
      lang: "ko-KR",
      link: "/ko/",
      themeConfig: {
        nav: [
          { text: "운동", link: defaultKoreanWorkoutsLink },
          { text: "소개", link: "/ko/about" },
        ],
        sidebar: {
          "/ko/": workoutSidebar.ko,
          "/ko/workouts/": workoutSidebar.ko,
        },
      },
    },
    "zh-cn": {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh-cn/",
      themeConfig: {
        nav: [
          { text: "运动", link: defaultChineseWorkoutsLink },
          { text: "关于", link: "/zh-cn/about" },
        ],
        sidebar: {
          "/zh-cn/": workoutSidebar["zh-CN"],
          "/zh-cn/workouts/": workoutSidebar["zh-CN"],
        },
      },
    },
  },
  themeConfig: {
    nav: [
      { text: "Workout", link: defaultWorkoutsLink },
      { text: "About", link: "/about" },
    ],
    sidebar: {
      "/": workoutSidebar.de,
      "/workouts/": workoutSidebar.de,
    },
  },
  vite: {
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },
});
