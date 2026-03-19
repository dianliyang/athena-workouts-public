type LastUpdatedThemeConfig = {
  text?: string;
  formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean };
};

export function resolveSnapshotLastModified(
  locale: string,
  frontmatter: Record<string, unknown>,
  config: LastUpdatedThemeConfig,
): { label: string; datetime: string; text: string } | null {
  const datetime =
    typeof frontmatter.snapshotUpdatedAt === "string"
      ? frontmatter.snapshotUpdatedAt
      : null;

  if (!datetime) return null;

  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return null;

  const formatOptions = config.formatOptions ?? {
    dateStyle: "short",
    timeStyle: "short",
    forceLocale: true,
  };
  const { forceLocale: _forceLocale, ...intlOptions } = formatOptions;

  return {
    label: config.text ?? "Last updated",
    datetime,
    text: new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      ...intlOptions,
    }).format(date),
  };
}
