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

function formatStatus(
  value: string | undefined,
  locale: SidebarLocale,
): string {
  const copy = getCopy(locale);
  if (!value) return copy.statusTbd;
  return copy.statusLabels[value.toLowerCase()] ?? value.replace(/_/g, " ");
}

function statusClass(value: string | undefined): string {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("cancel") || normalized.includes("closed"))
    return "is-canceled";
  if (normalized.includes("wait")) return "is-waitlist";
  if (normalized.includes("available") || normalized.includes("scheduled"))
    return "is-scheduled";
  return "";
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

function formatSchedule(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string[] {
  const entries = item.schedule;
  if (!entries.length) return [];

  const results: string[] = [];
  let i = 0;

  while (i < entries.length) {
    const startEntry = entries[i];
    let j = i + 1;

    while (
      j < entries.length &&
      entries[j].time === startEntry.time &&
      entries[j].location === startEntry.location &&
      WEEKDAY_ORDER[entries[j].day] === WEEKDAY_ORDER[entries[j - 1].day] + 1
    ) {
      j++;
    }

    const groupSize = j - i;
    if (groupSize >= 2) {
      const startDay = localizeWeekday(startEntry.day, locale);
      const endDay = localizeWeekday(entries[j - 1].day, locale);
      const separator =
        locale === "ja" || locale === "ko" || locale === "zh-CN" ? "〜" : " - ";
      results.push(`${startDay}${separator}${endDay} ${startEntry.time}`);
    } else {
      results.push(
        [localizeWeekday(startEntry.day, locale), startEntry.time]
          .filter(Boolean)
          .join(" "),
      );
    }
    i = j;
  }

  return results;
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
  const uniqueLocations = [
    ...new Set(item.schedule.map((s) => s.location?.trim()).filter(Boolean)),
  ];
  const title = uniqueLocations.length > 0 ? uniqueLocations.join("; ") : "Location";
  const location = item.location?.trim() || "";

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
  const locationParts = splitLocation(item);
  const localizedLocationTitle = localizeKnownCategoryFragments(
    locale,
    locationParts.title,
  );
  const localizedInstructor = item.instructor
    ? localizeKnownCategoryFragments(locale, item.instructor)
    : "";

  const details = [
    item.location
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

  const booking = item.bookingUrl
    ? `<p class="workout-booking"><a href="${escapeHtml(item.bookingUrl)}">${escapeHtml(copy.openBookingLabel)}</a></p>`
    : "";
  const status = formatStatus(item.bookingStatus, locale);
  const statusClasses = statusClass(item.bookingStatus);
  const opensAt = formatOpeningDateTime(item, locale);
  const schedules = formatSchedule(item, locale);
  const scheduleHtml =
    schedules.length > 0
      ? schedules
          .map(
            (s) =>
              `<div class="workout-row-schedule-item">${escapeHtml(s)}</div>`,
          )
          .join("")
      : `<div class="workout-row-schedule-item">${escapeHtml(copy.scheduleTbd)}</div>`;

  return [
    '<div class="workout-row">',
    '  <div class="workout-row-main">',
    '    <div class="workout-row-top">',
    `      <div class="workout-row-schedule">${scheduleHtml}</div>`,
    '      <div class="workout-status-block">',
    `        <div class="workout-status ${statusClasses}"><span class="workout-status-dot"></span><span>${escapeHtml(status)}</span></div>`,
    opensAt
      ? `        <div class="workout-opens-at">${escapeHtml(copy.opensLabel)} ${escapeHtml(opensAt)}</div>`
      : "",
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
