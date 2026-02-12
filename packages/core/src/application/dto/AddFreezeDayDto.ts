/**
 * DTO for adding a freeze day to a streak.
 */
export interface AddFreezeDayDto {
  habitId: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Optional reason for the freeze */
  reason?: string;
}
