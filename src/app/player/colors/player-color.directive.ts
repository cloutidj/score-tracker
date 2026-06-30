import { Directive, computed, input } from '@angular/core';
import { PlayerColor, contrastCssVarValue, cssVarValue } from '@player/models/player-color';

/**
 * Themes its host to a player's color: sets the `--st-player` base and
 * `--st-player-contrast` (a readable on-color, picked by luminance) custom
 * properties and adds `.st-player-themed`, which derives the hover/pressed
 * variants in CSS (see `_player-colors.scss`). Host styles then read
 * `var(--st-player*)` only, so changing a player's color is a single swap.
 */
@Directive({
  selector: '[stPlayerColor]',
  host: {
    class: 'st-player-themed',
    '[style.--st-player]': 'baseColor()',
    '[style.--st-player-contrast]': 'contrastColor()',
  },
})
export class PlayerColorDirective {
  readonly stPlayerColor = input<PlayerColor | undefined>(undefined);

  protected readonly baseColor = computed(() => {
    const color = this.stPlayerColor();
    return color ? cssVarValue(color) : null;
  });
  protected readonly contrastColor = computed(() => {
    const color = this.stPlayerColor();
    return color ? contrastCssVarValue(color) : null;
  });
}
