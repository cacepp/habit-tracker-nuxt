import { get, set } from 'idb-keyval';
import type { Habit, HabitEntry, HabitUnit, IndexedDBClient } from '~/types';

enum DBKeys {
  HABITS = 'habits',
  HABITS_ORDER = 'habitsOrder',
  ENTRIES = 'entries',
  UNITS = 'units',
}

export default defineNuxtPlugin(() => {
  const indexedDB: IndexedDBClient = {
    // HABITS
    async getHabits() {
      const habits = await get<Habit[]>(DBKeys.HABITS);
      return habits || [];
    },

    async saveHabits(habits: Habit[]) {
      await set(DBKeys.HABITS, structuredClone(toRaw(habits)));
    },

    async addHabit(habit: Habit) {
      const habits = await this.getHabits();
      const newHabits = [...habits, structuredClone(toRaw(habit))];
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
      await this.saveHabits(habits.filter(h => h.id !== id));

      const entries = await this.getEntries();
      await this.saveEntries(entries.filter(e => e.habitId !== id));
    },

    // ORDER
    async getHabitsOrder(): Promise<number[]> {
      return (await get<number[]>(DBKeys.HABITS_ORDER)) || [];
    },

    async saveHabitsOrder(order: number[]) {
      await set(DBKeys.HABITS_ORDER, structuredClone(toRaw(order)));
    },

    // ENTRIES
    async getEntries() {
      const entries = await get<HabitEntry[]>(DBKeys.ENTRIES);
      return entries || [];
    },

    async getEntriesByDate(date: string) {
      const entries = await this.getEntries();
      return entries.filter(e => e.date === date);
    },

    async getEntriesInRange(start: string, end: string) {
      const entries = await this.getEntries();
      return entries.filter(e => e.date >= start && e.date <= end);
    },

    async saveEntries(entries: HabitEntry[]) {
      await set(DBKeys.ENTRIES, entries);
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
    async getUnits(): Promise<HabitUnit[]> {
      return (await get<HabitUnit[]>(DBKeys.UNITS)) ?? [];
    },

    async saveUnits(units: HabitUnit[]) {
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
