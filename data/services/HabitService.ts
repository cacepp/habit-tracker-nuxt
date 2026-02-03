import type { IHabitService } from '@/domain/services/IHabitService';
import { injectable, inject } from 'tsyringe';
import type { IHabitRepository } from '@/domain/repositories/IHabitRepository';
import type { Habit } from '@/domain/entities';

@injectable()
export class HabitService implements IHabitService {
  constructor(
    @inject('IHabitRepository')
    private readonly habitsRepo: IHabitRepository,
  ) {}

  async getHabits(): Promise<Habit[]> {
    return this.habitsRepo.getAll();
  }

  async addHabit(data: Omit<Habit, 'id' | 'createdAt'>, highPriority: boolean): Promise<Habit> {
    const newHabit: Habit = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    const habits = await this.habitsRepo.getAll();
    const order = await this.habitsRepo.getOrder();

    habits.push(newHabit);
    if (highPriority) order.unshift(newHabit.id);
    else order.push(newHabit.id);

    try {
      await this.habitsRepo.add(newHabit);
      await this.habitsRepo.saveOrder(order);
    }
    catch (e) {
      throw new Error(`Ошибка добавления привычки: ${e}`);
    }

    return newHabit;
  }

  async updateHabit(habit: Habit): Promise<void> {
    try {
      await this.habitsRepo.update(habit);
    }
    catch (e) {
      throw new Error(`Ошибка обновления привычки: ${e}`);
    }
  }

  async deleteHabit(id: number): Promise<void> {
    try {
      const order = await this.habitsRepo.getOrder();
      const newOrder = order.filter(hId => hId !== id);

      await this.habitsRepo.delete(id);
      await this.habitsRepo.saveOrder(newOrder);
    }
    catch (e) {
      throw new Error(`Ошибка удаления привычки: ${e}`);
    }
  }

  async deactivateHabit(habit: Habit, date: string): Promise<void> {
    const updated: Habit = {
      ...habit,
      isActive: false,
      deactivatedAt: date,
    };

    try {
      await this.habitsRepo.update(updated);
    }
    catch (e) {
      throw new Error(`Ошибка деактивации привычки: ${e}`);
    }
  }

  async activateHabit(habit: Habit): Promise<void> {
    const updated: Habit = {
      ...habit,
      isActive: true,
      deactivatedAt: undefined,
    };

    try {
      await this.habitsRepo.update(updated);
    }
    catch (e) {
      throw new Error(`Ошибка активации привычки: ${e}`);
    }
  }

  async updateOrder(newOrder: number[]): Promise<void> {
    await this.habitsRepo.saveOrder(newOrder);
  }

  async getOrderedHabits(): Promise<Habit[]> {
    const habits = await this.habitsRepo.getAll();
    const order = await this.habitsRepo.getOrder();

    const map = new Map(habits.map(h => [h.id, h]));

    const ordered = order.map(id => map.get(id)).filter(Boolean) as Habit[];
    const unordered = habits.filter(h => !order.includes(h.id));
    return [...ordered, ...unordered];
  }
}
