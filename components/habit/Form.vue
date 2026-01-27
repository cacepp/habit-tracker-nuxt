<script setup lang="ts">
import type { Habit, HabitUnit } from '~/types';
import type { FormSubmitEvent } from '@nuxt/ui';
import { formSchema, type HabitFormSchema } from '~/schemas/habit.schema';

const props = defineProps<{
  habit?: Habit | null;
}>();

const emit = defineEmits<{
  created: [];
  updated: [];
  close: [];
}>();

const habitsStore = useHabitsStore();
const toast = useToast();

const loading = ref<boolean>(false);
const formState = reactive<HabitFormSchema>({
  name: '',
  type: 'boolean',
  target: 1,
  unitId: undefined,
  color: '#2eb648',
  icon: 'i-lucide-calendar-check',
});

const newUnit = ref<string>('');
const editingUnit = ref<HabitUnit | null>(null);
const isAddingUnit = ref(false);

const modalState = reactive({
  add: false,
  edit: false,
  unitTable: false,
  icon: false,
});

const isDeleteAlertOpen = ref(false);
const unitToDeleteId = ref<number | null>(null);

const typeOptions = [
  { label: 'Да/Нет', value: 'boolean' as const },
  { label: 'Числовое значение', value: 'numeric' as const },
];

const isNumeric = computed(() => formState.type === 'numeric');

const resetForm = () => {
  formState.name = '';
  formState.type = 'boolean';
  formState.target = 1;
  formState.unitId = undefined;
  formState.color = '#2eb648';
  formState.icon = 'i-lucide-calendar-check';
};

watch(
  () => props.habit,
  (habit) => {
    if (habit) {
      formState.name = habit.name;
      formState.type = habit.type;
      formState.target = habit.target || 1;
      formState.unitId = habit.unitId ?? undefined;
      formState.color = habit.color;
      formState.icon = habit.icon;
    }
    else {
      resetForm();
    }
  },
  { immediate: true },
);

const onSubmit = async (event: FormSubmitEvent<HabitFormSchema>) => {
  loading.value = true;
  const data = event.data;

  const habitData: Omit<Habit, 'id' | 'createdAt'> = {
    name: data.name,
    type: data.type,
    color: data.color,
    icon: data.icon,
    ...(data.type === 'numeric' && {
      target: data.target!,
      unitId: data.unitId!,
    }),
  };

  try {
    if (props.habit) {
      await habitsStore.updateHabit({
        ...habitData,
        id: props.habit.id,
        createdAt: props.habit.createdAt,
      });
      toast.add({ title: 'Привычка обновлена', color: 'success' });
      emit('updated');
    }
    else {
      await habitsStore.addHabit(habitData);
      toast.add({ title: 'Привычка создана', color: 'success' });
      resetForm();
      emit('created');
    }
  }
  finally {
    loading.value = false;
  }
};

const addNewUnit = async () => {
  if (!newUnit.value) {
    toast.add({
      title: 'Ошибка добавления ед. измерения',
      description: 'Название не должно быть пустым',
      color: 'error',
    });
    return;
  }
  const unit = newUnit.value;

  try {
    await habitsStore.addUnit(unit);
    const added = habitsStore.units.find(u => u.name === unit);
    if (added) formState.unitId = added.id;

    toast.add({
      title: `Ед. измерения "${unit}" успешно добавлена`,
    });
    modalState.add = false;
  }
  catch (err) {
    toast.add({
      title: `Ошибка`,
      description: getErrorMessage(err),
      color: 'error',
    });
    return;
  }
  finally {
    newUnit.value = '';
    isAddingUnit.value = false;
  }
};

const confirmAddUnit = async () => {
  await addNewUnit();
};

const editUnit = async (unit: HabitUnit) => {
  editingUnit.value = { ...unit };
  newUnit.value = unit.name;
  modalState.edit = true;
};

const confirmEditUnit = async () => {
  if (!editingUnit.value) {
    toast.add({
      title: 'Ошибка редактирования ед. измерения',
      description: 'Название не должно быть пустым',
      color: 'error',
    });
    return;
  }

  try {
    await habitsStore.updateUnit(editingUnit.value.id, newUnit.value);
    toast.add({ title: 'Ед. измерения обновлена', color: 'success' });
    editingUnit.value = null;
    modalState.edit = false;
  }
  catch (err) {
    toast.add({
      title: 'Ошибка редактирования ед. измерения',
      description: getErrorMessage(err),
      color: 'error',
    });
  }
};

const handleDeleteUnit = async (id: number) => {
  unitToDeleteId.value = id;
  isDeleteAlertOpen.value = true;
};

const confirmDeleteUnit = async () => {
  if (!unitToDeleteId.value) return;

  try {
    await habitsStore.deleteUnit(unitToDeleteId.value);

    toast.add({
      title: 'Единица успешно удалена',
      color: 'success',
    });

    formState.unitId = undefined;
  }
  catch (err) {
    toast.add({
      title: 'Невозможно удалить единицу',
      description: getErrorMessage(err),
      color: 'warning',
    });
  }
  finally {
    isDeleteAlertOpen.value = false;
  }
};

const cancelDeleteUnit = async () => {
  isDeleteAlertOpen.value = false;
  unitToDeleteId.value = null;
};
</script>

<template>
  <div>
    <UForm
      :schema="formSchema"
      :state="formState"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        label="Название привычки"
        name="name"
        required
      >
        <UInput
          v-model.trim="formState.name"
          :disabled="loading"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Тип отслеживания"
        name="type"
        required
      >
        <USelect
          v-model="formState.type"
          :items="typeOptions"
          placeholder="Выберите тип"
          :disabled="loading"
          class="w-full"
        />
      </UFormField>

      <div v-if="isNumeric">
        <UFormField
          label="Целевое значениe"
          name="target"
          required
        >
          <UInputNumber
            v-model.number="formState.target"
            :min="1"
            :disabled="loading"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Единица измерения"
          name="unitId"
          :error="!formState.unitId ? 'Выберите единицу' : undefined"
          required
        >
          <div
            class="flex gap-2"
          >
            <USelect
              v-model="formState.unitId"
              :items="habitsStore.units.map(u => ({
                label: u.name,
                value: u.id,
              }))"
              :placeholder="
                habitsStore.units.length > 0
                  ? 'Выберите единицу'
                  : 'Единиц нет. Добавьте'
              "
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
              description=" "
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
                <div
                  v-if="habitsStore.units.length > 0"
                  class="flex flex-col gap-2 p-1 min-w-40"
                >
                  <div
                    v-for="unit in habitsStore.units"
                    :key="unit.id"
                    class="flex gap-1 p-1 items-center justify-between border"
                  >
                    <span class="ml-2">{{ unit.name }}</span>

                    <div class="flex gap-2">
                      <UPopover
                        :open="modalState.edit && editingUnit?.id === unit.id"
                        @update:open="(y) => {
                          if (!y) editingUnit = null
                          modalState.edit = y
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
                        @click="handleDeleteUnit(unit.id)"
                      />

                      <Transition
                        name="toast-slide"
                        appear
                      >
                        <UAlert
                          v-if="isDeleteAlertOpen"
                          title="ВНИМАНИЕ!"
                          description="Вы собираетесь удалить единицу. Подтвердите действие!"
                          color="error"
                          variant="subtle"
                          orientation="horizontal"
                          class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-4 rounded-xl backdrop-blur-xl shadow-xl z-100 flex flex-col sm:flex-row justify-between items-center gap-3"
                          :actions="[
                            {
                              label: 'Удалить',
                              color: 'error',
                              variant: 'subtle',
                              onClick: () => confirmDeleteUnit(),
                            },
                            {
                              label: 'Отмена',
                              color: 'neutral',
                              variant: 'subtle',
                              onClick: () => cancelDeleteUnit(),
                            },
                          ]"
                        />
                      </Transition>
                    </div>
                  </div>
                </div>
                <div v-else>
                  Пусто
                </div>
              </template>
            </USlideover>
          </div>
        </UFormField>
      </div>

      <div class="flex gap-8">
        <UFormField
          label="Цвет"
          name="color"
          required
        >
          <UPopover>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-brush"
            />

            <template #content>
              <UColorPicker
                v-model="formState.color"
                mode="click"
              />
            </template>
          </UPopover>
        </UFormField>

        <UFormField
          label="Иконка"
          name="icon"
          required
        >
          <UPopover v-model:open="modalState.icon">
            <UButton
              color="neutral"
              variant="subtle"
              :icon="formState.icon"
            />

            <template #content>
              <IconPicker
                v-model="formState.icon"
                class="max-h-50"
                @close="modalState.icon = false"
              />
            </template>
          </UPopover>
        </UFormField>
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
    </UForm>
  </div>
</template>

<style scoped>
.toast-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-slide-leave-active {
  transition: all 0.3s ease-in;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}
.toast-slide-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.toast-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}
</style>
