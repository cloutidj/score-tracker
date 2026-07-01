import { ScoringCategory, ScoringConfig } from './models/scoring-config';
import { CategoryValues, ruleHandler } from './rule-handlers';

export type { CategoryValues } from './rule-handlers';

export interface PlayerScoreBreakdown {
  /** Points contributed by each category, keyed by category id. */
  categoryPoints: Record<string, number>;
  total: number;
}

/**
 * Compute one player's per-category points and total from their entered values, per a
 * config's rules. Pure and framework-free, so it can be reasoned about and unit-tested on
 * its own; each rule kind's scoring lives in its handler in `rule-handlers.ts`.
 *
 * Two passes, because some rules depend on other categories' results:
 *   1. Every `'value'`-phase rule is scored from raw entered values — a `flat`, `perUnit`,
 *      `lookupTable`, or `multiplyCategory` value never depends on a computed score.
 *   2. `'aggregate'`-phase rules are scored from the pass-1 points (e.g. foxes × the lowest
 *      color score). An aggregate referencing another aggregate gets 0 for that reference —
 *      chains aren't supported, and the builder won't author one.
 */
export function computePlayerScore(
  config: ScoringConfig,
  values: CategoryValues,
): PlayerScoreBreakdown {
  const categoryPoints: Record<string, number> = {};

  for (const category of config.categories) {
    if (ruleHandler(category.rule.kind).phase === 'value') {
      categoryPoints[category.id] = score(category, values, categoryPoints);
    }
  }

  for (const category of config.categories) {
    if (ruleHandler(category.rule.kind).phase === 'aggregate') {
      categoryPoints[category.id] = score(category, values, categoryPoints);
    }
  }

  const total = config.categories.reduce((sum, c) => sum + (categoryPoints[c.id] ?? 0), 0);
  return { categoryPoints, total };
}

function score(
  category: ScoringCategory,
  values: CategoryValues,
  computedPoints: Record<string, number>,
): number {
  return ruleHandler(category.rule.kind).score(category.rule, {
    value: values[category.id] ?? 0,
    entered: values,
    computedPoints,
  });
}
