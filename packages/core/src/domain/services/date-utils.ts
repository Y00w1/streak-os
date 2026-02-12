/**
 * Date utility functions for streak calculations.
 * All functions use UTC normalization to avoid timezone issues.
 */

/**
 * Converts a Date to a normalized date key (YYYY-MM-DD format).
 * Uses UTC to avoid timezone issues.
 */
export function getDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a date key (YYYY-MM-DD) into a Date object.
 * Returns a Date at midnight UTC.
 */
export function parseDate(key: string): Date {
  const parts = key.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid date key: ${key}`);
  }
  
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Checks if two dates represent the same day (ignoring time).
 */
export function isSameDay(a: Date, b: Date): boolean {
  return getDateKey(a) === getDateKey(b);
}

/**
 * Checks if a date is today.
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Gets the number of calendar days between two dates.
 * Returns positive number if end is after start, negative if before.
 */
export function getDaysBetween(start: Date, end: Date): number {
  const startKey = getDateKey(start);
  const endKey = getDateKey(end);
  const startDate = parseDate(startKey);
  const endDate = parseDate(endKey);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Adds a specified number of days to a date.
 * Returns a new Date object.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Gets yesterday's date.
 */
export function getYesterday(): Date {
  return addDays(new Date(), -1);
}

/**
 * Checks if a date is in the future.
 */
export function isFutureDate(date: Date): boolean {
  return getDaysBetween(new Date(), date) > 0;
}

/**
 * Normalizes a date to midnight UTC for consistent comparisons.
 */
export function normalizeDate(date: Date): Date {
  return parseDate(getDateKey(date));
}
