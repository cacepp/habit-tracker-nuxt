import type { HabitUnit } from '@/domain/entities';
import type { IUnitRepository } from '@/domain/repositories/IUnitRepository';
import { get, set } from 'idb-keyval';
import { injectable } from 'tsyringe';
import { DBKeys } from '@/core/constants';

@injectable()
export class UnitRepository implements IUnitRepository {
  async getAll(): Promise<HabitUnit[]> {
    return (await get<HabitUnit[]>(DBKeys.UNITS)) || [];
  }

  async save(units: HabitUnit[]): Promise<void> {
    await set(DBKeys.UNITS, structuredClone(units));
  }
}
