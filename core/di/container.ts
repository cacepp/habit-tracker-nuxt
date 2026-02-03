import { container } from 'tsyringe';
import { HabitRepository } from '@/data/repositories/HabitRepository';
import { HabitService } from '@/data/services/HabitService';
import { EntryRepository } from '@/data/repositories/EntryRepository';
import { EntryService } from '@/data/services/EntryService';
import { UnitRepository } from '@/data/repositories/UnitRepository';
import { UnitService } from '@/data/services/UnitService';

type DependencyRegistration = {
  token: string | symbol;
  provider: { useClass: new (...args: any[]) => any };
};

const dependencies: DependencyRegistration[] = [
  {
    token: 'IHabitRepository',
    provider: { useClass: HabitRepository },
  },
  {
    token: 'IHabitService',
    provider: { useClass: HabitService },
  },
  {
    token: 'IEntryRepository',
    provider: { useClass: EntryRepository },
  },
  {
    token: 'IEntryService',
    provider: { useClass: EntryService },
  },
  {
    token: 'IUnitRepository',
    provider: { useClass: UnitRepository },
  },
  {
    token: 'IUnitService',
    provider: { useClass: UnitService },
  },
];

export const registerDependencies = () => {
  dependencies.forEach(({ token, provider }) => {
    container.register(token, provider);
  });
};
