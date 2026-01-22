import type { Habit, HabitUnit } from '~/types';
import { useIndexedDB } from '~/plugins/indexeddb.client';

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([]);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);
  const units = ref<HabitUnit[]>([]);

  const db = useIndexedDB();

  const fetchHabits = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      habits.value = await db.getHabits();
    }
    catch (e) {
      error.value = `Ошибка загрузки: ${e}`;
      console.log(error.value);
      habits.value = [];
    }
    finally {
      isLoading.value = false;
    }
  };

  const addHabit = async (data: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    habits.value.push(newHabit);

    try {
      await db.addHabit(newHabit);
    }
    catch (e) {
      habits.value = habits.value.filter(h => h.id !== newHabit.id);
      throw e;
    }
  };

  const updateHabit = async (habit: Habit) => {
    const index = habits.value.findIndex(h => h.id === habit.id);
    if (index !== -1) habits.value[index] = habit;
    await db.updateHabit(habit);
  };

  const deleteHabit = async (id: number) => {
    habits.value = habits.value.filter(h => h.id !== id);
    await db.deleteHabit(id);
  };

  const fetchUnits = async () => {
    units.value = await db.getUnits();
  };

  const addUnit = async (name: string) => {
    if (units.value.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      error.value = 'Ошибка: единица измерения с таким именем уже существует';
      console.log(error.value);
      return;
    }
    const newUnit: HabitUnit = { id: Date.now(), name };
    units.value.push(newUnit);
    await db.saveUnits(units.value.map(u => ({ ...u })));
  };

  const updateUnit = async (id: number, name: string) => {
    if (
      units.value.some(
        u => u.name.toLowerCase() === name.toLowerCase() && u.id !== id,
      )
    ) {
      error.value = 'Ошибка: единица измерения с таким именем уже существует';
      return;
    }

    const unit = units.value.find(u => u.id === id);
    if (!unit) return;
    unit.name = name;
    await db.saveUnits(units.value.map(u => ({ ...u })));
  };

  const deleteUnit = async (id: number) => {
    const count = habits.value.filter(h => h.unitId === id).length;

    if (count > 0) {
      error.value = `Привычек с такой единицей: ${count}`;
      console.log(error.value);
      return;
    }

    units.value = units.value.filter(u => u.id !== id);
    await db.saveUnits(units.value.map(u => ({ ...u })));
  };

  return {
    habits, error, isLoading, units,
    fetchHabits, addHabit, updateHabit, deleteHabit,
    fetchUnits, addUnit, updateUnit, deleteUnit,
  };
});
