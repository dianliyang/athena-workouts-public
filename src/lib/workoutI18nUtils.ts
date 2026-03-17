export type LocalizedLabelRecord<Locale extends string> = Partial<
  Record<Locale, string>
>;

export type LocalizedLabelMap<Locale extends string> = Record<
  string,
  LocalizedLabelRecord<Locale>
>;

export function trimLocalizedLabel(value: string): string {
  return value.replace(/[:：]+\s*$/u, "").trim();
}

export function normalizeTranslationKey(value: string): string {
  return trimLocalizedLabel(value).replace(/\s+/gu, " ");
}

export function getLocalizedValue<Locale extends string>(
  map: LocalizedLabelMap<Locale>,
  locale: Locale,
  value: string,
): string | undefined {
  return map[normalizeTranslationKey(value)]?.[locale];
}

export function getLocalizedLabel<Locale extends string>(
  map: LocalizedLabelMap<Locale>,
  locale: Locale,
  value: string,
): string {
  return trimLocalizedLabel(getLocalizedValue(map, locale, value) ?? value);
}
