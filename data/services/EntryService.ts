import { injectable, inject } from 'tsyringe';
import type { IEntryService } from '@/domain/services/IEntryService';
import type { IEntryRepository } from '@/domain/repositories/IEntryRepository';
import type { HabitEntry } from '@/domain/entities';

@injectable()
export class EntryService implements IEntryService {
  constructor(
    @inject('IEntryRepository')
    private readonly entryRepo: IEntryRepository,
  ) {}

  async getEntriesByDate(date: string): Promise<HabitEntry[]> {
    return this.entryRepo.getByDate(date);
  }

  async getEntriesInRange(start: string, end: string): Promise<HabitEntry[]> {
    return this.entryRepo.getInRange(start, end);
  }

  async upsertEntry(entry: HabitEntry): Promise<void> {
    const entries = await this.entryRepo.getAll();

    const existing = entries.find(e =>
      e.habitId === entry.habitId && e.date === entry.date,
    );

    if (existing) {
      await this.entryRepo.update({
        ...existing,
        ...entry,
        id: existing.id,
      });
    }
    else {
      await this.entryRepo.add({
        ...entry,
        id: Date.now(),
      });
    }
  }
}
