import { Component, input } from '@angular/core';
import { PlayerColor } from '@player/models/player-color';
import { PlayerColorDirective } from '../player-color.directive';

@Component({
  selector: 'st-color-swatch',
  imports: [PlayerColorDirective],
  template: `
    <span
      class="st-color-swatch"
      [class.is-active]="active()"
      [class.is-clickable]="clickable()"
      [stPlayerColor]="color()"
    ></span>
  `,
})
export class ColorSwatchComponent {
  readonly color = input<PlayerColor | undefined>(undefined);
  readonly active = input(false);
  readonly clickable = input(false);
}
