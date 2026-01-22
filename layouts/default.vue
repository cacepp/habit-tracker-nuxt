<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const items = ref<NavigationMenuItem[]>([
  {
    label: 'Главная',
    icon: 'i-heroicons-home',
    to: '/',
  },
  {
    label: 'Привычки',
    icon: 'i-heroicons-calendar-days',
    to: '/habits',
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    to: 'https://github.com/cacepp/habit-tracker-nuxt',
    target: '_blank',
  },
]);
</script>

<template>
  <div>
    <div class="flex gap-2">
      <UNavigationMenu
        orientation="horizontal"
        :items="items"
        class="data-[orientation=vertical]:w-48 ml-1"
      />
    </div>
    <div class="p-2">
      <slot />
    </div>
    <ScrollToTop />
  </div>
</template>

<style scoped></style>
