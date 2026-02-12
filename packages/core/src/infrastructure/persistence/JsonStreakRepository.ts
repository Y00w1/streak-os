import type { StreakRepository } from '../../domain/ports/StreakRepository';
import type { FileSystem } from '../../domain/ports/FileSystem';
import type { Streak } from '../../domain/entities/Streak';
import { serializeStreak, deserializeStreak } from '../../domain/entities/Streak';

/**
 * JSON file-based implementation of StreakRepository.
 */
export class JsonStreakRepository implements StreakRepository {
  private readonly filePath: string;
  private cache: Map<string, Streak> | null = null;

  constructor(
    private fileSystem: FileSystem,
    dataDirectory: string
  ) {
    this.filePath = `${dataDirectory}/streaks.json`;
  }

  /**
   * Load all streaks from file into cache.
   */
  private async load(): Promise<Map<string, Streak>> {
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
      const streaks = new Map<string, Streak>();

      if (data && typeof data === 'object' && data.streaks) {
        for (const [id, streakData] of Object.entries(data.streaks)) {
          try {
            const streak = deserializeStreak(streakData as Record<string, unknown>);
            streaks.set(id, streak);
          } catch (err) {
            console.error(`Failed to deserialize streak ${id}:`, err);
          }
        }
      }

      this.cache = streaks;
      return streaks;
    } catch (err) {
      console.error('Failed to parse streaks file:', err);
      this.cache = new Map();
      return this.cache;
    }
  }

  /**
   * Persist all streaks to file.
   */
  private async persist(): Promise<void> {
    if (this.cache === null) {
      await this.load();
    }

    const streaks: Record<string, unknown> = {};
    
    for (const [id, streak] of (this.cache ?? new Map()).entries()) {
      streaks[id] = serializeStreak(streak);
    }

    const data = {
      version: 1,
      streaks,
    };

    const content = JSON.stringify(data, null, 2);
    await this.fileSystem.writeFile(this.filePath, content);
  }

  async save(streak: Streak): Promise<void> {
    await this.load();
    this.cache?.set(streak.id, streak);
    await this.persist();
  }

  async findById(id: string): Promise<Streak | null> {
    const streaks = await this.load();
    return streaks.get(id) ?? null;
  }

  async findByHabitId(habitId: string): Promise<Streak[]> {
    const streaks = await this.load();
    return Array.from(streaks.values()).filter(s => s.habitId === habitId);
  }

  async findAll(): Promise<Streak[]> {
    const streaks = await this.load();
    return Array.from(streaks.values());
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
