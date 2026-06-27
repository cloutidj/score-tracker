import { Directive, computed, input } from '@angular/core';
import { PlayerColor } from '@models/player-color';

/**
 * Themes its host to a player's color: sets the `--st-player` custom property
 * (the palette base) and adds `.st-player-themed`, which derives the
 * hover/pressed/contrast variants in CSS (see `_player-colors.scss`). Host
 * styles then read `var(--st-player*)` only, so changing a player's color is a
 * single base-color swap.
 */
@Directive({
  selector: '[stPlayerColor]',
  host: {
    class: 'st-player-themed',
    '[style.--st-player]': 'baseColor()',
  },
})
export class PlayerColorDirective {
  // Colors may arrive deserialized (plain objects); re-hydrate so the helper works.
  readonly stPlayerColor = input(undefined, {
    transform: (val: PlayerColor | undefined) =>
      val ? Object.assign(new PlayerColor(), val) : undefined,
  });

  protected readonly baseColor = computed(() => this.stPlayerColor()?.cssVarValue() ?? null);
}
