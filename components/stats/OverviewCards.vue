<script setup lang="ts">
import type { Habit } from '~/types';

interface HabitRate {
  habit: Habit;
  rate: number;
}

const props = defineProps<{
  streak: number;
  habitRates: HabitRate[];
}>();

const bestHabit = computed(() => props.habitRates[0]);
const worstHabit = computed(() => props.habitRates.at(-1));
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <!-- streak -->
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500">
            Серия дней <span v-text="'(≥70%)'" />
          </div>
          <div class="text-3xl font-bold mt-1">
            🔥 {{ streak }}
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="bestHabit">
      <div class="text-sm text-gray-500 mb-2">
        Лучшая привычка
      </div>
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center text-white"
          :style="{ backgroundColor: bestHabit.habit.color }"
        >
          <UIcon :name="bestHabit.habit.icon" />
        </div>
        <div>
          <div class="font-semibold leading-tight">
            {{ bestHabit.habit.name }}
          </div>
          <div class="text-sm text-gray-500">
            Выполнено на {{ bestHabit.rate }}%
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="worstHabit">
      <div class="text-sm text-gray-500 mb-2">
        Требует внимания
      </div>
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center text-white"
          :style="{ backgroundColor: worstHabit.habit.color }"
        >
          <UIcon :name="worstHabit.habit.icon" />
        </div>
        <div>
          <div class="font-semibold leading-tight">
            {{ worstHabit.habit.name }}
          </div>
          <div class="text-sm text-gray-500">
            Выполнено на {{ worstHabit.rate }}%
          </div>
        </div>
      </div>
    </UCard>

    <!-- Total -->
    <UCard>
      <div class="text-sm text-gray-500">
        Всего привычек
      </div>
      <div class="text-3xl font-bold mt-1">
        {{ habitRates.length }}
      </div>
    </UCard>
  </div>
</template>

<style scoped></style>
