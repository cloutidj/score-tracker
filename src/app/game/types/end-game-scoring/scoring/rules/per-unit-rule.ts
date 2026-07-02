import { RuleHandler } from '../rule-handler';

/** points = value × pointsPerUnit (e.g. 1 VP per greenery tile, 5 VP per milestone). */
export interface PerUnitRule {
  kind: 'perUnit';
  pointsPerUnit: number;
}

export const perUnit: RuleHandler<PerUnitRule> = {
  label: 'Per unit (value × points)',
  phase: 'value',
  defaultRule: () => ({ kind: 'perUnit', pointsPerUnit: 1 }),
  score: (rule, ctx) => ctx.value * rule.pointsPerUnit,
  describe: (rule) => `${rule.pointsPerUnit} ${plural(rule.pointsPerUnit, 'point')} per unit entered.`,
};

function plural(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}
