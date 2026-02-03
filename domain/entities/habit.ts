export type HabitType = 'boolean' | 'numeric';

export interface Habit {
  id: number;
  name: string;
  type: HabitType;
  target?: number;
  unitId?: number;
  color: string;
  icon: string;
  createdAt: string;
  isActive: boolean;
  deactivatedAt?: string;
}

export function isBooleanHabit(habit: Habit): habit is Habit & { type: 'boolean' } {
  return habit.type === 'boolean';
}

export function isNumericHabit(habit: Habit): habit is Habit & { type: 'numeric'; target: number; unitId: number } {
  return habit.type === 'numeric';
}
