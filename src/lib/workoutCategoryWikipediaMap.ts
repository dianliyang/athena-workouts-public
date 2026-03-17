import { normalizeTranslationKey } from "./workoutI18nUtils";
import type { SidebarLocale } from "./workoutSidebarI18n";

type WikipediaUrlMap = Record<string, Partial<Record<SidebarLocale, string>>>;

export const workoutCategoryWikipediaMap: WikipediaUrlMap = {
  Aikido: {
    de: "https://de.wikipedia.org/wiki/Aikid%C5%8D",
    en: "https://en.wikipedia.org/wiki/Aikido",
    ja: "https://ja.wikipedia.org/wiki/%E5%90%88%E6%B0%97%E9%81%93",
    ko: "https://ko.wikipedia.org/wiki/%ED%95%A9%EA%B8%B0%EB%8F%84",
    "zh-CN": "https://zh.wikipedia.org/wiki/%E5%90%88%E6%B0%94%E9%81%93",
  },
  Badminton: {
    de: "https://de.wikipedia.org/wiki/Badminton",
    en: "https://en.wikipedia.org/wiki/Badminton",
    ja: "https://ja.wikipedia.org/wiki/%E3%83%90%E3%83%89%E3%83%9F%E3%83%B3%E3%83%88%E3%83%B3",
    ko: "https://ko.wikipedia.org/wiki/%EB%B0%B0%EB%93%9C%EB%AF%BC%ED%84%B4",
    "zh-CN": "https://zh.wikipedia.org/wiki/%E7%BE%BD%E6%AF%9B%E7%90%83",
  },
  Basketball: {
    de: "https://de.wikipedia.org/wiki/Basketball",
    en: "https://en.wikipedia.org/wiki/Basketball",
    ja: "https://ja.wikipedia.org/wiki/%E3%83%90%E3%82%B9%E3%82%B1%E3%83%83%E3%83%88%E3%83%9C%E3%83%BC%E3%83%AB",
    ko: "https://ko.wikipedia.org/wiki/%EB%86%8D%EA%B5%AC",
    "zh-CN": "https://zh.wikipedia.org/wiki/%E7%AF%AE%E7%90%83",
  },
  Beachvolleyball: {
    de: "https://de.wikipedia.org/wiki/Beachvolleyball",
    en: "https://en.wikipedia.org/wiki/Beach_volleyball",
    ja: "https://ja.wikipedia.org/wiki/%E3%83%93%E3%83%BC%E3%83%81%E3%83%90%E3%83%AC%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%AB",
    ko: "https://ko.wikipedia.org/wiki/%EB%B9%84%EC%B9%98%EB%B0%B0%EA%B5%AC",
    "zh-CN":
      "https://zh.wikipedia.org/wiki/%E6%B2%99%E6%BB%A9%E6%8E%92%E7%90%83",
  },
  Bouldering: {
    en: "https://en.wikipedia.org/wiki/Bouldering",
  },
  Boxing: {
    de: "https://de.wikipedia.org/wiki/Boxen",
    en: "https://en.wikipedia.org/wiki/Boxing",
    ja: "https://ja.wikipedia.org/wiki/%E3%83%9C%E3%82%AF%E3%82%B7%E3%83%B3%E3%82%B0",
    ko: "https://ko.wikipedia.org/wiki/%EB%B3%B5%EC%8B%B1",
    "zh-CN": "https://zh.wikipedia.org/wiki/%E6%8B%B3%E5%87%BB",
  },
  Climbing: {
    en: "https://en.wikipedia.org/wiki/Rock_climbing",
  },
  Floorball: {
    de: "https://de.wikipedia.org/wiki/Unihockey",
    en: "https://en.wikipedia.org/wiki/Floorball",
    ja: "https://ja.wikipedia.org/wiki/%E3%83%95%E3%83%AD%E3%82%A2%E3%83%9C%E3%83%BC%E3%83%AB",
    ko: "https://ko.wikipedia.org/wiki/%ED%94%8C%EB%A1%9C%EC%96%B4%EB%B3%BC",
    "zh-CN": "https://zh.wikipedia.org/wiki/%E5%9C%B0%E6%9D%BF%E7%90%83",
  },
  Futsal: {
    de: "https://de.wikipedia.org/wiki/Futsal",
    en: "https://en.wikipedia.org/wiki/Futsal",
    ja: "https://ja.wikipedia.org/wiki/%E3%83%95%E3%83%83%E3%83%88%E3%82%B5%E3%83%AB",
    ko: "https://ko.wikipedia.org/wiki/%ED%92%8B%EC%82%B4",
    "zh-CN":
      "https://zh.wikipedia.org/wiki/%E5%AE%A4%E5%86%85%E4%BA%94%E4%BA%BA%E5%88%B6%E8%B6%B3%E7%90%83",
  },
};

export function getCategoryWikipediaUrl(
  locale: SidebarLocale,
  category: string,
): string | null {
  const entry = workoutCategoryWikipediaMap[normalizeTranslationKey(category)];
  if (!entry) return null;
  return entry[locale] ?? entry.en ?? null;
}
