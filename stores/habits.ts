import type { Habit, HabitUnit } from '~/types';
import { useIndexedDB } from '~/plugins/indexeddb.client';

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([]);
  const isLoading = ref<boolean>(true);
  const units = ref<HabitUnit[]>([]);

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

    try {
      await db.addHabit(newHabit);
    }
    catch (e) {
      habits.value = habits.value.filter(h => h.id !== newHabit.id);
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
    const prev = [...habits.value];
    habits.value = habits.value.filter(h => h.id !== id);

    try {
      await db.deleteHabit(id);
    }
    catch (e) {
      habits.value = prev;
      throw new Error(`Ошибка удаления привычки: ${e}`);
    }
  };

  const fetchUnits = async () => {
    try {
      units.value = await db.getUnits();
    }
    catch (e) {
      units.value = [];
      throw new Error(`Ошибка удаления единиц: ${e}`);
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

  const habitsWithUnits = computed(() =>
    habits.value.map(h => ({
      ...h,
      unitName: h.unitId ? unitsMap.value.get(h.unitId) : undefined,
    })),
  );

  const init = async () => {
    await Promise.all([fetchHabits(), fetchUnits()]);
  };

  return {
    habits, isLoading, units, habitsWithUnits,
    fetchHabits, addHabit, updateHabit, deleteHabit,
    fetchUnits, addUnit, updateUnit, deleteUnit,
    init,
  };
});
