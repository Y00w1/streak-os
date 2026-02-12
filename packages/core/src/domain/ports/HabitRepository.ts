import type { Habit } from '../entities/Habit';

/**
 * Repository interface for Habit persistence.
 * Defines the contract for habit storage operations.
 */
export interface HabitRepository {
  /**
   * Save a habit (create or update).
   */
  save(habit: Habit): Promise<void>;

  /**
   * Find a habit by ID.
   * Returns null if not found.
   */
  findById(id: string): Promise<Habit | null>;

  /**
   * Find all habits (including archived).
   */
  findAll(): Promise<Habit[]>;

  /**
   * Find all active (non-archived) habits.
   */
  findActive(): Promise<Habit[]>;

  /**
   * Delete a habit permanently.
   */
  delete(id: string): Promise<void>;
}
