import type { Habit } from '@/domain/entities';
import type { IHabitRepository } from '@/domain/repositories/IHabitRepository';
import { get, set } from 'idb-keyval';
import { injectable } from 'tsyringe';
import { DBKeys } from '@/core/constants';

@injectable()
export class HabitRepository implements IHabitRepository {
  async getAll(): Promise<Habit[]> {
    return (await get<Habit[]>(DBKeys.HABITS)) || [];
  }

  async save(habits: Habit[]): Promise<void> {
    await set(DBKeys.HABITS, structuredClone(habits));
  }

  async add(habit: Habit): Promise<void> {
    const habits = await this.getAll();
    await this.save([...habits, habit]);
  }

  async update(habit: Habit): Promise<void> {
    const habits = await this.getAll();
    await this.save(habits.map(h => h.id === habit.id ? habit : h));
  }

  async delete(id: number): Promise<void> {
    const habits = await this.getAll();
    await this.save(habits.filter(h => h.id !== id));
  }

  async getOrder(): Promise<number[]> {
    return (await get<number[]>(DBKeys.HABITS_ORDER)) || [];
  }

  async saveOrder(order: number[]): Promise<void> {
    await set(DBKeys.HABITS_ORDER, structuredClone(order));
  }
}
