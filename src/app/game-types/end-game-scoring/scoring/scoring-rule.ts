import { FlatRule } from './rules/flat-rule';
import { PerUnitRule } from './rules/per-unit-rule';
import { LookupTableRule } from './rules/lookup-table-rule';
import { MultiplyCategoryRule } from './rules/multiply-category-rule';
import { AggregateMultiplyRule } from './rules/aggregate-multiply-rule';

/**
 * The fixed catalog of ways one category contributes to a player's final score. A
 * discriminated union on `kind`: the pure scoring engine (see `scoring-engine.ts`) switches
 * on it to turn a player's entered value for a category into points.
 *
 * Deliberately a closed set of rule kinds rather than a general formula engine — it covers
 * the common board-game mechanisms (flat totals, per-unit multipliers, count→points tables,
 * cross-category multipliers) while staying bounded and serializable. Each kind's variant
 * interface and its behavior live together in one file under `rules/`; adding a kind means
 * adding one such file and listing it here and in `rule-registry.ts` — nothing in the core.
 */
export type ScoringRule =
  | FlatRule
  | PerUnitRule
  | LookupTableRule
  | MultiplyCategoryRule
  | AggregateMultiplyRule;

export type ScoringRuleKind = ScoringRule['kind'];
