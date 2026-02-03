import type { Habit, HabitEntry } from '~/types';

export const isHabitCompleted = (habit: Habit, entry?: HabitEntry): boolean => {
  if (!entry) return false;

  if (habit.type === 'boolean') {
    return entry.value === true;
  }

  return typeof entry.value === 'number' && entry.value >= (habit.target ?? 0);
};

export const isHabitVisibleOnDate = (habit: Habit, date: string) => {
  const created = toDateString(habit.createdAt);
  const deactivated = habit.deactivatedAt ? toDateString(habit.deactivatedAt) : undefined;

  if (date < created) return false;

  if (!habit.isActive) {
    if (deactivated) {
      return date < deactivated;
    }
    return false;
  }

  return true;
};
