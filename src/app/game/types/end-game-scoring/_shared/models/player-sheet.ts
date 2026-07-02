import { Player } from '@player/models/player';
import { CategoryValues } from './category-values';
import { PlayerScoreBreakdown } from './player-score-breakdown';

/** A player's entered category values plus the computed breakdown for the chosen config. */
export interface PlayerSheet {
  player: Player;
  values: CategoryValues;
  breakdown: PlayerScoreBreakdown;
}
