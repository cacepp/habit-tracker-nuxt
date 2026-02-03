import type { HabitEntry } from '@/domain/entities';

export interface IEntryService {
  getEntriesByDate(date: string): Promise<HabitEntry[]>;
  getEntriesInRange(start: string, end: string): Promise<HabitEntry[]>;
  upsertEntry(entry: HabitEntry): Promise<void>;
}
