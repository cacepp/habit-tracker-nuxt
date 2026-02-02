import type { Habit, HabitUnit } from '~/types';
import { useIndexedDB } from '~/plugins/indexeddb.client';

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([]);
  const isLoading = ref<boolean>(true);
  const units = ref<HabitUnit[]>([]);
  const orderIds = ref<number[]>([]);

  const db = useIndexedDB();

  const fetchHabits = async () => {
    isLoading.value = true;
    try {
      habits.value = await db.getHabits();
    }
    catch (e) {
      habits.value = [];
      throw new Error(`Ошибка загрузки привычек: ${e}`);
    }
    finally {
      isLoading.value = false;
    }
  };

  const addHabit = async (data: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    habits.value.push(newHabit);
    orderIds.value.push(newHabit.id);

    try {
      await db.addHabit(newHabit);
      await db.saveHabitsOrder(orderIds.value);
    }
    catch (e) {
      habits.value = habits.value.filter(h => h.id !== newHabit.id);
      orderIds.value = orderIds.value.filter(id => id !== newHabit.id);
      throw new Error(`Ошибка добавления привычки: ${e}`);
    }
  };

  const updateHabit = async (habit: Habit) => {
    const index = habits.value.findIndex(h => h.id === habit.id);
    if (index === -1) return;

    const prev = { ...habits.value[index] };
    habits.value[index] = habit;

    try {
      await db.updateHabit(habit);
    }
    catch (e) {
      habits.value[index] = prev;
      throw new Error(`Ошибка обновления привычки: ${e}`);
    }
  };

  const deleteHabit = async (id: number) => {
    const prevHabits = [...habits.value];
    const prevOrder = [...orderIds.value];

    habits.value = habits.value.filter(h => h.id !== id);
    orderIds.value = orderIds.value.filter(hId => hId !== id);

    try {
      await db.deleteHabit(id);
      await db.saveHabitsOrder(orderIds.value);
    }
    catch (e) {
      habits.value = prevHabits;
      orderIds.value = prevOrder;
      throw new Error(`Ошибка удаления привычки: ${e}`);
    }
  };

  const fetchUnits = async () => {
    try {
      units.value = await db.getUnits();
    }
    catch (e) {
      units.value = [];
      throw new Error(`Ошибка загрузки единиц: ${e}`);
    }
  };

  const unitsMap = computed(() => {
    const map = new Map<number, string>();
    units.value.forEach(u => map.set(u.id, u.name));
    return map;
  });

  const orderedHabits = computed(() => {
    const map = new Map(habits.value.map(h => [h.id, h]));
    return orderIds.value.map(id => map.get(id)).filter(Boolean) as Habit[];
  });

  const habitsWithUnits = computed(() =>
    orderedHabits.value.map(h => ({
      ...h,
      unitName: h.unitId ? unitsMap.value.get(h.unitId) : undefined,
    })),
  );

  const initOrder = async () => {
    const savedOrder = await db.getHabitsOrder();

    const ids = habits.value.map(h => h.id);
    if (savedOrder.length === habits.value.length) {
      orderIds.value = savedOrder;
    }
    else {
      orderIds.value = ids;
      await db.saveHabitsOrder(orderIds.value);
    }
  };

  const updateOrder = async (newOrder: number[]) => {
    orderIds.value = [...newOrder];
    await db.saveHabitsOrder(orderIds.value);
  };

  const init = async () => {
    await Promise.all([fetchHabits(), fetchUnits(), initOrder()]);
  };

  return {
    habits, isLoading, units, habitsWithUnits,
    fetchHabits, addHabit, updateHabit, deleteHabit,
    fetchUnits,
    orderIds, updateOrder, init,
  };
});
