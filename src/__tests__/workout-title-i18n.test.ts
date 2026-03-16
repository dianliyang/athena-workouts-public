import { describe, expect, test } from "vitest";
import { localizeWorkoutTitle } from "../lib/workoutTitleI18n";

type Locale = "de" | "en" | "zh-CN" | "ja" | "ko";

describe("Workout title localization (BDD)", () => {
  describe("Given a German source title with detailed ballet level information", () => {
    const source =
      "Ballett, American Technique Anf. mit Grundk. und Mittelstufe";

    test("then the title is consistently localized across all supported locales", () => {
      const results: Record<Locale, string> = {
        de: localizeWorkoutTitle(source, "de"),
        en: localizeWorkoutTitle(source, "en"),
        "zh-CN": localizeWorkoutTitle(source, "zh-CN"),
        ja: localizeWorkoutTitle(source, "ja"),
        ko: localizeWorkoutTitle(source, "ko"),
      };

      expect(results.de).toBe(source);
      expect(results.en).toBe(
        "Ballet, American Technique Beg. with basic skills and Intermediate",
      );
      expect(results.ja).toContain("バレエ、アメリカンテクニック");
      expect(results.ja).toContain("初級");
      expect(results.ja).toContain("中級");
      expect(results.ko).toContain("발레, 아메리칸 테크닉");
      expect(results.ko).toContain("초급");
      expect(results.ko).toContain("중급");
      expect(results["zh-CN"]).toContain("芭蕾，美式技巧");
      expect(results["zh-CN"]).toContain("初级");
      expect(results["zh-CN"]).toContain("中级");
    });
  });

  describe("Given German titles that combine beginner/intermediate/advanced markers", () => {
    const cases: Array<{
      title: string;
      locale: Locale;
      expected: string;
    }> = [
      {
        title: "Mittelstufe bis Fortgeschrittene",
        locale: "en",
        expected: "Intermediate to Advanced",
      },
      {
        title: "Mittelstufe bis Fortgeschrittene",
        locale: "ja",
        expected: "中級から上級",
      },
      {
        title: "Mittelstufe bis Fortgeschrittene",
        locale: "ko",
        expected: "중급에서 고급",
      },
      {
        title: "Mittelstufe bis Fortgeschrittene",
        locale: "zh-CN",
        expected: "中级至高级",
      },
      {
        title: "Anf. und Fortg.",
        locale: "en",
        expected: "Beg. and Adv.",
      },
      {
        title: "Anf. und Fortg.",
        locale: "ja",
        expected: "初級と上級",
      },
      {
        title: "Anf. und Fortg.",
        locale: "ko",
        expected: "초급 및 고급",
      },
      {
        title: "Anf. und Fortg.",
        locale: "zh-CN",
        expected: "初级及高级",
      },
      {
        title: "Anf. + Fortg.",
        locale: "en",
        expected: "Beg. + Adv.",
      },
      {
        title: "Anf. + Fortg.",
        locale: "ja",
        expected: "初級 + 上級",
      },
      {
        title: "Anf. + Fortg.",
        locale: "ko",
        expected: "초급 + 고급",
      },
      {
        title: "Anf. + Fortg.",
        locale: "zh-CN",
        expected: "初级 + 高级",
      },
      {
        title: "Yoga für fortg. Anfänger",
        locale: "en",
        expected: "Yoga für Advanced Beginners",
      },
      {
        title: "Yoga für fortg. Anfänger",
        locale: "ja",
        expected: "ヨガ für 初中級",
      },
      {
        title: "Yoga für fortg. Anfänger",
        locale: "ko",
        expected: "요가 für 초중급",
      },
      {
        title: "Yoga für fortg. Anfänger",
        locale: "zh-CN",
        expected: "瑜伽 für 初中级",
      },
    ];

    test("then specific patterns are applied before generic beginner/advanced fragments", () => {
      for (const { title, locale, expected } of cases) {
        const localized = localizeWorkoutTitle(title, locale);
        expect(localized).toBe(expected);
      }
    });
  });

  describe("Given the senior fitness category title", () => {
    const source = "Fitnessgymnastik für Ältere";

    test("then localized titles describe older adults in each language", () => {
      expect(localizeWorkoutTitle(source, "de")).toBe(source);
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Fitness Gymnastics for Older Adults",
      );
      expect(localizeWorkoutTitle(source, "ja")).toBe(
        "シニア向けフィットネス体操",
      );
      expect(localizeWorkoutTitle(source, "ko")).toBe(
        "고령자용 피트니스 체조",
      );
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe(
        "老年健身体操",
      );
    });
  });
});

