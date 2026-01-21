<script setup lang="ts">
import type { Habit, HabitType } from '~/types';

interface FormData {
  name: string;
  type: HabitType;
  target: number;
  unit: string;
  color: string;
}

const props = defineProps<{
  habit?: Habit | null;
}>();

const emit = defineEmits<{
  created: [];
  updated: [];
  close: [];
}>();

const habitsStore = useHabitsStore();
const loading = ref<boolean>(false);

const form = ref<FormData>({
  name: '',
  type: 'boolean' as const,
  target: 0,
  unit: '',
  color: '#2eb648',
});

const newUnit = ref('');
const isAddingUnit = ref(false);
const popoverState = ref(false);

const resetForm = () => {
  form.value = {
    name: '',
    type: 'boolean' as const,
    target: 0,
    unit: '',
    color: '#2eb648',
  };
};

const typeOptions = [
  { label: 'Да/Нет', value: 'boolean' as const },
  { label: 'Числовое значение', value: 'numeric' as const },
];

const isNumeric = computed(() => form.value.type === 'numeric');

watch(
  () => props.habit,
  (habit) => {
    if (habit) {
      form.value = {
        name: habit.name,
        type: habit.type,
        target: habit.target || 0,
        unit: habit.unit || '',
        color: habit.color,
      };
    }
    else {
      resetForm();
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (
      form.value.type === 'numeric'
      && form.value.unit
      && !habitsStore.units.includes(form.value.unit)
    ) {
      await habitsStore.addUnit(form.value.unit);
    }

    const habitData: Omit<Habit, 'id' | 'createdAt'> = {
      name: form.value.name.trim(),
      type: form.value.type,
      ...(form.value.type === 'numeric' && {
        target: form.value.target,
        unit: form.value.unit.trim(),
      }),
      color: form.value.color,
    };

    if (props.habit) {
      await habitsStore.updateHabit({
        ...habitData,
        id: props.habit.id,
        createdAt: props.habit.createdAt,
      });
      emit('updated');
    }
    else {
      await habitsStore.addHabit(habitData);
      emit('created');
      resetForm();
    }
  }
  finally {
    loading.value = false;
  }
};

const addNewUnit = async () => {
  const unit = newUnit.value.trim();
  if (!unit) return;

  if (!habitsStore.units.includes(unit)) {
    await habitsStore.addUnit(unit);
  }

  form.value.unit = unit;
  newUnit.value = '';
  isAddingUnit.value = false;
};

const confirmAddUnit = async () => {
  if (!newUnit.value.trim()) return;

  await addNewUnit();
  popoverState.value = false;
};
</script>

<template>
  <div>
    <form
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <div>
        <label class="block text-sm font-medium mb-1">
          Название привычки <span class="text-red-500">*</span>
        </label>
        <UInput
          v-model="form.name"
          :disabled="loading"
          class="w-full"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">
          Тип отслеживания <span class="text-red-500">*</span>
        </label>
        <USelect
          v-model="form.type"
          :items="typeOptions"
          placeholder="Выберите тип"
          :disabled="loading"
          class="w-full"
        />
      </div>

      <div v-if="isNumeric">
        <label class="block text-sm font-medium mb-1">
          Целевое значение <span class="text-red-500">*</span>
        </label>
        <UInput
          v-model.number="form.target"
          type="number"
          min="1"
          placeholder="10000"
          :disabled="loading"
          class="w-full"
        />

        <label class="block text-sm font-medium mb-1">
          Единица измерения <span class="text-red-500">*</span>
        </label>

        <div class="flex gap-2">
          <USelect
            v-model="form.unit"
            :items="habitsStore.units.map(u => ({
              label: u,
              value: u,
            }))"
            placeholder="Выберите единицу"
            class="w-full"
          />

          <UPopover v-model:open="popoverState">
            <UButton
              icon="i-lucide-plus"
              variant="soft"
              @click="() => {
                isAddingUnit = true;
                popoverState = true;
              }"
            />

            <template #content>
              <div class="flex gap-1">
                <UInput
                  v-model="newUnit"
                  class="flex-1"
                  placeholder="Например: км, мин, шт"
                />

                <UButton
                  icon="i-lucide-check"
                  color="primary"
                  @click="confirmAddUnit"
                />
              </div>
            </template>
          </UPopover>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">
          Цвет
        </label>
        <UPopover>
          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-brush"
          />

          <template #content>
            <UColorPicker
              v-model="form.color"
              mode="click"
            />
          </template>
        </UPopover>
      </div>

      <div class="flex gap-3 pt-4">
        <UButton
          type="submit"
          :loading="loading"
          color="primary"
          class="flex-1"
        >
          {{ props.habit ? 'Сохранить' : 'Создать' }}
        </UButton>
        <UButton
          variant="ghost"
          :disabled="loading"
          class="flex-1"
          @click="emit('close')"
        >
          Отмена
        </UButton>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
