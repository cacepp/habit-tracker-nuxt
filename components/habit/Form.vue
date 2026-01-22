<script setup lang="ts">
import type { Habit, HabitType, HabitUnit } from '~/types';

interface FormData {
  name: string;
  type: HabitType;
  target?: number;
  unitId?: number;
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
  type: 'boolean',
  target: 1,
  unitId: undefined,
  color: 'primary',
});

const newUnit = ref('');
const editingUnit = ref<HabitUnit | null>(null);

const isAddingUnit = ref(false);
const modalState = reactive<{ add: boolean; edit: boolean; unitTable: boolean }>({
  add: false,
  edit: false,
  unitTable: false,
});

const resetForm = () => {
  form.value = {
    name: '',
    type: 'boolean' as const,
    target: 1,
    unitId: undefined,
    color: 'primary',
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
        target: habit.target || 1,
        unitId: habit.unitId ?? undefined,
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
  if (form.value.type === 'numeric' && !form.value.unitId) {
    return;
  }

  loading.value = true;

  try {
    const habitData: Omit<Habit, 'id' | 'createdAt'> = {
      name: form.value.name,
      type: form.value.type,
      color: form.value.color,
      ...(form.value.type === 'numeric' && {
        target: form.value.target,
        unitId: form.value.unitId!,
      }),
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
  const unit = newUnit.value;
  if (!unit) return;

  if (!habitsStore.units.some(u => u.name.toLowerCase() === unit.toLowerCase())) {
    await habitsStore.addUnit(unit);
  }

  const added = habitsStore.units.find(u => u.name === unit);
  if (added) {
    form.value.unitId = added.id;
  }
  newUnit.value = '';
  isAddingUnit.value = false;
};

const confirmAddUnit = async () => {
  if (!newUnit.value) return;

  await addNewUnit();
  modalState.add = false;
};

const editUnit = async (unit: HabitUnit) => {
  editingUnit.value = { ...unit };
  newUnit.value = unit.name;
  modalState.edit = true;
};

const confirmEditUnit = async () => {
  if (!editingUnit.value) return;

  await habitsStore.updateUnit(editingUnit.value.id, newUnit.value);

  editingUnit.value = null;
  newUnit.value = '';
  modalState.edit = false;
};

const confirmDeleteUnit = async (id: number) => {
  form.value.unitId = undefined;
  await habitsStore.deleteUnit(id);
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
          v-model.trim="form.name"
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
            v-model="form.unitId"
            :items="habitsStore.units.map(u => ({
              label: u.name,
              value: u.id,
            }))"
            :placeholder="(() =>
              habitsStore.units.length > 0
                ? 'Выберите единицу'
                : 'Единиц нет. Добавьте'
            )()"
            :disabled="habitsStore.units.length === 0"
            class="w-full"
          />

          <UPopover v-model:open="modalState.add">
            <UButton
              icon="i-lucide-plus"
              variant="soft"
              @click="() => {
                isAddingUnit = true;
                modalState.add = true;
              }"
            />

            <template #content>
              <div class="flex gap-1">
                <UInput
                  v-model.trim="newUnit"
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

          <USlideover
            v-model:open="modalState.unitTable"
            title="Единицы измерения"
            :close="{
              color: 'primary',
              variant: 'outline',
              class: 'rounded-full',
            }"
          >
            <UButton
              icon="i-lucide-list"
              variant="soft"
              @click="() => {
                modalState.unitTable = true;
              }"
            />

            <template #body>
              <div class="flex flex-col gap-2 p-1 min-w-40">
                <div
                  v-for="unit in habitsStore.units"
                  :key="unit.id"
                  class="flex gap-1 p-1 items-center justify-between border"
                >
                  <span class="ml-2">{{ unit.name }}</span>

                  <div class="flex gap-2">
                    <UPopover
                      :open="modalState.edit && editingUnit?.id === unit.id"
                      @update:open="(v) => {
                        if (!v) editingUnit = null
                        modalState.edit = v
                      }"
                    >
                      <UButton
                        icon="i-lucide-edit-2"
                        size="sm"
                        variant="soft"
                        @click="editUnit(unit)"
                      />

                      <template #content>
                        <div class="flex gap-2 items-center min-w-48">
                          <UInput
                            v-model.trim="newUnit"
                            placeholder="Название единицы"
                            class="flex-1"
                          />

                          <UButton
                            icon="i-lucide-check"
                            size="sm"
                            color="primary"
                            @click="confirmEditUnit"
                          />
                        </div>
                      </template>
                    </UPopover>

                    <UButton
                      icon="i-lucide-trash"
                      size="sm"
                      variant="soft"
                      color="error"
                      @click="confirmDeleteUnit(unit.id)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </USlideover>
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
