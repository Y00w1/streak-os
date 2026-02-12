import type { Streak } from '../entities/Streak';

/**
 * Repository interface for Streak persistence.
 * Defines the contract for streak storage operations.
 */
export interface StreakRepository {
  /**
   * Save a streak (create or update).
   */
  save(streak: Streak): Promise<void>;

  /**
   * Find a streak by ID.
   * Returns null if not found.
   */
  findById(id: string): Promise<Streak | null>;

  /**
   * Find all streaks for a specific habit.
   */
  findByHabitId(habitId: string): Promise<Streak[]>;

  /**
   * Find all streaks.
   */
  findAll(): Promise<Streak[]>;

  /**
   * Delete a streak permanently.
   */
  delete(id: string): Promise<void>;
}
