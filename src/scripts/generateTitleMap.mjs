import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import vm from "vm";

const ROOT = new URL("../..", import.meta.url).pathname;

const DE_DIR = join(ROOT, "docs/de/workouts");
const LOCALE_DIRS = {
  en: join(ROOT, "docs/en/workouts"),
  ja: join(ROOT, "docs/ja/workouts"),
  ko: join(ROOT, "docs/ko/workouts"),
  "zh-CN": join(ROOT, "docs/zh-cn/workouts"),
};
const CATALOG_DIR =
  process.env.WORKOUT_CATALOG_DIR ??
  join(ROOT, "..", "athena-public-catalogs");
const CATEGORY_MAP_FILE = join(ROOT, "src/lib/workoutCategoryMap.ts");
const OUT_FILE = join(ROOT, "src/lib/workoutTitleMap.ts");

function normalizeKey(value = "") {
  return value.replace(/[:：]+\s*$/u, "").trim().replace(/\s+/gu, " ");
}

function extractHeadings(content) {
  return content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim());
}

function extractObjectLiteral(file, varName) {
  const src = readFileSync(file, "utf-8");
  const match = src.match(
    new RegExp(`export const ${varName}[^=]*=\\s*({[\\s\\S]*?^});`, "m"),
  );
  if (!match) throw new Error(`Unable to find ${varName} in ${file}`);
  return vm.runInNewContext(`(${match[1]})`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripLocalizedPrefix(full, labels) {
  for (const label of labels.filter(Boolean)) {
    const re = new RegExp(
      `^${escapeRegex(label)}(?:\\s*[:：,，-]+\\s*|\\s+)`,
      "u",
    );
    if (re.test(full)) return full.replace(re, "").trim();
    if (full.startsWith(label)) return full.slice(label.length).trim();
  }
  return null;
}

function isRuleCoveredTitle(title) {
  return [
    /^Anfänger\*innenkurs\s+\d+$/u,
    /^Kurs\s+\d+$/u,
    /^Fortgeschrittene\s+\d+$/u,
    /^Wochenende\s+\d+$/u,
    /^Warming up\s+\d+$/u,
    /^Gruppe\s+(?:Mo|Di|Mi|Do|Fr|Sa\/So)(?:\s+unbesetzt)?$/u,
    /^Kurs\s+\d+:\s+(?:Mo|Di|Mi|Do|Fr|Sa|So)\s+plus\s+\d+\s+Woe$/u,
    /^Kurs\s+\d+\s+an\s+\d+\s+Wochenenden$/u,
    /^Kurs\s+\d+\s+(?:Mo|Di|Mi|Do|Fr|Sa|So)$/u,
    /^Kurs\s+\d+:\s+Kompaktkurs(?:\s+.+?)?(?:\/unbesetzt)?$/u,
  ].some((pattern) => pattern.test(title));
}

function readCatalogRecords(catalogDir) {
  const manifest = JSON.parse(
    readFileSync(join(catalogDir, "workouts", "manifest.json"), "utf-8"),
  );
  const detail = JSON.parse(
    readFileSync(join(catalogDir, manifest.detailKey), "utf-8"),
  );
  return Array.isArray(detail) ? detail : Object.values(detail);
}

const snapshotRecords = readCatalogRecords(CATALOG_DIR);
const activeCategories = new Set(
  snapshotRecords
    .map((record) => normalizeKey(record.category ?? ""))
    .filter(Boolean),
);
const activeTitles = new Set(
  snapshotRecords
    .map((record) => normalizeKey(record.title ?? ""))
    .filter(Boolean),
);
const categoryMap = extractObjectLiteral(CATEGORY_MAP_FILE, "workoutCategoryMap");

const fullTitleMapping = {};
let mismatches = 0;

const files = readdirSync(DE_DIR)
  .filter((f) => f.endsWith(".md") && f !== "index.md")
  .sort();

for (const file of files) {
  const deHeadings = extractHeadings(readFileSync(join(DE_DIR, file), "utf-8"));

  for (const [locale, dir] of Object.entries(LOCALE_DIRS)) {
    let localeHeadings;
    try {
      localeHeadings = extractHeadings(readFileSync(join(dir, file), "utf-8"));
    } catch {
      continue;
    }

    if (localeHeadings.length !== deHeadings.length) {
      console.warn(
        `[${locale}] ${file}: heading count mismatch` +
          ` (de=${deHeadings.length}, ${locale}=${localeHeadings.length})`,
      );
      mismatches++;
    }

    const len = Math.min(deHeadings.length, localeHeadings.length);
    for (let i = 0; i < len; i++) {
      const de = normalizeKey(deHeadings[i]);
      const loc = localeHeadings[i];
      if (!loc || loc === de) continue;
      if (!fullTitleMapping[de]) fullTitleMapping[de] = {};
      fullTitleMapping[de][locale] = loc;
    }
  }
}

const titleOnlyMapping = {};
const manualOverrides = {
  "Anf. mit Grundk. und Mittelstufe": {
    en: "Adv. Beginners and Intermediate",
    ja: "初級経験者・中級",
    ko: "초급경험자·중급",
    "zh-CN": "有基础初级与中级",
  },
  "Mittelstufe bis Fortgeschrittene": {
    en: "Intermediate to Advanced",
    ja: "中級から上級",
    ko: "중급에서 고급",
    "zh-CN": "中级至高级",
  },
  "jeweils 1.4. d.J. bis 31.3. des Folgejahres": {
    en: "(Apr 1 of the current year to Mar 31 of the following year)",
    ja: "（毎年4月1日から翌年3月31日まで）",
    ko: "(매년 4월 1일부터 다음 해 3월 31일까지)",
    "zh-CN": "（每年4月1日至次年3月31日）",
  },
  "Kurs 0: Mi plus 2 Woe": {
    en: "Course 0 (Wed + 2 weekends)",
    ja: "コース0（水曜＋週末2回）",
    ko: "코스 0 (수요일 + 주말 2회)",
    "zh-CN": "第0期（周三 + 2个周末）",
  },
  "Kurs 1: Di plus 2 Woe": {
    en: "Course 1 (Tue + 2 weekends)",
    ja: "コース1（火曜＋週末2回）",
    ko: "코스 1 (화요일 + 주말 2회)",
    "zh-CN": "第1期（周二 + 2个周末）",
  },
  "Kurs 1: Kompaktkurs Mo-Fr": {
    en: "Course 1 (Intensive Course, Mon-Fri)",
    ja: "コース1（集中コース 月〜金）",
    ko: "코스 1 (집중 과정 월-금)",
    "zh-CN": "第1期（强化班 周一至周五）",
  },
  "Kurs 2: Do plus 2 Woe": {
    en: "Course 2 (Thu + 2 weekends)",
    ja: "コース2（木曜＋週末2回）",
    ko: "코스 2 (목요일 + 주말 2회)",
    "zh-CN": "第2期（周四 + 2个周末）",
  },
  "Kurs 2: Kompaktkurs Sa-So/unbesetzt": {
    en: "Course 2 (Intensive Course, Sat-Sun; guidance vacancy)",
    ja: "コース2（集中コース 土〜日／指導枠空きあり）",
    ko: "코스 2 (집중 과정 토-일 / 지도 공석)",
    "zh-CN": "第2期（强化班 周六至周日／指导空缺）",
  },
  "Kurs 3: Kompaktkurs Sa-So": {
    en: "Course 3 (Intensive Course, Sat-Sun)",
    ja: "コース3（集中コース 土〜日）",
    ko: "코스 3 (집중 과정 토-일)",
    "zh-CN": "第3期（强化班 周六至周日）",
  },
  "Kurs 4: Kompaktkurs Mo-Fr/unbesetzt": {
    en: "Course 4 (Intensive Course, Mon-Fri; guidance vacancy)",
    ja: "コース4（集中コース 月〜金／指導枠空きあり）",
    ko: "코스 4 (집중 과정 월-금 / 지도 공석)",
    "zh-CN": "第4期（强化班 周一至周五／指导空缺）",
  },
  "Kurs 5: Kompaktkurs Sa-So/unbesetzt": {
    en: "Course 5 (Intensive Course, Sat-Sun; guidance vacancy)",
    ja: "コース5（集中コース 土〜日／指導枠空きあり）",
    ko: "코스 5 (집중 과정 토-일 / 지도 공석)",
    "zh-CN": "第5期（强化班 周六至周日／指导空缺）",
  },
  "International Sailing Course/ unbesetzt": {
    en: "International Sailing Course / guidance vacancy",
    ja: "国際セーリングコース／指導枠空きあり",
    ko: "국제 세일링 코스 / 지도 공석",
    "zh-CN": "国际帆船课程／指导空缺",
  },
};

for (const record of snapshotRecords) {
  const category = normalizeKey(record.category ?? "");
  const title = normalizeKey(record.title ?? "");
  if (!category || !title || activeCategories.has(title) || isRuleCoveredTitle(title)) {
    continue;
  }

  if (!titleOnlyMapping[title]) titleOnlyMapping[title] = {};

  const exactMatch = fullTitleMapping[title];
  if (exactMatch) {
    Object.assign(titleOnlyMapping[title], exactMatch);
    continue;
  }

  const combinedCandidates = [
    `${category}: ${title}`,
    `${category} ${title}`,
    `${category}：${title}`,
  ];

  const combinedKey = combinedCandidates.find((candidate) =>
    Object.prototype.hasOwnProperty.call(fullTitleMapping, candidate),
  );

  if (!combinedKey) continue;

  for (const [locale, fullLocalized] of Object.entries(fullTitleMapping[combinedKey])) {
    const localizedCategory = categoryMap[category]?.[locale] ?? category;
    const stripped = stripLocalizedPrefix(fullLocalized, [
      localizedCategory,
      category,
    ]);
    if (stripped) {
      titleOnlyMapping[title][locale] = stripped;
    }
  }
}

for (const key of Object.keys(titleOnlyMapping)) {
  if (Object.keys(titleOnlyMapping[key]).length === 0) {
    delete titleOnlyMapping[key];
  }
}

for (const [key, value] of Object.entries(manualOverrides)) {
  if (activeTitles.has(key)) {
    titleOnlyMapping[key] = value;
  }
}

const entries = Object.entries(titleOnlyMapping)
  .filter(([key]) => activeTitles.has(key))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([de, locales]) => {
    const inner = Object.entries(locales)
      .map(
        ([lang, title]) =>
          `    ${JSON.stringify(lang)}: ${JSON.stringify(title)},`,
      )
      .join("\n");
    return `  ${JSON.stringify(de)}: {\n${inner}\n  },`;
  })
  .join("\n");

const output = `\
// Auto-generated by src/scripts/generateTitleMap.mjs — do not edit manually.
// Re-run: node src/scripts/generateTitleMap.mjs

import type { SidebarLocale } from "./workoutSidebarI18n";
import type { LocalizedLabelMap } from "./workoutI18nUtils";

export const workoutTitleMap: LocalizedLabelMap<SidebarLocale> = {
${entries}
};
`;

writeFileSync(OUT_FILE, output, "utf-8");

console.log(
  `Wrote ${Object.keys(titleOnlyMapping).length} title-only entries to src/lib/workoutTitleMap.ts` +
  (mismatches
    ? `  (${mismatches} heading-count mismatches — review warnings above)`
    : ""),
);
