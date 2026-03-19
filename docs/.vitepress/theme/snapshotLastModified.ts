import type { SidebarLocale } from "../../../src/lib/workoutSidebarI18n";

const lastUpdatedLabels: Record<SidebarLocale, string> = {
  de: "Zuletzt aktualisiert",
  en: "Last updated",
  ja: "最終更新",
  ko: "마지막 업데이트",
  "zh-CN": "最后更新",
};

export function resolveSnapshotLastModified(
  locale: SidebarLocale,
  frontmatter: Record<string, unknown>,
): { label: string; datetime: string; text: string } | null {
  const datetime =
    typeof frontmatter.snapshotUpdatedAt === "string"
      ? frontmatter.snapshotUpdatedAt
      : null;

  if (!datetime) return null;

  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return null;

  return {
    label: lastUpdatedLabels[locale],
    datetime,
    text: date.toLocaleString(locale === "en" ? "en-US" : locale, {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}
