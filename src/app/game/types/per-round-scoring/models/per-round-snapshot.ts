import { PlayerSnapshot } from '@player/models/player-snapshot';

/**
 * Plain, JSON-safe snapshot of the live game. The runtime state is class instances with
 * methods, none of which survive `JSON.parse`, so we serialize to this flat shape and
 * rebuild the instances in {@link PerRoundScoringService.fromSnapshot}.
 */
export interface PerRoundSessionSnapshot {
  players: PlayerSnapshot[];
  roundScores: { round: number; score: number }[][]; // parallel to players
  gameRounds: number[]; // roundIds; labels re-derived
  currentRound: number;
  currentPlayerIndex: number;
}
