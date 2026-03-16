type ParsedWorkoutDate = {
  day: number;
  month: number;
  year: number;
};

type FormattedWorkoutDate = {
  monthShort: string;
  day: number;
  year: number;
  date: Date;
};

function inferYearFromSemester(month: number, semester?: string): number | null {
  if (!semester) return null;

  const yearMatch = semester.match(/(20\d{2})/);
  if (!yearMatch) return null;

  const baseYear = Number(yearMatch[1]);
  if (Number.isNaN(baseYear)) return null;

  if (/winter/i.test(semester)) {
    return month >= 8 ? baseYear : baseYear + 1;
  }

  if (/summer|sommer/i.test(semester)) {
    return baseYear;
  }

  return baseYear;
}

function parseWorkoutDate(value: string, semester?: string): ParsedWorkoutDate | null {
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3]),
    };
  }

  const dottedMatch = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})?\.?$/);
  if (!dottedMatch) return null;

  const day = Number(dottedMatch[1]);
  const month = Number(dottedMatch[2]);
  const rawYear = dottedMatch[3];
  let year: number | null = null;

  if (rawYear) {
    year = rawYear.length === 2 ? 2000 + Number(rawYear) : Number(rawYear);
  } else {
    year = inferYearFromSemester(month, semester);
  }

  if (!year || Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    return null;
  }

  return { day, month, year };
}

function formatParsedDate(parts: ParsedWorkoutDate, locale = "en-US"): FormattedWorkoutDate {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return {
    monthShort: date.toLocaleString(locale, { month: "short", timeZone: "UTC" }),
    day: date.getUTCDate(),
    year: date.getUTCFullYear(),
    date,
  };
}

function formatLocalizedSingle(display: FormattedWorkoutDate, locale: string): string {
  if (locale === "en-US") {
    return `${display.monthShort} ${display.day}, ${display.year}`;
  }

  return display.date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatLocalizedRange(
  startDisplay: FormattedWorkoutDate,
  endDisplay: FormattedWorkoutDate,
  locale: string,
): string {
  if (locale === "en-US") {
    if (startDisplay.year === endDisplay.year && startDisplay.monthShort === endDisplay.monthShort) {
      return `${startDisplay.monthShort} ${startDisplay.day} - ${endDisplay.day}, ${startDisplay.year}`;
    }

    if (startDisplay.year === endDisplay.year) {
      return `${startDisplay.monthShort} ${startDisplay.day} - ${endDisplay.monthShort} ${endDisplay.day}, ${startDisplay.year}`;
    }

    return `${startDisplay.monthShort} ${startDisplay.day}, ${startDisplay.year} - ${endDisplay.monthShort} ${endDisplay.day}, ${endDisplay.year}`;
  }

  const sameYear = startDisplay.year === endDisplay.year;
  const sameMonth = sameYear && startDisplay.monthShort === endDisplay.monthShort;

  if (locale === "zh-CN") {
    if (sameMonth) {
      return `${startDisplay.year}年${startDisplay.date.getUTCMonth() + 1}月${startDisplay.day}日 - ${endDisplay.day}日`;
    }
    if (sameYear) {
      return `${startDisplay.year}年${startDisplay.date.getUTCMonth() + 1}月${startDisplay.day}日 - ${endDisplay.date.getUTCMonth() + 1}月${endDisplay.day}日`;
    }
  }

  if (locale === "ja-JP") {
    if (sameMonth) {
      return `${startDisplay.year}年${startDisplay.date.getUTCMonth() + 1}月${startDisplay.day}日 - ${endDisplay.day}日`;
    }
    if (sameYear) {
      return `${startDisplay.year}年${startDisplay.date.getUTCMonth() + 1}月${startDisplay.day}日 - ${endDisplay.date.getUTCMonth() + 1}月${endDisplay.day}日`;
    }
  }

  if (locale === "ko-KR") {
    if (sameMonth) {
      return `${startDisplay.year}년 ${startDisplay.date.getUTCMonth() + 1}월 ${startDisplay.day}일 - ${endDisplay.day}일`;
    }
    if (sameYear) {
      return `${startDisplay.year}년 ${startDisplay.date.getUTCMonth() + 1}월 ${startDisplay.day}일 - ${endDisplay.date.getUTCMonth() + 1}월 ${endDisplay.day}일`;
    }
  }

  if (locale === "de-DE") {
    if (sameMonth) {
      return `${startDisplay.day}. - ${endDisplay.day}. ${startDisplay.monthShort} ${startDisplay.year}`;
    }
    if (sameYear) {
      return `${startDisplay.day}. ${startDisplay.monthShort} - ${endDisplay.day}. ${endDisplay.monthShort} ${startDisplay.year}`;
    }
  }

  return `${formatLocalizedSingle(startDisplay, locale)} - ${formatLocalizedSingle(endDisplay, locale)}`;
}

export function formatWorkoutDuration(
  startDate?: string | null,
  endDate?: string | null,
  semester?: string,
): string {
  return formatWorkoutDurationLocalized(startDate, endDate, semester, "en-US");
}

export function formatWorkoutDurationLocalized(
  startDate?: string | null,
  endDate?: string | null,
  semester?: string,
  locale = "en-US",
): string {
  const start = startDate?.trim() ?? "";
  const end = endDate?.trim() ?? "";

  if (start && end) {
    const startParts = parseWorkoutDate(start, semester);
    const endParts = parseWorkoutDate(end, semester);

    if (!startParts || !endParts) {
      return start === end ? start : `${start} to ${end}`;
    }

    const startDisplay = formatParsedDate(startParts, locale);
    const endDisplay = formatParsedDate(endParts, locale);

    return formatLocalizedRange(startDisplay, endDisplay, locale);
  }

  const single = start || end;
  const singleParts = parseWorkoutDate(single, semester);
  if (!singleParts) return single;

  const display = formatParsedDate(singleParts, locale);
  return formatLocalizedSingle(display, locale);
}
