import { ScoringRule, ScoringRuleKind } from './scoring-rule';
import { RuleHandler } from './rule-handler';
import { flat } from './rules/flat-rule';
import { perUnit } from './rules/per-unit-rule';
import { lookupTable } from './rules/lookup-table-rule';
import { multiplyCategory } from './rules/multiply-category-rule';
import { aggregateMultiply } from './rules/aggregate-multiply-rule';

/** One handler per rule kind. The mapped type forces an entry for every kind. */
type RuleRegistry = { [K in ScoringRuleKind]: RuleHandler<Extract<ScoringRule, { kind: K }>> };

export const ruleHandlers: RuleRegistry = {
  flat,
  perUnit,
  lookupTable,
  multiplyCategory,
  aggregateMultiply,
};

/** Erase the per-kind generic for runtime dispatch on a union value. */
export function ruleHandler(kind: ScoringRuleKind): RuleHandler<ScoringRule> {
  return ruleHandlers[kind] as RuleHandler<ScoringRule>;
}
