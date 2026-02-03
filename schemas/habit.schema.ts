import * as v from 'valibot';

export const formSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, 'Введите название привычки'),
    ),
    type: v.picklist(['boolean', 'numeric']),
    target: v.optional(
      v.pipe(
        v.number('Введите целое число'),
        v.minValue(1, 'Минимум 1 и больше'),
      )),
    unitId: v.optional(v.number()),
    color: v.string(),
    icon: v.string(),
    isActive: v.boolean(),
    highPriority: v.boolean(),
  }),
  v.check(
    data =>
      data.type !== 'numeric'
      || (data.target !== undefined && data.unitId !== undefined),
    'Для числовой привычки укажите цель и единицу измерения',
  ),
);

export type HabitFormSchema = v.InferInput<typeof formSchema>;
