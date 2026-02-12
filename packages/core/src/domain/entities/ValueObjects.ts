/**
 * Domain value objects for the streak system.
 */

/**
 * Status of a streak
 */
export type StreakStatus = 'active' | 'broken' | 'frozen';

/**
 * Record of a habit completion on a specific date
 */
export interface CompletionLog {
  /** Date key in YYYY-MM-DD format */
  date: string;
  /** Unix timestamp (milliseconds) when the completion was logged */
  timestamp: number;
  /** Optional note/comment about this completion */
  note?: string;
}

/**
 * Record of a freeze day (day when streak is preserved without completion)
 */
export interface FreezeDayLog {
  /** Date key in YYYY-MM-DD format */
  date: string;
  /** Optional reason for the freeze */
  reason?: string;
}
