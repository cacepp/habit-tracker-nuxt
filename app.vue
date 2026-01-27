<script setup lang="ts">
import { ru } from '@nuxt/ui/locale';

useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    },
  ],
});
</script>

<template>
  <UApp :locale="ru">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
