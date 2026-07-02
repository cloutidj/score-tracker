import { RuleHandler } from '../rule-handler';
import { nameOf } from '../name-of';

/**
 * points = value × the referenced category's *entered value* (× optional `pointsPerUnit`,
 * default 1). For "this many of that" scoring across two entered categories.
 */
export interface MultiplyCategoryRule {
  kind: 'multiplyCategory';
  categoryId: string;
  pointsPerUnit?: number;
}

export const multiplyCategory: RuleHandler<MultiplyCategoryRule> = {
  label: 'Multiply by another category',
  phase: 'value',
  defaultRule: () => ({ kind: 'multiplyCategory', categoryId: '', pointsPerUnit: 1 }),
  score: (rule, ctx) => ctx.value * (ctx.entered[rule.categoryId] ?? 0) * (rule.pointsPerUnit ?? 1),
  describe: (rule, names) => {
    const ref = nameOf(names, rule.categoryId);
    const factor = rule.pointsPerUnit != null && rule.pointsPerUnit !== 1 ? ` × ${rule.pointsPerUnit}` : '';
    return `Value × ${ref}'s entered value${factor}.`;
  },
};
