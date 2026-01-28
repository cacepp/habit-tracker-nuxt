<script setup lang="ts">
import type { Habit } from '~/types';
import type { TableColumn } from '@nuxt/ui/components/Table.vue';
import { UIcon } from '#components';

interface HabitRate {
  habit: Habit;
  rate: number;
}

const props = defineProps<{
  habitRates: HabitRate[];
}>();

const columns: TableColumn<HabitRate>[] = [
  {
    accessorKey: 'habit',
    header: 'Привычка',
    cell: ({ row }) => {
      const { habit } = row.original;

      return h('div', { class: 'flex items-center gap-3' }, [
        h(
          'div',
          {
            class: 'w-8 h-8 rounded-lg flex items-center justify-center text-white',
            style: { backgroundColor: habit.color },
          },
          [
            h(UIcon, { name: habit.icon, class: 'w-4 h-4' }),
          ],
        ),
        h('span', { class: 'font-medium' }, habit.name),
      ]);
    },
  },
  {
    accessorKey: 'rate',
    header: 'Прогресс',
    cell: ({ row }) => {
      const { rate } = row.original;

      return h('div', { class: 'flex items-center gap-2 w-full' }, [
        h('div', { class: 'bg-gray-200 rounded-full h-2.5 flex-1' }, [
          h('div', {
            class: 'bg-blue-500 h-2.5 rounded-full transition-all duration-300',
            style: { width: `${rate}%` },
          }),
        ]),
        h('span', { class: 'text-sm font-semibold w-10 text-right' }, `${rate}%`),
      ]);
    },
  },
];
</script>

<template>
  <UCard>
    <div class="mb-4">
      <div class="text-sm text-gray-500">
        Привычки
      </div>
      <div class="text-lg font-semibold">
        Процент выполнения по привычкам
      </div>
    </div>

    <div class="w-full overflow-x-auto">
      <UTable
        :data="props.habitRates"
        :columns="columns"
        class="w-full text-sm"
        :ui="{
          td: 'whitespace-normal break-words',
          th: 'whitespace-nowrap',
        }"
      />
    </div>
  </UCard>
</template>

<style scoped></style>
