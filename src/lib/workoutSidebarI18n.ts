import { workoutTitleMap } from "./workoutTitleMap";
import { workoutCategoryMap } from "./workoutCategoryMap";

export type SidebarLocale = "de" | "en" | "zh-CN" | "ja" | "ko";

function trimSidebarLabel(value: string): string {
  return value.replace(/[:：]+\s*$/u, "").trim();
}

function normalizeTranslationKey(value: string): string {
  return trimSidebarLabel(value).replace(/\s+/g, " ");
}

export function getAllCategoryLabelMappings(): Record<
  string,
  Partial<Record<SidebarLocale, string>>
> {
  return { ...workoutCategoryMap };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getCategoryLabel(
  locale: SidebarLocale,
  category: string,
): string {
  const normalizedKey = normalizeTranslationKey(category);
  return trimSidebarLabel(
    workoutCategoryMap[normalizedKey]?.[locale] ?? normalizedKey,
  );
}

export function localizeKnownCategoryFragments(
  locale: SidebarLocale,
  value: string,
): string {
  const activeKeys = Object.keys(workoutCategoryMap)
    .filter((key) => {
      const localized = workoutCategoryMap[key]?.[locale];
      return localized && localized !== key;
    })
    .sort((left, right) => right.length - left.length);

  if (activeKeys.length === 0) return value;

  const pattern = new RegExp(
    `(^|[\\s,(+/:-])(${activeKeys.map(escapeRegex).join("|")})(?=$|[\\s),+/:-])`,
    "gu",
  );

  return value.replace(pattern, (match, prefix, key) => {
    const localized = workoutCategoryMap[key]?.[locale];
    return `${prefix}${localized ?? key}`;
  });
}

type SidebarLinkItem = {
  text: string;
  link: string;
};

type SidebarGroupItem = {
  collapsed: boolean;
  text: string;
  items: SidebarLinkItem[];
};

const standaloneCategories = new Set<string>([]);

const familyPrefixes: Array<{ prefix: string; family: string }> = [
  { prefix: "Yoga", family: "Yoga" },
  { prefix: "Yacht", family: "Yacht" },
  { prefix: "Jollensegeln", family: "Jollensegeln" },
  { prefix: "Ballett", family: "Dance" },
  { prefix: "Windsurfen", family: "Windsurfen" },
  { prefix: "Klettern", family: "Klettern" },
  { prefix: "Kinderklettern", family: "Klettern" },
  { prefix: "Schwimmkurse", family: "Schwimmen" },
  { prefix: "Schwimmen", family: "Schwimmen" },
];

const familyCategoryAliases: Array<{
  category: string;
  family: string;
  label?: string;
}> = [
    { category: "Afro Dance", family: "Dance" },
    { category: "Aikido", family: "Combat Sports" },
    { category: "Ballett", family: "Dance" },
    { category: "Aerial Hoop", family: "Weitere Sportarten" },
    { category: "Akrobatik", family: "Weitere Sportarten" },
    { category: "Aqua-Jogging", family: "Schwimmen" },
    { category: "Australian Football", family: "Weitere Sportarten" },
    { category: "Bachata / Kizomba", family: "Dance" },
    { category: "Badminton", family: "Ball Sports" },
    {
      category: "Ballett, American Technique",
      family: "Dance",
      label: "Ballett, American Technique",
    },
    {
      category: "Ballett, klassisches Ballett",
      family: "Dance",
      label: "Ballett, klassisches Ballett",
    },
    { category: "Basketball", family: "Ball Sports" },
    { category: "CAU Alumni Cup", family: "Weitere Sportarten" },
    { category: "Beachvolleyball", family: "Ball Sports" },
    { category: "Calisthenics", family: "Fitness" },
    { category: "Boxen", family: "Combat Sports" },
    { category: "Breaking", family: "Dance" },
    { category: "Contemporary Dance (Lyrical)", family: "Dance" },
    { category: "Eltern-Kind-Turnen", family: "Weitere Sportarten" },
    { category: "Entspannung und Achtsamkeit", family: "Mind & Body" },
    { category: "Erste Hilfe Kurs", family: "Services" },
    { category: "Fechten", family: "Weitere Sportarten" },
    { category: "Fitnessgymnastik für Ältere", family: "Fitness" },
    { category: "Floorball", family: "Ball Sports" },
    { category: "Forró", family: "Dance" },
    { category: "Fußball", family: "Ball Sports" },
    { category: "Futsal", family: "Ball Sports" },
    { category: "Functional Training", family: "Fitness" },
    { category: "Gerätturnen", family: "Weitere Sportarten" },
    { category: "Gesellschaftstanz", family: "Dance" },
    { category: "Handball", family: "Ball Sports" },
    { category: "HIIT", family: "Fitness" },
    { category: "Hip-Hop", family: "Dance" },
    { category: "Iaido", family: "Combat Sports" },
    { category: "Indoor Cycling", family: "Fitness" },
    { category: "Inline-Hockey", family: "Ball Sports" },
    { category: "Inlineskaten", family: "Weitere Sportarten" },
    { category: "Jazz Dance", family: "Dance" },
    { category: "Jiu-Jitsu", family: "Combat Sports" },
    { category: "Jonglieren / Flow Arts", family: "Weitere Sportarten" },
    { category: "Judo", family: "Combat Sports" },
    { category: "Kajakrolle", family: "Kanu Sports" },
    { category: "Kanu", family: "Kanu Sports" },
    { category: "Kanupolo", family: "Kanu Sports" },
    {
      category: "Jollen Einstufungssegeln",
      family: "Jollensegeln",
      label: "Einstufungssegeln",
    },
    {
      category: "Jollen Regattatraining",
      family: "Jollensegeln",
      label: "Regattatraining",
    },
    { category: "K-Pop Dance", family: "Dance" },
    { category: "Karate-Do", family: "Combat Sports" },
    { category: "Kendo", family: "Combat Sports" },
    { category: "Kieler Woche Regattakurse", family: "Jollensegeln" },
    { category: "Kitesurfen am Wochenende", family: "Board Sports" },
    { category: "Kinderklettern", family: "Klettern" },
    { category: "Klettern", family: "Klettern" },
    { category: "Klettersport", family: "Klettern" },
    { category: "Kung Fu", family: "Combat Sports" },
    { category: "Lacrosse", family: "Ball Sports" },
    { category: "Langhanteltraining", family: "Fitness" },
    { category: "Lauftreff", family: "Weitere Sportarten" },
    { category: "Lindy Hop", family: "Dance" },
    { category: "Orientalischer Tanz", family: "Dance" },
    { category: "Orientierungslauf", family: "Weitere Sportarten" },
    { category: "Parkour", family: "Weitere Sportarten" },
    { category: "Pilates", family: "Mind & Body" },
    { category: "Pilates (Präventionssport)", family: "Mind & Body" },
    { category: "Reiten", family: "Weitere Sportarten" },
    { category: "Rhönrad/Cyr", family: "Weitere Sportarten" },
    { category: "freies Jollensegeln", family: "Jollensegeln" },
    { category: "Pole Dance", family: "Dance" },
    { category: "Rock`n`Roll", family: "Dance" },
    { category: "Rope Skipping", family: "Fitness" },
    { category: "Rückenfit", family: "Fitness" },
    { category: "Rudern", family: "Weitere Sportarten" },
    { category: "Salsa", family: "Dance" },
    { category: "Schach", family: "Weitere Sportarten" },
    {
      category: "Segeln für Jugendliche in den Sommerferien",
      family: "Jollensegeln",
    },
    { category: "Semestergebühr", family: "Services" },
    { category: "Skat", family: "Weitere Sportarten" },
    { category: "Sportbootführerschein See", family: "Services" },
    { category: "Step Aerobic", family: "Fitness" },
    { category: "Taekwondo", family: "Combat Sports" },
    { category: "Tai Chi", family: "Mind & Body" },
    { category: "Tango Argentino", family: "Dance" },
    { category: "Tanzsport, Standard und Latein", family: "Dance" },
    { category: "Tennis Gebühren", family: "Services" },
    { category: "Tenniskurse kompakt Semesterferien", family: "Ball Sports" },
    { category: "Tenniskurse Semester", family: "Ball Sports" },
    { category: "Roundnet", family: "Ball Sports" },
    { category: "Tischfußball", family: "Ball Sports" },
    { category: "Tischtennis", family: "Ball Sports" },
    { category: "Trampolin Großgerät", family: "Weitere Sportarten" },
    { category: "Ultimate Frisbee", family: "Weitere Sportarten" },
    { category: "Vertikaltuch", family: "Weitere Sportarten" },
    { category: "Völkerball", family: "Ball Sports" },
    { category: "Volleyball", family: "Ball Sports" },
    { category: "Volleyball Uniliga", family: "Ball Sports" },
    { category: "UniFIT", family: "Fitness" },
    { category: "Versicherungspaket für Übungsleiter:innen", family: "Services" },
    { category: "Wellenreiten in Rantum/Sylt", family: "Board Sports" },
    { category: "Workout", family: "Fitness" },
    { category: "Yachtsegeln für Frauen", family: "Yacht", label: "für Frauen" },
    { category: "Yachtsegeln Inklusion", family: "Yacht", label: "Inklusion" },
    { category: "Yachtsegeln Zweihand", family: "Yacht", label: "Zweihand" },
    { category: "Zumba", family: "Dance" },
  ];

function getSidebarFamily(
  category: string,
): { family: string; label: string } | null {
  const normalizedCategory = normalizeTranslationKey(category);

  if (standaloneCategories.has(normalizedCategory)) {
    return null;
  }

  const aliasMatch = familyCategoryAliases.find(
    (entry) => entry.category === normalizedCategory,
  );
  if (aliasMatch) {
    const parts = normalizedCategory
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    return {
      family: aliasMatch.family,
      label:
        aliasMatch.label ??
        (parts.length > 1 ? parts.slice(1).join(", ") : normalizedCategory),
    };
  }

  const parts = normalizedCategory
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length > 1) {
    return {
      family: parts[0],
      label: parts.slice(1).join(", "),
    };
  }

  for (const { prefix, family } of familyPrefixes) {
    if (normalizedCategory === prefix) {
      return {
        family,
        label: normalizedCategory,
      };
    }

    if (normalizedCategory.startsWith(`${prefix} `)) {
      return {
        family,
        label: normalizedCategory.slice(prefix.length).trim(),
      };
    }
  }

  return null;
}

export function localizeSidebarItems(
  locale: SidebarLocale,
  items: SidebarLinkItem[],
): Array<SidebarLinkItem | SidebarGroupItem> {
  const grouped = new Map<string, SidebarLinkItem[]>();
  const standalone: SidebarLinkItem[] = [];

  for (const item of items) {
    const familyEntry = getSidebarFamily(item.text);
    if (familyEntry) {
      const family = familyEntry.family;
      const variant = familyEntry.label;
      const familyItems = grouped.get(family) ?? [];
      familyItems.push({
        text: trimSidebarLabel(getCategoryLabel(locale, variant)),
        link: item.link,
      });
      grouped.set(family, familyItems);
      continue;
    }

    standalone.push({
      text: trimSidebarLabel(getCategoryLabel(locale, item.text)),
      link: item.link,
    });
  }

  const groupedItems = Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([family, familyItems]) => ({
      collapsed: false,
      text: trimSidebarLabel(getCategoryLabel(locale, family)),
      items: familyItems.sort((left, right) =>
        left.text.localeCompare(right.text),
      ),
    }));

  const standaloneItems = standalone.sort((left, right) =>
    left.text.localeCompare(right.text),
  );

  return [...standaloneItems, ...groupedItems];
}

export const titlePhraseMaps: Record<
  SidebarLocale,
  Array<{
    pattern: RegExp;
    replacement: string | ((match: string, p1: string) => string);
  }>
> = {
  de: [],
  en: [
    { pattern: /fortg\.\s*Anfänger|Fortg\.\s*Anf\./gu, replacement: "Advanced Beginners" },
    { pattern: /fortg\./giu, replacement: "Advanced" },
    { pattern: /Anfänger|Anf\./gu, replacement: "Beginners" },
    { pattern: /\bund\b/gu, replacement: "and" },
    { pattern: /\bauch\b/gu, replacement: "also" },
    { pattern: /\bneue\b/gu, replacement: "new" },
    { pattern: /tägl\./gu, replacement: "Daily" },
    { pattern: /\bab\s+(\d+[:.]\d+-\d+[:.]\d+)\b/giu, replacement: "from $1" },
    { pattern: /\bab\s+(\d+)\s+Uhr\b/giu, replacement: "from $1" },
    { pattern: /\bab\b/giu, replacement: "from" },
    { pattern: /\bUhr\b/giu, replacement: "" },
  ],
  ja: [
    { pattern: /fortg\.\s*Anfänger|Fortg\.\s*Anf\./gu, replacement: "初中級" },
    { pattern: /fortg\./giu, replacement: "上級" },
    { pattern: /Anfänger|Anf\./gu, replacement: "初心者" },
    { pattern: /\bund\b/gu, replacement: "と" },
    { pattern: /\bauch\b/gu, replacement: "も" },
    { pattern: /\bneue\b/gu, replacement: "新しい" },
    { pattern: /tägl\./gu, replacement: "毎日" },
    { pattern: /\bab\s+(\d+[:.]\d+-\d+[:.]\d+)\b/giu, replacement: "$1から" },
    { pattern: /\bab\s+(\d+)\s+Uhr\b/giu, replacement: "$1時から" },
    { pattern: /\bab\b/giu, replacement: "から" },
    { pattern: /\bUhr\b/giu, replacement: "時" },
  ],
  ko: [
    { pattern: /fortg\.\s*Anfänger|Fortg\.\s*Anf\./gu, replacement: "초중급" },
    { pattern: /fortg\./giu, replacement: "고급" },
    { pattern: /Anfänger|Anf\./gu, replacement: "초보자" },
    { pattern: /\bund\b/gu, replacement: "및" },
    { pattern: /\bauch\b/gu, replacement: "포함" },
    { pattern: /\bneue\b/gu, replacement: "새로운" },
    { pattern: /tägl\./gu, replacement: "매일" },
    { pattern: /\bab\s+(\d+[:.]\d+-\d+[:.]\d+)\b/giu, replacement: "$1부터" },
    { pattern: /\bab\s+(\d+)\s+Uhr\b/giu, replacement: "$1시부터" },
    { pattern: /\bab\b/giu, replacement: "부터" },
    { pattern: /\bUhr\b/giu, replacement: "시" },
  ],
  "zh-CN": [
    { pattern: /fortg\.\s*Anfänger|Fortg\.\s*Anf\./gu, replacement: "初中级" },
    { pattern: /fortg\./giu, replacement: "进阶" },
    { pattern: /Anfänger|Anf\./gu, replacement: "初学者" },
    { pattern: /\bund\b/gu, replacement: "及" },
    { pattern: /\bauch\b/gu, replacement: "也包括" },
    { pattern: /\bneue\b/gu, replacement: "新" },
    { pattern: /tägl\./gu, replacement: "每日" },
    { pattern: /\bab\s+(\d+[:.]\d+-\d+[:.]\d+)\b/giu, replacement: "$1起" },
    { pattern: /\bab\s+(\d+)\s+Uhr\b/giu, replacement: "$1点起" },
    { pattern: /\bab\b/giu, replacement: "起" },
    { pattern: /\bUhr\b/giu, replacement: "点" },
  ],
};

export function localizeWorkoutTitle(
  value: string,
  locale: SidebarLocale,
): string {
  // 0. Direct title/category map
  const directMatch =
    workoutTitleMap[value]?.[locale] ?? workoutCategoryMap[value]?.[locale];
  if (directMatch) return directMatch;

  // 1. Exact match via discovery/category mapping
  const directLabel = getCategoryLabel(locale, value);
  if (directLabel !== value) {
    return directLabel;
  }

  // 2. Fallback to fragment-based replacement
  let result = localizeKnownCategoryFragments(locale, value);

  // 3. Fallback to phrase maps (legacy rules)
  for (const rule of titlePhraseMaps[locale]) {
    result = result.replace(rule.pattern, rule.replacement as any);
  }

  return result.replace(/\s+/g, " ").trim();
}

