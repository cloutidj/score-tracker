import { ScoringRule } from './models/scoring-rule';
import { CategoryNames, ruleHandler } from './rule-handlers';

export type { CategoryNames } from './rule-handlers';

/**
 * Human-readable "how does this category score?" text for a single rule, with any category
 * references resolved to names via `categoryNames`. Pure and framework-free (like
 * `scoring-engine.ts`), so it can back the grid's category info popup and the rule-set manager
 * without pulling in Angular. Delegates to the rule's handler in `rule-handlers.ts`.
 */
export function describeRule(rule: ScoringRule, categoryNames: CategoryNames): string {
  return ruleHandler(rule.kind).describe(rule, categoryNames);
}
