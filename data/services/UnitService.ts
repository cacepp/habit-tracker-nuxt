import type { IUnitService } from '@/domain/services/IUnitService';
import { injectable, inject } from 'tsyringe';
import type { IUnitRepository } from '@/domain/repositories/IUnitRepository';
import type { IHabitRepository } from '@/domain/repositories/IHabitRepository';
import type { Habit, HabitUnit } from '@/domain/entities';

@injectable()
export class UnitService implements IUnitService {
  constructor(
    @inject('IUnitRepository')
    private readonly unitsRepo: IUnitRepository,

    @inject('IHabitRepository')
    private readonly habitsRepo: IHabitRepository,
  ) {}

  async getUnits(): Promise<HabitUnit[]> {
    return this.unitsRepo.getAll();
  }

  async addUnit(name: string): Promise<HabitUnit> {
    const units = await this.unitsRepo.getAll();
    if (units.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      throw new Error(`Единица измерения с таким именем ("${name}") уже существует`);
    }

    const newUnit: HabitUnit = { id: Date.now(), name };
    await this.unitsRepo.save([...units, newUnit]);
    return newUnit;
  }

  async updateUnit(id: number, name: string): Promise<void> {
    const units = await this.unitsRepo.getAll();
    if (units.some(u => u.name.toLowerCase() === name.toLowerCase() && u.id !== id)) {
      throw new Error(`Единица измерения с таким именем ("${name}") уже существует`);
    }
    if (!name) throw new Error('Название не должно быть пустым');

    const unit = units.find(u => u.id === id);
    if (!unit) return;

    unit.name = name;
    await this.unitsRepo.save([...units]);
  }

  async deleteUnit(id: number): Promise<void> {
    const habits = await this.habitsRepo.getAll();
    const count = habits.filter((h: Habit) => h.unitId === id).length;
    if (count > 0) throw new Error(`Привычек с такой единицей: ${count}`);

    const units = (await this.unitsRepo.getAll()).filter(u => u.id !== id);
    await this.unitsRepo.save(units);
  }
}
