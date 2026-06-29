import { ScoringRule } from './models/scoring-rule';

/** Maps a category id to its display name, for resolving rule references. */
export type CategoryNames = Map<string, string>;

/**
 * Human-readable "how does this category score?" text for a single rule, with any category
 * references resolved to names via `categoryNames`. Pure and framework-free (like
 * `scoring-engine.ts`), so it can back the grid's category info popup and the rule-set manager
 * without pulling in Angular. Switches exhaustively over the closed `ScoringRule` union — adding
 * a rule kind is a compile error here until it's described.
 */
export function describeRule(rule: ScoringRule, categoryNames: CategoryNames): string {
  switch (rule.kind) {
    case 'flat':
      return 'The entered value is the score.';
    case 'perUnit':
      return `${rule.pointsPerUnit} ${plural(rule.pointsPerUnit, 'point')} per unit entered.`;
    case 'lookupTable':
      return rule.mode === 'exact'
        ? 'Each entered count scores from a fixed table.'
        : 'Scores by the highest step reached (track position).';
    case 'multiplyCategory': {
      const ref = nameOf(categoryNames, rule.categoryId);
      const factor = rule.pointsPerUnit != null && rule.pointsPerUnit !== 1 ? ` × ${rule.pointsPerUnit}` : '';
      return `Value × ${ref}'s entered value${factor}.`;
    }
    case 'aggregateMultiply': {
      const refs = rule.categoryIds.map((id) => nameOf(categoryNames, id)).join(', ');
      return `Value × the ${aggregateWord(rule.aggregate)} of ${refs || '(no categories)'}.`;
    }
  }
}

function nameOf(categoryNames: CategoryNames, id: string): string {
  return categoryNames.get(id) ?? '(category)';
}

function plural(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

function aggregateWord(aggregate: 'min' | 'max' | 'sum'): string {
  switch (aggregate) {
    case 'min':
      return 'lowest';
    case 'max':
      return 'highest';
    case 'sum':
      return 'total';
  }
}
