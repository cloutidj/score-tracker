import { Component, input } from '@angular/core';
import { StColor } from '@color/models/st-color';
import { ColorDirective } from '../color.directive';

@Component({
  selector: 'st-color-swatch',
  imports: [ColorDirective],
  template: `
    <span
      class="st-color-swatch"
      [class.is-active]="active()"
      [class.is-clickable]="clickable()"
      [stColor]="color()"
    ></span>
  `,
})
export class ColorSwatchComponent {
  readonly color = input<StColor | undefined>(undefined);
  readonly active = input(false);
  readonly clickable = input(false);
}
