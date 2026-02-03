<script setup lang="ts">
import { parseDate } from '@internationalized/date';
import type { Habit, HabitEntry } from '~/types';
import { useIndexedDB } from '~/plugins/indexeddb.client';

const props = defineProps<{
  selectedDate: string;
}>();

const emit = defineEmits<{
  'update:date': [date: string];
}>();

const habitsStore = useHabitsStore();

const db = useIndexedDB();

const todayString = new Date().toISOString().slice(0, 10);

const currentDate = shallowRef(parseDate(props.selectedDate));

const getHabitsForDate = (date: string, habits: Habit[]) => {
  return habits.filter(h => isHabitVisibleOnDate(h, date));
};

const entriesByDate = ref<Record<string, HabitEntry[]>>({});

const loadMonthEntries = async (year: number, month: number) => {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;

  const all = await db.getEntriesInRange(start, end);

  entriesByDate.value = all.reduce((acc, e) => {
    (acc[e.date] ||= []).push(e);
    return acc;
  }, {} as Record<string, HabitEntry[]>);
};

const getDayStatus = (date: string): 'success' | 'partial' | 'fail' | 'empty' | 'future' => {
  if (date > todayString) return 'future';

  const habits = getHabitsForDate(date, habitsStore.habits);
  if (!habits.length) return 'empty';

  const entries = entriesByDate.value[date] || [];

  const completedCount = habits.filter(h =>
    isHabitCompleted(h, entries.find(e => e.habitId === h.id)),
  ).length;

  if (completedCount === 0) return 'fail';
  if (completedCount === habits.length) return 'success';
  return 'partial';
};

const getColorByStatus = (status: ReturnType<typeof getDayStatus>) => {
  switch (status) {
    case 'success': return 'success';
    case 'partial': return 'warning';
    case 'fail': return 'error';
    default: return undefined;
  }
};

watch(
  () => props.selectedDate,
  newDate =>
    currentDate.value = parseDate(newDate),
);

watch(currentDate, (val) => {
  const jsDate = val.toDate('UTC');
  loadMonthEntries(jsDate.getFullYear(), jsDate.getMonth() + 1);
}, { immediate: true });

const onDateSelect = (newDate: unknown) => {
  emit('update:date', newDate!.toString());
};
</script>

<template>
  <UCalendar
    v-model="currentDate"
    :show-week-numbers="false"
    @update:model-value="onDateSelect"
  >
    <template #day="{ day }">
      <UChip
        :show="!['empty', 'future'].includes(getDayStatus(day.toString()))"
        :color="getColorByStatus(getDayStatus(day.toString()))"
        size="2xs"
        inset
      >
        {{ day.day }}
      </UChip>
    </template>
  </UCalendar>
</template>

<style scoped></style>
