import { PlayerBase } from './player-base';
import { PlayerColor } from './player-color';

export class Player extends PlayerBase {
  constructor(public playerNumber: number) {
    super();
  }
}

/**
 * A fresh player for editing: empty name, no color yet. `color` is seeded `null` rather than
 * left absent so a Signal Forms field over the player materializes the sub-field and its
 * `required` rule counts toward validity.
 */
export function blankPlayer(playerNumber = 0): Player {
  const player = new Player(playerNumber);
  player.name = '';
  player.color = null as unknown as PlayerColor;
  return player;
}
