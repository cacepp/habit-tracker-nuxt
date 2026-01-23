<script setup lang="ts">
const { icons } = useIcons();

defineProps<{
  modelValue: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
  'close': [];
}>();
</script>

<template>
  <UCommandPalette
    placeholder="Поиск по иконкам"
    :groups="[
      {
        id: 'icons',
        label: 'Иконки',
        items: icons.map(icon => ({
          id: icon,
          label: icon,
          icon,
        })),
      },
    ]"
    @update:model-value="(cmd) => {
      if (cmd.icon) {
        $emit('update:modelValue', cmd.icon)
        $emit('close');
      }
    }"
  />
</template>

<style scoped></style>
