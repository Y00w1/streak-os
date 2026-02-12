/**
 * DTO for habit data returned to the UI.
 */
export interface HabitDto {
  id: string;
  name: string;
  description?: string | undefined;
  createdAt: number;
  archived: boolean;
}
