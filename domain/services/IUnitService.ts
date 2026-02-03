import type { HabitUnit } from '@/domain/entities';

export interface IUnitService {
  getUnits(): Promise<HabitUnit[]>;
  addUnit(name: string): Promise<HabitUnit>;
  updateUnit(id: number, name: string): Promise<void>;
  deleteUnit(id: number): Promise<void>;
}
