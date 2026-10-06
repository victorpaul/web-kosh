/* Job periods: dates are stored as "YYYY-MM" (or "YYYY"), durations are computed, never typed by hand. */

interface YearMonth {
  year: number;
  /* 1–12; undefined when only the year is known */
  month?: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parse(value: string): YearMonth {
  const [year, month] = value.split('-').map(Number);
  return { year, month: month || undefined };
}

function format(ym: YearMonth): string {
  return ym.month ? `${MONTHS[ym.month - 1]} ${ym.year}` : String(ym.year);
}

export function formatPeriod(start: string, end: string | null): string {
  return `${format(parse(start))} – ${end ? format(parse(end)) : 'present'}`;
}

/* Inclusive month count (Feb–Sep 2021 is 8 months); null when the start month is unknown. */
export function monthsWorked(start: string, end: string | null, today = new Date()): number | null {
  const from = parse(start);
  const to = end ? parse(end) : { year: today.getFullYear(), month: today.getMonth() + 1 };
  if (!from.month || !to.month) return null;
  return (to.year - from.year) * 12 + (to.month - from.month) + 1;
}

export function formatDuration(months: number | null): string {
  if (months === null || months <= 0) return '';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  if (!years) return plural(rest, 'month');
  return rest ? `${plural(years, 'year')} ${plural(rest, 'month')}` : plural(years, 'year');
}
