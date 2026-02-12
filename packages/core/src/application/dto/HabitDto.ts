/**
 * DTO for habit data returned to the UI.
 */
export interface HabitDto {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  archived: boolean;
}
