import type {
  WorkoutDetailItem,
  WorkoutTitleGroup,
} from "../../../src/lib/workoutsCatalog";
import { formatWorkoutDurationLocalized } from "../../../src/lib/workoutDate";
import {
  getCategoryLabel,
  localizeKnownCategoryFragments,
  localizeWorkoutTitle,
  type SidebarLocale,
} from "../../../src/lib/workoutSidebarI18n";
import { getCopy, localizeWeekday } from "../../../src/lib/workoutPageLocale";

// ── Utilities ─────────────────────────────────────────────────────────────────

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildWikipediaUrl(
  locale: SidebarLocale,
  title: string,
): string {
  const domainByLocale: Record<SidebarLocale, string> = {
    de: "de.wikipedia.org",
    en: "en.wikipedia.org",
    ja: "ja.wikipedia.org",
    ko: "ko.wikipedia.org",
    "zh-CN": "zh.wikipedia.org",
  };

  return `https://${domainByLocale[locale]}/wiki/Special:Search?search=${encodeURIComponent(title)}`;
}

function formatStatus(
  value: string | undefined,
  locale: SidebarLocale,
): string {
  const copy = getCopy(locale);
  const normalized = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  const normalizedUnderscore = normalized.replace(/\s+/g, "_");
  if (!normalized || normalized === "tbd" || normalized === "status_tbd") {
    return copy.statusTbd;
  }
  return (
    copy.statusLabels[normalized] ??
    copy.statusLabels[normalizedUnderscore] ??
    value!.replace(/_/g, " ")
  );
}

function statusBadgeType(
  value: string | undefined,
): "info" | "tip" | "warning" | "danger" {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("cancel") || normalized.includes("closed")) {
    return "danger";
  }
  if (normalized.includes("wait") || normalized.includes("restricted")) {
    return "warning";
  }
  if (normalized.includes("available") || normalized.includes("scheduled")) {
    return "tip";
  }
  return "info";
}

function localizeScheduleTime(
  value: string,
  locale: SidebarLocale,
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const replacements: Record<SidebarLocale, Array<[RegExp, string]>> = {
    de: [],
    en: [
      [/\bnur am\s+(\d+[:.]\d+\.?)/giu, "only at $1"],
      [/\bab\s+(\d+[:.]\d+\.?)/giu, "from $1"],
    ],
    ja: [
      [/\bnur am\s+(\d+[:.]\d+\.?)/giu, "$1のみ"],
      [/\bab\s+(\d+[:.]\d+\.?)/giu, "$1から"],
    ],
    ko: [
      [/\bnur am\s+(\d+[:.]\d+\.?)/giu, "$1에만"],
      [/\bab\s+(\d+[:.]\d+\.?)/giu, "$1부터"],
    ],
    "zh-CN": [
      [/\bnur am\s+(\d+[:.]\d+\.?)/giu, "仅限 $1"],
      [/\bab\s+(\d+[:.]\d+\.?)/giu, "$1起"],
    ],
  };

  let result = trimmed;
  for (const [pattern, replacement] of replacements[locale]) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function renderScheduleCards(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const { scheduleLocations } = resolveScheduleLocations(item);

  if (item.schedule.length === 0) {
    return `<div class="workout-schedule-cards">` +
      `<div class="workout-schedule-card is-empty">` +
      `<div class="workout-schedule-card-time">${escapeHtml(getCopy(locale).scheduleTbd)}</div>` +
      `</div></div>`;
  }

  const cards = groupScheduleEntries(item, scheduleLocations, locale).map(
    (group) => {
      const scheduleLabel = [group.dayLabel, localizeScheduleTime(group.time, locale)]
        .filter(Boolean)
        .join(" ");

      return `<div class="workout-schedule-card">` +
        `<div class="workout-schedule-card-time">${escapeHtml(scheduleLabel)}</div>` +
        (group.location
          ? `<div class="workout-schedule-card-location">${escapeHtml(group.location)}</div>`
          : "") +
        `</div>`;
    },
  );

  return `<div class="workout-schedule-cards">${cards.join("")}</div>`;
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

function formatGroupedDays(days: string[], locale: SidebarLocale): string {
  const localizedDays = days.map((day) => localizeWeekday(day, locale));
  if (days.length === 0) return "";
  if (days.length === 1) return localizedDays[0];

  const dayNumbers = days.map((day) => WEEKDAY_ORDER[day] ?? -1);
  const isContinuous = dayNumbers.every((day, index) =>
    index === 0 ? true : day === dayNumbers[index - 1] + 1,
  );

  if (isContinuous) {
    const separator = locale === "zh-CN" ? "至" : locale === "ja" || locale === "ko" ? "〜" : "-";
    return `${localizedDays[0]}${separator}${localizedDays[localizedDays.length - 1]}`;
  }

  return localizedDays.join(locale === "zh-CN" || locale === "ja" ? "、" : ", ");
}

function groupScheduleEntries(
  item: WorkoutDetailItem,
  scheduleLocations: string[],
  locale: SidebarLocale,
): Array<{ dayLabel: string; time: string; location: string }> {
  const groups = new Map<
    string,
    { days: string[]; time: string; location: string }
  >();
  const order: string[] = [];

  item.schedule.forEach((entry, index) => {
    const location = scheduleLocations[index] ?? "";
    const key = `${entry.time}__${location}`;
    const existing = groups.get(key);
    if (existing) {
      existing.days.push(entry.day);
      return;
    }

    groups.set(key, {
      days: [entry.day],
      time: entry.time,
      location,
    });
    order.push(key);
  });

  return order.map((key) => {
    const group = groups.get(key)!;
    return {
      dayLabel: formatGroupedDays(group.days, locale),
      time: group.time,
      location: group.location,
    };
  });
}

function normalizeLocationValue(value: string): string {
  return cleanLocationText(value).toLowerCase();
}

function cleanLocationText(value: string): string {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function expandTopLevelLocations(values: string[]): string[] {
  return values
    .flatMap((value) => value.split(/\s*;\s*/g))
    .map((value) => cleanLocationText(value))
    .filter(Boolean);
}

function resolveScheduleLocations(item: WorkoutDetailItem): {
  scheduleLocations: string[];
  unmatchedTopLevelLocations: string[];
} {
  const topLevelLocations = expandTopLevelLocations(
    item.location.map((value) => value?.trim()).filter(Boolean) as string[],
  );

  if (topLevelLocations.length === 1) {
    return {
      scheduleLocations: item.schedule.map(() => topLevelLocations[0]),
      unmatchedTopLevelLocations: [],
    };
  }

  if (item.schedule.length === 1) {
    return {
      scheduleLocations: [
        topLevelLocations.join("; ") || cleanLocationText(item.schedule[0]?.location ?? "") || "",
      ],
      unmatchedTopLevelLocations: [],
    };
  }

  const matchedTopLevelIndexes = new Set<number>();

  const scheduleLocations = item.schedule.map((entry) => {
    const shortLocation = cleanLocationText(entry.location ?? "");
    if (!shortLocation) return "";

    const normalizedShortLocation = normalizeLocationValue(shortLocation);
    const matches = topLevelLocations
      .map((value, index) => ({ value, index }))
      .filter(({ value }) =>
        normalizeLocationValue(value).startsWith(normalizedShortLocation),
      );

    if (matches.length === 1) {
      matchedTopLevelIndexes.add(matches[0].index);
      return matches[0].value;
    }

    return shortLocation;
  });

  return {
    scheduleLocations,
    unmatchedTopLevelLocations: topLevelLocations.filter(
      (_, index) => !matchedTopLevelIndexes.has(index),
    ),
  };
}

function formatDuration(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const copy = getCopy(locale);
  return formatWorkoutDurationLocalized(
    item.startDate,
    item.endDate,
    item.semester,
    copy.dateLocale,
  );
}

function formatSessionCount(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const copy = getCopy(locale);
  const count = item.plannedDates?.length ?? 0;
  if (count <= 0) return "";
  if (locale === "ja" || locale === "ko" || locale === "zh-CN") {
    return `${count}${copy.sessionPlural}`;
  }
  return `${count} ${count === 1 ? copy.sessionSingular : copy.sessionPlural}`;
}

function formatOpeningDateTime(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  if (item.bookingStatus !== "scheduled" || !item.bookingOpensAt) return "";

  const copy = getCopy(locale);
  const date = new Date(item.bookingOpensAt);
  if (Number.isNaN(date.getTime())) return item.bookingLabel ?? "";

  const dateText = date.toLocaleDateString(copy.dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString(
    locale === "en" ? "en-GB" : copy.dateLocale,
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  );

  if (locale === "ja" || locale === "ko" || locale === "zh-CN")
    return `${dateText} ${time}`;
  if (locale === "de") return `${dateText}, ${time}`;
  return `${dateText} at ${time}`;
}

function splitLocation(item: WorkoutDetailItem): {
  title: string;
  detail: string;
} {
  const topLevelLocations = (Array.isArray(item.location) ? item.location : [])
    .map((value) => value?.trim())
    .filter(Boolean) as string[];
  const uniqueLocations = [
    ...new Set(item.schedule.map((s) => s.location?.trim()).filter(Boolean)),
  ];
  const title = uniqueLocations.length > 0 ? uniqueLocations.join("; ") : "Location";
  const location = topLevelLocations.join("; ");

  if (!location) return { title, detail: "" };

  const normalizedTitle = title.toLowerCase();
  const normalizedLocation = location.toLowerCase();

  if (normalizedLocation.startsWith(normalizedTitle)) {
    const remainder = location.slice(title.length).replace(/^[,\s]+/, "");
    return { title, detail: remainder };
  }

  return { title, detail: location };
}

function formatPriceRange(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const copy = getCopy(locale);
  const entries = [
    { label: copy.priceLabels.student, value: item.priceStudent },
    { label: copy.priceLabels.staff, value: item.priceStaff },
    { label: copy.priceLabels.external, value: item.priceExternal },
    {
      label: copy.priceLabels.externalReduced,
      value: item.priceExternalReduced,
    },
  ].filter((entry) => entry.value != null);

  if (entries.length === 0) {
    return `<div class="workout-price-value">${escapeHtml(copy.priceTbd)}</div>`;
  }

  return entries
    .map(
      (entry, index) =>
        `${index > 0 ? '<div class="workout-price-separator"></div>' : ""}` +
        `<div class="workout-price-item">` +
        `<span class="workout-price-label">${escapeHtml(entry.label)}</span>` +
        `<span class="workout-price-value">€${escapeHtml(String(entry.value))}</span>` +
        `</div>`,
    )
    .join("");
}

// ── Row renderer ──────────────────────────────────────────────────────────────

export function renderRow(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const copy = getCopy(locale);
  const { unmatchedTopLevelLocations } = resolveScheduleLocations(item);
  const locationParts = splitLocation({
    ...item,
    location: unmatchedTopLevelLocations,
  });
  const hasParentLocationDetails = unmatchedTopLevelLocations.length > 0;
  const localizedLocationTitle = localizeKnownCategoryFragments(
    locale,
    locationParts.title,
  );
  const localizedInstructor = item.instructor
    ? localizeKnownCategoryFragments(locale, item.instructor)
    : "";

  const details = [
    hasParentLocationDetails
      ? `<div class="workout-detail is-location">` +
        `<div class="workout-detail-icon">📍</div>` +
        `<div class="workout-detail-copy">` +
        `<strong>${escapeHtml(localizedLocationTitle)}</strong>` +
        `<span>${escapeHtml(locationParts.detail || copy.locationLabel)}</span>` +
        `</div></div>`
      : "",
    item.instructor
      ? `<div class="workout-detail is-instructor">` +
        `<div class="workout-detail-icon">👤</div>` +
        `<div class="workout-detail-copy">` +
        `<strong>${escapeHtml(localizedInstructor)}</strong>` +
        `<span>${escapeHtml(copy.instructorLabel)}</span>` +
        `</div></div>`
      : "",
    formatDuration(item, locale)
      ? `<div class="workout-detail is-duration">` +
        `<div class="workout-detail-icon">🗓</div>` +
        `<div class="workout-detail-copy">` +
        `<strong>${escapeHtml(formatDuration(item, locale))}</strong>` +
        `<span>${escapeHtml(formatSessionCount(item, locale) || copy.durationLabel)}</span>` +
        `</div></div>`
      : "",
  ].filter(Boolean);
  const status = formatStatus(item.bookingStatus, locale);
  const badgeType = statusBadgeType(item.bookingStatus);
  const opensAt = formatOpeningDateTime(item, locale);
  const scheduleCards = renderScheduleCards(item, locale);
  const wrapperTag = item.url ? "a" : "div";
  const wrapperAttributes = item.url
    ? ` class="workout-row" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"`
    : ` class="workout-row"`;

  return [
    ` <${wrapperTag}${wrapperAttributes}>`.trimStart(),
    '  <div class="workout-row-main">',
    '    <div class="workout-row-top">',
    `      <div class="workout-row-schedule">${scheduleCards}</div>`,
    '      <div class="workout-status-block">',
    `        <Badge type="${badgeType}" text="${escapeHtml(status)}" />`,
    opensAt
      ? `        <div class="workout-opens-at">${escapeHtml(copy.opensLabel)} ${escapeHtml(opensAt)}</div>`
      : "",
    "      </div>",
    "    </div>",
    `    <div class="workout-row-details">${details.join("")}</div>`,
    `    <div class="workout-price-panel">${formatPriceRange(item, locale)}</div>`,
    "  </div>",
    `</${wrapperTag}>`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Group renderer ────────────────────────────────────────────────────────────

export function renderGroup(
  titleGroup: WorkoutTitleGroup,
  locale: SidebarLocale,
): string[] {
  const copy = getCopy(locale);
  const firstItem = titleGroup.items[0];
  const provider = firstItem?.provider ?? "";
  const url = firstItem?.url;
  const localizedTitle = localizeWorkoutTitle(titleGroup.title, locale);

  const providerHtml = url
    ? `<p class="workout-group-provider">${escapeHtml(copy.providerLabel)}: <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(provider)}</a></p>`
    : `<p class="workout-group-provider">${escapeHtml(copy.providerLabel)}: ${escapeHtml(provider)}</p>`;

  const lines = [
    `## ${localizedTitle}`,
    "",
    providerHtml,
    "",
    '<div class="workout-table">',
  ];

  for (const item of titleGroup.items) {
    lines.push(renderRow(item, locale));
  }

  lines.push("</div>", "");
  return lines;
}

// ── Page renderers ────────────────────────────────────────────────────────────

export function renderCategoryPage(
  locale: SidebarLocale,
  category: string,
  titleGroups: WorkoutTitleGroup[],
): string {
  const copy = getCopy(locale);
  const pageTitle = getCategoryLabel(locale, category);
  const wikipediaUrl = buildWikipediaUrl(locale, pageTitle);
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
    `<p class="workout-page-header-meta"><a class="workout-page-wikipedia" href="${escapeHtml(wikipediaUrl)}" target="_blank" rel="noopener noreferrer">Wikipedia</a></p>`,
    "",
    variantText,
    "",
  ];

  for (const group of titleGroups) {
    lines.push(...renderGroup(group, locale));
  }

  return lines.join("\n");
}

export function renderIndexPage(
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
    ...sidebar.map((item) => `- [${item.text}](${item.link})`),
  ];

  return lines.join("\n");
}
