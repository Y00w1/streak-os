import type { HabitRepository } from '../../domain/ports/HabitRepository';
import type { FileSystem } from '../../domain/ports/FileSystem';
import type { Habit } from '../../domain/entities/Habit';
import { serializeHabit, deserializeHabit } from '../../domain/entities/Habit';
import {
  HABITS_FILE_NAME,
  DATA_VERSION,
  ERROR_PARSE_HABITS_FILE,
  ERROR_DESERIALIZE_HABIT_TEMPLATE,
  PAYLOAD_KEY_HABITS,
  PAYLOAD_KEY_VERSION,
} from './Constants';

/**
 * JSON file-based implementation of HabitRepository.
 */
export class JsonHabitRepository implements HabitRepository {
  private readonly filePath: string;
  private cache: Map<string, Habit> | null = null;

  constructor(
    private fileSystem: FileSystem,
    dataDirectory: string
  ) {
    this.filePath = `${dataDirectory}/${HABITS_FILE_NAME}`;
  }

  /**
   * Load all habits from file into cache.
   */
  private async load(): Promise<Map<string, Habit>> {
    if (this.cache !== null) {
      return this.cache;
    }

    const content = await this.fileSystem.readFile(this.filePath);
    
    if (!content) {
      // File doesn't exist yet - return empty map
      this.cache = new Map();
      return this.cache;
    }

    try {
      const data = JSON.parse(content);
      const habits = new Map<string, Habit>();

      if (data && typeof data === 'object' && data[PAYLOAD_KEY_HABITS]) {
        for (const [id, habitData] of Object.entries(data[PAYLOAD_KEY_HABITS])) {
          try {
            const habit = deserializeHabit(habitData as Record<string, unknown>);
            habits.set(id, habit);
          } catch (err) {
            console.error(ERROR_DESERIALIZE_HABIT_TEMPLATE.replace('{id}', id), err);
          }
        }
      }

      this.cache = habits;
      return habits;
    } catch (err) {
      console.error(ERROR_PARSE_HABITS_FILE, err);
      this.cache = new Map();
      return this.cache;
    }
  }

  /**
   * Persist all habits to file.
   */
  private async persist(): Promise<void> {
    if (this.cache === null) {
      await this.load();
    }

    const habits: Record<string, unknown> = {};
    
    for (const [id, habit] of (this.cache ?? new Map()).entries()) {
      habits[id] = serializeHabit(habit);
    }

    const data = {
      [PAYLOAD_KEY_VERSION]: DATA_VERSION,
      [PAYLOAD_KEY_HABITS]: habits,
    };

    const content = JSON.stringify(data, null, 2);
    await this.fileSystem.writeFile(this.filePath, content);
  }

  async save(habit: Habit): Promise<void> {
    await this.load();
    this.cache?.set(habit.id, habit);
    await this.persist();
  }

  async findById(id: string): Promise<Habit | null> {
    const habits = await this.load();
    return habits.get(id) ?? null;
  }

  async findAll(): Promise<Habit[]> {
    const habits = await this.load();
    return Array.from(habits.values());
  }

  async findActive(): Promise<Habit[]> {
    const all = await this.findAll();
    return all.filter(h => !h.archived);
  }

  async delete(id: string): Promise<void> {
    await this.load();
    this.cache?.delete(id);
    await this.persist();
  }

  /**
   * Clear cache to force reload on next operation.
   */
  clearCache(): void {
    this.cache = null;
  }
}
