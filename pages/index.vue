<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable';

useHead({
  title: 'Главная - Habit Tracker',
});

const habitsStore = useHabitsStore();
const entriesStore = useHabitEntriesStore();

const selectedDate = ref(toDateString(new Date().toISOString()));

const visibleHabits = computed(() => {
  const selected = selectedDate.value;
  return habitsStore.habitsWithUnits.filter(h => h.isActive && toDateString(h.createdAt) <= selected);
});

const habitsWithEntries = computed(() =>
  visibleHabits.value.map(habit => ({
    habit,
    entry: entriesStore.entriesMap.get(habit.id),
  })),
);

const stats = computed(() => entriesStore.getProgressStats(visibleHabits.value));

const draggableItems = shallowRef<typeof habitsWithEntries.value>([]);
const el = useTemplateRef('el');

watch(
  habitsWithEntries,
  () => {
    draggableItems.value = [...habitsWithEntries.value];
  },
  { immediate: true },
);

useSortable(el, draggableItems, {
  animation: 200,
  handle: '.drag-handle',
  onEnd: async (e: { oldIndex: number; newIndex: number }) => {
    if (e.oldIndex != null && e.newIndex != null) {
      const movedItem = draggableItems.value.splice(e.oldIndex, 1)[0];
      draggableItems.value.splice(e.newIndex, 0, movedItem);
    }

    await habitsStore.updateOrder(draggableItems.value.map(i => i.habit.id));
  },
});

const changeDate = async (newDate: string) => {
  selectedDate.value = newDate;
  await entriesStore.fetchEntriesByDate(newDate);
};

const toggleBooleanHabit = async (habitId: number, isChecked: boolean) => {
  void entriesStore.upsertEntry({
    habitId,
    date: selectedDate.value,
    value: isChecked,
  });
};

const changeNumericHabit = async (
  habitId: number,
  delta: number,
  currentValue?: number,
) =>
  void entriesStore.upsertEntry({
    habitId,
    date: selectedDate.value,
    value: Math.max(0, (currentValue ?? 0) + delta),
  });

const updateNote = async (
  habitId: number,
  note: string,
  currentValue?: boolean | number,
) =>
  void entriesStore.upsertEntry({
    habitId,
    date: selectedDate.value,
    value:
        typeof currentValue === 'number'
          ? currentValue
          : typeof currentValue === 'boolean'
            ? currentValue
            : false,
    note,
  });

onMounted(async () => {
  await habitsStore.init();
  await entriesStore.fetchEntriesByDate(selectedDate.value);
});
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 space-y-6">
    <!-- Calendar -->
    <section>
      <DailyCalendar
        :selected-date="selectedDate"
        size="lg"
        @update:date="changeDate"
      />
    </section>

    <!-- HABITS LIST -->
    <section class="min-h-30">
      <div
        class="flex flex-col gap-8"
      >
        <!-- Общий прогресс -->
        <section class="dark:bg-gray-900 rounded-xl p-4 shadow-sm sticky top-0 z-45">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">
              Общий прогресс
            </span>
            <span class="font-semibold">{{ stats.percent }}%</span>
          </div> <UProgress
            :model-value="stats.percent"
            size="lg"
            color="primary"
          />
        </section>
        <div
          ref="el"
          class="grid gap-5"
        >
          <div
            v-for="{ habit, entry } in draggableItems"
            :key="habit.id"
            :class="[
              'group relative rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-300 p-5 space-y-4',
              isHabitCompleted(habit, entry) && 'ring-2 ring-green-400/40',
            ]"
            :style="isHabitCompleted(habit, entry)
              ? {
                background: `linear-gradient(135deg, ${habit.color}20 0%, ${habit.color}10 100%)`,
              }
              : {}"
          >
            <div class="p-5 space-y-4 select-none">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                  <span
                    class="w-4 h-4 rounded-full shrink-0"
                    :style="{ backgroundColor: habit.color }"
                  />
                  <UIcon
                    v-if="habit.icon"
                    :name="habit.icon"
                    class="text-xl shrink-0 text-gray-500 dark:text-gray-400"
                  />
                  <h3 class="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[45vw]">
                    {{ habit.name }}
                  </h3>
                </div>

                <div
                  v-if="habit.type === 'numeric'"
                  class="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                >
                  {{ entry?.value || 0 }} / {{ habit.target }}
                  <span
                    v-if="habit.unitName"
                    class="ml-1 opacity-70"
                  >
                    {{ habit.unitName }}
                  </span>
                </div>

                <span class="drag-handle cursor-grab active:cursor-grabbing text-gray-400">
                  <UIcon
                    class="size-12"
                    name="i-heroicons-arrows-up-down"
                  />
                </span>
              </div>

              <div class="flex flex-col gap-3">
                <!-- Boolean -->
                <template v-if="habit.type === 'boolean'">
                  <UCheckbox
                    label="Отметить выполнение"
                    size="lg"
                    :model-value="entry?.value === true"
                    @update:model-value="val =>
                      toggleBooleanHabit(habit.id, val as boolean)
                    "
                  />
                </template>

                <!-- Numeric -->
                <template v-else-if="habit.type === 'numeric'">
                  <div class="flex items-center gap-3">
                    <UButton
                      icon="i-lucide-minus"
                      variant="soft"
                      size="sm"
                      @click="changeNumericHabit(habit.id, -1, entry?.value as number)"
                    />
                    <div class="text-xl font-bold w-14 text-center">
                      {{ entry?.value || 0 }}
                    </div>
                    <UButton
                      icon="i-lucide-plus"
                      variant="soft"
                      size="sm"
                      @click="changeNumericHabit(habit.id, 1, entry?.value as number)"
                    />
                  </div>

                  <UProgress
                    :model-value="Math.min(100, Math.round((((entry?.value as number) || 0) / (habit?.target as number)) * 100))"
                    size="sm"
                    color="success"
                    class="transition-all duration-500 opacity-80"
                  />
                </template>
              </div>

              <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
                <UTextarea
                  :model-value="entry?.note ?? ''"
                  size="lg"
                  autoresize
                  variant="soft"
                  placeholder="Заметка ..."
                  @blur="(e: FocusEvent) =>
                    updateNote(
                      habit.id,
                      (e.target as HTMLTextAreaElement).value,
                      entry?.value,
                    )
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
