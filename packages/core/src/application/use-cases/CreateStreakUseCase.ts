import { HabitRepository } from '../../domain/ports/HabitRepository';
import { StreakRepository } from '../../domain/ports/StreakRepository';
import { createStreak } from '../../domain/entities/Streak';
import { CreateStreakDto } from '../dto/CreateStreakDto';
import { parseDate } from '../../domain/services/date-utils';

/**
 * Use case for creating a new streak for a habit.
 */
export class CreateStreakUseCase {
  constructor(
    private habitRepository: HabitRepository,
    private streakRepository: StreakRepository
  ) {}

  async execute(dto: CreateStreakDto): Promise<{ streakId: string }> {
    // Validate habit exists
    const habit = await this.habitRepository.findById(dto.habitId);
    if (!habit) {
      throw new Error(`Habit not found: ${dto.habitId}`);
    }

    // Parse start date if provided
    const startDate = dto.startDate ? parseDate(dto.startDate) : new Date();

    // Create streak entity
    const streak = createStreak(dto.habitId, startDate);

    // Persist
    await this.streakRepository.save(streak);

    return { streakId: streak.id };
  }
}
