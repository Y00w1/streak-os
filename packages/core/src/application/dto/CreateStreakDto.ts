/**
 * DTO for creating a new streak.
 */
export interface CreateStreakDto {
  habitId: string;
  /** Optional start date in YYYY-MM-DD format. Defaults to today. */
  startDate?: string;
}
