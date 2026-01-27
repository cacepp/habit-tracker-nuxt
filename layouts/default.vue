<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { useNow } from '@vueuse/core';

const isSidebarOpen = ref(false);

const items = ref<NavigationMenuItem[]>([
  {
    label: 'Главная',
    icon: 'i-heroicons-home',
    to: '/',
    onSelect: () => {
      isSidebarOpen.value = false;
    },
  },
  {
    label: 'Привычки',
    icon: 'i-heroicons-calendar-days',
    to: '/habits',
    onSelect: () => {
      isSidebarOpen.value = false;
    },
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    to: 'https://github.com/cacepp/habit-tracker-nuxt',
    target: '_blank',
  },
]);

const currentTime = useNow({ interval: 1000 });

const formattedTime = computed(() =>
  currentTime.value.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
);

const formattedDate = computed(() =>
  currentTime.value.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
);
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Overlay (mobile) -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/40 z-49 lg:hidden"
      @click="isSidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col transform transition-transform duration-300 gap-4
           lg:static lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="mb-8 shrink-0 flex items-center justify-between">
        <h2 class="text-xl font-bold">
          Habit Tracker
        </h2>
        <UButton
          icon="i-lucide-x"
          variant="ghost"
          class="lg:hidden"
          @click="isSidebarOpen = false"
        />
      </div>

      <UNavigationMenu
        :items="items"
        orientation="vertical"
        @update:model-value="isSidebarOpen = false"
      />

      <WeatherWidget
        :city="'Петрозаводск'"
        class="flex-1 overflow-auto"
      />
    </aside>

    <!-- Content -->
    <div class="flex-1 flex flex-col min-h-0">
      <header class="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div class="flex items-center gap-3">
          <UButton
            icon="i-lucide-menu"
            variant="ghost"
            class="lg:hidden"
            @click="isSidebarOpen = true"
          />
        </div>

        <div class="text-right leading-tight">
          <div class="text-sm text-gray-500 capitalize">
            {{ formattedDate }}
          </div>
          <div class="font-mono text-lg font-semibold">
            {{ formattedTime }}
          </div>
        </div>
      </header>

      <main
        id="page-scroll"
        class="relative flex-1 overflow-auto p-4"
      >
        <slot />
        <ScrollToTop />
      </main>
    </div>
  </div>
</template>

<style scoped></style>
