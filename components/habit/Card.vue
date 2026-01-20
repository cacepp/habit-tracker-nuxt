<script setup lang="ts">
import { type Habit, isBooleanHabit, isNumericHabit } from '~/types';

defineProps<{
  habit: Habit;
}>();

defineEmits<{
  edit: [habit: Habit];
  delete: [id: number];
}>();
</script>

<template>
  <div
    class="group hover:shadow-lg transition-all duration-200 h-full flex flex-col p-0 rounded-lg overflow-hidden w-80 border-2"
    :style="{ borderColor: habit.color }"
  >
    <div class="flex-1 p-4 flex flex-col">
      <div>
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="font-semibold text-lg mb-1 line-clamp-2">
              {{ habit.name }}
            </h3>
            <UBadge
              :label="isBooleanHabit(habit) ? 'Да/Нет' : `${habit.unit ?? ''}`"
              variant="soft"
              size="sm"
              color="neutral"
            />
          </div>
          <div
            class="w-4 h-4 rounded-full border-2 shadow-sm shrink-0"
            :style="{ backgroundColor: habit.color }"
          />
        </div>

        <div
          v-if="isNumericHabit(habit)"
          class="mb-6 p-3 rounded-lg"
        >
          <div class="text-sm font-medium">
            Цель
          </div>
          <div class="text-2xl font-bold">
            {{ habit.target }} {{ habit.unit }}
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <span>Создано</span>
          <span class="font-medium">{{ formatDateTime(habit.createdAt) }}</span>
        </div>
      </div>

      <div class="mt-auto pt-6 flex gap-2">
        <UButton
          size="sm"
          variant="solid"
          color="secondary"
          block
          icon="i-heroicons-pencil"
          @click="$emit('edit', habit)"
        />
        <UButton
          size="sm"
          variant="ghost"
          color="neutral"
          block
          icon="i-heroicons-trash"
          @click="$emit('delete', habit.id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
