<script setup lang="ts">
import { parseDate } from '@internationalized/date';

const props = defineProps<{
  selectedDate: string;
}>();

const emit = defineEmits<{
  'update:date': [date: string];
}>();

const currentDate = shallowRef(parseDate(props.selectedDate));

watch(
  () => props.selectedDate,
  newDate =>
    currentDate.value = parseDate(newDate),
);

const onDateSelect = (newDate: unknown) => {
  emit('update:date', newDate!.toString());
};
</script>

<template>
  <UCalendar
    v-model="currentDate"
    :show-week-numbers="false"
    @update:model-value="onDateSelect"
  />
</template>

<style scoped></style>
