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

  const deactivateHabit = async (habit: Habit, date: string) => {
    const prev = { ...habit };

    habit.isActive = false;
    habit.deactivatedAt = date;

    try {
      await db.updateHabit(habit);
    }
    catch (e) {
      Object.assign(habit, prev);
      throw new Error(`Ошибка деактивации привычки: ${e}`);
    }
  };

  const activateHabit = async (habit: Habit) => {
    const prev = { ...habit };

    habit.isActive = true;
    habit.deactivatedAt = undefined;

    try {
      await db.updateHabit(habit);
    }
    catch (e) {
      Object.assign(habit, prev);
      throw new Error(`Ошибка активации привычки: ${e}`);
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

  const addUnit = async (name: string) => {
    if (units.value.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      throw new Error(`Единица измерения с таким именем ("${name}") уже существует`);
    }
    const newUnit: HabitUnit = { id: Date.now(), name };
    units.value.push(newUnit);
    await db.saveUnits(units.value.map(u => ({ ...u })));
  };

  const updateUnit = async (id: number, name: string) => {
    if (units.value.some(u => u.name.toLowerCase() === name.toLowerCase() && u.id !== id)) {
      throw new Error(`Единица измерения с таким именем ("${name}") уже существует`);
    }
    else if (name.length === 0) {
      throw new Error(`Название не должно быть пустым`);
    }

    const unit = units.value.find(u => u.id === id);
    if (!unit) return;
    unit.name = name;
    await db.saveUnits(units.value.map(u => ({ ...u })));
  };

  const deleteUnit = async (id: number) => {
    const count = habits.value.filter(h => h.unitId === id).length;

    if (count > 0) {
      throw new Error(`Привычек с такой единицей: ${count}`);
    }

    units.value = units.value.filter(u => u.id !== id);
    await db.saveUnits(units.value.map(u => ({ ...u })));
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
    deactivateHabit, activateHabit,
    fetchUnits, addUnit, updateUnit, deleteUnit,
    orderIds, updateOrder, init,
  };
});
