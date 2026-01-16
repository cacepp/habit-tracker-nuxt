import { get, set } from 'idb-keyval';
import type { Habit } from '~/types';

enum DBKeys {
  HABITS = 'habits',
}

export default defineNuxtPlugin(() => {
  const indexedDB = {
    async getHabits() {
      const habits = await get<Habit[]>(DBKeys.HABITS);
      return habits || [];
    },

    async saveHabits(habits: Habit[]) {
      await set(DBKeys.HABITS, habits);
    },

    async addHabit(habit: Habit) {
      const habits = await this.getHabits();
      const newHabits = [...habits, habit];
      await this.saveHabits(newHabits);
    },

    async updateHabit(changedHabit: Habit) {
      const habits = await this.getHabits();
      const newHabits = habits.map(habit =>
        habit.id === changedHabit.id ? changedHabit : habit,
      );
      await this.saveHabits(newHabits);
    },

    async deleteHabit(id: number) {
      const habits = await this.getHabits();
      const newHabits = habits.filter(h => h.id !== id);
      await this.saveHabits(newHabits);
    },
  };

  return {
    provide: {
      indexedDB,
    },
  };
});

export const useIndexedDB = () => {
  return useNuxtApp().$indexedDB;
};
