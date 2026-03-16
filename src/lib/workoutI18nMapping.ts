import type { SidebarLocale } from "./workoutSidebarI18n";
import { getAllCategoryLabelMappings } from "./workoutSidebarI18n";
import { titlePhraseMaps } from "./workoutTitleI18n";

type TitlePhraseMapping = {
  pattern: string;
  flags: string;
  replacement: string;
};

export type WorkoutI18nMapping = {
  categories: Record<string, Partial<Record<SidebarLocale, string>>>;
  titlePhrases: Record<SidebarLocale, TitlePhraseMapping[]>;
};

export const workoutI18nMapping: WorkoutI18nMapping = {
  categories: getAllCategoryLabelMappings(),
  titlePhrases: Object.fromEntries(
    (Object.entries(titlePhraseMaps) as [SidebarLocale, { pattern: RegExp; replacement: string }[]][])
      .map(([locale, rules]) => [
        locale,
        rules.map((rule) => ({
          pattern: rule.pattern.source,
          flags: rule.pattern.flags,
          replacement: rule.replacement,
        })),
      ]),
  ) as Record<SidebarLocale, TitlePhraseMapping[]>,
};

