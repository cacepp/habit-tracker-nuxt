import { useDI } from '@/core/di/provider';
import type { IEntryService } from '@/domain/services/IEntryService';
import type { Habit, HabitEntry } from '@/domain/entities';

export const useEntryVM = defineStore('TEMP_entry', () => {
  const entryService = useDI().resolve<IEntryService>('IEntryService');

  const entries = ref<HabitEntry[]>([]);
  const isLoading = ref(false);

  const fetchEntriesByDate = async (date: string) => {
    isLoading.value = true;
    try {
      entries.value = await entryService.getEntriesByDate(date);
    }
    finally {
      isLoading.value = false;
    }
  };

  const upsertEntry = async (data: Omit<HabitEntry, 'id'>) => {
    const existing = entries.value.find(
      (e: HabitEntry) => e.habitId === data.habitId && e.date === data.date,
    );

    if (existing) {
      const index = entries.value.findIndex((e: HabitEntry) => e.id === existing.id);
      if (index === -1) return;

      const prev = { ...entries.value[index] };
      const updated: HabitEntry = { ...prev, ...data };
      entries.value[index] = updated;

      try {
        await entryService.upsertEntry(updated);
      }
      catch (e) {
        entries.value[index] = prev;
        throw e;
      }
    }
    else {
      const tempEntry: HabitEntry = {
        id: Date.now(),
        ...data,
      };

      entries.value.push(tempEntry);

      try {
        await entryService.upsertEntry(tempEntry);
      }
      catch (e) {
        entries.value = entries.value.filter((e: HabitEntry) => e.id !== tempEntry.id);
        throw e;
      }
    }
  };

  const entriesMap = computed(() => {
    const map = new Map<number, HabitEntry>();
    entries.value.forEach((e: HabitEntry) => map.set(e.habitId, e));
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
    entries,
    isLoading,
    entriesMap,
    fetchEntriesByDate,
    upsertEntry,
    getProgressStats,
  };
});
