import { RuleHandler } from '../rule-handler';
import { nameOf } from '../name-of';

/**
 * points = value × an aggregate of the referenced categories' *computed points*. Models
 * bonuses that scale with other scores — e.g. "That's So Clever" foxes, each worth the
 * player's lowest color score. Referencing another `aggregateMultiply` is unsupported (that
 * reference contributes 0); the builder prevents authoring it.
 */
export interface AggregateMultiplyRule {
  kind: 'aggregateMultiply';
  aggregate: 'min' | 'max' | 'sum';
  categoryIds: string[];
}

export const aggregateMultiply: RuleHandler<AggregateMultiplyRule> = {
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
