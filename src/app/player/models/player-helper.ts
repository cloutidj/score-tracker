import { Player } from './player';
import { StColor } from '@color/models/st-color';

/**
 * Static helper for constructing {@link Player} values, paired with the plain-data model —
 * same shape as {@link import('@color/models/color-helper').ColorHelper} beside `StColor`.
 */
export class PlayerHelper {
  /**
   * A fresh player for editing: empty name, no color yet. `color` is seeded `null` rather than
   * left absent so a Signal Forms field over the player materializes the sub-field and its
   * `required` rule counts toward validity.
   */
  static blank(playerNumber = 0): Player {
    const player = new Player(playerNumber);
    player.name = '';
    player.color = null as unknown as StColor;
    return player;
  }
}
