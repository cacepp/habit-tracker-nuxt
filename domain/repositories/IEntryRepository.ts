import type { HabitEntry } from '@/domain/entities';

export interface IEntryRepository {
  getAll(): Promise<HabitEntry[]>;
  getByDate(date: string): Promise<HabitEntry[]>;
  getInRange(start: string, end: string): Promise<HabitEntry[]>;
  save(entries: HabitEntry[]): Promise<void>;
  add(entry: HabitEntry): Promise<void>;
  update(entry: HabitEntry): Promise<void>;
  delete(id: number): Promise<void>;
}
