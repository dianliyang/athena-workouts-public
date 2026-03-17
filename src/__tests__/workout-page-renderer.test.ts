import { describe, expect, test } from "vitest";
import {
  renderCategoryPage,
  renderRow,
} from "../../docs/.vitepress/workouts/workoutPageRenderer";
import type { WorkoutDetailItem } from "../lib/workoutsCatalog";

const baseItem: WorkoutDetailItem = {
  id: "spin-1",
  slug: "spin-1",
  title: "Spin Intervals",
  provider: "UniSport",
  category: "Cycling",
  description: null,
  schedule: [
    { day: "Mon", time: "18:00-19:00", location: "Studio A" },
    { day: "Wed", time: "18:00-19:00", location: "Studio A" },
  ],
  location: ["Studio A, Main Campus Hall"],
  url: "https://example.com/workouts/spin",
};

describe("workout page renderer", () => {
  test("renders a locale-aware Wikipedia link in the category page header", () => {
    const markdown = renderCategoryPage("ja", "Beachvolleyball", []);

    expect(markdown).toContain('class="workout-page-wikipedia"');
    expect(markdown).toContain("https://ja.wikipedia.org/wiki/Special:Search?search=");
    expect(markdown).toContain(encodeURIComponent("ビーチバレーボール"));
    expect(markdown).toContain(">Wikipedia<");
  });

  test("renders the whole card as a link when the item has a url", () => {
    const html = renderRow(baseItem, "en");

    expect(html).toContain(
      '<a class="workout-row" href="https://example.com/workouts/spin" target="_blank" rel="noopener noreferrer">',
    );
    expect(html).not.toContain("<div class=\"workout-row\">");
  });

  test("matches detailed top-level locations onto schedule mini-cards", () => {
    const html = renderRow(baseItem, "en");

    expect(html).toContain("Studio A, Main Campus Hall");
    expect(html).not.toContain("Open booking");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("uses the top-level detailed location directly for a single schedule", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Mon", time: "18:00-19:00", location: "Studio A" }],
        location: ["Main Campus Hall, Room 2"],
      },
      "en",
    );

    expect(html).toContain("Main Campus Hall, Room 2");
    expect(html).not.toContain("Studio A</div>");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("falls back to the schedule location for a single schedule when top-level location is missing", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Mon", time: "18:00-19:00", location: "Studio A" }],
        location: [],
      },
      "en",
    );

    expect(html).toContain("Studio A");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("uses the top-level location directly for a single schedule even when the schedule location is empty", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Mon", time: "18:00-19:00", location: "" }],
      },
      "en",
    );

    expect(html).toContain("Studio A, Main Campus Hall");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("renders booking status with the VitePress Badge component", () => {
    const html = renderRow(
      {
        ...baseItem,
        bookingStatus: "waitlist",
      },
      "en",
    );

    expect(html).toContain('<Badge type="warning" text="Waitlist" />');
    expect(html).not.toContain("workout-status-dot");
  });

  test("localizes raw tbd booking statuses", () => {
    const html = renderRow(
      {
        ...baseItem,
        bookingStatus: "tbd",
      },
      "ja",
    );

    expect(html).toContain('<Badge type="info" text="状態未定" />');
    expect(html).not.toContain('text="tbd"');
  });

  test("uses prerequisite-oriented labels for restricted statuses", () => {
    const english = renderRow(
      {
        ...baseItem,
        bookingStatus: "restricted",
      },
      "en",
    );
    const japanese = renderRow(
      {
        ...baseItem,
        bookingStatus: "restricted waitlist",
      },
      "ja",
    );

    expect(english).toContain(
      '<Badge type="warning" text="Eligibility required" />',
    );
    expect(japanese).toContain(
      '<Badge type="warning" text="キャンセル待ち（参加条件あり）" />',
    );
  });

  test("normalizes underscored restricted waitlist statuses for Chinese", () => {
    const chinese = renderRow(
      {
        ...baseItem,
        bookingStatus: "restricted_waitlist",
      },
      "zh-CN",
    );

    expect(chinese).toContain('<Badge type="warning" text="候补（需满足条件）" />');
    expect(chinese).not.toContain('text="restricted waitlist"');
  });

  test("localizes see text booking statuses for Chinese", () => {
    const chinese = renderRow(
      {
        ...baseItem,
        bookingStatus: "See text",
      },
      "zh-CN",
    );

    expect(chinese).toContain('<Badge type="info" text="见说明" />');
    expect(chinese).not.toContain('text="See text"');
  });

  test("renders multiple schedules as mini-cards inside the same session group", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Mon", time: "18:00-19:00", location: "Studio A" },
          { day: "Wed", time: "18:00-19:00", location: "Studio B" },
          { day: "Fri", time: "20:00-21:00", location: "Studio C" },
        ],
        location: [
          "Studio A, Main Campus Hall",
          "Studio B, West Wing",
          "Studio C, North Annex",
        ],
        instructor: "Alex",
      },
      "en",
    );

    expect(html).toContain("workout-schedule-cards");
    expect(html.match(/class="workout-schedule-card"/g)).toHaveLength(3);
    expect(html).toContain("Mon 18:00-19:00");
    expect(html).toContain("Wed 18:00-19:00");
    expect(html).toContain("Fri 20:00-21:00");
    expect(html).toContain("Studio A, Main Campus Hall");
    expect(html).toContain("Studio B, West Wing");
    expect(html).toContain("Studio C, North Annex");
    expect(html).toContain("Alex");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("uses all top-level locations directly for a single schedule", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Mon", time: "18:00-19:00", location: "Studio A" }],
        location: ["Studio A, Main Campus Hall", "Overflow Building, Room 3"],
      },
      "en",
    );

    expect(html).toContain("Studio A, Main Campus Hall");
    expect(html).toContain("Overflow Building, Room 3");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("matches similar detailed addresses to the correct mini-card", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          {
            day: "Mon",
            time: "18:00-19:00",
            location: "Beach-Volleyballplatz 1",
          },
          {
            day: "Wed",
            time: "18:00-19:00",
            location: "Beach-Volleyballplatz 2",
          },
        ],
        location: [
          "Beach-Volleyballplatz 1, Olshausenstr. 70, 24118 Kiel",
          "Beach-Volleyballplatz 2, Olshausenstr.70, 24118 Kiel",
        ],
      },
      "en",
    );

    expect(html).toContain(
      "Beach-Volleyballplatz 1, Olshausenstr. 70, 24118 Kiel",
    );
    expect(html).toContain(
      "Beach-Volleyballplatz 2, Olshausenstr.70, 24118 Kiel",
    );
    expect(html).not.toContain(
      "Beach-Volleyballplatz 1, Olshausenstr. 70, Beach-Volleyballplatz 2, Olshausenstr.70, 24118 Kiel",
    );
    expect(html).not.toContain('workout-detail is-location');
  });

  test("localizes schedule-time phrases like 'nur am 06:05.' inside schedule cards", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Wed", time: "nur am 06:05.", location: "Studio A" }],
      },
      "zh-CN",
    );

    expect(html).toContain("周三 仅限 06:05.");
    expect(html).not.toContain("周三 nur am 06:05.");
  });

  test("groups continuous schedule entries with the same time and resolved location", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Thu", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Fri", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Sat", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Sun", time: "09:00-18:00", location: "SZ Schilks" },
        ],
        location: ["SZ Schilks, Soling 34, 24159 Kiel"],
      },
      "zh-CN",
    );

    expect(html.match(/class="workout-schedule-card"/g)).toHaveLength(1);
    expect(html).toContain("周四至周日 09:00-18:00");
    expect(html).toContain("SZ Schilks, Soling 34, 24159 Kiel");
  });

  test("groups non-continuous schedule entries with the same time and resolved location", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Mon", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Wed", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Fri", time: "09:00-18:00", location: "SZ Schilks" },
        ],
        location: ["SZ Schilks, Soling 34, 24159 Kiel"],
      },
      "zh-CN",
    );

    expect(html.match(/class="workout-schedule-card"/g)).toHaveLength(1);
    expect(html).toContain("周一、周三、周五 09:00-18:00");
    expect(html).toContain("SZ Schilks, Soling 34, 24159 Kiel");
  });

  test("uses the single top-level location for all mini-cards when only one exists", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Mon", time: "18:00-19:00", location: "Studio A" },
          { day: "Wed", time: "20:00-21:00", location: "Studio B" },
        ],
        location: ["Main Campus Hall, Room 2"],
      },
      "en",
    );

    expect(html.match(/Main Campus Hall, Room 2/g)).toHaveLength(2);
    expect(html).not.toContain("Studio A</div>");
    expect(html).not.toContain("Studio B</div>");
  });

  test("does not collapse different locations when top-level details are packed into one semicolon-separated string", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Tue", time: "16:00-18:00", location: "SH tief Bahn 1" },
          { day: "Tue", time: "16:00-18:00", location: "SH tief Bahn 2" },
          { day: "Tue", time: "16:00-18:00", location: "SH tief Bahn 3" },
        ],
        location: [
          "SH tief Bahn 1, ,; SH tief Bahn 2, ,; SH tief Bahn 3, ,",
        ],
      },
      "zh-CN",
    );

    expect(html.match(/class="workout-schedule-card"/g)).toHaveLength(3);
    expect(html).toContain("周二 16:00-18:00");
    expect(html).toContain("SH tief Bahn 1");
    expect(html).toContain("SH tief Bahn 2");
    expect(html).toContain("SH tief Bahn 3");
    expect(html).not.toContain("SH tief Bahn 1, ,");
    expect(html).not.toContain("SH tief Bahn 2, ,");
    expect(html).not.toContain("SH tief Bahn 3, ,");
    expect(html).not.toContain("周二、周二、周二 16:00-18:00");
  });
});
