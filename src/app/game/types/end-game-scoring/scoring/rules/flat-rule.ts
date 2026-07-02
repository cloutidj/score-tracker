import { RuleHandler } from '../rule-handler';

/** The entered value *is* the points (e.g. Terraform Rating, card VP, a hand-summed total). */
export interface FlatRule {
  kind: 'flat';
}

export const flat: RuleHandler<FlatRule> = {
  label: 'Flat (value is the points)',
  phase: 'value',
  defaultRule: () => ({ kind: 'flat' }),
  score: (_rule, ctx) => ctx.value,
  describe: () => 'The entered value is the score.',
};
