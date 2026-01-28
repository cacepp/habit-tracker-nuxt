<script setup lang="ts">
const stats = useHabitStats();
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold">
      Статистика
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsOverviewCards
        :streak="stats.streak.value"
        :habit-rates="stats.habitRates.value"
        class="col-span-1 md:col-span-3"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
      <StatsCompletionChart
        :data="stats.completionByDay.value"
        class="w-full h-96"
      />
    </div>

    <StatsHabitTable :habit-rates="stats.habitRates.value" />
  </div>
</template>

<style scoped></style>
