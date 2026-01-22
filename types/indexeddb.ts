import type { Habit, HabitEntry, HabitUnit } from '~/types';

export interface IndexedDBClient {
  getHabits(): Promise<Habit[]>;
  saveHabits(habits: Habit[]): Promise<void>;
  addHabit(habit: Habit): Promise<void>;
  updateHabit(habits: Habit): Promise<void>;
  deleteHabit(id: number): Promise<void>;

  getEntries(): Promise<HabitEntry[]>;
  saveEntries(entries: HabitEntry[]): Promise<void>;
  getEntriesByDate(date: string): Promise<HabitEntry[]>;
  addEntry(entry: HabitEntry): Promise<void>;
  updateEntry(entry: HabitEntry): Promise<void>;
  deleteEntry(id: number): Promise<void>;

  getUnits(): Promise<HabitUnit[]>;
  saveUnits(units: HabitUnit[]): Promise<void>;
}
