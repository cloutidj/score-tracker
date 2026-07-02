import { PlayerSnapshot } from '@player/models/player-snapshot';
import { CategoryValues } from './category-values';
import { ScoringConfig } from './scoring-config';

/**
 * Plain, JSON-safe snapshot of the live game. The chosen {@link ScoringConfig} is embedded
 * whole, so a resumed game keeps scoring even if the source config is later edited or
 * deleted; players are flattened to primitives (rebuilt on restore) and values are kept by
 * `playerNumber`.
 */
export interface EndGameSnapshot {
  config: ScoringConfig;
  players: PlayerSnapshot[];
  values: Record<number, CategoryValues>;
}
