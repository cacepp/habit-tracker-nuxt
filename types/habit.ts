export type HabitType = 'boolean' | 'numeric';

export interface HabitUnit {
  id: number;
  name: string;
}

export interface Habit {
  id: number;
  name: string;
  type: HabitType;
  target?: number;
  unitId?: number;
  color: string;
  createdAt: string;
}

export function isBooleanHabit(habit: Habit): habit is Habit & { type: 'boolean' } {
  return habit.type === 'boolean';
}

export function isNumericHabit(habit: Habit): habit is Habit & { type: 'numeric'; target: number; unit: string } {
  return habit.type === 'numeric';
}
