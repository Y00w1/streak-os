import { HabitRepository } from '../../domain/ports/HabitRepository';
import { StreakRepository } from '../../domain/ports/StreakRepository';
import { addCompletion } from '../../domain/entities/Streak';
import { CompleteHabitDto } from '../dto/CompleteHabitDto';
import { parseDate, getDateKey } from '../../domain/services/date-utils';
import { calculateCurrentStreak } from '../../domain/services/StreakCalculationService';

/**
 * Use case for completing a habit on a specific date.
 */
export class CompleteHabitUseCase {
  constructor(
    private habitRepository: HabitRepository,
    private streakRepository: StreakRepository
  ) {}

  async execute(dto: CompleteHabitDto): Promise<{ currentStreak: number }> {
    // Validate habit exists
    const habit = await this.habitRepository.findById(dto.habitId);
    if (!habit) {
      throw new Error(`Habit not found: ${dto.habitId}`);
    }

    // Find active streak for this habit
    const streaks = await this.streakRepository.findByHabitId(dto.habitId);
    if (streaks.length === 0) {
      throw new Error(`No streak found for habit: ${dto.habitId}. Create a streak first.`);
    }

    // Use the first (most recent) streak
    // In future, we might have logic to pick the active one
    const streak = streaks[0];
    if (!streak) {
      throw new Error('Streak not found');
    }

    // Parse completion date or use today
    const completionDate = dto.date ? parseDate(dto.date) : new Date();

    // Add completion to streak (this validates no future dates, no duplicates)
    addCompletion(streak, completionDate, dto.note);

    // Persist updated streak
    await this.streakRepository.save(streak);

    // Calculate and return current streak
    const currentStreak = calculateCurrentStreak(streak);

    return { currentStreak };
  }
}
