import type { Habit } from '~/types';
import { useIndexedDB } from '~/plugins/indexeddb.client';

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([]);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  const db = useIndexedDB();

  const fetchHabits = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      habits.value = await db.getHabits();
    }
    catch (e) {
      error.value = `Ошибка загрузки: ${e}`;
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

  return {
    habits, error, isLoading,
    fetchHabits, addHabit, updateHabit, deleteHabit,
  };
});
