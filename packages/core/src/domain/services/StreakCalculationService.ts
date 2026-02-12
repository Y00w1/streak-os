import type { Streak } from '../entities/Streak';
import type { StreakStatus } from '../entities/ValueObjects';
import { addDays, getDateKey, getDaysBetween, parseDate } from './DateUtils';

/**
 * Service for calculating streak metrics and status.
 * Pure functions with no side effects.
 */

/**
 * Calculates the current streak count.
 * 
 * Algorithm:
 * - Walk backward from asOfDate (default: today)
 * - Count consecutive days with completion OR freeze
 * - Stop at first gap (missing day without freeze)
 * 
 * @param streak The streak to calculate
 * @param asOfDate Optional reference date (defaults to today)
 * @returns Current streak count
 */
export function calculateCurrentStreak(
  streak: Streak,
  asOfDate: Date = new Date()
): number {
  // If the streak was reset, start counting from reset date
  const startDate = parseDate(streak.startDate);
  const referenceDate = asOfDate;

  // If reference date is before start date, streak is 0
  if (getDaysBetween(startDate, referenceDate) < 0) {
    return 0;
  }

  let count = 0;
  let currentDate = referenceDate;

  // Walk backward from reference date
  while (true) {
    const dateKey = getDateKey(currentDate);

    // Check if this day has completion or freeze
    const hasCompletion = streak.completions.has(dateKey);
    const isFrozen = streak.freezeDays.has(dateKey);

    if (hasCompletion || isFrozen) {
      count++;
      
      // Move to previous day
      currentDate = addDays(currentDate, -1);
      
      // Stop if we've gone before the start date
      if (getDaysBetween(startDate, currentDate) < 0) {
        break;
      }
    } else {
      // Gap found - streak is broken
      break;
    }
  }

  return count;
}

/**
 * Determines the current status of a streak.
 * 
 * - 'active': Streak continues through yesterday or today
 * - 'broken': Gap exists, streak needs restart
 * - 'frozen': Today is marked as a freeze day
 * 
 * @param streak The streak to check
 * @param asOfDate Optional reference date (defaults to today)
 * @returns Current streak status
 */
export function getStreakStatus(
  streak: Streak,
  asOfDate: Date = new Date()
): StreakStatus {
  const today = getDateKey(asOfDate);
  const yesterday = getDateKey(addDays(asOfDate, -1));

  // Check if today is a freeze day
  if (streak.freezeDays.has(today)) {
    return 'frozen';
  }

  // Check if completed today or yesterday
  const completedToday = streak.completions.has(today);
  const completedYesterday = streak.completions.has(yesterday);
  const frozenYesterday = streak.freezeDays.has(yesterday);

  if (completedToday || completedYesterday || frozenYesterday) {
    return 'active';
  }

  // Calculate streak to determine if it's truly broken
  const count = calculateCurrentStreak(streak, asOfDate);
  
  // If count is 0, it's broken
  // If count > 0 but we didn't complete today/yesterday, check if the streak
  // continues up to a recent point
  if (count === 0) {
    return 'broken';
  }

  // If we have a count but didn't complete today/yesterday,
  // the streak is still active if it continues to yesterday
  if (count > 0 && (completedYesterday || frozenYesterday)) {
    return 'active';
  }

  return 'broken';
}

/**
 * Gets the longest streak ever achieved.
 * Scans all completions to find the maximum consecutive sequence.
 * 
 * @param streak The streak to analyze
 * @returns Longest streak count
 */
export function getLongestStreak(streak: Streak): number {
  if (streak.completions.size === 0) {
    return 0;
  }

  // Get all completion dates sorted ascending
  const dates = Array.from(streak.completions.keys())
    .map(key => parseDate(key))
    .sort((a, b) => a.getTime() - b.getTime());

  let maxStreak = 0;
  let currentStreak = 0;
  let previousDate: Date | null = null;

  for (const date of dates) {
    if (previousDate === null) {
      currentStreak = 1;
    } else {
      const daysDiff = getDaysBetween(previousDate, date);
      
      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++;
      } else if (daysDiff > 1) {
        // Gap found - check for freeze days
        let hasGap = false;
        for (let i = 1; i < daysDiff; i++) {
          const intermediateDate = addDays(previousDate, i);
          const intermediateKey = getDateKey(intermediateDate);
          if (!streak.freezeDays.has(intermediateKey)) {
            hasGap = true;
            break;
          }
        }

        if (hasGap) {
          // Real gap - reset streak
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        } else {
          // All intermediate days are frozen - continue streak
          currentStreak += daysDiff;
        }
      }
      // daysDiff === 0 means same day (shouldn't happen with proper validation)
    }

    previousDate = date;
    maxStreak = Math.max(maxStreak, currentStreak);
  }

  return maxStreak;
}
