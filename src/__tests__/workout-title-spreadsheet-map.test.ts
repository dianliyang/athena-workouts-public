import { describe, expect, test } from "vitest";
import { workoutTitleSpreadsheetMap } from "../lib/workoutTitleSpreadsheetMap";

describe("workoutTitleSpreadsheetMap", () => {
  test("imports non-category title rows from the spreadsheet", () => {
    expect(workoutTitleSpreadsheetMap["5x3h Kurs 1: Mo"]).toEqual({
      en: "5×3h Course 1: Mon",
      ja: "5×3h コース1：月曜",
      ko: "5×3h 강좌1: 월요일",
      "zh-CN": "5×3h 课程1：周一",
    });
  });

  test("keeps spreadsheet spacing and wording for title-only rows", () => {
    expect(workoutTitleSpreadsheetMap["Anfänger*innenkurs 12"]).toEqual({
      en: "Beginners Course 12",
      ja: "初心者コース 12",
      ko: "초급자 강좌 12",
      "zh-CN": "初学者课程 12",
    });
  });

  test("does not include rows that belong to the category map", () => {
    expect(workoutTitleSpreadsheetMap["Afro Dance"]).toBeUndefined();
    expect(workoutTitleSpreadsheetMap["Wup für Anfänger"]).toEqual({
      en: "Warm-Up for Beginners",
      ja: "初心者向けウォームアップ",
      ko: "초급자를 위한 워밍업",
      "zh-CN": "初学者热身",
    });
  });
});
