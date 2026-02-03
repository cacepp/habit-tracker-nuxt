export interface HabitEntry {
  id: number;
  habitId: number;
  date: string;
  value: boolean | number;
  note?: string;
}
