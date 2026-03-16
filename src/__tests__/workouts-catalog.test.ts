import { describe, expect, test } from "vitest";
import {
  buildWorkoutCategoryPages,
  buildWorkoutDetailCatalog,
  CATEGORY_INDEX_PATH,
} from "../lib/workoutsCatalog";
import { getCategoryLabel, localizeSidebarItems } from "../lib/workoutSidebarI18n";

type WorkoutDetailRecord = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  category: string | null;
  description: string | null;
  schedule: Array<{
    day: string;
    time: string;
    location: string;
  }>;
  location: string | null;
  bookingUrl: string | null;
  url: string | null;
  instructor?: string;
  startDate?: string;
  endDate?: string;
  priceStudent?: number | null;
  priceStaff?: number | null;
  priceExternal?: number | null;
  priceExternalReduced?: number | null;
  bookingStatus?: string;
  semester?: string;
  isEntgeltfrei?: boolean;
  bookingLabel?: string;
  bookingOpensOn?: string;
  bookingOpensAt?: string;
  plannedDates?: string[];
  durationUrl?: string;
};

const detailRecords: Record<string, WorkoutDetailRecord> = {
  yogaA: {
    id: "yoga-a",
    slug: "sunrise-yoga-a",
    title: "Sunrise Yoga 08.00-09.00",
    provider: "Campus Active",
    category: "Yoga",
    description: null,
    schedule: [{ day: "Mon", time: "08:00-09:00", location: "Studio A" }],
    location: "Studio A",
    bookingUrl: "https://example.com/a",
    url: "https://example.com/course-a",
    instructor: "Alex",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    priceStudent: 10,
    priceStaff: 20,
    priceExternal: 30,
    bookingStatus: "available",
    semester: "Summer 2026",
  },
  yogaB: {
    id: "yoga-b",
    slug: "sunrise-yoga-b",
    title: "Sunrise Yoga 10:00-11:00",
    provider: "Campus Active",
    category: "Yoga",
    description: null,
    schedule: [{ day: "Wed", time: "08:00-09:00", location: "Studio B" }],
    location: "Studio B",
    bookingUrl: "",
    url: "https://example.com/course-b",
    instructor: "Taylor",
    startDate: "2026-04-02",
    endDate: "2026-07-01",
    priceStudent: 11,
    priceStaff: 21,
    priceExternal: 31,
    bookingStatus: "waitlist",
    semester: "Summer 2026",
  },
  dance: {
    id: "dance-1",
    slug: "dance-fit",
    title: "Dance Fit",
    provider: "UniSport",
    category: "Dance",
    description: null,
    schedule: [{ day: "Tue", time: "18:00-19:00", location: "Hall 1" }],
    location: "Hall 1",
    bookingUrl: null,
    url: "https://example.com/dance",
    instructor: "Jordan",
    startDate: "2026-04-03",
    endDate: "2026-06-20",
    priceStudent: 5,
    priceStaff: 8,
    priceExternal: 12,
    bookingStatus: "available",
    semester: "Summer 2026",
  },
};

describe("workouts detail catalog transformations", () => {
  test("groups detail records by category and then by exact title", () => {
    const catalog = buildWorkoutDetailCatalog(detailRecords);

    expect(catalog.categories).toEqual(["Dance", "Yoga"]);
    expect(catalog.groups.Yoga.titleGroups).toEqual([
      {
        title: "Sunrise Yoga",
        items: [
          expect.objectContaining({ slug: "sunrise-yoga-a", instructor: "Alex" }),
          expect.objectContaining({ slug: "sunrise-yoga-b", instructor: "Taylor" }),
        ],
      },
    ]);
    expect(catalog.groups.Dance.titleGroups).toEqual([
      {
        title: "Dance Fit",
        items: [expect.objectContaining({ slug: "dance-fit" })],
      },
    ]);
  });

  test("builds sidebar/page metadata from detail category groups", () => {
    const pages = buildWorkoutCategoryPages(buildWorkoutDetailCatalog(detailRecords));

    expect(pages.sidebar).toEqual([
      { text: "Dance", link: "/workouts/dance" },
      { text: "Yoga", link: "/workouts/yoga" },
    ]);
    expect(pages.pages).toEqual([
      expect.objectContaining({
        category: "Dance",
        path: "docs/workouts/dance.md",
        route: "/workouts/dance",
      }),
      expect.objectContaining({
        category: "Yoga",
        path: "docs/workouts/yoga.md",
        route: "/workouts/yoga",
      }),
    ]);
    expect(CATEGORY_INDEX_PATH).toBe("docs/workouts");
  });

  test("translates sidebar labels with fallback to the source category", () => {
    expect(getCategoryLabel("de", "Aqua-Jogging")).toBe("Aqua-Jogging");
    expect(getCategoryLabel("en", "Aqua-Jogging")).toBe("Aqua Jogging");
    expect(getCategoryLabel("zh-CN", "Aqua-Jogging")).toBe("水中慢跑");
    expect(getCategoryLabel("ja", "Aqua-Jogging")).toBe("アクアジョギング");
    expect(getCategoryLabel("ko", "Aqua-Jogging")).toBe("아쿠아 조깅");
    expect(getCategoryLabel("zh-CN", "Calisthenics")).toBe("街头健身");
    expect(getCategoryLabel("zh-CN", "Yachtsegeln Inklusion")).toBe("融合游艇帆船");
    expect(getCategoryLabel("zh-CN", "Ballett, American Technique")).toBe("芭蕾，美式技巧");
    expect(getCategoryLabel("en", "Nonexistent Category")).toBe("Nonexistent Category");
    expect(getCategoryLabel("ja", "Nonexistent Category")).toBe("Nonexistent Category");
    expect(getCategoryLabel("ko", "Nonexistent Category")).toBe("Nonexistent Category");
    expect(getCategoryLabel("zh-CN", "Nonexistent Category")).toBe("Nonexistent Category");
  });

  test("builds VitePress sidebar groups for category families", () => {
    expect(
      localizeSidebarItems("en", [
        { text: "Yoga, Aerial Yoga", link: "/en/workouts/yoga-aerial-yoga" },
        { text: "Yoga, Hatha Yoga", link: "/en/workouts/yoga-hatha-yoga" },
        {
          text: "Yoga, Hatha Yoga (Präventionssport)",
          link: "/en/workouts/yoga-hatha-yoga-praventionssport",
        },
        { text: "Yoga, Vinyasa", link: "/en/workouts/yoga-vinyasa" },
        { text: "Yoga, Wake Up Yoga", link: "/en/workouts/yoga-wake-up-yoga" },
        { text: "Jollen Einstufungssegeln", link: "/en/workouts/jollen-einstufungssegeln" },
        { text: "freies Jollensegeln", link: "/en/workouts/freies-jollensegeln" },
        { text: "Yachtsegeln für Frauen:", link: "/en/workouts/yachtsegeln-fur-frauen" },
        { text: "Yachtsegeln Inklusion:", link: "/en/workouts/yachtsegeln-inklusion" },
        { text: "Yachtsegeln Zweihand:", link: "/en/workouts/yachtsegeln-zweihand" },
        { text: "Aqua-Jogging", link: "/en/workouts/aqua-jogging" },
        { text: "Badminton", link: "/en/workouts/badminton" },
        { text: "Schwimmkurse Kinder", link: "/en/workouts/schwimmkurse-kinder" },
        { text: "Schwimmen", link: "/en/workouts/schwimmen" },
        { text: "Indoor Cycling", link: "/en/workouts/indoor-cycling" },
        { text: "Basketball", link: "/en/workouts/basketball" },
        { text: "Inline-Hockey", link: "/en/workouts/inline-hockey" },
        { text: "Lacrosse", link: "/en/workouts/lacrosse" },
        { text: "Floorball", link: "/en/workouts/floorball" },
        { text: "Fitnessgymnastik für Ältere", link: "/en/workouts/fitnessgymnastik-fur-altere" },
        { text: "Tenniskurse kompakt Semesterferien", link: "/en/workouts/tenniskurse-kompakt-semesterferien" },
        { text: "Tenniskurse Semester", link: "/en/workouts/tenniskurse-semester" },
        { text: "Volleyball", link: "/en/workouts/volleyball" },
        { text: "Tischtennis", link: "/en/workouts/tischtennis" },
        { text: "Aikido", link: "/en/workouts/aikido" },
        { text: "Aerial Hoop", link: "/en/workouts/aerial-hoop" },
        { text: "Akrobatik", link: "/en/workouts/akrobatik" },
        { text: "Boxen", link: "/en/workouts/boxen" },
        { text: "CAU Alumni Cup", link: "/en/workouts/cau-alumni-cup" },
        { text: "Kajakrolle", link: "/en/workouts/kajakrolle" },
        { text: "Kanu", link: "/en/workouts/kanu" },
        { text: "Kanupolo", link: "/en/workouts/kanupolo" },
        { text: "Kinderklettern", link: "/en/workouts/kinderklettern" },
        { text: "Judo", link: "/en/workouts/judo" },
        { text: "Klettern", link: "/en/workouts/klettern" },
        { text: "Klettersport", link: "/en/workouts/klettersport" },
        { text: "Langhanteltraining", link: "/en/workouts/langhanteltraining" },
        { text: "Lauftreff", link: "/en/workouts/lauftreff" },
        { text: "Orientierungslauf", link: "/en/workouts/orientierungslauf" },
        { text: "Parkour", link: "/en/workouts/parkour" },
        { text: "Pilates", link: "/en/workouts/pilates" },
        { text: "Rückenfit", link: "/en/workouts/ruckenfit" },
        { text: "Tai Chi", link: "/en/workouts/tai-chi" },
        { text: "Erste Hilfe Kurs", link: "/en/workouts/erste-hilfe-kurs" },
        { text: "Semestergebühr", link: "/en/workouts/semestergebuhr" },
        { text: "Wellenreiten in Rantum/Sylt", link: "/en/workouts/wellenreiten-in-rantum-sylt" },
        { text: "Kitesurfen am Wochenende", link: "/en/workouts/kitesurfen-am-wochenende" },
        { text: "Vertikaltuch", link: "/en/workouts/vertikaltuch" },
        { text: "Afro Dance", link: "/en/workouts/afro-dance" },
        { text: "Ballett, American Technique", link: "/en/workouts/ballett-american-technique" },
        { text: "Ballett, klassisches Ballett", link: "/en/workouts/ballett-klassisches-ballett" },
        { text: "Forró", link: "/en/workouts/forro" },
        { text: "Gesellschaftstanz", link: "/en/workouts/gesellschaftstanz" },
        { text: "Pole Dance", link: "/en/workouts/pole-dance" },
        { text: "Rock`n`Roll", link: "/en/workouts/rock-n-roll" },
        { text: "Salsa", link: "/en/workouts/salsa" },
        { text: "Tanzsport, Standard und Latein", link: "/en/workouts/tanzsport-standard-und-latein" },
        { text: "Zumba", link: "/en/workouts/zumba" },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "Ball Sports",
        items: [
          { text: "Badminton", link: "/en/workouts/badminton" },
          { text: "Basketball", link: "/en/workouts/basketball" },
          {
            text: "Compact Tennis Courses during Semester Break",
            link: "/en/workouts/tenniskurse-kompakt-semesterferien",
          },
          { text: "Floorball", link: "/en/workouts/floorball" },
          { text: "Inline Hockey", link: "/en/workouts/inline-hockey" },
          { text: "Lacrosse", link: "/en/workouts/lacrosse" },
          { text: "Semester Tennis Courses", link: "/en/workouts/tenniskurse-semester" },
          { text: "Table Tennis", link: "/en/workouts/tischtennis" },
          { text: "Volleyball", link: "/en/workouts/volleyball" },
        ],
      },
      {
        collapsed: false,
        text: "Board Sports",
        items: [
          { text: "Surfing in Rantum / Sylt", link: "/en/workouts/wellenreiten-in-rantum-sylt" },
          { text: "Weekend Kitesurfing", link: "/en/workouts/kitesurfen-am-wochenende" },
        ],
      },
      {
        collapsed: false,
        text: "Combat Sports",
        items: [
          { text: "Aikido", link: "/en/workouts/aikido" },
          { text: "Boxing", link: "/en/workouts/boxen" },
          { text: "Judo", link: "/en/workouts/judo" },
        ],
      },
      {
        collapsed: false,
        text: "Dance",
        items: [
          { text: "Afro Dance", link: "/en/workouts/afro-dance" },
          { text: "Ballet, American Technique", link: "/en/workouts/ballett-american-technique" },
          { text: "Ballet, Classical Ballet", link: "/en/workouts/ballett-klassisches-ballett" },
          { text: "Forro", link: "/en/workouts/forro" },
          { text: "Pole Dance", link: "/en/workouts/pole-dance" },
          { text: "Rock'n'Roll", link: "/en/workouts/rock-n-roll" },
          { text: "Salsa", link: "/en/workouts/salsa" },
          { text: "Social Dance", link: "/en/workouts/gesellschaftstanz" },
          {
            text: "Standard and Latin",
            link: "/en/workouts/tanzsport-standard-und-latein",
          },
          { text: "Zumba", link: "/en/workouts/zumba" },
        ],
      },
      {
        collapsed: false,
        text: "Fitness",
        items: [
          { text: "Back Fitness", link: "/en/workouts/ruckenfit" },
          { text: "Barbell Training", link: "/en/workouts/langhanteltraining" },
          {
            text: "Fitness Gymnastics for Older Adults",
            link: "/en/workouts/fitnessgymnastik-fur-altere",
          },
          { text: "Indoor Cycling", link: "/en/workouts/indoor-cycling" },
        ],
      },
      {
        collapsed: false,
        text: "Dinghy Sailing",
        items: [
          { text: "Open Dinghy Sailing", link: "/en/workouts/freies-jollensegeln" },
          { text: "Placement Sailing", link: "/en/workouts/jollen-einstufungssegeln" },
        ],
      },
      {
        collapsed: false,
        text: "Canoe Sports",
        items: [
          { text: "Canoe Polo", link: "/en/workouts/kanupolo" },
          { text: "Canoeing", link: "/en/workouts/kanu" },
          { text: "Kayak Roll", link: "/en/workouts/kajakrolle" },
        ],
      },
      {
        collapsed: false,
        text: "Climbing",
        items: [
          { text: "Children's Climbing", link: "/en/workouts/kinderklettern" },
          { text: "Climbing", link: "/en/workouts/klettern" },
          { text: "Sport Climbing", link: "/en/workouts/klettersport" },
        ],
      },
      {
        collapsed: false,
        text: "Mind & Body",
        items: [
          { text: "Pilates", link: "/en/workouts/pilates" },
          { text: "Tai Chi", link: "/en/workouts/tai-chi" },
        ],
      },
      {
        collapsed: false,
        text: "Swimming",
        items: [
          { text: "Aqua Jogging", link: "/en/workouts/aqua-jogging" },
          { text: "Children", link: "/en/workouts/schwimmkurse-kinder" },
          { text: "Swimming", link: "/en/workouts/schwimmen" },
        ],
      },
      {
        collapsed: false,
        text: "Services",
        items: [
          { text: "First Aid Course", link: "/en/workouts/erste-hilfe-kurs" },
          { text: "Semester Fee", link: "/en/workouts/semestergebuhr" },
        ],
      },
      {
        collapsed: false,
        text: "Other Sports",
        items: [
          { text: "Acrobatics", link: "/en/workouts/akrobatik" },
          { text: "Aerial Hoop", link: "/en/workouts/aerial-hoop" },
          { text: "Aerial Silks", link: "/en/workouts/vertikaltuch" },
          { text: "CAU Alumni Cup", link: "/en/workouts/cau-alumni-cup" },
          { text: "Orienteering", link: "/en/workouts/orientierungslauf" },
          { text: "Parkour", link: "/en/workouts/parkour" },
          { text: "Running Group", link: "/en/workouts/lauftreff" },
        ],
      },
      {
        collapsed: false,
        text: "Yacht",
        items: [
          { text: "For Women", link: "/en/workouts/yachtsegeln-fur-frauen" },
          { text: "Inclusion", link: "/en/workouts/yachtsegeln-inklusion" },
          { text: "Two-Handed", link: "/en/workouts/yachtsegeln-zweihand" },
        ],
      },
      {
        collapsed: false,
        text: "Yoga",
        items: [
          { text: "Aerial Yoga", link: "/en/workouts/yoga-aerial-yoga" },
          { text: "Hatha Yoga", link: "/en/workouts/yoga-hatha-yoga" },
          {
            text: "Hatha Yoga (Preventive Sport)",
            link: "/en/workouts/yoga-hatha-yoga-praventionssport",
          },
          { text: "Vinyasa", link: "/en/workouts/yoga-vinyasa" },
          { text: "Wake Up Yoga", link: "/en/workouts/yoga-wake-up-yoga" },
        ],
      },
    ]);
  });

  test("builds Chinese sidebar groups with localized family labels", () => {
    expect(
      localizeSidebarItems("zh-CN", [
        { text: "Basketball", link: "/zh-cn/workouts/basketball" },
        { text: "Volleyball", link: "/zh-cn/workouts/volleyball" },
        { text: "Aikido", link: "/zh-cn/workouts/aikido" },
        { text: "Kinderklettern", link: "/zh-cn/workouts/kinderklettern" },
        { text: "Klettern", link: "/zh-cn/workouts/klettern" },
        { text: "Yoga, Aerial Yoga", link: "/zh-cn/workouts/yoga-aerial-yoga" },
        { text: "Schwimmkurse Kinder", link: "/zh-cn/workouts/schwimmkurse-kinder" },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "球类运动",
        items: [
          { text: "排球", link: "/zh-cn/workouts/volleyball" },
          { text: "篮球", link: "/zh-cn/workouts/basketball" },
        ],
      },
      {
        collapsed: false,
        text: "武术搏击",
        items: [{ text: "合气道", link: "/zh-cn/workouts/aikido" }],
      },
      {
        collapsed: false,
        text: "攀岩",
        items: [
          { text: "儿童攀岩", link: "/zh-cn/workouts/kinderklettern" },
          { text: "攀岩", link: "/zh-cn/workouts/klettern" },
        ],
      },
      {
        collapsed: false,
        text: "游泳",
        items: [{ text: "儿童", link: "/zh-cn/workouts/schwimmkurse-kinder" }],
      },
      {
        collapsed: false,
        text: "瑜伽",
        items: [{ text: "空中瑜伽", link: "/zh-cn/workouts/yoga-aerial-yoga" }],
      },
    ]);
  });

  test("builds Japanese and Korean sidebar groups with localized family labels", () => {
    expect(
      localizeSidebarItems("ja", [
        { text: "Basketball", link: "/ja/workouts/basketball" },
        { text: "Volleyball", link: "/ja/workouts/volleyball" },
        { text: "Aikido", link: "/ja/workouts/aikido" },
        { text: "Yoga, Aerial Yoga", link: "/ja/workouts/yoga-aerial-yoga" },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "球技",
        items: [
          { text: "バスケットボール", link: "/ja/workouts/basketball" },
          { text: "バレーボール", link: "/ja/workouts/volleyball" },
        ],
      },
      {
        collapsed: false,
        text: "格闘技",
        items: [{ text: "合気道", link: "/ja/workouts/aikido" }],
      },
      {
        collapsed: false,
        text: "ヨガ",
        items: [{ text: "エアリアルヨガ", link: "/ja/workouts/yoga-aerial-yoga" }],
      },
    ]);

    expect(
      localizeSidebarItems("ko", [
        { text: "Basketball", link: "/ko/workouts/basketball" },
        { text: "Volleyball", link: "/ko/workouts/volleyball" },
        { text: "Aikido", link: "/ko/workouts/aikido" },
        { text: "Yoga, Aerial Yoga", link: "/ko/workouts/yoga-aerial-yoga" },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "구기 종목",
        items: [
          { text: "농구", link: "/ko/workouts/basketball" },
          { text: "배구", link: "/ko/workouts/volleyball" },
        ],
      },
      {
        collapsed: false,
        text: "격투 스포츠",
        items: [{ text: "합기도", link: "/ko/workouts/aikido" }],
      },
      {
        collapsed: false,
        text: "요가",
        items: [{ text: "에어리얼 요가", link: "/ko/workouts/yoga-aerial-yoga" }],
      },
    ]);
  });
});
