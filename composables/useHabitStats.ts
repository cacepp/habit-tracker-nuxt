import { useIndexedDB } from '~/plugins/indexeddb.client';
import type { HabitEntry } from '~/types';

type RangeKey = '7d' | '30d' | '90d' | 'year' | 'all';

export const useHabitStats = () => {
  const habitsStore = useHabitsStore();
  const db = useIndexedDB();

  const range = ref<RangeKey>('7d');
  const entries = ref<HabitEntry[]>([]);
  const isLoading = ref(false);

  const today = toDateString(new Date().toISOString());

  const getDateRange = () => {
    const start = new Date();
    const end = new Date();

    switch (range.value) {
      case '7d':
        start.setDate(end.getDate() - 6);
        break;
      case '30d':
        start.setDate(end.getDate() - 29);
        break;
      case '90d':
        start.setDate(end.getDate() - 89);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2000);
        break;
    }

    return {
      start: toDateString(start.toISOString()),
      end: toDateString(end.toISOString()),
    };
  };

  const load = async () => {
    isLoading.value = true;

    if (!habitsStore.habits.length) {
      await habitsStore.init();
    }

    const { start, end } = getDateRange();
    entries.value = await db.getEntriesInRange(start, end);
    isLoading.value = false;
  };

  watch(range, load, {
    immediate: true,
  });

  const completionByDay = computed(() => {
    const result: { date: string; percent: number }[] = [];
    const { start, end } = getDateRange();
    const startDate = new Date(start);
    const endDate = new Date(end);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = toDateString(d.toISOString());
      let done = 0;
      let total = 0;

      for (const habit of habitsStore.habits) {
        if (!isHabitVisibleOnDate(habit, dateStr)) continue;

        const entry = entries.value.find(e => e.habitId === habit.id && e.date === dateStr);
        if (isHabitCompleted(habit, entry)) done++;
        total++;
      }

      const percent = total ? Math.round((done / total) * 100) : 0;
      result.push({ date: dateStr, percent });
    }

    return result;
  });

  const habitRates = computed(() => {
    const { start, end } = getDateRange();
    const startDate = new Date(start);
    const endDate = new Date(end);

    return habitsStore.habits.map((habit) => {
      let done = 0;
      let activeDays = 0;

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = toDateString(d.toISOString());

        if (!isHabitVisibleOnDate(habit, dateStr)) continue;

        activeDays++;

        const entry = entries.value.find(e => e.habitId === habit.id && e.date === dateStr);
        if (isHabitCompleted(habit, entry)) done++;
      }

      const rate = activeDays ? Math.round((done / activeDays) * 100) : 0;
      return { habit, rate };
    }).sort((a, b) => b.rate - a.rate);
  });

  const streak = computed(() => {
    let count = 0;

    const reversed = [...completionByDay.value]
      .filter(d => d.date <= today)
      .reverse();

    for (const day of reversed) {
      if (day.percent >= 70) count++;
      else break;
    }

    return count;
  });

  return {
    range,
    isLoading,
    completionByDay,
    habitRates,
    streak,
    reload: load,
  };
};
