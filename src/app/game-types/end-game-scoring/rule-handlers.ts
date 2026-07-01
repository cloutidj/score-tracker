import {
  AggregateMultiplyRule,
  FlatRule,
  LookupTableRule,
  MultiplyCategoryRule,
  PerUnitRule,
  ScoringRule,
  ScoringRuleKind,
} from './models/scoring-rule';

/** A player's raw entered value per category id; a missing id is treated as 0. */
export type CategoryValues = Record<string, number>;

/** Maps a category id to its display name, for resolving rule references. */
export type CategoryNames = Map<string, string>;

/** Everything a rule needs to score, whichever pass it runs in. */
export interface ScoreContext {
  /** This category's entered value. */
  value: number;
  /** All raw entered values, by category id (read by `multiplyCategory`). */
  entered: CategoryValues;
  /** Pass-1 computed points, by category id (read by `aggregateMultiply` in pass 2). */
  computedPoints: Record<string, number>;
}

/**
 * The behavior of one {@link ScoringRule} kind, in one place: how to score it, describe it,
 * seed a fresh one, and label it in the builder. The strategy that the pure scoring engine,
 * the describe helper, and the config builder all dispatch to via {@link ruleHandlers}.
 *
 * `phase` drives the engine's two-pass ordering: `'value'` rules score directly from entered
 * values; `'aggregate'` rules run afterward and may read other categories' pass-1 points.
 */
export interface RuleHandler<R extends ScoringRule> {
  readonly label: string;
  readonly phase: 'value' | 'aggregate';
  defaultRule(): R;
  score(rule: R, ctx: ScoreContext): number;
  describe(rule: R, names: CategoryNames): string;
}

const flat: RuleHandler<FlatRule> = {
  label: 'Flat (value is the points)',
  phase: 'value',
  defaultRule: () => ({ kind: 'flat' }),
  score: (_rule, ctx) => ctx.value,
  describe: () => 'The entered value is the score.',
};

const perUnit: RuleHandler<PerUnitRule> = {
  label: 'Per unit (value × points)',
  phase: 'value',
  defaultRule: () => ({ kind: 'perUnit', pointsPerUnit: 1 }),
  score: (rule, ctx) => ctx.value * rule.pointsPerUnit,
  describe: (rule) => `${rule.pointsPerUnit} ${plural(rule.pointsPerUnit, 'point')} per unit entered.`,
};

const lookupTable: RuleHandler<LookupTableRule> = {
  label: 'Lookup table (value → points)',
  phase: 'value',
  defaultRule: () => ({ kind: 'lookupTable', mode: 'threshold', table: [] }),
  score: (rule, ctx) => lookup(rule, ctx.value),
  describe: (rule) =>
    rule.mode === 'exact'
      ? 'Each entered count scores from a fixed table.'
      : 'Scores by the highest step reached (track position).',
};

const multiplyCategory: RuleHandler<MultiplyCategoryRule> = {
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

const aggregateMultiply: RuleHandler<AggregateMultiplyRule> = {
  label: 'Multiply by min/max/sum of categories',
  phase: 'aggregate',
  defaultRule: () => ({ kind: 'aggregateMultiply', aggregate: 'sum', categoryIds: [] }),
  score: (rule, ctx) => {
    const refs = rule.categoryIds.map((id) => ctx.computedPoints[id] ?? 0);
    return ctx.value * (refs.length ? aggregateOf(rule.aggregate, refs) : 0);
  },
  describe: (rule, names) => {
    const refs = rule.categoryIds.map((id) => nameOf(names, id)).join(', ');
    return `Value × the ${aggregateWord(rule.aggregate)} of ${refs || '(no categories)'}.`;
  },
};

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

function nameOf(names: CategoryNames, id: string): string {
  return names.get(id) ?? '(category)';
}

function plural(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

function aggregateWord(aggregate: AggregateMultiplyRule['aggregate']): string {
  switch (aggregate) {
    case 'min':
      return 'lowest';
    case 'max':
      return 'highest';
    case 'sum':
      return 'total';
  }
}
