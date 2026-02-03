<script setup lang="ts">
import { type Habit, isBooleanHabit, isNumericHabit } from '~/types';

defineProps<{
  habit: Habit;
  unitName?: string;
}>();

defineEmits<{
  edit: [habit: Habit];
  delete: [id: number];
}>();
</script>

<template>
  <div
    class="group hover:shadow-xl transition-shadow duration-300 flex flex-col p-4 rounded-xl border-2 "
    :style="{
      borderColor: habit.color,
      background: `linear-gradient(135deg, ${habit.color}20 0%, ${habit.color}10 100%)`,
    }"
  >
    <div class="flex justify-between items-start mb-4">
      <div class="flex flex-col gap-1">
        <h3 class="font-semibold text-lg line-clamp-2 text-gray-800 dark:text-gray-100 truncate max-w-40">
          {{ habit.name }}
        </h3>
        <UBadge
          :label="isBooleanHabit(habit) ? 'Да/Нет' : unitName ?? ''"
          variant="soft"
          size="md"
          :color="isBooleanHabit(habit) ? 'success' : 'primary'"
        />
      </div>
      <div class="flex gap-2">
        <span v-if="habit.icon">
          <UIcon
            :name="habit.icon"
            class="text-xl text-gray-600 dark:text-gray-300"
          />
        </span>
        <div
          class="w-5 h-5 rounded-full border-2 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
          :style="{ backgroundColor: habit.color }"
        />
      </div>
    </div>

    <div
      v-if="isNumericHabit(habit)"
      class="mb-4 p-3 rounded-lg flex flex-col items-start"
      :style="{
        background: `linear-gradient(90deg, ${habit.color}20 0%, ${habit.color}10 100%)`,
      }"
    >
      <span class="text-sm text-gray-500 dark:text-gray-400">Цель</span>
      <span class="text-2xl font-bold text-gray-800 dark:text-gray-100">
        {{ habit.target }} {{ unitName }}
      </span>
    </div>

    <div class="text-sm text-gray-500 dark:text-gray-400 mb-4 flex justify-between">
      <span>Создано</span>
      <span class="font-medium text-gray-700 dark:text-gray-300">
        {{ formatDateTime(habit.createdAt) }}
      </span>
    </div>

    <span
      v-if="!habit.isActive"
      class="text-gray-500 text-sm mb-4"
    >Отключена</span>

    <div class="flex gap-2 mt-auto">
      <UButton
        size="sm"
        variant="solid"
        color="secondary"
        icon="i-heroicons-pencil"
        @click="$emit('edit', habit)"
      />
      <UButton
        size="sm"
        variant="ghost"
        color="error"
        icon="i-heroicons-trash"
        @click="$emit('delete', habit.id)"
      />
    </div>
  </div>
</template>

<style scoped></style>
