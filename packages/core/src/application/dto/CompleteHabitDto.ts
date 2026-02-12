/**
 * DTO for completing a habit on a specific date.
 */
export interface CompleteHabitDto {
  habitId: string;
  /** Optional date in YYYY-MM-DD format. Defaults to today. */
  date?: string;
  /** Optional note about this completion */
  note?: string;
}
