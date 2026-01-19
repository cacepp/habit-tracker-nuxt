import { type Habit, isBooleanHabit } from '~/types';
import { useIndexedDB } from '~/plugins/indexeddb.client';

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const booleanHabits = computed(() =>
    habits.value.filter(isBooleanHabit),
  );

  const db = useIndexedDB();

  const fetchHabits = async () => {
    isLoading.value = true;
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

    await db.addHabit(newHabit);
    await fetchHabits();
  };

  const updateHabit = async (habit: Habit) => {
    await db.updateHabit(habit);
    await fetchHabits();
  };

  const deleteHabit = async (id: number) => {
    await db.deleteHabit(id);
    await fetchHabits();
  };

  return {
    habits, error, booleanHabits,
    fetchHabits, addHabit, updateHabit, deleteHabit,
  };
});
