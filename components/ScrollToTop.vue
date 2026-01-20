<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core';

const isVisible = ref(false);
const { y: scrollY } = useWindowScroll();
watch(scrollY, (newY) => {
  isVisible.value = newY > 300;
});
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <UButton
    v-if="isVisible"
    class="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
    color="primary"
    icon="i-heroicons-arrow-up"
    size="xl"
    @click="scrollToTop"
  />
</template>

<style scoped></style>
