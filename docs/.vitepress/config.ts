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
import { formatWorkoutDurationLocalized } from "../../src/lib/workoutDate";
import {
  getCategoryLabel,
  localizeKnownCategoryFragments,
  localizeSidebarItems,
  localizeWorkoutTitle,
  type SidebarLocale,
} from "../../src/lib/workoutSidebarI18n";
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

type PageLocaleCopy = {
  categoryTitle: string;
  variantSingular: string;
  variantPlural: string;
  providerLabel: string;
  locationLabel: string;
  instructorLabel: string;
  durationLabel: string;
  sessionSingular: string;
  sessionPlural: string;
  openBookingLabel: string;
  opensLabel: string;
  scheduleTbd: string;
  priceTbd: string;
  statusTbd: string;
  priceLabels: {
    student: string;
    staff: string;
    external: string;
    externalReduced: string;
  };
  statusLabels: Record<string, string>;
  dateLocale: string;
};

const pageLocaleCopy: Record<SidebarLocale, PageLocaleCopy> = {
  de: {
    categoryTitle: "Workout",
    variantSingular: "Variante",
    variantPlural: "Varianten",
    providerLabel: "Anbieter",
    locationLabel: "Ort",
    instructorLabel: "Leitung",
    durationLabel: "Zeitraum",
    sessionSingular: "Termin",
    sessionPlural: "Termine",
    openBookingLabel: "Buchung öffnen",
    opensLabel: "Öffnet",
    scheduleTbd: "Zeitplan offen",
    priceTbd: "Preis offen",
    statusTbd: "Status offen",
    priceLabels: {
      student: "Studierende",
      staff: "Mitarbeitende",
      external: "Extern",
      externalReduced: "Extern ermäßigt",
    },
    statusLabels: {
      available: "Verfügbar",
      scheduled: "Geplant",
      waitlist: "Warteliste",
      closed: "Geschlossen",
      canceled: "Abgesagt",
      see_text: "Siehe Text",
    },
    dateLocale: "de-DE",
  },
  en: {
    categoryTitle: "Workout",
    variantSingular: "variant",
    variantPlural: "variants",
    providerLabel: "Provider",
    locationLabel: "Location",
    instructorLabel: "Instructor",
    durationLabel: "Duration",
    sessionSingular: "session",
    sessionPlural: "sessions",
    openBookingLabel: "Open booking",
    opensLabel: "Opens",
    scheduleTbd: "Schedule TBD",
    priceTbd: "Price TBD",
    statusTbd: "Status TBD",
    priceLabels: {
      student: "Student",
      staff: "Staff",
      external: "External",
      externalReduced: "Ext. Reduced",
    },
    statusLabels: {
      available: "Available",
      scheduled: "Scheduled",
      waitlist: "Waitlist",
      closed: "Closed",
      canceled: "Canceled",
      see_text: "See text",
    },
    dateLocale: "en-US",
  },
  ja: {
    categoryTitle: "ワークアウト",
    variantSingular: "件のコース",
    variantPlural: "件のコース",
    providerLabel: "提供元",
    locationLabel: "場所",
    instructorLabel: "担当",
    durationLabel: "期間",
    sessionSingular: "回",
    sessionPlural: "回",
    openBookingLabel: "予約ページを開く",
    opensLabel: "受付開始",
    scheduleTbd: "日程未定",
    priceTbd: "料金未定",
    statusTbd: "状態未定",
    priceLabels: {
      student: "学生",
      staff: "スタッフ",
      external: "学外",
      externalReduced: "学外割引",
    },
    statusLabels: {
      available: "受付中",
      scheduled: "予定",
      waitlist: "キャンセル待ち",
      closed: "受付終了",
      canceled: "中止",
      see_text: "本文参照",
    },
    dateLocale: "ja-JP",
  },
  ko: {
    categoryTitle: "운동",
    variantSingular: "개 강좌",
    variantPlural: "개 강좌",
    providerLabel: "제공처",
    locationLabel: "장소",
    instructorLabel: "강사",
    durationLabel: "기간",
    sessionSingular: "회",
    sessionPlural: "회",
    openBookingLabel: "예약 열기",
    opensLabel: "오픈",
    scheduleTbd: "일정 미정",
    priceTbd: "요금 미정",
    statusTbd: "상태 미정",
    priceLabels: {
      student: "학생",
      staff: "직원",
      external: "외부",
      externalReduced: "외부 할인",
    },
    statusLabels: {
      available: "예약 가능",
      scheduled: "예정",
      waitlist: "대기자 명단",
      closed: "마감",
      canceled: "취소",
      see_text: "본문 참조",
    },
    dateLocale: "ko-KR",
  },
  "zh-CN": {
    categoryTitle: "运动",
    variantSingular: " 个项目",
    variantPlural: " 个项目",
    providerLabel: "提供方",
    locationLabel: "地点",
    instructorLabel: "教练",
    durationLabel: "时长",
    sessionSingular: "次课",
    sessionPlural: "次课",
    openBookingLabel: "打开报名",
    opensLabel: "开放时间",
    scheduleTbd: "时间待定",
    priceTbd: "价格待定",
    statusTbd: "状态待定",
    priceLabels: {
      student: "学生",
      staff: "员工",
      external: "校外",
      externalReduced: "校外优惠",
    },
    statusLabels: {
      available: "可报名",
      scheduled: "即将开放",
      waitlist: "候补",
      closed: "已关闭",
      canceled: "已取消",
      see_text: "见说明",
    },
    dateLocale: "zh-CN",
  },
};

function getCopy(locale: SidebarLocale): PageLocaleCopy {
  return pageLocaleCopy[locale];
}

const weekdayLabels: Record<SidebarLocale, Record<string, string>> = {
  de: {
    "tägl": "tägl.",
    "tägl.": "tägl.",
    "Sa-So": "Sa-So",
    "Mon-Fri": "Mo-Fr",
    "Mo-Fr": "Mo-Fr",
    Mon: "Mo",
    Mo: "Mo",
    Tue: "Di",
    Di: "Di",
    Wed: "Mi",
    Mi: "Mi",
    Thu: "Do",
    Do: "Do",
    Fri: "Fr",
    Fr: "Fr",
    Sat: "Sa",
    Sa: "Sa",
    Sun: "So",
    So: "So",
  },
  en: {
    "tägl": "Daily",
    "tägl.": "Daily",
    "Sa-So": "Sat-Sun",
    "Mon-Fri": "Mon-Fri",
    "Mo-Fr": "Mon-Fri",
    Mon: "Mon",
    Mo: "Mon",
    Tue: "Tue",
    Di: "Tue",
    Wed: "Wed",
    Mi: "Wed",
    Thu: "Thu",
    Do: "Thu",
    Fri: "Fri",
    Fr: "Fri",
    Sat: "Sat",
    Sa: "Sat",
    Sun: "Sun",
    So: "Sun",
  },
  ja: {
    "tägl": "毎日",
    "tägl.": "毎日",
    "Sa-So": "土-日",
    "Mon-Fri": "月-金",
    "Mo-Fr": "月-金",
    Mon: "月",
    Mo: "月",
    Tue: "火",
    Di: "火",
    Wed: "水",
    Mi: "水",
    Thu: "木",
    Do: "木",
    Fri: "金",
    Fr: "金",
    Sat: "土",
    Sa: "土",
    Sun: "日",
    So: "日",
  },
  ko: {
    "tägl": "매일",
    "tägl.": "매일",
    "Sa-So": "토-일",
    "Mon-Fri": "월-금",
    "Mo-Fr": "월-금",
    Mon: "월",
    Mo: "월",
    Tue: "화",
    Di: "화",
    Wed: "수",
    Mi: "수",
    Thu: "목",
    Do: "목",
    Fri: "금",
    Fr: "금",
    Sat: "토",
    Sa: "토",
    Sun: "일",
    So: "일",
  },
  "zh-CN": {
    "tägl": "每日",
    "tägl.": "每日",
    "Sa-So": "周六至周日",
    "Mon-Fri": "周一至周五",
    "Mo-Fr": "周一至周五",
    Mon: "周一",
    Mo: "周一",
    Tue: "周二",
    Di: "周二",
    Wed: "周三",
    Mi: "周三",
    Thu: "周四",
    Do: "周四",
    Fri: "周五",
    Fr: "周五",
    Sat: "周六",
    Sa: "周六",
    Sun: "周日",
    So: "周日",
  },
};

function localizeWeekday(value: string, locale: SidebarLocale): string {
  return weekdayLabels[locale][value.trim()] ?? value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatStatus(value: string | undefined, locale: SidebarLocale): string {
  const copy = getCopy(locale);
  if (!value) return copy.statusTbd;
  return copy.statusLabels[value.toLowerCase()] ?? value.replace(/_/g, " ");
}

function statusClass(value: string | undefined): string {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("cancel") || normalized.includes("closed")) return "is-canceled";
  if (normalized.includes("wait")) return "is-waitlist";
  if (normalized.includes("available") || normalized.includes("scheduled")) return "is-scheduled";
  return "";
}

function formatSchedule(item: WorkoutDetailItem, locale: SidebarLocale): string {
  if (!item.schedule.length) return "";
  return item.schedule
    .map((entry) => [localizeWeekday(entry.day, locale), entry.time].filter(Boolean).join(" "))
    .join("; ");
}

function formatDuration(item: WorkoutDetailItem, locale: SidebarLocale): string {
  const copy = getCopy(locale);
  return formatWorkoutDurationLocalized(item.startDate, item.endDate, item.semester, copy.dateLocale);
}

function formatSessionCount(item: WorkoutDetailItem, locale: SidebarLocale): string {
  const copy = getCopy(locale);
  const count = item.plannedDates?.length ?? 0;
  if (count <= 0) return "";
  if (locale === "ja" || locale === "ko" || locale === "zh-CN") {
    return `${count}${copy.sessionPlural}`;
  }
  return `${count} ${count === 1 ? copy.sessionSingular : copy.sessionPlural}`;
}

function formatOpeningDateTime(item: WorkoutDetailItem, locale: SidebarLocale): string {
  if (item.bookingStatus !== "scheduled" || !item.bookingOpensAt) return "";

  const copy = getCopy(locale);
  const date = new Date(item.bookingOpensAt);
  if (Number.isNaN(date.getTime())) {
    return item.bookingLabel ?? "";
  }

  const dateText = date.toLocaleDateString(copy.dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString(locale === "en" ? "en-GB" : copy.dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (locale === "ja" || locale === "ko" || locale === "zh-CN") {
    return `${dateText} ${time}`;
  }

  if (locale === "de") {
    return `${dateText}, ${time}`;
  }

  return `${dateText} at ${time}`;
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

function formatPriceRange(item: WorkoutDetailItem, locale: SidebarLocale): string {
  const copy = getCopy(locale);
  const entries = [
    { label: copy.priceLabels.student, value: item.priceStudent },
    { label: copy.priceLabels.staff, value: item.priceStaff },
    { label: copy.priceLabels.external, value: item.priceExternal },
    { label: copy.priceLabels.externalReduced, value: item.priceExternalReduced },
  ].filter((entry) => entry.value != null);

  if (entries.length === 0) return `<div class="workout-price-value">${escapeHtml(copy.priceTbd)}</div>`;

  return entries
    .map(
      (entry, index) =>
        `${index > 0 ? '<div class="workout-price-separator"></div>' : ""}<div class="workout-price-item"><span class="workout-price-label">${escapeHtml(entry.label)}</span><span class="workout-price-value">€${escapeHtml(String(entry.value))}</span></div>`,
    )
    .join("");
}

function renderRow(item: WorkoutDetailItem, locale: SidebarLocale): string {
  const copy = getCopy(locale);
  const locationParts = splitLocation(item);
  const localizedLocationTitle = localizeKnownCategoryFragments(locale, locationParts.title);
  const localizedInstructor = item.instructor ? localizeKnownCategoryFragments(locale, item.instructor) : "";

  const details = [
    item.location
      ? `<div class="workout-detail is-location"><div class="workout-detail-icon">📍</div><div class="workout-detail-copy"><strong>${escapeHtml(localizedLocationTitle)}</strong><span>${escapeHtml(locationParts.detail || copy.locationLabel)}</span></div></div>`
      : "",
    item.instructor
      ? `<div class="workout-detail is-instructor"><div class="workout-detail-icon">👤</div><div class="workout-detail-copy"><strong>${escapeHtml(localizedInstructor)}</strong><span>${escapeHtml(copy.instructorLabel)}</span></div></div>`
      : "",
    formatDuration(item, locale)
      ? `<div class="workout-detail is-duration"><div class="workout-detail-icon">🗓</div><div class="workout-detail-copy"><strong>${escapeHtml(formatDuration(item, locale))}</strong><span>${escapeHtml(formatSessionCount(item, locale) || copy.durationLabel)}</span></div></div>`
      : "",
  ].filter(Boolean);

  const booking = item.bookingUrl
    ? `<p class="workout-booking"><a href="${escapeHtml(item.bookingUrl)}">${escapeHtml(copy.openBookingLabel)}</a></p>`
    : "";
  const status = formatStatus(item.bookingStatus, locale);
  const statusClasses = statusClass(item.bookingStatus);
  const opensAt = formatOpeningDateTime(item, locale);

  return [
    '<div class="workout-row">',
    '  <div class="workout-row-main">',
    '    <div class="workout-row-top">',
    `      <div class="workout-row-schedule">${escapeHtml(formatSchedule(item, locale) || copy.scheduleTbd)}</div>`,
    '      <div class="workout-status-block">',
    `        <div class="workout-status ${statusClasses}"><span class="workout-status-dot"></span><span>${escapeHtml(status)}</span></div>`,
    opensAt ? `        <div class="workout-opens-at">${escapeHtml(copy.opensLabel)} ${escapeHtml(opensAt)}</div>` : "",
    "      </div>",
    "    </div>",
    `    <div class="workout-row-details">${details.join("")}</div>`,
    `    <div class="workout-price-panel">${formatPriceRange(item, locale)}</div>`,
    "  </div>",
    booking ? `  <div>${booking}</div>` : "",
    "</div>",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderGroup(titleGroup: WorkoutTitleGroup, locale: SidebarLocale): string[] {
  const copy = getCopy(locale);
  const provider = titleGroup.items[0]?.provider ?? "";
  const localizedTitle = localizeWorkoutTitle(titleGroup.title, locale);
  const lines = [
    `## ${localizedTitle}`,
    "",
    `<p class="workout-group-provider">${escapeHtml(copy.providerLabel)}: ${escapeHtml(provider)}</p>`,
    "",
    '<div class="workout-table">',
  ];

  for (const item of titleGroup.items) {
    lines.push(renderRow(item, locale));
  }

  lines.push("</div>");
  lines.push("");
  return lines;
}

function renderCategoryPage(
  locale: SidebarLocale,
  category: string,
  titleGroups: WorkoutTitleGroup[],
): string {
  const copy = getCopy(locale);
  const pageTitle = getCategoryLabel(locale, category);
  const variantCount = titleGroups.length;
  const variantText =
    locale === "ja" || locale === "ko" || locale === "zh-CN"
      ? `${variantCount}${copy.variantPlural}`
      : `${variantCount} ${variantCount === 1 ? copy.variantSingular : copy.variantPlural}.`;
  const lines = [
    "---",
    `title: ${JSON.stringify(pageTitle)}`,
    "layout: doc",
    "---",
    "",
    `# ${pageTitle}`,
    "",
    variantText,
    "",
  ];

  for (const group of titleGroups) {
    lines.push(...renderGroup(group, locale));
  }

  return lines.join("\n");
}

function localizeSidebar(
  locale: SidebarLocale,
  items: Array<{ text: string; link: string }>,
) {
  return localizeSidebarItems(locale, items);
}

function renderIndexPage(
  locale: SidebarLocale,
  sidebar: Array<{ text: string; link: string }>,
): string {
  const copy = getCopy(locale);
  const lines = [
    "---",
    `title: ${JSON.stringify(copy.categoryTitle)}`,
    "layout: doc",
    "---",
    "",
    `# ${copy.categoryTitle}`,
    "",
    "Use the sidebar to browse workout categories.",
    "",
  ];

  for (const item of sidebar) {
    lines.push(`- [${item.text}](${item.link})`);
  }

  return lines.join("\n");
}

function writeGeneratedPages(
  locale: SidebarLocale,
  root: string,
  pages: Array<{ path: string; category: string; group: { titleGroups: WorkoutTitleGroup[] } }>,
  sidebar: Array<{ text: string; link: string }>,
) {
  fs.mkdirSync(root, { recursive: true });

  for (const entry of fs.readdirSync(root)) {
    if (entry.endsWith(".md")) {
      fs.unlinkSync(path.join(root, entry));
    }
  }

  for (const page of pages) {
    fs.writeFileSync(page.path, renderCategoryPage(locale, page.category, page.group.titleGroups), "utf8");
  }

  fs.writeFileSync(path.join(root, "index.md"), renderIndexPage(locale, sidebar), "utf8");
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

  writeGeneratedPages("de", workoutsDocsRoot, rootPages.pages, rootPages.sidebar);
  fs.mkdirSync(englishDocsRoot, { recursive: true });
  writeGeneratedPages("en", englishWorkoutsDocsRoot, enPages.pages, enPages.sidebar);
  fs.mkdirSync(japaneseDocsRoot, { recursive: true });
  writeGeneratedPages("ja", japaneseWorkoutsDocsRoot, jaPages.pages, jaPages.sidebar);
  fs.mkdirSync(koreanDocsRoot, { recursive: true });
  writeGeneratedPages("ko", koreanWorkoutsDocsRoot, koPages.pages, koPages.sidebar);
  fs.mkdirSync(chineseDocsRoot, { recursive: true });
  writeGeneratedPages("zh-CN", chineseWorkoutsDocsRoot, zhCnPages.pages, zhCnPages.sidebar);

  return {
    de: localizeSidebar("de", rootPages.sidebar),
    en: localizeSidebar("en", enPages.sidebar),
    ja: localizeSidebar("ja", jaPages.sidebar),
    ko: localizeSidebar("ko", koPages.sidebar),
    "zh-CN": localizeSidebar("zh-CN", zhCnPages.sidebar),
  };
}

const workoutSidebar = await ensureWorkoutPages();
const defaultWorkoutsLink = "/workouts";
const defaultEnglishWorkoutsLink = "/en/workouts";
const defaultJapaneseWorkoutsLink = "/ja/workouts";
const defaultKoreanWorkoutsLink = "/ko/workouts";
const defaultChineseWorkoutsLink = "/zh-cn/workouts";

export default defineConfig({
  title: "Sports in Kiel",
  description: "Static workouts catalog rendered from the R2-backed workouts API.",
  lastUpdated: true,
  locales: {
    root: {
      label: "Deutsch",
      lang: "de-DE",
      themeConfig: {
        docFooter: {
          prev: "Vorherige Seite",
          next: "Nächste Seite",
        },
        lastUpdated: {
          text: "Zuletzt aktualisiert",
        },
        nav: [
          { text: "Workout", link: defaultWorkoutsLink },
          { text: "About", link: "/about" },
        ],
        sidebar: {
          "/workouts/": workoutSidebar.de,
        },
      },
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      themeConfig: {
        docFooter: {
          prev: "Previous page",
          next: "Next page",
        },
        lastUpdated: {
          text: "Last updated",
        },
        nav: [
          { text: "Workout", link: defaultEnglishWorkoutsLink },
          { text: "About", link: "/en/about" },
        ],
        sidebar: {
          "/en/workouts/": workoutSidebar.en,
        },
      },
    },
    ja: {
      label: "日本語",
      lang: "ja-JP",
      link: "/ja/",
      themeConfig: {
        docFooter: {
          prev: "前のページ",
          next: "次のページ",
        },
        lastUpdated: {
          text: "最終更新",
        },
        nav: [
          { text: "ワークアウト", link: defaultJapaneseWorkoutsLink },
          { text: "このサイトについて", link: "/ja/about" },
        ],
        sidebar: {
          "/ja/workouts/": workoutSidebar.ja,
        },
      },
    },
    ko: {
      label: "한국어",
      lang: "ko-KR",
      link: "/ko/",
      themeConfig: {
        docFooter: {
          prev: "이전 페이지",
          next: "다음 페이지",
        },
        lastUpdated: {
          text: "마지막 업데이트",
        },
        nav: [
          { text: "운동", link: defaultKoreanWorkoutsLink },
          { text: "소개", link: "/ko/about" },
        ],
        sidebar: {
          "/ko/workouts/": workoutSidebar.ko,
        },
      },
    },
    "zh-cn": {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh-cn/",
      themeConfig: {
        docFooter: {
          prev: "上一页",
          next: "下一页",
        },
        lastUpdated: {
          text: "最后更新",
        },
        nav: [
          { text: "运动", link: defaultChineseWorkoutsLink },
          { text: "关于", link: "/zh-cn/about" },
        ],
        sidebar: {
          "/zh-cn/workouts/": workoutSidebar["zh-CN"],
        },
      },
    },
  },
  themeConfig: {
    docFooter: {
      prev: "Vorherige Seite",
      next: "Nächste Seite",
    },
    lastUpdated: {
      text: "Zuletzt aktualisiert",
    },
    nav: [
      { text: "Workout", link: defaultWorkoutsLink },
      { text: "About", link: "/about" },
    ],
    sidebar: {
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
