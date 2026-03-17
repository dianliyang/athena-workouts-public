import { describe, expect, test } from "vitest";
import { localizeWorkoutTitle } from "../lib/workoutSidebarI18n";

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
        "Ballet, American Technique Adv. Beginners and Intermediate",
      );
      expect(results.ja).toBe("バレエ（アメリカン・テクニック）初級経験者・中級");
      expect(results.ko).toBe("발레 (아메리칸 테크닉) 초급경험자·중급");
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe(
        "芭蕾（美式技巧）有基础初级与中级",
      );
    });
  });

  describe("Given a title with time and day markers like 'tägl. Sa ab 14 Uhr'", () => {
    const source = "freies Jollensegeln tägl. Sa ab 14 Uhr";

    test("then it is correctly localized into English", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Daily Sat from 14",
      );
    });

    test("then it is correctly localized into Japanese", () => {
      // Note: 'freies Jollensegeln' might not be in workoutCategoryMap yet for fragments
      // but let's see what we get.
      const localized = localizeWorkoutTitle(source, "ja");
      expect(localized).toContain("毎日");
      expect(localized).toContain("土");
      expect(localized).toContain("から");
      expect(localized).toContain("14");
      expect(localized).toContain("時");
    });
  });

  describe("Given a title with 'ab' followed by a time range like 'Mo ab 14:30-18:30'", () => {
    const source = "freies Jollensegeln Mo ab 14:30-18:30";

    test("then it is correctly localized into English", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Mon from 14:30-18:30",
      );
    });

    test("then it is correctly localized into Japanese", () => {
      const localized = localizeWorkoutTitle(source, "ja");
      expect(localized).toContain("月");
      expect(localized).toContain("14:30-18:30");
      expect(localized).toContain("から");
    });
  });

  describe("Given a title with 'ab' followed by a single clock time like 'Fri ab 17:00'", () => {
    const source = "freies Jollensegeln Fri ab 17:00";

    test("then it is correctly localized into English", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Fri from 17:00",
      );
    });

    test("then it is correctly localized into Japanese", () => {
      const localized = localizeWorkoutTitle(source, "ja");
      expect(localized).toContain("金");
      expect(localized).toContain("17:00");
      expect(localized).toContain("から");
    });

    test("then it is correctly localized into Korean and Chinese", () => {
      expect(localizeWorkoutTitle(source, "ko")).toContain("금");
      expect(localizeWorkoutTitle(source, "zh-CN")).toContain("周五");
    });
  });

  describe("Given a title with 'nur am' followed by a time like 'Mi nur am 06:05'", () => {
    const source = "freies Jollensegeln Mi nur am 06:05";

    test("then it is correctly localized across locales", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Wed only at 06:05",
      );
      expect(localizeWorkoutTitle(source, "ja")).toContain("水 06:05のみ");
      expect(localizeWorkoutTitle(source, "ko")).toContain("수 06:05에만");
      expect(localizeWorkoutTitle(source, "zh-CN")).toContain("周三 仅限 06:05");
    });
  });

  describe("Given a title with a weekday range and start time like 'Mi-So ab 17 Uhr'", () => {
    const source = "freies Jollensegeln Mi-So ab 17 Uhr";

    test("then the weekday range and start time are localized together", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Wed-Sun from 17",
      );
      expect(localizeWorkoutTitle(source, "ja")).toContain("水〜日 17時から");
      expect(localizeWorkoutTitle(source, "ko")).toContain("수-일 17시부터");
      expect(localizeWorkoutTitle(source, "zh-CN")).toContain("周三至周日 17点起");
    });
  });

  describe("Given a title with a weekday and end time like 'Sa bis 12:00'", () => {
    const source = "freies Jollensegeln Sa bis 12:00";

    test("then the weekday and end time are localized together", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Sat until 12:00",
      );
      expect(localizeWorkoutTitle(source, "ja")).toContain("土 12:00まで");
      expect(localizeWorkoutTitle(source, "ko")).toContain("토 12:00까지");
      expect(localizeWorkoutTitle(source, "zh-CN")).toContain("周六 截至 12:00");
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
          expected: "Beginners + Advanced",
        },
        {
          title: "Anf. + Fortg.",
          locale: "ja",
          expected: "初心者 + 上級",
        },
        {
          title: "Anf. + Fortg.",
          locale: "ko",
          expected: "초보자 + 고급",
        },
        {
          title: "Anf. + Fortg.",
          locale: "zh-CN",
          expected: "初学者 + 进阶",
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

  describe("Given the plain Hatha Yoga preventive-sport title", () => {
    const source = "Yoga, Hatha Yoga (Präventionssport)";

    test("then it uses the polished direct-title translation instead of fragment fallback text", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Yoga – Hatha Yoga (Certified Health Programme)",
      );
      expect(localizeWorkoutTitle(source, "ja")).toBe(
        "ヨガ - ハタヨガ（健康予防プログラム）",
      );
      expect(localizeWorkoutTitle(source, "ko")).toBe(
        "요가 - 하타 요가 (공인 건강 예방 프로그램)",
      );
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe(
        "瑜伽 - 哈他瑜伽（认证健康课程）",
      );
    });
  });

  describe("Given the instructor insurance package title with an annual date range", () => {
    const source =
      "Versicherungspaket für Übungsleiter:innen jeweils 1.4. d.J. bis 31.3. des Folgejahres";

    test("then the annual coverage window is translated explicitly in each locale", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Insurance Package for Instructors (Apr 1 of the current year to Mar 31 of the following year)",
      );
      expect(localizeWorkoutTitle(source, "ja")).toBe(
        "指導者向け保険パッケージ（毎年4月1日から翌年3月31日まで）",
      );
      expect(localizeWorkoutTitle(source, "ko")).toBe(
        "강사용 보험 패키지 (매년 4월 1일부터 다음 해 3월 31일까지)",
      );
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe(
        "教练保险套餐（每年4月1日至次年3月31日）",
      );
    });
  });

  describe("Given source titles with trailing punctuation or uneven spacing", () => {
    test("then normalized direct title matches still use the title map", () => {
      expect(
        localizeWorkoutTitle("  Aikido   Anf. : ", "en"),
      ).toBe("Aikido Beginners");
      expect(
        localizeWorkoutTitle("Aikido Anf.：", "ja"),
      ).toBe("合気道 初心者");
    });
  });

  describe("Given advanced dinghy sailing course titles with compact-course and weekend variants", () => {
    test("then explicit title-map translations use consistent course wording and guidance-vacancy labels", () => {
      expect(
        localizeWorkoutTitle(
          "Jollensegeln für Fortgeschrittene: Kurs 0: Mi plus 2 Woe",
          "en",
        ),
      ).toBe("Advanced Dinghy Sailing: Course 0 (Wed + 2 weekends)");
      expect(
        localizeWorkoutTitle(
          "Jollensegeln für Fortgeschrittene: Kurs 1: Kompaktkurs Mo-Fr",
          "en",
        ),
      ).toBe("Advanced Dinghy Sailing: Course 1 (Intensive Course, Mon-Fri)");
      expect(
        localizeWorkoutTitle(
          "Jollensegeln für Fortgeschrittene: Kurs 2: Kompaktkurs Sa-So/unbesetzt",
          "en",
        ),
      ).toBe(
        "Advanced Dinghy Sailing: Course 2 (Intensive Course, Sat-Sun; guidance vacancy)",
      );
      expect(
        localizeWorkoutTitle(
          "Jollensegeln für Fortgeschrittene: Kurs 4: Kompaktkurs Mo-Fr/unbesetzt",
          "ja",
        ),
      ).toBe(
        "中上級ディンギーセーリング：コース4（集中コース 月〜金／指導枠空きあり）",
      );
      expect(
        localizeWorkoutTitle(
          "Jollensegeln für Fortgeschrittene: Kurs 5: Kompaktkurs Sa-So/unbesetzt",
          "ko",
        ),
      ).toBe(
        "중급 딩기 세일링: 코스 5 (집중 과정 토-일 / 지도 공석)",
      );
      expect(
        localizeWorkoutTitle(
          "Jollensegeln für Fortgeschrittene: Kurs 3: Kompaktkurs Sa-So",
          "zh-CN",
        ),
      ).toBe("小艇帆船进阶课程：第3期（强化班 周六至周日）");
      expect(
        localizeWorkoutTitle(
          "Jollensegeln für Fortgeschrittene: Kurs 5: Kompaktkurs Sa-So/unbesetzt",
          "zh-CN",
        ),
      ).toBe("小艇帆船进阶课程：第5期（强化班 周六至周日／指导空缺）");
    });
  });

  describe("Given an international sailing course title marked as '/ unbesetzt'", () => {
    const source = "Yacht International Center: International Sailing Course/ unbesetzt";

    test("then it uses guidance-vacancy wording instead of a generic vacancy label", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Yacht International Center: International Sailing Course / guidance vacancy",
      );
      expect(localizeWorkoutTitle(source, "ja")).toBe(
        "ヨット国際センター：国際セーリングコース／指導枠空きあり",
      );
      expect(localizeWorkoutTitle(source, "ko")).toBe(
        "요트 국제센터: 국제 세일링 코스 / 지도 공석",
      );
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe(
        "游艇国际中心：国际帆船课程／指导空缺",
      );
    });
  });
});
