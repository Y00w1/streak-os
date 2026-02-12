/**
 * Domain-level constants for the streak system.
 * All error messages and magic strings are centralized here.
 */

// Date format constant for documentation
export const DATE_KEY_FORMAT = 'YYYY-MM-DD';

// Milliseconds for date calculations
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
export const DATE_PARTS_EXPECTED_COUNT = 3;

// ============================================
// Habit Entity Error Messages
// ============================================
export const ERROR_HABIT_NAME_EMPTY = 'Habit name cannot be empty';
export const ERROR_HABIT_INVALID_ID = 'Invalid habit: missing id';
export const ERROR_HABIT_INVALID_NAME = 'Invalid habit: missing name';
export const ERROR_HABIT_INVALID_CREATED_AT = 'Invalid habit: missing createdAt';
export const ERROR_HABIT_INVALID_ARCHIVED = 'Invalid habit: missing archived';

// ============================================
// Streak Entity Error Messages
// ============================================
export const ERROR_STREAK_HABIT_ID_EMPTY = 'Habit ID cannot be empty';
export const ERROR_STREAK_INVALID_ID = 'Invalid streak: missing id';
export const ERROR_STREAK_INVALID_HABIT_ID = 'Invalid streak: missing habitId';
export const ERROR_STREAK_INVALID_START_DATE = 'Invalid streak: missing startDate';
export const ERROR_STREAK_INVALID_COMPLETIONS = 'Invalid streak: invalid completions';
export const ERROR_STREAK_INVALID_FREEZE_DAYS = 'Invalid streak: invalid freezeDays';
export const ERROR_STREAK_INVALID_UPDATED_AT = 'Invalid streak: missing updatedAt';

// ============================================
// Business Rule Error Messages
// ============================================
export const ERROR_FUTURE_COMPLETION = 'Cannot complete a habit for a future date';
export const ERROR_DUPLICATE_COMPLETION = 'Already completed for this date';
export const ERROR_DUPLICATE_FREEZE = 'Already frozen for this date';

// ============================================
// Date Utilities Error Messages
// ============================================
export const ERROR_INVALID_DATE_KEY_TEMPLATE = 'Invalid date key: {key}';

// ============================================
// Streak Status Values
// ============================================
export const STREAK_STATUS_ACTIVE = 'active' as const;
export const STREAK_STATUS_BROKEN = 'broken' as const;
export const STREAK_STATUS_FROZEN = 'frozen' as const;

// ============================================
// Console Messages
// ============================================
export const ERROR_DESERIALIZE_HABIT_TEMPLATE = 'Failed to deserialize habit {id}';
export const ERROR_DESERIALIZE_STREAK_TEMPLATE = 'Failed to deserialize streak {id}';
