import type { SidebarLocale } from "./workoutSidebarI18n";
export type PageLocaleCopy = {
  categoryTitle: string;
  variantSingular: string;
  variantPlural: string;
  providerLabel: string;
  locationLabel: string;
  instructorLabel: string;
  durationLabel: string;
  sessionSingular: string;
  sessionPlural: string;
  openBookingLabel: string;
  opensLabel: string;
  scheduleTbd: string;
  priceTbd: string;
  statusTbd: string;
  priceLabels: {
    student: string;
    staff: string;
    external: string;
    externalReduced: string;
  };
  statusLabels: Record<string, string>;
  dateLocale: string;
};

export const pageLocaleCopy: Record<SidebarLocale, PageLocaleCopy> = {
  de: {
    categoryTitle: "Workout",
    variantSingular: "Variante",
    variantPlural: "Varianten",
    providerLabel: "Anbieter",
    locationLabel: "Ort",
    instructorLabel: "Leitung",
    durationLabel: "Zeitraum",
    sessionSingular: "Termin",
    sessionPlural: "Termine",
    openBookingLabel: "Buchung öffnen",
    opensLabel: "Öffnet",
    scheduleTbd: "Zeitplan offen",
    priceTbd: "Preis offen",
    statusTbd: "Status offen",
    priceLabels: {
      student: "Studierende",
      staff: "Mitarbeitende",
      external: "Extern",
      externalReduced: "Extern ermäßigt",
    },
    statusLabels: {
      available: "Verfügbar",
      scheduled: "Geplant",
      waitlist: "Warteliste",
      restricted: "Eingeschränkt",
      "restricted waitlist": "Warteliste (eingeschränkt)",
      closed: "Geschlossen",
      canceled: "Abgesagt",
      see_text: "Siehe Text",
    },
    dateLocale: "de-DE",
  },
  en: {
    categoryTitle: "Workout",
    variantSingular: "variant",
    variantPlural: "variants",
    providerLabel: "Provider",
    locationLabel: "Location",
    instructorLabel: "Instructor",
    durationLabel: "Duration",
    sessionSingular: "session",
    sessionPlural: "sessions",
    openBookingLabel: "Open booking",
    opensLabel: "Opens",
    scheduleTbd: "Schedule TBD",
    priceTbd: "Price TBD",
    statusTbd: "Status TBD",
    priceLabels: {
      student: "Student",
      staff: "Staff",
      external: "External",
      externalReduced: "Ext. Reduced",
    },
    statusLabels: {
      available: "Available",
      scheduled: "Scheduled",
      waitlist: "Waitlist",
      restricted: "Restricted",
      "restricted waitlist": "Waitlist (restricted)",
      closed: "Closed",
      canceled: "Canceled",
      see_text: "See text",
    },
    dateLocale: "en-US",
  },
  ja: {
    categoryTitle: "ワークアウト",
    variantSingular: "件のコース",
    variantPlural: "件のコース",
    providerLabel: "提供元",
    locationLabel: "場所",
    instructorLabel: "担当",
    durationLabel: "期間",
    sessionSingular: "回",
    sessionPlural: "回",
    openBookingLabel: "予約ページを開く",
    opensLabel: "受付開始",
    scheduleTbd: "日程未定",
    priceTbd: "料金未定",
    statusTbd: "状態未定",
    priceLabels: {
      student: "学生",
      staff: "スタッフ",
      external: "学外",
      externalReduced: "学外割引",
    },
    statusLabels: {
      available: "受付中",
      scheduled: "予定",
      waitlist: "キャンセル待ち",
      restricted: "制限あり",
      "restricted waitlist": "キャンセル待ち（制限あり）",
      closed: "受付終了",
      canceled: "中止",
      see_text: "本文参照",
    },
    dateLocale: "ja-JP",
  },
  ko: {
    categoryTitle: "운동",
    variantSingular: "개 강좌",
    variantPlural: "개 강좌",
    providerLabel: "제공처",
    locationLabel: "장소",
    instructorLabel: "강사",
    durationLabel: "기간",
    sessionSingular: "회",
    sessionPlural: "회",
    openBookingLabel: "예약 열기",
    opensLabel: "오픈",
    scheduleTbd: "일정 미정",
    priceTbd: "요금 미정",
    statusTbd: "상태 미정",
    priceLabels: {
      student: "학생",
      staff: "직원",
      external: "외부",
      externalReduced: "외부 할인",
    },
    statusLabels: {
      available: "예약 가능",
      scheduled: "예정",
      waitlist: "대기자 명단",
      restricted: "제한됨",
      "restricted waitlist": "대기자 명단 (제한됨)",
      closed: "마감",
      canceled: "취소",
      see_text: "본문 참조",
    },
    dateLocale: "ko-KR",
  },
  "zh-CN": {
    categoryTitle: "运动",
    variantSingular: " 个项目",
    variantPlural: " 个项目",
    providerLabel: "提供方",
    locationLabel: "地点",
    instructorLabel: "教练",
    durationLabel: "时长",
    sessionSingular: "次课",
    sessionPlural: "次课",
    openBookingLabel: "打开报名",
    opensLabel: "开放时间",
    scheduleTbd: "时间待定",
    priceTbd: "价格待定",
    statusTbd: "状态待定",
    priceLabels: {
      student: "学生",
      staff: "员工",
      external: "校外",
      externalReduced: "校外优惠",
    },
    statusLabels: {
      available: "可报名",
      scheduled: "即将开放",
      waitlist: "候补",
      restricted: "受限",
      "restricted waitlist": "候补（受限）",
      closed: "已关闭",
      canceled: "已取消",
      see_text: "见说明",
    },
    dateLocale: "zh-CN",
  },
};

// ── Weekday labels ────────────────────────────────────────────────────────────

export const weekdayLabels: Record<SidebarLocale, Record<string, string>> = {
  de: {
    tägl: "tägl.",
    "tägl.": "tägl.",
    "Sa-So": "Sa-So",
    "Mon-Fri": "Mo-Fr",
    "Mo-Fr": "Mo-Fr",
    Mon: "Mo",
    Mo: "Mo",
    Tue: "Di",
    Di: "Di",
    Wed: "Mi",
    Mi: "Mi",
    Thu: "Do",
    Do: "Do",
    Fri: "Fr",
    Fr: "Fr",
    Sat: "Sa",
    Sa: "Sa",
    Sun: "So",
    So: "So",
  },
  en: {
    tägl: "Daily",
    "tägl.": "Daily",
    "Sa-So": "Sat-Sun",
    "Mon-Fri": "Mon-Fri",
    "Mo-Fr": "Mon-Fri",
    Mon: "Mon",
    Mo: "Mon",
    Tue: "Tue",
    Di: "Tue",
    Wed: "Wed",
    Mi: "Wed",
    Thu: "Thu",
    Do: "Thu",
    Fri: "Fri",
    Fr: "Fri",
    Sat: "Sat",
    Sa: "Sat",
    Sun: "Sun",
    So: "Sun",
  },
  ja: {
    tägl: "毎日",
    "tägl.": "毎日",
    "Sa-So": "土-日",
    "Mon-Fri": "月-金",
    "Mo-Fr": "月-金",
    Mon: "月",
    Mo: "月",
    Tue: "火",
    Di: "火",
    Wed: "水",
    Mi: "水",
    Thu: "木",
    Do: "木",
    Fri: "金",
    Fr: "金",
    Sat: "土",
    Sa: "土",
    Sun: "日",
    So: "日",
  },
  ko: {
    tägl: "매일",
    "tägl.": "매일",
    "Sa-So": "토-일",
    "Mon-Fri": "월-금",
    "Mo-Fr": "월-금",
    Mon: "월",
    Mo: "월",
    Tue: "화",
    Di: "화",
    Wed: "수",
    Mi: "수",
    Thu: "목",
    Do: "목",
    Fri: "금",
    Fr: "금",
    Sat: "토",
    Sa: "토",
    Sun: "일",
    So: "일",
  },
  "zh-CN": {
    tägl: "每日",
    "tägl.": "每日",
    "Sa-So": "周六至周日",
    "Mon-Fri": "周一至周五",
    "Mo-Fr": "周一至周五",
    Mon: "周一",
    Mo: "周一",
    Tue: "周二",
    Di: "周二",
    Wed: "周三",
    Mi: "周三",
    Thu: "周四",
    Do: "周四",
    Fri: "周五",
    Fr: "周五",
    Sat: "周六",
    Sa: "周六",
    Sun: "周日",
    So: "周日",
  },
};
export function getCopy(locale: SidebarLocale): PageLocaleCopy {
  return pageLocaleCopy[locale];
}

export function localizeWeekday(value: string, locale: SidebarLocale): string {
  const trimmed = value.trim();
  const direct = weekdayLabels[locale][trimmed];
  if (direct) return direct;

  // Handle ranges like "Sat-Sun" or "Mo-Fr"
  if (trimmed.includes("-")) {
    const parts = trimmed.split("-");
    return parts
      .map((p) => localizeWeekday(p, locale))
      .join(locale === "ja" || locale === "ko" || locale === "zh-CN" ? "〜" : "-");
  }

  return trimmed;
}

