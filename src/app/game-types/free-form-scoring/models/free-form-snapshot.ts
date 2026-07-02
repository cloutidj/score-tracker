import { PlayerSnapshot } from '@player/models/player-snapshot';

/**
 * Plain, JSON-safe snapshot of the live game. Scores are flat number arrays (parallel to
 * `players`) and the player instances are flattened to primitives, since neither survives
 * `JSON.parse`; {@link FreeFormScoringService.fromSnapshot} rebuilds the model instances.
 */
export interface FreeFormSnapshot {
  players: PlayerSnapshot[];
  scores: number[][]; // parallel to players
}
