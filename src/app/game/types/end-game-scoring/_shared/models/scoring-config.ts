import { ScoringCategory } from './scoring-category';

/**
 * A named scoring sheet for a game: an ordered list of categories with their rules. Either a
 * code-provided built-in (`builtIn: true`, see `config/built-in/`) or a user-created
 * one persisted via {@link import('../../config/scoring-config.store').ScoringConfigStore}. Chosen at
 * setup and embedded in the live session's snapshot, so an in-progress game keeps scoring
 * even if the source config is later edited or deleted.
 */
export interface ScoringConfig {
  id: string;
  name: string;
  builtIn: boolean;
  categories: ScoringCategory[];
}
