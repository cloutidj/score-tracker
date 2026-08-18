import { Directive, computed, input } from '@angular/core';
import { StColor } from '@color/models/st-color';
import { ColorHelper } from '@color/models/color-helper';

/**
 * Themes its host to an {@link StColor} — see docs/COLOR.md for the full
 * runtime theming flow.
 */
@Directive({
  selector: '[stColor]',
  host: {
    class: 'st-color-themed',
    '[style.--st-player-color]': 'baseColor()',
    '[style.--st-player-color-contrast]': 'contrastColor()',
  },
})
export class ColorDirective {
  readonly stColor = input<StColor | undefined>(undefined);

  protected readonly baseColor = computed(() => {
    const color = this.stColor();
    return color ? ColorHelper.cssVarValue(color) : null;
  });
  protected readonly contrastColor = computed(() => {
    const color = this.stColor();
    return color ? ColorHelper.contrastCssVarValue(color) : null;
  });
}
