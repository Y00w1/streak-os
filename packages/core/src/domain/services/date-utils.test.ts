import { describe, it, expect } from 'vitest';
import {
  getDateKey,
  parseDate,
  isSameDay,
  isToday,
  getDaysBetween,
  addDays,
  getYesterday,
  isFutureDate,
  normalizeDate,
} from './date-utils';

describe('date-utils', () => {
  describe('getDateKey', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(Date.UTC(2026, 1, 11, 15, 30, 0)); // Feb 11, 2026, 3:30 PM UTC
      expect(getDateKey(date)).toBe('2026-02-11');
    });

    it('should pad single-digit months and days with zero', () => {
      const date = new Date(Date.UTC(2026, 0, 5, 0, 0, 0)); // Jan 5, 2026
      expect(getDateKey(date)).toBe('2026-01-05');
    });

    it('should handle end of year', () => {
      const date = new Date(Date.UTC(2025, 11, 31, 23, 59, 59)); // Dec 31, 2025
      expect(getDateKey(date)).toBe('2025-12-31');
    });
  });

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD to Date at midnight UTC', () => {
      const date = parseDate('2026-02-11');
      expect(date.getUTCFullYear()).toBe(2026);
      expect(date.getUTCMonth()).toBe(1); // February (0-indexed)
      expect(date.getUTCDate()).toBe(11);
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
    });

    it('should be inverse of getDateKey', () => {
      const original = '2026-02-11';
      const date = parseDate(original);
      expect(getDateKey(date)).toBe(original);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day different times', () => {
      const date1 = new Date(Date.UTC(2026, 1, 11, 8, 0, 0));
      const date2 = new Date(Date.UTC(2026, 1, 11, 20, 0, 0));
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date(Date.UTC(2026, 1, 11, 23, 59, 59));
      const date2 = new Date(Date.UTC(2026, 1, 12, 0, 0, 0));
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return true for exact same date', () => {
      const date = new Date(Date.UTC(2026, 1, 11, 12, 0, 0));
      expect(isSameDay(date, date)).toBe(true);
    });
  });

  describe('isToday', () => {
    it('should return true for current date', () => {
      const now = new Date();
      expect(isToday(now)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = addDays(new Date(), -1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = addDays(new Date(), 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('getDaysBetween', () => {
    it('should return 0 for same day', () => {
      const date = new Date(Date.UTC(2026, 1, 11));
      expect(getDaysBetween(date, date)).toBe(0);
    });

    it('should return positive for future date', () => {
      const start = new Date(Date.UTC(2026, 1, 11));
      const end = new Date(Date.UTC(2026, 1, 14));
      expect(getDaysBetween(start, end)).toBe(3);
    });

    it('should return negative for past date', () => {
      const start = new Date(Date.UTC(2026, 1, 14));
      const end = new Date(Date.UTC(2026, 1, 11));
      expect(getDaysBetween(start, end)).toBe(-3);
    });

    it('should handle month boundaries', () => {
      const start = new Date(Date.UTC(2026, 0, 31)); // Jan 31
      const end = new Date(Date.UTC(2026, 1, 1)); // Feb 1
      expect(getDaysBetween(start, end)).toBe(1);
    });

    it('should handle year boundaries', () => {
      const start = new Date(Date.UTC(2025, 11, 31)); // Dec 31, 2025
      const end = new Date(Date.UTC(2026, 0, 1)); // Jan 1, 2026
      expect(getDaysBetween(start, end)).toBe(1);
    });
  });

  describe('addDays', () => {
    it('should add positive days', () => {
      const date = new Date(Date.UTC(2026, 1, 11));
      const result = addDays(date, 5);
      expect(getDateKey(result)).toBe('2026-02-16');
    });

    it('should subtract days with negative input', () => {
      const date = new Date(Date.UTC(2026, 1, 11));
      const result = addDays(date, -5);
      expect(getDateKey(result)).toBe('2026-02-06');
    });

    it('should handle month boundaries', () => {
      const date = new Date(Date.UTC(2026, 1, 28)); // Feb 28
      const result = addDays(date, 1);
      expect(getDateKey(result)).toBe('2026-03-01');
    });

    it('should not mutate original date', () => {
      const date = new Date(Date.UTC(2026, 1, 11));
      const originalKey = getDateKey(date);
      addDays(date, 5);
      expect(getDateKey(date)).toBe(originalKey);
    });
  });

  describe('getYesterday', () => {
    it('should return yesterday\'s date', () => {
      const yesterday = getYesterday();
      const expected = addDays(new Date(), -1);
      expect(getDateKey(yesterday)).toBe(getDateKey(expected));
    });
  });

  describe('isFutureDate', () => {
    it('should return false for today', () => {
      const today = new Date();
      expect(isFutureDate(today)).toBe(false);
    });

    it('should return false for yesterday', () => {
      const yesterday = addDays(new Date(), -1);
      expect(isFutureDate(yesterday)).toBe(false);
    });

    it('should return true for tomorrow', () => {
      const tomorrow = addDays(new Date(), 1);
      expect(isFutureDate(tomorrow)).toBe(true);
    });
  });

  describe('normalizeDate', () => {
    it('should strip time component', () => {
      const date = new Date(Date.UTC(2026, 1, 11, 15, 30, 45, 123));
      const normalized = normalizeDate(date);
      expect(normalized.getUTCHours()).toBe(0);
      expect(normalized.getUTCMinutes()).toBe(0);
      expect(normalized.getUTCSeconds()).toBe(0);
      expect(normalized.getUTCMilliseconds()).toBe(0);
    });

    it('should preserve date', () => {
      const date = new Date(Date.UTC(2026, 1, 11, 15, 30, 45));
      const normalized = normalizeDate(date);
      expect(getDateKey(normalized)).toBe('2026-02-11');
    });
  });
});
