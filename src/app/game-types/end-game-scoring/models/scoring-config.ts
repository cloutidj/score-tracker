import { ScoringRule } from './scoring-rule';

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

/**
 * A named scoring sheet for a game: an ordered list of categories with their rules. Either a
 * code-provided built-in (`builtIn: true`, see `data/built-in-configs.ts`) or a user-created
 * one persisted via {@link import('../scoring-config.store').ScoringConfigStore}. Chosen at
 * setup and embedded in the live session's snapshot, so an in-progress game keeps scoring
 * even if the source config is later edited or deleted.
 */
export interface ScoringConfig {
  id: string;
  name: string;
  builtIn: boolean;
  categories: ScoringCategory[];
}
