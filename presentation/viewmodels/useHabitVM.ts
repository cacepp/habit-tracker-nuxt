import { useDI } from '@/core/di/provider';
import type { IHabitService } from '@/domain/services/IHabitService';
import type { Habit, HabitUnit } from '@/domain/entities';
import type { IUnitService } from '@/domain/services/IUnitService';

export const useHabitVM = defineStore('TEMP_habit', () => {
  const habitService = useDI().resolve<IHabitService>('IHabitService');
  const unitService = useDI().resolve<IUnitService>('IUnitService');

  const habits = ref<Habit[]>([]);
  const units = ref<HabitUnit[]>([]);
  const isLoading = ref(false);

  const loadHabits = async () => {
    isLoading.value = true;
    try {
      habits.value = await habitService.getHabits();
    }
    finally {
      isLoading.value = false;
    }
  };

  const loadUnits = async () => {
    units.value = await unitService.getUnits();
  };

  const init = async () => {
    await Promise.all([loadHabits(), loadUnits()]);
  };

  const addHabit = async (
    data: Omit<Habit, 'id' | 'createdAt'>,
    highPriority: boolean,
  ) => {
    const newHabit = await habitService.addHabit(data, highPriority);
    await loadHabits();

    return newHabit;
  };

  const updateHabit = async (habit: Habit) => {
    const prev = [...habits.value];

    habits.value = habits.value.map((h: Habit) => h.id === habit.id ? habit : h);

    try {
      await habitService.updateHabit(habit);
    }
    catch (e) {
      habits.value = prev;
      throw e;
    }
  };

  const deleteHabit = async (id: number) => {
    const prev = [...habits.value];
    habits.value = habits.value.filter((h: Habit) => h.id !== id);

    try {
      await habitService.deleteHabit(id);
    }
    catch (e) {
      habits.value = prev;
      throw e;
    }
  };

  const deactivateHabit = async (habit: Habit, date: string) => {
    const updated = { ...habit, isActive: false, deactivatedAt: date };
    await updateHabit(updated);
  };

  const activateHabit = async (habit: Habit) => {
    const updated = { ...habit, isActive: true, deactivatedAt: undefined };
    await updateHabit(updated);
  };

  const updateOrder = async (newOrder: number[]) => {
    const prev = [...habits.value];

    habits.value = newOrder
      .map(id => habits.value.find((h: Habit) => h.id === id))
      .filter(Boolean) as Habit[];

    try {
      await habitService.updateOrder(newOrder);
    }
    catch (e) {
      habits.value = prev;
      throw e;
    }
  };

  const addUnit = async (name: string) => {
    const newUnit = await unitService.addUnit(name);
    units.value.push(newUnit);
  };

  const updateUnit = async (id: number, name: string) => {
    const prev = [...units.value];
    const unit = units.value.find(u => u.id === id);
    if (!unit) return;

    unit.name = name;

    try {
      await unitService.updateUnit(id, name);
    }
    catch (e) {
      units.value = prev;
      throw e;
    }
  };

  const deleteUnit = async (id: number) => {
    const prev = [...units.value];
    units.value = units.value.filter(u => u.id !== id);

    try {
      await unitService.deleteUnit(id);
    }
    catch (e) {
      units.value = prev;
      throw e;
    }
  };

  const unitsMap = computed(() => {
    const map = new Map<number, string>();
    units.value.forEach(u => map.set(u.id, u.name));
    return map;
  });

  const habitsWithUnits = computed(() =>
    habits.value.map((h: Habit) => ({
      ...h,
      unitName: h.unitId ? unitsMap.value.get(h.unitId) : undefined,
    })),
  );

  return {
    habits,
    units,
    habitsWithUnits,
    isLoading,

    init,
    loadHabits,

    addHabit,
    updateHabit,
    deleteHabit,
    deactivateHabit,
    activateHabit,
    updateOrder,

    addUnit,
    updateUnit,
    deleteUnit,
  };
});
