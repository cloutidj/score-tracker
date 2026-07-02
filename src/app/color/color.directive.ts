import { Directive, computed, input } from '@angular/core';
import { StColor } from '@color/models/st-color';
import { ColorHelper } from '@color/models/color-helper';

/**
 * Themes its host to an {@link StColor}: sets the `--st-color` base and
 * `--st-color-contrast` (a readable on-color, picked by luminance) custom
 * properties and adds `.st-color-themed`, which derives the hover/pressed
 * variants in CSS (see `_color-theming.scss`). Host styles then read
 * `var(--st-color*)` only, so changing the color is a single swap.
 */
@Directive({
  selector: '[stColor]',
  host: {
    class: 'st-color-themed',
    '[style.--st-color]': 'baseColor()',
    '[style.--st-color-contrast]': 'contrastColor()',
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
