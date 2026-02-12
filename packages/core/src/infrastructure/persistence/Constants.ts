/**
 * Infrastructure-level constants for persistence.
 * File names, versions, and related error messages.
 */

// ============================================
// File Names
// ============================================
export const HABITS_FILE_NAME = 'habits.json';
export const STREAKS_FILE_NAME = 'streaks.json';

// ============================================
// Persistence Format
// ============================================
export const DATA_VERSION = 1;

// ============================================
// Error Messages
// ============================================
export const ERROR_PARSE_HABITS_FILE = 'Failed to parse habits file';
export const ERROR_PARSE_STREAKS_FILE = 'Failed to parse streaks file';
export const ERROR_DESERIALIZE_HABIT_TEMPLATE = 'Failed to deserialize habit {id}';
export const ERROR_DESERIALIZE_STREAK_TEMPLATE = 'Failed to deserialize streak {id}';

// ============================================
// Repository Data Structure Keys
// ============================================
export const PAYLOAD_KEY_HABITS = 'habits';
export const PAYLOAD_KEY_STREAKS = 'streaks';
export const PAYLOAD_KEY_VERSION = 'version';
