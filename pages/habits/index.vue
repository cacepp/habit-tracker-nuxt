<script setup lang="ts">
import type { Habit } from '~/types';

const habitsStore = useHabitsStore();
const { habits, isLoading } = storeToRefs(habitsStore);
const { fetchHabits, deleteHabit } = habitsStore;

const isCreateModalOpen = ref<boolean>(false);
const isEditModalOpen = ref<boolean>(false);

const editHabit = ref<Habit | null>(null);
const reversedHabits = computed(() => {
  return [...habits.value].reverse();
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

const handleDelete = async (id: number) => {
  await deleteHabit(id);
};

onMounted(() => {
  fetchHabits();
});
</script>

<template>
  <div>
    /pages/habits/index.vue
    <div>
      <div>
        <UButton
          size="lg"
          color="primary"
          icon="i-heroicons-plus"
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
            class="grid gap-6 auto-rows-[minmax(240px,auto)] grid-cols-[repeat(auto-fit,minmax(320px,1fr))]"
          >
            <HabitCard
              v-for="habit in reversedHabits"
              :key="habit.id"
              :habit="habit"
              class="w-full"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </TransitionGroup>
        </div>

        <UModal v-model:open="isCreateModalOpen">
          <template #content>
            <div class="p-4">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold">
                  Новая привычка
                </h2>
              </div>

              <HabitForm
                @created="handleCreated"
                @close="isCreateModalOpen = false"
              />
            </div>
          </template>
        </UModal>

        <UModal v-model:open="isEditModalOpen">
          <template #content>
            <div class="p-4">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold">
                  Редактировать привычку
                </h2>
              </div>

              <HabitForm
                v-if="editHabit"
                :habit="editHabit"
                @updated="handleUpdated"
                @close="isEditModalOpen = false"
              />
            </div>
          </template>
        </UModal>
      </div>
    </div>
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
