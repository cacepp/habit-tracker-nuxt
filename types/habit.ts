type HabitType = boolean | number;

export interface Habit {
  id: number;
  name: string;
  type: HabitType;
  target?: number;
  unit?: string;
  color: string;
  createdAt: string;
}

export function isBooleanHabit(habit: Habit): habit is Habit & { type: boolean } {
  return typeof habit.type === 'boolean';
}

export function isNumericHabit(habit: Habit): habit is Habit & { type: number; target: number; unit: string } {
  return typeof habit.type === 'number';
}
