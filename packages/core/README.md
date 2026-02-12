# @streak-os/core

Core business logic for STREAK-OS - A clean architecture implementation of the streak tracking domain.

## Overview

This package contains the complete streak tracking engine with:
- **Domain entities** (Habit, Streak)
- **Calculation services** (streak counting, status determination)
- **Use cases** (create, complete, reset)
- **Repository abstractions** (storage-agnostic)
- **Type-safe DTOs** (input/output contracts)

## Architecture

```
src/
├── domain/          # Pure business logic (no dependencies)
│   ├── entities/    # Habit, Streak, value objects
│   ├── services/    # StreakCalculationService, date-utils
│   └── ports/       # Repository interfaces
├── application/     # Use cases and orchestration
│   ├── dto/         # Data transfer objects
│   └── use-cases/   # Business operations
└── infrastructure/  # Implementation details
    └── persistence/ # JSON repositories
```

## Features

✅ Daily streak tracking  
✅ Freeze day mechanics  
✅ Reset functionality  
✅ Backward-walking calculation algorithm  
✅ Timezone-safe date operations  
✅ Type-safe with strict TypeScript  
✅ 52 passing tests  
✅ Zero external dependencies (except nanoid)  

## Installation

```bash
pnpm add @streak-os/core
```

## Quick Start

```typescript
import {
  StreakService,
  JsonHabitRepository,
  JsonStreakRepository,
  FileSystem,
} from '@streak-os/core';

// 1. Implement FileSystem interface
class MyFileSystem implements FileSystem {
  async readFile(path: string) { /* ... */ }
  async writeFile(path: string, content: string) { /* ... */ }
  async exists(path: string) { /* ... */ }
  async deleteFile(path: string) { /* ... */ }
}

// 2. Initialize repositories
const fs = new MyFileSystem();
const habitRepo = new JsonHabitRepository(fs, '/path/to/data');
const streakRepo = new JsonStreakRepository(fs, '/path/to/data');

// 3. Create service
const service = new StreakService(habitRepo, streakRepo);

// 4. Use the API
const habit = await service.createHabit('Daily Coding');
await service.createStreak(habit.id);
await service.completeHabitToday(habit.id);

const state = await service.getStreakState(habit.id);
console.log(`Current streak: ${state.currentStreak} days`);
```

## API Reference

### StreakService

Main application service providing high-level streak operations.

#### Methods

**Habit Management:**
- `createHabit(name, description?)` → Creates a new habit
- `getAllHabits()` → Returns all habits
- `getActiveHabits()` → Returns non-archived habits
- `archiveHabit(habitId)` → Archives a habit
- `deleteHabit(habitId)` → Permanently deletes habit and associated streaks

**Streak Operations:**
- `createStreak(habitId, startDate?)` → Creates streak for habit
- `completeHabitToday(habitId, note?)` → Marks habit as completed today
- `completeHabitOnDate(habitId, date, note?)` → Marks habit as completed on specific date
- `getStreakState(habitId)` → Gets complete streak state with calculations
- `addFreezeDay(habitId, date, reason?)` → Adds a freeze day
- `resetStreak(habitId)` → Resets the streak to zero

### Streak State DTO

```typescript
interface StreakStateDto {
  streakId: string;
  habitId: string;
  habitName: string;
  currentStreak: number;      // Current consecutive days
  longestStreak: number;      // All-time best
  status: 'active' | 'broken' | 'frozen';
  lastCompletionDate: string | null;  // YYYY-MM-DD
  startDate: string;          // YYYY-MM-DD
  totalCompletions: number;
  totalFreezeDays: number;
}
```

## Business Rules

1. **No future completions** - Cannot complete a habit for dates in the future
2. **No duplicate completions** - Each day can only be completed once
3. **Strict daily requirement** - Streak breaks if a day is missed (unless frozen)
4. **Freeze days preserve streaks** - Days marked as frozen count toward streak continuity
5. **Forward-only time** - Calculation walks backward from reference date

## Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Build package
pnpm build
```

## Development

### Scripts

- `pnpm build` - Build the package (outputs to `dist/`)
- `pnpm dev` - Watch mode for development
- `pnpm test` - Run Vitest tests
- `pnpm test:ui` - Run tests with Vitest UI

### TypeScript Configuration

This package uses strict TypeScript settings:
- `exactOptionalPropertyTypes: true`
- `noUncheckedIndexedAccess: true`
- `strict: true`
- `module: esnext`
- `moduleResolution: bundler`

## License

ISC
