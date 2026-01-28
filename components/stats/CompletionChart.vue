<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler, type ChartOptions,
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
);

const props = defineProps<{
  data: { date: string; percent: number }[];
}>();

const chartData = computed(() => ({
  labels: props.data.map(d => d.date),
  datasets: [
    {
      label: 'Выполнение привычек (%)',
      data: props.data.map(d => d.percent),

      borderColor: '#22C55E',
      backgroundColor: 'rgba(34,197,94,0.25)',
      pointBackgroundColor: '#16A34A',
      pointRadius: 4,
      pointHoverRadius: 6,

      fill: true,
      tension: 0.4,
    },
  ],
}));

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 0,

  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => `${ctx.parsed.y}% выполнено`,
      },
    },
  },

  layout: {
    padding: 8,
  },

  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: {
        callback: value => `${value}%`,
      },
    },
    x: {
      grid: { display: false },
      ticks: {
        autoSkip: true,
        maxTicksLimit: 6,
      },
    },
  },
};
</script>

<template>
  <UCard class="w-full overflow-hidden">
    <div class="mb-4">
      <div class="text-sm text-gray-500">
        Общий прогресс по дням
      </div>
      <div class="text-lg font-semibold">
        Динамика выполнения привычек
      </div>
    </div>

    <div class="relative w-full max-w-full overflow-hidden h-65 sm:h-80">
      <Line
        class="max-w-full!"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </UCard>
</template>

<style scoped></style>
