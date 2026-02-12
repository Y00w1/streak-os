import { StreakRepository } from '../../domain/ports/StreakRepository';
import { addFreezeDay } from '../../domain/entities/Streak';
import { AddFreezeDayDto } from '../dto/AddFreezeDayDto';
import { parseDate } from '../../domain/services/date-utils';

/**
 * Use case for adding a freeze day to a streak.
 */
export class AddFreezeDayUseCase {
  constructor(private streakRepository: StreakRepository) {}

  async execute(dto: AddFreezeDayDto): Promise<void> {
    // Find streak for this habit
    const streaks = await this.streakRepository.findByHabitId(dto.habitId);
    if (streaks.length === 0) {
      throw new Error(`No streak found for habit: ${dto.habitId}`);
    }

    const streak = streaks[0];
    if (!streak) {
      throw new Error('Streak not found');
    }

    // Parse freeze date
    const freezeDate = parseDate(dto.date);

    // Add freeze day (this validates no duplicates)
    addFreezeDay(streak, freezeDate, dto.reason);

    // Persist updated streak
    await this.streakRepository.save(streak);
  }
}
