import type { HabitEntry } from '@/domain/entities';
import type { IEntryRepository } from '@/domain/repositories/IEntryRepository';
import { get, set } from 'idb-keyval';
import { injectable } from 'tsyringe';
import { DBKeys } from '@/core/constants';

@injectable()
export class EntryRepository implements IEntryRepository {
  async getAll(): Promise<HabitEntry[]> {
    return (await get<HabitEntry[]>(DBKeys.ENTRIES)) || [];
  }

  async getByDate(date: string): Promise<HabitEntry[]> {
    return (await this.getAll()).filter(e => e.date === date);
  }

  async getInRange(start: string, end: string): Promise<HabitEntry[]> {
    return (await this.getAll()).filter(e => e.date >= start && e.date <= end);
  }

  async save(entries: HabitEntry[]): Promise<void> {
    await set(DBKeys.ENTRIES, structuredClone(entries));
  }

  async add(entry: HabitEntry): Promise<void> {
    const entries = await this.getAll();
    await this.save([...entries, entry]);
  }

  async update(entry: HabitEntry): Promise<void> {
    const entries = await this.getAll();
    await this.save(entries.map(e => e.id === entry.id ? entry : e));
  }

  async delete(id: number): Promise<void> {
    const entries = await this.getAll();
    await this.save(entries.filter(e => e.id !== id));
  }
}
