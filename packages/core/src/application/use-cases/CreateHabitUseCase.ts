import { HabitRepository } from '../../domain/ports/HabitRepository';
import { createHabit } from '../../domain/entities/Habit';
import { CreateHabitDto } from '../dto/CreateHabitDto';
import { HabitDto } from '../dto/HabitDto';

/**
 * Use case for creating a new habit.
 */
export class CreateHabitUseCase {
  constructor(private habitRepository: HabitRepository) {}

  async execute(dto: CreateHabitDto): Promise<HabitDto> {
    // Validate input
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Habit name is required');
    }

    // Create habit entity
    const habit = createHabit(dto.name, dto.description);

    // Persist
    await this.habitRepository.save(habit);

    // Return DTO
    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      createdAt: habit.createdAt,
      archived: habit.archived,
    };
  }
}
