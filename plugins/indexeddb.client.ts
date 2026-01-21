import { get, set } from 'idb-keyval';
import type { Habit, HabitEntry } from '~/types';

enum DBKeys {
  HABITS = 'habits',
  ENTRIES = 'entries',
  UNITS = 'units',
}

export default defineNuxtPlugin(() => {
  const indexedDB = {
    // HABITS
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

    // ENTRIES
    async getEntries() {
      const entries = await get<HabitEntry[]>(DBKeys.ENTRIES);
      return entries || [];
    },

    async saveEntries(entries: HabitEntry[]) {
      await set(DBKeys.ENTRIES, entries);
    },

    async getEntriesByDate(date: string) {
      const entries = await this.getEntries();
      return entries.filter(e => e.date === date);
    },

    async addEntry(entry: HabitEntry) {
      const entries = await this.getEntries();
      await this.saveEntries([...entries, entry]);
    },

    async updateEntry(changedEntry: HabitEntry) {
      const entries = await this.getEntries();
      const newEntries = entries.map(e =>
        e.id === changedEntry.id ? changedEntry : e,
      );
      await this.saveEntries(newEntries);
    },

    async deleteEntry(id: number) {
      const entries = await this.getEntries();
      await this.saveEntries(entries.filter(e => e.id !== id));
    },

    // UNITS
    async getUnits(): Promise<string[]> {
      return (await get<string[]>(DBKeys.UNITS)) ?? [];
    },

    async saveUnits(units: string[]) {
      await set(DBKeys.UNITS, units);
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
