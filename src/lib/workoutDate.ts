type ParsedWorkoutDate = {
  day: number;
  month: number;
  year: number;
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

function formatParsedDate(parts: ParsedWorkoutDate): { month: string; day: number; year: number } {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return {
    month: date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
    day: date.getUTCDate(),
    year: date.getUTCFullYear(),
  };
}

export function formatWorkoutDuration(
  startDate?: string | null,
  endDate?: string | null,
  semester?: string,
): string {
  const start = startDate?.trim() ?? "";
  const end = endDate?.trim() ?? "";

  if (start && end) {
    const startParts = parseWorkoutDate(start, semester);
    const endParts = parseWorkoutDate(end, semester);

    if (!startParts || !endParts) {
      return start === end ? start : `${start} to ${end}`;
    }

    const startDisplay = formatParsedDate(startParts);
    const endDisplay = formatParsedDate(endParts);

    if (startDisplay.year === endDisplay.year && startDisplay.month === endDisplay.month) {
      return `${startDisplay.month} ${startDisplay.day} - ${endDisplay.day}, ${startDisplay.year}`;
    }

    if (startDisplay.year === endDisplay.year) {
      return `${startDisplay.month} ${startDisplay.day} - ${endDisplay.month} ${endDisplay.day}, ${startDisplay.year}`;
    }

    return `${startDisplay.month} ${startDisplay.day}, ${startDisplay.year} - ${endDisplay.month} ${endDisplay.day}, ${endDisplay.year}`;
  }

  const single = start || end;
  const singleParts = parseWorkoutDate(single, semester);
  if (!singleParts) return single;

  const display = formatParsedDate(singleParts);
  return `${display.month} ${display.day}, ${display.year}`;
}
