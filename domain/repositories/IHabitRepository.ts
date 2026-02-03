import type { Habit } from '@/domain/entities';

export interface IHabitRepository {
  getAll(): Promise<Habit[]>;
  save(habit: Habit[]): Promise<void>;
  add(habit: Habit): Promise<void>;
  update(habit: Habit): Promise<void>;
  delete(id: number): Promise<void>;

  getOrder(): Promise<number[]>;
  saveOrder(order: number[]): Promise<void>;
}
