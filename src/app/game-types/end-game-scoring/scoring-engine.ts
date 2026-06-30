import { ScoringCategory, ScoringConfig } from './models/scoring-config';
import { AggregateMultiplyRule, LookupTableRule } from './models/scoring-rule';

/** A player's raw entered value per category id; a missing id is treated as 0. */
export type CategoryValues = Record<string, number>;

export interface PlayerScoreBreakdown {
  /** Points contributed by each category, keyed by category id. */
  categoryPoints: Record<string, number>;
  total: number;
}

/**
 * Compute one player's per-category points and total from their entered values, per a
 * config's rules. Pure and framework-free, so it can be reasoned about and unit-tested on
 * its own (the rules catalog lives in `models/scoring-rule.ts`).
 *
 * Two passes, because some rules depend on other categories' results:
 *   1. Every non-`aggregateMultiply` category is scored from raw values — a `flat`,
 *      `perUnit`, `lookupTable`, or `multiplyCategory` value never depends on a computed
 *      score, only on entered values.
 *   2. `aggregateMultiply` categories are scored from the pass-1 points (e.g. foxes × the
 *      lowest color score). An aggregate referencing another aggregate gets 0 for that
 *      reference — chains aren't supported, and the builder won't author one.
 */
export function computePlayerScore(
  config: ScoringConfig,
  values: CategoryValues,
): PlayerScoreBreakdown {
  const categoryPoints: Record<string, number> = {};

  // Pass 1: everything that scores directly from entered values.
  for (const category of config.categories) {
    if (category.rule.kind !== 'aggregateMultiply') {
      categoryPoints[category.id] = scoreCategory(category, values);
    }
  }

  // Pass 2: aggregates over the pass-1 points.
  for (const category of config.categories) {
    if (category.rule.kind === 'aggregateMultiply') {
      categoryPoints[category.id] = scoreAggregate(category.rule, valueOf(values, category.id), categoryPoints);
    }
  }

  const total = config.categories.reduce((sum, c) => sum + (categoryPoints[c.id] ?? 0), 0);
  return { categoryPoints, total };
}

function valueOf(values: CategoryValues, id: string): number {
  return values[id] ?? 0;
}

function scoreCategory(category: ScoringCategory, values: CategoryValues): number {
  const v = valueOf(values, category.id);
  const rule = category.rule;
  switch (rule.kind) {
    case 'flat':
      return v;
    case 'perUnit':
      return v * rule.pointsPerUnit;
    case 'lookupTable':
      return lookup(rule, v);
    case 'multiplyCategory':
      return v * valueOf(values, rule.categoryId) * (rule.pointsPerUnit ?? 1);
    case 'aggregateMultiply':
      return 0; // scored in pass 2
  }
}

function lookup(rule: LookupTableRule, v: number): number {
  if (rule.mode === 'exact') {
    return rule.table.find((entry) => entry.at === v)?.points ?? 0;
  }
  // threshold: the points of the highest `at` not exceeding v.
  let best: number | undefined;
  let bestAt = -Infinity;
  for (const entry of rule.table) {
    if (entry.at <= v && entry.at >= bestAt) {
      bestAt = entry.at;
      best = entry.points;
    }
  }
  return best ?? 0;
}

function scoreAggregate(
  rule: AggregateMultiplyRule,
  value: number,
  categoryPoints: Record<string, number>,
): number {
  const refs = rule.categoryIds.map((id) => categoryPoints[id] ?? 0);
  return value * (refs.length ? aggregateOf(rule.aggregate, refs) : 0);
}

function aggregateOf(kind: AggregateMultiplyRule['aggregate'], nums: number[]): number {
  switch (kind) {
    case 'min':
      return Math.min(...nums);
    case 'max':
      return Math.max(...nums);
    case 'sum':
      return nums.reduce((a, b) => a + b, 0);
  }
}
