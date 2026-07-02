import { PlayerSnapshot } from '@player/models/player-snapshot';

/**
 * Plain, JSON-safe snapshot of a health-points game. `deltas` are flat signed-number arrays
 * (parallel to `players`) — damage negative, heal positive — and the starting life is shared by
 * all players, so it's stored once. {@link HealthPointsService.fromSnapshot} rebuilds the model
 * instances, since neither the `Player` instances nor the state classes survive `JSON.parse`.
 */
export interface HealthPointsSnapshot {
  players: PlayerSnapshot[];
  startingLife: number;
  deltas: number[][]; // parallel to players
}
