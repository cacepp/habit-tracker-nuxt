<script setup lang="ts">
const habitsStore = useHabitsStore();
const entriesStore = useHabitEntriesStore();

const selectedDate = ref(toDateString(new Date().toISOString()));

const changeDate = async (newDate: string) => {
  selectedDate.value = newDate;
  await entriesStore.fetchEntriesByDate(selectedDate.value);
};

const habitsWithEntries = computed(() => {
  return habitsStore.habits.map(habit => ({
    habit,
    entry: entriesStore.entries.find(e =>
      e.habitId === habit.id,
    ),
  }));
});

const totalHabits = computed(() => habitsWithEntries.value.length);

const completedHabits = computed(() =>
  habitsWithEntries.value.filter(({ habit, entry }) => {
    if (!entry) return false;
    if (habit.type === 'boolean') {
      return entry.value === true;
    }
    return typeof entry.value === 'number' && entry.value >= (habit.target ?? 0);
  }).length,
);

const progressPercent = computed(() => {
  if (!totalHabits.value) return 0;
  return Math.round(
    (completedHabits.value / totalHabits.value) * 100,
  );
});

const toggleBooleanHabit = async (
  habitId: number,
  isChecked: boolean,
) => {
  await entriesStore.upsertEntry({
    habitId,
    date: selectedDate.value,
    value: isChecked,
  });
};

const changeNumericHabit = async (
  habitId: number,
  delta: number,
  currentValue?: number,
) => {
  const nextValue = Math.max(0, (currentValue ?? 0) + delta);

  await entriesStore.upsertEntry({
    habitId,
    date: selectedDate.value,
    value: nextValue,
  });
};

const updateNote = async (
  habitId: number,
  note: string,
  currentValue?: boolean | number,
) => {
  await entriesStore.upsertEntry({
    habitId,
    date: selectedDate.value,
    value: typeof currentValue === 'number'
      ? currentValue
      : false,
    note,
  });
};

onMounted(async () => {
  if (!habitsStore.habits.length) {
    await habitsStore.fetchHabits();
  }
  await entriesStore.fetchEntriesByDate(selectedDate.value);
});
</script>

<template>
  <div class="p-2">
    /pages/index.vue
    <section class="mb-4">
      <p>Прогресс: {{ progressPercent }}%</p>
    </section>

    <section class="w-100">
      <DailyCalendar
        :selected-date="selectedDate"
        size="lg"
        @update:date="changeDate"
      />
    </section>

    <section class="flex justify-center sticky top-0 z-50 p-6 bg-slate-900">
      <UProgress
        v-model="progressPercent"
        status
        size="xl"
      />
    </section>

    <div v-if="habitsStore.isLoading || entriesStore.isLoading">
      Загрузка...
    </div>

    <section
      v-else
      class="flex flex-col gap-4"
    >
      <div
        v-for="{ habit, entry } in habitsWithEntries"
        :key="habit.id"
        class="border border-gray-200 rounded-lg p-2"
      >
        {{ habit.name }}

        <div>
          <template v-if="habit.type === 'boolean'">
            <UCheckbox
              :model-value="entry?.value === true"
              @update:model-value="val =>
                toggleBooleanHabit(habit.id, val as boolean)
              "
            />
          </template>

          <template v-else-if="habit.type === 'numeric'">
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-minus"
                @click="changeNumericHabit(
                  habit.id,
                  -1,
                  entry?.value as number,
                )"
              />

              <UButton
                icon="i-lucide-plus"
                @click="changeNumericHabit(
                  habit.id,
                  1,
                  entry?.value as number,
                )"
              />
            </div>

            {{ entry?.value || 0 }} / {{ habit.target }}
          </template>

          <template v-else>
            empty
          </template>
        </div>

        <UTextarea
          :model-value="entry?.note ?? ''"
          placeholder="Заметка..."
          @blur="(e: FocusEvent) =>
            updateNote(
              habit.id,
              (e.target as HTMLTextAreaElement).value,
              entry?.value,
            )
          "
        />
      </div>

      <div v-if="!habitsWithEntries.length">
        Нет привычек
      </div>
    </section>
  </div>
</template>

<style scoped></style>
