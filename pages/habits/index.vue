<script setup lang="ts">
import type { Habit } from '~/types';

const habitsStore = useHabitsStore();
const { habits, isLoading } = storeToRefs(habitsStore);
const { fetchHabits, deleteHabit, fetchUnits } = habitsStore;

const isCreateModalOpen = ref<boolean>(false);
const isEditModalOpen = ref<boolean>(false);

const editHabit = ref<Habit | null>(null);
const habitsWithUnitNameReversed = computed(() => {
  return [...habitsStore.habits]
    .reverse()
    .map((habit) => {
      const unitObj = habitsStore.units.find(u => u.id === habit.unitId);
      return {
        ...habit,
        unitName: unitObj?.name,
      };
    });
});

const handleCreated = () => {
  isCreateModalOpen.value = false;
  fetchHabits();
};

const handleEdit = (habit: Habit) => {
  editHabit.value = habit;
  isEditModalOpen.value = true;
};

const handleUpdated = () => {
  isEditModalOpen.value = false;
  editHabit.value = null;
  fetchHabits();
};

const isDeleteAlertOpen = ref(false);
const habitToDeleteId = ref<number | null>(null);

const confirmDelete = async () => {
  if (!habitToDeleteId.value) return;

  await deleteHabit(habitToDeleteId.value);
  habitToDeleteId.value = null;
  isDeleteAlertOpen.value = false;
};

const cancelDelete = () => {
  habitToDeleteId.value = null;
  isDeleteAlertOpen.value = false;
};

const handleDelete = (id: number) => {
  habitToDeleteId.value = id;
  isDeleteAlertOpen.value = true;
};

onMounted(() => {
  fetchHabits();
  fetchUnits();
});
</script>

<template>
  <div>
    /pages/habits/index.vue

    <div>
      <UButton
        size="lg"
        color="primary"
        icon="i-heroicons-plus"
        class="mb-2"
        @click="isCreateModalOpen = true"
      >
        Создать привычку
      </UButton>

      <div v-if="isLoading">
        загрузка...
      </div>

      <div
        v-else-if="!habits.length"
        class="text-center py-20 px-8"
      >
        <div>
          <UIcon
            name="i-heroicons-calendar-days"
          />
        </div>
        <h3 class="text-lg font-medium mb-2">
          Привычек пока нет
        </h3>
      </div>

      <div v-else>
        <TransitionGroup
          name="habit"
          tag="div"
          class="flex flex-wrap gap-6 *:min-w-[320px] *:flex-1"
        >
          <HabitCard
            v-for="habit in habitsWithUnitNameReversed"
            :key="habit.id"
            :habit="habit"
            :unit-name="habit.unitName"
            class="w-full"
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
    </div>
    <UAlert
      v-if="isDeleteAlertOpen"
      title="ВНИМАНИЕ!"
      description="Вы собираетесь удалить привычку. Подтвердите действие!"
      color="error"
      variant="subtle"
      orientation="horizontal"
      class="fixed top-14 backdrop-blur-xl"
      :actions="[
        {
          label: 'Удалить',
          color: 'error',
          variant: 'subtle',
          onClick: confirmDelete,
        },
        {
          label: 'Отмена',
          color: 'neutral',
          variant: 'subtle',
          onClick: cancelDelete,
        },
      ]"
    />
  </div>
</template>

<style scoped>
.habit-list-enter-active,
.habit-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.habit-list-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.habit-list-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.habit-list-leave-active {
  position: absolute;
  width: 100%;
  height: 100%;
}

.habit-list-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
