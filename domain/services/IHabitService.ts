import type { Habit } from '@/domain/entities';

export interface IHabitService {
  getHabits(): Promise<Habit[]>;
  addHabit(data: Omit<Habit, 'id' | 'createdAt'>, highPriority: boolean): Promise<Habit>;
  updateHabit(habit: Habit): Promise<void>;
  deleteHabit(id: number): Promise<void>;

  deactivateHabit(habit: Habit, date: string): Promise<void>;
  activateHabit(habit: Habit): Promise<void>;

  updateOrder(newOrder: number[]): Promise<void>;
  getOrderedHabits(): Promise<Habit[]>;
}
