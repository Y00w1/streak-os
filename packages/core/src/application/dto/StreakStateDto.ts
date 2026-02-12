import type { StreakStatus } from '../../domain/entities/ValueObjects';

/**
 * DTO representing the complete state of a streak for UI consumption.
 */
export interface StreakStateDto {
  /** Streak ID */
  streakId: string;
  /** Associated habit ID */
  habitId: string;
  /** Habit name */
  habitName: string;
  /** Current streak count */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Current status */
  status: StreakStatus;
  /** Last completion date (YYYY-MM-DD) or null */
  lastCompletionDate: string | null;
  /** When the streak started (YYYY-MM-DD) */
  startDate: string;
  /** Total number of completions */
  totalCompletions: number;
  /** Total number of freeze days used */
  totalFreezeDays: number;
}
