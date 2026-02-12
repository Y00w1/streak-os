import type { HabitRepository } from '../domain/ports/HabitRepository';
import type { StreakRepository } from '../domain/ports/StreakRepository';
import { CreateHabitUseCase } from './use-cases/CreateHabitUseCase';
import { CreateStreakUseCase } from './use-cases/CreateStreakUseCase';
import { CompleteHabitUseCase } from './use-cases/CompleteHabitUseCase';
import { GetStreakStateUseCase } from './use-cases/GetStreakStateUseCase';
import { AddFreezeDayUseCase } from './use-cases/AddFreezeDayUseCase';
import { ResetStreakUseCase } from './use-cases/ResetStreakUseCase';
import type { HabitDto } from './dto/HabitDto';
import type { StreakStateDto } from './dto/StreakStateDto';

/**
 * Main application service providing a simplified API for streak management.
 * Orchestrates all use cases and provides a clean interface for the UI.
 */
export class StreakService {
  private createHabitUseCase: CreateHabitUseCase;
  private createStreakUseCase: CreateStreakUseCase;
  private completeHabitUseCase: CompleteHabitUseCase;
  private getStreakStateUseCase: GetStreakStateUseCase;
  private addFreezeDayUseCase: AddFreezeDayUseCase;
  private resetStreakUseCase: ResetStreakUseCase;

  constructor(
    private habitRepository: HabitRepository,
    private streakRepository: StreakRepository
  ) {
    // Initialize use cases
    this.createHabitUseCase = new CreateHabitUseCase(habitRepository);
    this.createStreakUseCase = new CreateStreakUseCase(habitRepository, streakRepository);
    this.completeHabitUseCase = new CompleteHabitUseCase(habitRepository, streakRepository);
    this.getStreakStateUseCase = new GetStreakStateUseCase(habitRepository, streakRepository);
    this.addFreezeDayUseCase = new AddFreezeDayUseCase(streakRepository);
    this.resetStreakUseCase = new ResetStreakUseCase(streakRepository);
  }

  /**
   * Create a new habit.
   */
  async createHabit(name: string, description?: string): Promise<HabitDto> {
    const dto = description !== undefined ? { name, description } : { name };
    return this.createHabitUseCase.execute(dto);
  }

  /**
   * Create a new streak for a habit.
   */
  async createStreak(habitId: string, startDate?: string): Promise<{ streakId: string }> {
    const dto = startDate !== undefined ? { habitId, startDate } : { habitId };
    return this.createStreakUseCase.execute(dto);
  }

  /**
   * Complete a habit for today.
   */
  async completeHabitToday(habitId: string, note?: string): Promise<{ currentStreak: number }> {
    const dto = note !== undefined ? { habitId, note } : { habitId };
    return this.completeHabitUseCase.execute(dto);
  }

  /**
   * Complete a habit for a specific date.
   */
  async completeHabitOnDate(
    habitId: string,
    date: string,
    note?: string
  ): Promise<{ currentStreak: number }> {
    const dto = note !== undefined ? { habitId, date, note } : { habitId, date };
    return this.completeHabitUseCase.execute(dto);
  }

  /**
   * Get the current state of a streak for a habit.
   */
  async getStreakState(habitId: string): Promise<StreakStateDto> {
    return this.getStreakStateUseCase.execute(habitId);
  }

  /**
   * Add a freeze day to preserve a streak without completion.
   */
  async addFreezeDay(habitId: string, date: string, reason?: string): Promise<void> {
    const dto = reason !== undefined ? { habitId, date, reason } : { habitId, date };
    return this.addFreezeDayUseCase.execute(dto);
  }

  /**
   * Reset a streak, clearing all completions and freeze days.
   */
  async resetStreak(habitId: string): Promise<void> {
    return this.resetStreakUseCase.execute(habitId);
  }

  /**
   * Get all habits.
   */
  async getAllHabits(): Promise<HabitDto[]> {
    const habits = await this.habitRepository.findAll();
    return habits.map(h => {
      const dto: HabitDto = {
        id: h.id,
        name: h.name,
        createdAt: h.createdAt,
        archived: h.archived,
      };
      if (h.description !== undefined) {
        dto.description = h.description;
      }
      return dto;
    });
  }

  /**
   * Get all active (non-archived) habits.
   */
  async getActiveHabits(): Promise<HabitDto[]> {
    const habits = await this.habitRepository.findActive();
    return habits.map(h => {
      const dto: HabitDto = {
        id: h.id,
        name: h.name,
        createdAt: h.createdAt,
        archived: h.archived,
      };
      if (h.description !== undefined) {
        dto.description = h.description;
      }
      return dto;
    });
  }

  /**
   * Archive a habit (soft delete).
   */
  async archiveHabit(habitId: string): Promise<void> {
    const habit = await this.habitRepository.findById(habitId);
    if (!habit) {
      throw new Error(`Habit not found: ${habitId}`);
    }
    habit.archived = true;
    await this.habitRepository.save(habit);
  }

  /**
   * Unarchive a habit.
   */
  async unarchiveHabit(habitId: string): Promise<void> {
    const habit = await this.habitRepository.findById(habitId);
    if (!habit) {
      throw new Error(`Habit not found: ${habitId}`);
    }
    habit.archived = false;
    await this.habitRepository.save(habit);
  }

  /**
   * Delete a habit permanently.
   */
  async deleteHabit(habitId: string): Promise<void> {
    // Also delete associated streaks
    const streaks = await this.streakRepository.findByHabitId(habitId);
    for (const streak of streaks) {
      await this.streakRepository.delete(streak.id);
    }
    await this.habitRepository.delete(habitId);
  }
}
