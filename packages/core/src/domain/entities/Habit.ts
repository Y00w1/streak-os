import { nanoid } from 'nanoid';
import {
  ERROR_HABIT_NAME_EMPTY,
  ERROR_HABIT_INVALID_ID,
  ERROR_HABIT_INVALID_NAME,
  ERROR_HABIT_INVALID_CREATED_AT,
  ERROR_HABIT_INVALID_ARCHIVED,
} from '../Constants';

/**
 * Habit entity represents a trackable activity or behavior.
 */
export interface Habit {
  /** Unique identifier */
  id: string;
  /** Display name of the habit */
  name: string;
  /** Optional description or goal */
  description?: string;
  /** When the habit was created */
  createdAt: number;
  /** Whether the habit is archived (soft delete) */
  archived: boolean;
}

/**
 * Creates a new Habit with generated ID and defaults.
 */
export function createHabit(
  name: string,
  description?: string
): Habit {
  if (!name || name.trim().length === 0) {
    throw new Error(ERROR_HABIT_NAME_EMPTY);
  }

  const habit: Habit = {
    id: nanoid(),
    name: name.trim(),
    createdAt: Date.now(),
    archived: false,
  };

  if (description !== undefined) {
    habit.description = description.trim();
  }

  return habit;
}

/**
 * Serializes a Habit to a plain object for storage.
 */
export function serializeHabit(habit: Habit): Record<string, unknown> {
  return { ...habit };
}

/**
 * Deserializes a Habit from stored data.
 */
export function deserializeHabit(data: Record<string, unknown>): Habit {
  if (typeof data.id !== 'string' || !data.id) {
    throw new Error(ERROR_HABIT_INVALID_ID);
  }
  if (typeof data.name !== 'string' || !data.name) {
    throw new Error(ERROR_HABIT_INVALID_NAME);
  }
  if (typeof data.createdAt !== 'number') {
    throw new Error(ERROR_HABIT_INVALID_CREATED_AT);
  }

  const habit: Habit = {
    id: data.id,
    name: data.name,
    createdAt: data.createdAt,
    archived: typeof data.archived === 'boolean' ? data.archived : false,
  };

  if (typeof data.description === 'string') {
    habit.description = data.description;
  }

  return habit;
}
