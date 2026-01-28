import { useIndexedDB } from '~/plugins/indexeddb.client';
import type { Habit, HabitEntry } from '~/types';
import { isHabitCompleted } from '~/utils/habit';

export const useHabitEntriesStore = defineStore('habitEntries', () => {
  const entries = ref<HabitEntry[]>([]);
  const isLoading = ref(false);

  const db = useIndexedDB();

  const fetchEntriesByDate = async (date: string) => {
    isLoading.value = true;

    try {
      entries.value = await db.getEntriesByDate(date);
    }
    catch (e) {
      entries.value = [];
      throw new Error(`Ошибка загрузки: ${e}`);
    }
    finally {
      isLoading.value = false;
    }
  };

  const upsertEntry = async (data: Omit<HabitEntry, 'id'>) => {
    const existing = entries.value.find(e =>
      e.habitId === data.habitId
      && e.date === data.date,
    );

    if (existing) {
      const index = entries.value.findIndex(e => e.id === existing.id);
      if (index === -1) return;

      const prev = { ...entries.value[index] };
      const updated: HabitEntry = { ...prev, ...data };
      entries.value[index] = updated;

      try {
        await db.updateEntry(updated);
      }
      catch (e) {
        entries.value[index] = prev;
        throw new Error(`Ошибка сохранения: ${e}`);
      }
    }
    else {
      const newEntry: HabitEntry = {
        id: Date.now(),
        ...data,
      };
      entries.value.push(newEntry);
      try {
        await db.addEntry(newEntry);
      }
      catch (e) {
        entries.value = entries.value.filter(e => e.id !== newEntry.id);
        throw new Error(`Ошибка сохранения: ${e}`);
      }
    }
  };

  const deleteEntry = async (id: number) => {
    const prev = [...entries.value];
    entries.value = entries.value.filter(e => e.id !== id);

    try {
      await db.deleteEntry(id);
    }
    catch (e) {
      entries.value = prev;
      throw new Error(`Ошибка удаления: ${e}`);
    }
  };

  const entriesMap = computed(() => {
    const map = new Map<number, HabitEntry>();
    entries.value.forEach(e => map.set(e.habitId, e));
    return map;
  });

  const getProgressStats = (habits: Habit[]) => {
    const total = habits.length;

    const completed = habits.filter(habit =>
      isHabitCompleted(habit, entriesMap.value.get(habit.id)),
    ).length;

    return {
      total,
      completed,
      percent: total ? Math.round((completed / total) * 100) : 0,
    };
  };

  return {
    entries, isLoading, entriesMap,
    fetchEntriesByDate, upsertEntry, deleteEntry,
    getProgressStats,
  };
});
