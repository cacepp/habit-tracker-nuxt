import type { Habit, HabitEntry } from '~/types';

export const isHabitCompleted = (habit: Habit, entry?: HabitEntry): boolean => {
  if (!entry) return false;

  if (habit.type === 'boolean') {
    return entry.value === true;
  }

  return typeof entry.value === 'number' && entry.value >= (habit.target ?? 0);
};
