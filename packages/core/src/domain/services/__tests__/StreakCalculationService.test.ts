import { describe, it, expect, beforeEach } from 'vitest';
import { createStreak, addCompletion, addFreezeDay, resetStreak } from '../../entities/Streak';
import {
  calculateCurrentStreak,
  getStreakStatus,
  getLongestStreak,
} from '../StreakCalculationService';
import { addDays, getDateKey, parseDate } from '../DateUtils';

describe('StreakCalculationService', () => {
  const testHabitId = 'test-habit-123';
  const baseDate = new Date(Date.UTC(2024, 0, 1, 12, 0, 0)); // Jan 1, 2024 (in the past)

  describe('calculateCurrentStreak', () => {
    it('should return 0 for empty streak', () => {
      const streak = createStreak(testHabitId, baseDate);
      expect(calculateCurrentStreak(streak, baseDate)).toBe(0);
    });

    it('should return 1 for single day completion', () => {
      const streak = createStreak(testHabitId, baseDate);
      addCompletion(streak, baseDate);
      expect(calculateCurrentStreak(streak, baseDate)).toBe(1);
    });

    it('should count consecutive completions', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      // Complete 5 consecutive days
      for (let i = 0; i < 5; i++) {
        const date = addDays(baseDate, i);
        addCompletion(streak, date);
      }
      
      const asOfDate = addDays(baseDate, 4); // Check on day 5
      expect(calculateCurrentStreak(streak, asOfDate)).toBe(5);
    });

    it('should stop at gaps in completion', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      // Day 1, 2, 3: complete
      addCompletion(streak, baseDate);
      addCompletion(streak, addDays(baseDate, 1));
      addCompletion(streak, addDays(baseDate, 2));
      
      // Day 4: skip (gap)
      
      // Day 5, 6: complete
      addCompletion(streak, addDays(baseDate, 4));
      addCompletion(streak, addDays(baseDate, 5));
      
      const asOfDate = addDays(baseDate, 5); // Check on day 6
      expect(calculateCurrentStreak(streak, asOfDate)).toBe(2); // Only days 5 and 6
    });

    it('should count freeze days as part of streak', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      // Day 1, 2: complete
      addCompletion(streak, baseDate);
      addCompletion(streak, addDays(baseDate, 1));
      
      // Day 3: freeze
      addFreezeDay(streak, addDays(baseDate, 2));
      
      // Day 4, 5: complete
      addCompletion(streak, addDays(baseDate, 3));
      addCompletion(streak, addDays(baseDate, 4));
      
      const asOfDate = addDays(baseDate, 4); // Check on day 5
      expect(calculateCurrentStreak(streak, asOfDate)).toBe(5);
    });

    it('should handle mixed completions and freezes', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      addCompletion(streak, baseDate); // Day 1
      addFreezeDay(streak, addDays(baseDate, 1)); // Day 2
      addCompletion(streak, addDays(baseDate, 2)); // Day 3
      addFreezeDay(streak, addDays(baseDate, 3)); // Day 4
      addFreezeDay(streak, addDays(baseDate, 4)); // Day 5
      
      const asOfDate = addDays(baseDate, 4);
      expect(calculateCurrentStreak(streak, asOfDate)).toBe(5);
    });

    it('should return 0 when reference date is before start date', () => {
      const startDate = addDays(baseDate, 5);
      const streak = createStreak(testHabitId, startDate);
      addCompletion(streak, startDate);
      
      const asOfDate = baseDate; // Before start
      expect(calculateCurrentStreak(streak, asOfDate)).toBe(0);
    });

    it('should handle same-day start and completion', () => {
      const streak = createStreak(testHabitId, baseDate);
      addCompletion(streak, baseDate);
      
      expect(calculateCurrentStreak(streak, baseDate)).toBe(1);
    });

    it('should not count future completions', () => {
      const streak = createStreak(testHabitId, baseDate);
      addCompletion(streak, baseDate);
      
      const asOfDate = addDays(baseDate, -1); // Yesterday
      expect(calculateCurrentStreak(streak, asOfDate)).toBe(0);
    });

    it('should handle long streaks correctly', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      // Complete 100 consecutive days
      for (let i = 0; i < 100; i++) {
        addCompletion(streak, addDays(baseDate, i));
      }
      
      const asOfDate = addDays(baseDate, 99);
      expect(calculateCurrentStreak(streak, asOfDate)).toBe(100);
    });

    it('should stop at first gap when walking backward', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      // Old completions
      addCompletion(streak, baseDate);
      addCompletion(streak, addDays(baseDate, 1));
      
      // Gap on day 3
      
      // Recent completions
      addCompletion(streak, addDays(baseDate, 3));
      addCompletion(streak, addDays(baseDate, 4));
      addCompletion(streak, addDays(baseDate, 5));
      
      const asOfDate = addDays(baseDate, 5);
      expect(calculateCurrentStreak(streak, asOfDate)).toBe(3); // Days 4, 5, 6
    });
  });

  describe('getStreakStatus', () => {
    it('should return "broken" for empty streak', () => {
      const streak = createStreak(testHabitId, baseDate);
      expect(getStreakStatus(streak, baseDate)).toBe('broken');
    });

    it('should return "active" when completed today', () => {
      const streak = createStreak(testHabitId, baseDate);
      addCompletion(streak, baseDate);
      
      expect(getStreakStatus(streak, baseDate)).toBe('active');
    });

    it('should return "active" when completed yesterday', () => {
      const streak = createStreak(testHabitId, baseDate);
      const yesterday = addDays(baseDate, -1);
      addCompletion(streak, yesterday);
      
      expect(getStreakStatus(streak, baseDate)).toBe('active');
    });

    it('should return "frozen" when today is a freeze day', () => {
      const streak = createStreak(testHabitId, baseDate);
      addCompletion(streak, addDays(baseDate, -1)); // Yesterday
      addFreezeDay(streak, baseDate); // Today
      
      expect(getStreakStatus(streak, baseDate)).toBe('frozen');
    });

    it('should return "broken" when last completion was 2+ days ago', () => {
      const streak = createStreak(testHabitId, baseDate);
      const twoDaysAgo = addDays(baseDate, -2);
      addCompletion(streak, twoDaysAgo);
      
      expect(getStreakStatus(streak, baseDate)).toBe('broken');
    });

    it('should return "active" when yesterday was frozen', () => {
      const streak = createStreak(testHabitId, baseDate);
      const yesterday = addDays(baseDate, -1);
      addCompletion(streak, addDays(baseDate, -2)); // Day before yesterday
      addFreezeDay(streak, yesterday);
      
      expect(getStreakStatus(streak, baseDate)).toBe('active');
    });
  });

  describe('getLongestStreak', () => {
    it('should return 0 for empty streak', () => {
      const streak = createStreak(testHabitId, baseDate);
      expect(getLongestStreak(streak)).toBe(0);
    });

    it('should return 1 for single completion', () => {
      const streak = createStreak(testHabitId, baseDate);
      addCompletion(streak, baseDate);
      
      expect(getLongestStreak(streak)).toBe(1);
    });

    it('should find longest consecutive sequence', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      // First sequence: 3 days
      addCompletion(streak, baseDate);
      addCompletion(streak, addDays(baseDate, 1));
      addCompletion(streak, addDays(baseDate, 2));
      
      // Gap
      
      // Second sequence: 5 days (longest)
      for (let i = 5; i < 10; i++) {
        addCompletion(streak, addDays(baseDate, i));
      }
      
      // Gap
      
      // Third sequence: 2 days
      addCompletion(streak, addDays(baseDate, 12));
      addCompletion(streak, addDays(baseDate, 13));
      
      expect(getLongestStreak(streak)).toBe(5);
    });

    it('should count freeze days in longest streak', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      // 7-day sequence with mix of completions and freezes
      addCompletion(streak, baseDate);
      addCompletion(streak, addDays(baseDate, 1));
      addFreezeDay(streak, addDays(baseDate, 2));
      addFreezeDay(streak, addDays(baseDate, 3));
      addCompletion(streak, addDays(baseDate, 4));
      addCompletion(streak, addDays(baseDate, 5));
      addCompletion(streak, addDays(baseDate, 6));
      
      expect(getLongestStreak(streak)).toBe(7);
    });

    it('should handle non-consecutive completions', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      addCompletion(streak, baseDate);
      addCompletion(streak, addDays(baseDate, 3)); // Gap of 2 days
      addCompletion(streak, addDays(baseDate, 7)); // Gap of 3 days
      
      expect(getLongestStreak(streak)).toBe(1);
    });

    it('should handle reset streaks', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      // Build a streak
      for (let i = 0; i < 10; i++) {
        addCompletion(streak, addDays(baseDate, i));
      }
      
      // Reset
      resetStreak(streak);
      
      // New shorter streak
      addCompletion(streak, addDays(baseDate, 15));
      addCompletion(streak, addDays(baseDate, 16));
      
      // Should still find the longest ever (10) because we scan all completions
      // Actually, after reset, completions are cleared, so longest should be 2
      expect(getLongestStreak(streak)).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle out-of-order completions', () => {
      const streak = createStreak(testHabitId, baseDate);
      
      // Add completions in non-chronological order
      addCompletion(streak, addDays(baseDate, 2));
      addCompletion(streak, baseDate);
      addCompletion(streak, addDays(baseDate, 1));
      
      expect(calculateCurrentStreak(streak, addDays(baseDate, 2))).toBe(3);
    });

    it('should handle leap year dates', () => {
      const leapDay = new Date(Date.UTC(2024, 1, 29)); // Feb 29, 2024
      const streak = createStreak(testHabitId, leapDay);
      
      addCompletion(streak, leapDay);
      addCompletion(streak, addDays(leapDay, 1)); // March 1
      
      expect(calculateCurrentStreak(streak, addDays(leapDay, 1))).toBe(2);
    });

    it('should handle year boundaries', () => {
      const newYearsEve = new Date(Date.UTC(2025, 11, 31));
      const streak = createStreak(testHabitId, newYearsEve);
      
      addCompletion(streak, newYearsEve);
      addCompletion(streak, new Date(Date.UTC(2026, 0, 1))); // Jan 1, 2026
      
      expect(calculateCurrentStreak(streak, new Date(Date.UTC(2026, 0, 1)))).toBe(2);
    });
  });
});
