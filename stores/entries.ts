import { useIndexedDB } from '~/plugins/indexeddb.client';
import type { HabitEntry } from '~/types';

export const useHabitEntriesStore = defineStore('habitEntries', () => {
  const entries = ref<HabitEntry[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const db = useIndexedDB();

  const fetchEntriesByDate = async (date: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      entries.value = await db.getEntriesByDate(date);
    }
    catch (e) {
      error.value = `Ошибка загрузки: ${e}`;
      entries.value = [];
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
      const updated: HabitEntry = {
        ...existing,
        ...data,
      };

      entries.value = entries.value.map(e =>
        e.id === updated.id ? updated : e,
      );
      await db.updateEntry(updated);
    }
    else {
      const newEntry: HabitEntry = {
        id: Date.now(),
        ...data,
      };
      entries.value.push(newEntry);
      await db.addEntry(newEntry);
    }
  };

  const deleteEntry = async (id: number) => {
    entries.value = entries.value.filter(e => e.id !== id);
    await db.deleteEntry(id);
  };

  return {
    entries, isLoading, error,
    fetchEntriesByDate, upsertEntry, deleteEntry,
  };
});
