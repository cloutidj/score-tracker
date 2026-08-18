import { ScoringRule } from '@game-types/end-game-scoring/scoring/scoring-rule';

/** One line on a scoring sheet: a named quantity the player enters, plus how it scores. */
export interface ScoringCategory {
  /** Stable within its config; referenced by `multiplyCategory` / `aggregateMultiply` rules. */
  id: string;
  name: string;
  /** Compact column header for the grid; falls back to `name` when absent. */
  shortName?: string;
  /** One- or two-sentence "what to enter" help, shown in the category info popup. */
  description?: string;
  rule: ScoringRule;
}
