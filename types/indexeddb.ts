import type { Habit } from '~/types/habit';

export interface IndexedDBClient {
  getHabits(): Promise<Habit[]>;
  saveHabits(habits: Habit[]): Promise<void>;
  addHabit(habit: Habit): Promise<void>;
  updateHabit(habits: Habit): Promise<void>;
  deleteHabit(id: number): Promise<void>;
}
