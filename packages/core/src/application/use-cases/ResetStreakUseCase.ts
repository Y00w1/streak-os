import { StreakRepository } from '../../domain/ports/StreakRepository';
import { resetStreak } from '../../domain/entities/Streak';

/**
 * Use case for resetting a streak.
 */
export class ResetStreakUseCase {
  constructor(private streakRepository: StreakRepository) {}

  async execute(habitId: string): Promise<void> {
    // Find streak for this habit
    const streaks = await this.streakRepository.findByHabitId(habitId);
    if (streaks.length === 0) {
      throw new Error(`No streak found for habit: ${habitId}`);
    }

    const streak = streaks[0];
    if (!streak) {
      throw new Error('Streak not found');
    }

    // Reset the streak
    resetStreak(streak);

    // Persist updated streak
    await this.streakRepository.save(streak);
  }
}
