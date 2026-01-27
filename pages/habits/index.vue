<script setup lang="ts">
import type { Habit } from '~/types';

useHead({
  title: 'Привычки - Habit Tracker',
});

const habitsStore = useHabitsStore();
const { habits, isLoading } = storeToRefs(habitsStore);

const isCreateModalOpen = ref<boolean>(false);
const isEditModalOpen = ref<boolean>(false);
const editHabit = ref<Habit | null>(null);
const isDeleteAlertOpen = ref(false);
const habitToDeleteId = ref<number | null>(null);

const habitsWithUnitNameReversed = computed(() =>
  [...habitsStore.habitsWithUnits].reverse(),
);

const handleCreated = () => {
  isCreateModalOpen.value = false;
  habitsStore.fetchHabits();
};

const handleEdit = (habit: Habit) => {
  editHabit.value = habit;
  isEditModalOpen.value = true;
};

const handleUpdated = () => {
  isEditModalOpen.value = false;
  editHabit.value = null;
  habitsStore.fetchHabits();
};

const handleDelete = (id: number) => {
  habitToDeleteId.value = id;
  isDeleteAlertOpen.value = true;
};

const confirmDelete = async () => {
  if (!habitToDeleteId.value) return;

  await habitsStore.deleteHabit(habitToDeleteId.value);
  habitToDeleteId.value = null;
  isDeleteAlertOpen.value = false;
};

const cancelDelete = () => {
  habitToDeleteId.value = null;
  isDeleteAlertOpen.value = false;
};

onMounted(async () => {
  await habitsStore.init();
});
</script>

<template>
  <div class="p-6 max-w-300 mx-auto">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold">
        Привычки
      </h1>
      <UButton
        size="lg"
        color="primary"
        icon="i-heroicons-plus"
        @click="isCreateModalOpen = true"
      >
        Создать привычку
      </UButton>
    </div>

    <!-- Loading / No habits -->
    <div
      v-if="isLoading"
      class="text-center py-20 text-gray-500"
    >
      загрузка...
    </div>

    <div
      v-else-if="!habits.length"
      class="text-center py-20 px-8 space-y-4"
    >
      <div class="flex justify-center">
        <UIcon
          name="i-heroicons-calendar-days"
          class="text-6xl text-gray-300"
        />
      </div>
      <h3 class="text-xl font-medium text-gray-700">
        Привычек пока нет
      </h3>
      <p class="text-gray-500">
        Создайте первую привычку, чтобы начать отслеживать свой прогресс
      </p>
      <UButton
        size="md"
        color="primary"
        icon="i-heroicons-plus"
        @click="isCreateModalOpen = true"
      >
        Создать привычку
      </UButton>
    </div>

    <!-- Список привычек -->
    <div v-else>
      <TransitionGroup
        name="habit-list"
        tag="div"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <HabitCard
          v-for="habit in habitsWithUnitNameReversed"
          :key="habit.id"
          :habit="habit"
          :unit-name="habit.unitName"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </TransitionGroup>
    </div>

    <UModal
      v-model:open="isCreateModalOpen"
      title="Новая привычка"
      description=" "
    >
      <template #body>
        <HabitForm
          @created="handleCreated"
          @close="isCreateModalOpen = false"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="isEditModalOpen"
      title="Редактировать привычку"
      description=" "
    >
      <template #body>
        <HabitForm
          v-if="editHabit"
          :habit="editHabit"
          @updated="handleUpdated"
          @close="isEditModalOpen = false"
        />
      </template>
    </UModal>

    <!-- Delete Alert -->
    <Transition
      name="toast-slide"
      appear
    >
      <UAlert
        v-if="isDeleteAlertOpen"
        title="ВНИМАНИЕ!"
        description="Вы собираетесь удалить привычку. Подтвердите действие!"
        color="error"
        variant="subtle"
        orientation="horizontal"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-4 rounded-xl backdrop-blur-xl shadow-xl z-100 flex flex-col sm:flex-row justify-between items-center gap-3"
        :actions="[
          {
            label: 'Удалить',
            color: 'error',
            variant: 'solid',
            onClick: confirmDelete,
          },
          {
            label: 'Отмена',
            color: 'neutral',
            variant: 'ghost',
            onClick: cancelDelete,
          },
        ]"
      />
    </Transition>
  </div>
</template>

<style scoped>
.habit-list-enter-active,
.habit-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.habit-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.habit-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.habit-list-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

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
