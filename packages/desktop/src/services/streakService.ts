import {
  StreakService,
  JsonHabitRepository,
  JsonStreakRepository,
} from '@streak-os/core';
import { InMemoryFileSystem } from './InMemoryFileSystem';

/**
 * Initialize the streak service with in-memory storage.
 * In production, this would use Tauri FS API.
 */
const fileSystem = new InMemoryFileSystem();
const habitRepository = new JsonHabitRepository(fileSystem, '/data');
const streakRepository = new JsonStreakRepository(fileSystem, '/data');

export const streakService = new StreakService(habitRepository, streakRepository);
