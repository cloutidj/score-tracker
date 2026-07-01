import { RuleHandler } from '../rule-handler';

/**
 * points = a table lookup of the entered value. `threshold` mode picks the points of the
 * highest `at` not exceeding the value (a step/track, e.g. a "That's So Clever" green track);
 * `exact` mode matches `at === value` (0 if none, e.g. a blue-box count→points table). The
 * table need not be pre-sorted.
 */
export interface LookupTableRule {
  kind: 'lookupTable';
  mode: 'threshold' | 'exact';
  table: LookupEntry[];
}

export interface LookupEntry {
  at: number;
  points: number;
}

export const lookupTable: RuleHandler<LookupTableRule> = {
  label: 'Lookup table (value → points)',
  phase: 'value',
  defaultRule: () => ({ kind: 'lookupTable', mode: 'threshold', table: [] }),
  score: (rule, ctx) => lookup(rule, ctx.value),
  describe: (rule) =>
    rule.mode === 'exact'
      ? 'Each entered count scores from a fixed table.'
      : 'Scores by the highest step reached (track position).',
};

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
