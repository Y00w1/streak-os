import { HabitRepository } from '../../domain/ports/HabitRepository';
import { StreakRepository } from '../../domain/ports/StreakRepository';
import { StreakStateDto } from '../dto/StreakStateDto';
import {
  calculateCurrentStreak,
  getStreakStatus,
  getLongestStreak,
} from '../../domain/services/StreakCalculationService';
import { getLastCompletionDate } from '../../domain/entities/Streak';
import { getDateKey } from '../../domain/services/DateUtils';

/**
 * Use case for retrieving the current state of a streak.
 */
export class GetStreakStateUseCase {
  constructor(
    private habitRepository: HabitRepository,
    private streakRepository: StreakRepository
  ) {}

  async execute(habitId: string): Promise<StreakStateDto> {
    // Validate habit exists
    const habit = await this.habitRepository.findById(habitId);
    if (!habit) {
      throw new Error(`Habit not found: ${habitId}`);
    }

    // Find streak for this habit
    const streaks = await this.streakRepository.findByHabitId(habitId);
    if (streaks.length === 0) {
      throw new Error(`No streak found for habit: ${habitId}`);
    }

    const streak = streaks[0];
    if (!streak) {
      throw new Error('Streak not found');
    }

    // Calculate metrics
    const currentStreak = calculateCurrentStreak(streak);
    const longestStreak = getLongestStreak(streak);
    const status = getStreakStatus(streak);
    const lastCompletion = getLastCompletionDate(streak);

    return {
      streakId: streak.id,
      habitId: streak.habitId,
      habitName: habit.name,
      currentStreak,
      longestStreak,
      status,
      lastCompletionDate: lastCompletion ? getDateKey(lastCompletion) : null,
      startDate: streak.startDate,
      totalCompletions: streak.completions.size,
      totalFreezeDays: streak.freezeDays.size,
    };
  }
}
