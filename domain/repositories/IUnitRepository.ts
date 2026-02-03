import type { HabitUnit } from '@/domain/entities';

export interface IUnitRepository {
  getAll(): Promise<HabitUnit[]>;
  save(units: HabitUnit[]): Promise<void>;
}
