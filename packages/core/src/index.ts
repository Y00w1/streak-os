/**
 * @streak-os/core
 * 
 * Core business logic for STREAK-OS.
 * Clean Architecture implementation with domain-driven design.
 */

// Main Service
export { StreakService } from './application/StreakService';

// DTOs
export type { HabitDto } from './application/dto/HabitDto';
export type { StreakStateDto } from './application/dto/StreakStateDto';
export type { CreateHabitDto } from './application/dto/CreateHabitDto';
export type { CreateStreakDto } from './application/dto/CreateStreakDto';
export type { CompleteHabitDto } from './application/dto/CompleteHabitDto';
export type { AddFreezeDayDto } from './application/dto/AddFreezeDayDto';

// Domain Entities
export type { Habit } from './domain/entities/Habit';
export type { Streak } from './domain/entities/Streak';
export type { StreakStatus, CompletionLog, FreezeDayLog } from './domain/entities/value-objects';

// Repository Ports (for dependency injection)
export type { HabitRepository } from './domain/ports/HabitRepository';
export type { StreakRepository } from './domain/ports/StreakRepository';
export type { FileSystem } from './domain/ports/FileSystem';

// Repository Implementations
export { JsonHabitRepository } from './infrastructure/persistence/JsonHabitRepository';
export { JsonStreakRepository } from './infrastructure/persistence/JsonStreakRepository';

// Utility functions (for advanced usage)
export {
  calculateCurrentStreak,
  getStreakStatus,
  getLongestStreak,
} from './domain/services/StreakCalculationService';

export {
  getDateKey,
  parseDate,
  isSameDay,
  isToday,
  getDaysBetween,
  addDays,
} from './domain/services/date-utils';
