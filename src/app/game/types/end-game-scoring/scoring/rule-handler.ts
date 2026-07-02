import { ScoringRule } from './scoring-rule';
import { ScoreContext } from './score-context';
import { CategoryNames } from '../_shared/models/category-names';

/**
 * The behavior of one {@link ScoringRule} kind, in one place: how to score it, describe it,
 * seed a fresh one, and label it in the builder. The strategy that the pure scoring engine,
 * the describe helper, and the config builder all dispatch to via `ruleHandlers`. Each kind's
 * variant interface and handler live together in one file under `rules/`.
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
