import { nanoid } from 'nanoid';
import type { CompletionLog, FreezeDayLog } from './value-objects';
import { getDateKey, isFutureDate, normalizeDate, parseDate } from '../services/date-utils';

/**
 * Streak entity represents a continuous chain of habit completions.
 */
export interface Streak {
  /** Unique identifier */
  id: string;
  /** Reference to the habit being tracked */
  habitId: string;
  /** Date key (YYYY-MM-DD) when the streak started */
  startDate: string;
  /** Map of date keys to completion logs */
  completions: Map<string, CompletionLog>;
  /** Set of date keys for freeze days */
  freezeDays: Set<string>;
  /** Timestamp of last reset (if any) */
  resetAt?: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Creates a new Streak with generated ID and defaults.
 */
export function createStreak(
  habitId: string,
  startDate?: Date
): Streak {
  if (!habitId || habitId.trim().length === 0) {
    throw new Error('Habit ID cannot be empty');
  }

  const start = startDate ? normalizeDate(startDate) : new Date();
  
  return {
    id: nanoid(),
    habitId: habitId.trim(),
    startDate: getDateKey(start),
    completions: new Map(),
    freezeDays: new Set(),
    updatedAt: Date.now(),
  };
}

/**
 * Checks if the streak has a completion on a specific date.
 */
export function isCompletedOn(streak: Streak, date: Date): boolean {
  const dateKey = getDateKey(date);
  return streak.completions.has(dateKey);
}

/**
 * Checks if a specific date is marked as a freeze day.
 */
export function isFrozenOn(streak: Streak, date: Date): boolean {
  const dateKey = getDateKey(date);
  return streak.freezeDays.has(dateKey);
}

/**
 * Gets the last completion date, or null if no completions.
 */
export function getLastCompletionDate(streak: Streak): Date | null {
  if (streak.completions.size === 0) {
    return null;
  }

  const dates = Array.from(streak.completions.keys())
    .map(key => parseDate(key))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort descending

  return dates[0] ?? null;
}

/**
 * Adds a completion to the streak.
 * Throws error if date is in the future or already completed.
 */
export function addCompletion(
  streak: Streak,
  date: Date,
  note?: string
): void {
  if (isFutureDate(date)) {
    throw new Error('Cannot complete habit in the future');
  }

  const dateKey = getDateKey(date);

  if (streak.completions.has(dateKey)) {
    throw new Error(`Habit already completed on ${dateKey}`);
  }

  const log: CompletionLog = note !== undefined
    ? {
        date: dateKey,
        timestamp: Date.now(),
        note: note.trim(),
      }
    : {
        date: dateKey,
        timestamp: Date.now(),
      };

  streak.completions.set(dateKey, log);
  streak.updatedAt = Date.now();
}

/**
 * Adds a freeze day to the streak.
 * Freeze days preserve the streak without requiring completion.
 */
export function addFreezeDay(
  streak: Streak,
  date: Date,
  reason?: string
): void {
  const dateKey = getDateKey(date);

  if (streak.freezeDays.has(dateKey)) {
    throw new Error(`Freeze day already set for ${dateKey}`);
  }

  // Note: We're storing freeze days in a Set, so we lose the reason.
  // For MVP, we'll just track which days are frozen.
  // In future, we could change to Map<string, FreezeDayLog>
  streak.freezeDays.add(dateKey);
  streak.updatedAt = Date.now();
}

/**
 * Resets the streak, clearing all completions and freeze days.
 */
export function resetStreak(streak: Streak): void {
  streak.completions.clear();
  streak.freezeDays.clear();
  streak.resetAt = Date.now();
  streak.updatedAt = Date.now();
}

/**
 * Serializes a Streak to a plain object for storage.
 * Converts Map/Set to JSON-compatible structures.
 */
export function serializeStreak(streak: Streak): Record<string, unknown> {
  return {
    id: streak.id,
    habitId: streak.habitId,
    startDate: streak.startDate,
    completions: Array.from(streak.completions.entries()).map(([key, log]) => ({
      key,
      log,
    })),
    freezeDays: Array.from(streak.freezeDays),
    resetAt: streak.resetAt,
    updatedAt: streak.updatedAt,
  };
}

/**
 * Deserializes a Streak from stored data.
 * Converts JSON structures back to Map/Set.
 */
export function deserializeStreak(data: Record<string, unknown>): Streak {
  if (typeof data.id !== 'string' || !data.id) {
    throw new Error('Invalid streak: missing id');
  }
  if (typeof data.habitId !== 'string' || !data.habitId) {
    throw new Error('Invalid streak: missing habitId');
  }
  if (typeof data.startDate !== 'string' || !data.startDate) {
    throw new Error('Invalid streak: missing startDate');
  }
  if (typeof data.updatedAt !== 'number') {
    throw new Error('Invalid streak: missing updatedAt');
  }

  const completionsArray = Array.isArray(data.completions) ? data.completions : [];
  const completions = new Map<string, CompletionLog>();
  
  for (const item of completionsArray) {
    if (
      typeof item === 'object' &&
      item !== null &&
      'key' in item &&
      'log' in item &&
      typeof item.key === 'string'
    ) {
      const log = item.log as CompletionLog;
      completions.set(item.key, log);
    }
  }

  const freezeDaysArray = Array.isArray(data.freezeDays) ? data.freezeDays : [];
  const freezeDays = new Set<string>(
    freezeDaysArray.filter((item): item is string => typeof item === 'string')
  );

  const streak: Streak = {
    id: data.id,
    habitId: data.habitId,
    startDate: data.startDate,
    completions,
    freezeDays,
    updatedAt: data.updatedAt,
  };

  if (typeof data.resetAt === 'number') {
    streak.resetAt = data.resetAt;
  }

  return streak;
}
