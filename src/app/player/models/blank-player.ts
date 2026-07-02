import { Player } from './player';
import { StColor } from '@color/models/st-color';

/**
 * A fresh player for editing: empty name, no color yet. `color` is seeded `null` rather than
 * left absent so a Signal Forms field over the player materializes the sub-field and its
 * `required` rule counts toward validity.
 */
export function blankPlayer(playerNumber = 0): Player {
  const player = new Player(playerNumber);
  player.name = '';
  player.color = null as unknown as StColor;
  return player;
}
