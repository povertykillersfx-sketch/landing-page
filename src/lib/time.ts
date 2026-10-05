export function safeTimeZone(timeZone: string | undefined): string {
  const value = timeZone?.trim() || "UTC";
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return value;
  } catch {
    return "UTC";
  }
}

function partsInZone(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map = Object.fromEntries(dtf.formatToParts(date).map((part) => [part.type, part.value]));
  let hour = Number(map.hour);
  let day = Number(map.day);
  let month = Number(map.month);
  let year = Number(map.year);
  if (hour === 24) {
    hour = 0;
    const next = addCalendarDays(year, month, day, 1);
    year = next.year;
    month = next.month;
    day = next.day;
  }
  return {
    year,
    month,
    day,
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: String(map.weekday),
  };
}

export function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = partsInZone(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - date.getTime();
}

export function addCalendarDays(year: number, month: number, day: number, delta: number) {
  const next = new Date(Date.UTC(year, month - 1, day + delta));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

export function zonedMidnightUtc(year: number, month: number, day: number, timeZone: string): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const first = new Date(guess.getTime() - getTimeZoneOffsetMs(guess, timeZone));
  const secondOffset = getTimeZoneOffsetMs(first, timeZone);
  return new Date(guess.getTime() - secondOffset);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function periodStarts(now: Date, timeZone: string) {
  const zone = safeTimeZone(timeZone);
  const parts = partsInZone(now, zone);
  const today = zonedMidnightUtc(parts.year, parts.month, parts.day, zone);
  const dow = WEEKDAYS.indexOf(parts.weekday);
  const mondayOffset = dow === 0 ? 6 : Math.max(dow - 1, 0);
  const weekDate = addCalendarDays(parts.year, parts.month, parts.day, -mondayOffset);
  const week = zonedMidnightUtc(weekDate.year, weekDate.month, weekDate.day, zone);
  const month = zonedMidnightUtc(parts.year, parts.month, 1, zone);
  return { today, week, month };
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function formatDateTime(iso: string, timeZone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: safeTimeZone(timeZone),
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
